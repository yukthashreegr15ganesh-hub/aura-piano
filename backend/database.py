import json
import os
import asyncio
import logging
import re
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

logger = logging.getLogger("aura.database")

# In-memory / file-backed fallback collection matching Motor's async interface
class LocalCollection:
    def __init__(self, name: str, parent_db):
        self.name = name
        self.parent_db = parent_db

    async def create_index(self, keys, unique: bool = False):
        # Index creation handled in local store
        return True

    async def insert_one(self, document: Dict[str, Any]):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            import uuid
            doc_copy["_id"] = str(uuid.uuid4())
        await self.parent_db.insert(self.name, doc_copy)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    async def find_one(self, filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        docs = await self.parent_db.find(self.name, filter)
        return docs[0] if docs else None

    def find(self, filter: Dict[str, Any] = None):
        filter = filter or {}
        class LocalCursor:
            def __init__(self, collection, query):
                self.collection = collection
                self.query = query
                self._sort_field = None
                self._sort_dir = 1
                self._limit_num = None

            def sort(self, field_or_list, direction=1):
                if isinstance(field_or_list, list):
                    if len(field_or_list) > 0:
                        self._sort_field, self._sort_dir = field_or_list[0]
                else:
                    self._sort_field = field_or_list
                    self._sort_dir = direction
                return self

            def limit(self, num: int):
                self._limit_num = num
                return self

            async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
                items = await self.collection.parent_db.find(self.collection.name, self.query)
                if self._sort_field:
                    items = sorted(
                        items,
                        key=lambda x: (x.get(self._sort_field) is None, x.get(self._sort_field)),
                        reverse=(self._sort_dir == -1)
                    )
                lim = length if length is not None else self._limit_num
                if lim is not None:
                    items = items[:lim]
                return items
        return LocalCursor(self, filter)

    async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        return await self.parent_db.update_one(self.name, filter, update, upsert=upsert)

    async def count_documents(self, filter: Dict[str, Any] = None) -> int:
        filter = filter or {}
        items = await self.parent_db.find(self.name, filter)
        return len(items)

class LocalDatabase:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.lock = asyncio.Lock()
        self.data: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "songs": [],
            "sessions": []
        }
        self.load()

    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception as e:
                logger.error(f"Error loading local store from {self.filepath}: {e}")

    def save(self):
        try:
            os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving local store: {e}")

    def __getitem__(self, name: str) -> LocalCollection:
        if name not in self.data:
            self.data[name] = []
        return LocalCollection(name, self)

    async def insert(self, collection_name: str, doc: Dict[str, Any]):
        async with self.lock:
            if collection_name not in self.data:
                self.data[collection_name] = []
            self.data[collection_name].append(doc)
            self.save()

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, cond) for cond in v):
                    return False
            elif isinstance(v, dict):
                field_val = doc.get(k)
                for op, op_val in v.items():
                    if op == "$gte" and not (field_val is not None and field_val >= op_val):
                        return False
                    if op == "$lte" and not (field_val is not None and field_val <= op_val):
                        return False
                    if op == "$in" and field_val not in op_val:
                        return False
                    if op == "$ne" and field_val == op_val:
                        return False
                    if op == "$regex":
                        flags = re.IGNORECASE if v.get("$options") == "i" else 0
                        if field_val is None or not re.search(op_val, str(field_val), flags):
                            return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    async def find(self, collection_name: str, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        async with self.lock:
            col = self.data.get(collection_name, [])
            return [dict(d) for d in col if self._matches(d, query)]

    async def update_one(self, collection_name: str, filter: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        async with self.lock:
            col = self.data.get(collection_name, [])
            found = False
            for d in col:
                if self._matches(d, filter):
                    found = True
                    if "$set" in update:
                        d.update(update["$set"])
                    if "$inc" in update:
                        for k, inc_val in update["$inc"].items():
                            d[k] = d.get(k, 0) + inc_val
                    break
            if not found and upsert:
                new_doc = dict(filter)
                if "$set" in update:
                    new_doc.update(update["$set"])
                if "_id" not in new_doc:
                    import uuid
                    new_doc["_id"] = str(uuid.uuid4())
                col.append(new_doc)
            self.save()

class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.is_connected = False
        self.mode = "checking"

    async def connect(self):
        try:
            # Attempt to connect to real MongoDB with short timeout
            self.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            # Ping to verify
            await self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            self.mode = "mongodb"
            logger.info(f"Connected successfully to MongoDB at {settings.MONGODB_URL}")
        except Exception as e:
            logger.warning(f"MongoDB not reachable ({e}). Falling back to embedded local storage.")
            local_store_path = os.path.join(settings.DATA_DIR, "aura_store.json")
            self.db = LocalDatabase(local_store_path)
            self.is_connected = True
            self.mode = "local_embedded"

        # Initialize indexes
        await self._init_indexes()

    async def _init_indexes(self):
        try:
            await self.db["users"].create_index("email", unique=True)
            await self.db["users"].create_index("username", unique=True)
            await self.db["songs"].create_index("id", unique=True)
            await self.db["songs"].create_index([("category", 1), ("difficulty", 1)])
            await self.db["sessions"].create_index([("song_id", 1), ("mode", 1), ("accuracy", -1)])
            await self.db["sessions"].create_index([("user_id", 1), ("created_at", -1)])
        except Exception as err:
            logger.warning(f"Index creation note: {err}")

    async def close(self):
        if self.client:
            self.client.close()

db_manager = DatabaseManager()

def get_db():
    return db_manager.db
