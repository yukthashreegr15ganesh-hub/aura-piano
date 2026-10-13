import { Song } from '../songs/types';
import { BUNDLED_SONGS } from '../songs/seedSongs';
import { extractOrSearchClientSong } from '../songs/clientSongExtractor';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const TOKEN_KEY = 'aura_piano_jwt_token';
const GUEST_SESSIONS_KEY = 'aura_piano_guest_sessions';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  total_practice_time_seconds: number;
  daily_streak: number;
  last_active_date?: string;
}

export interface ProgressSummary {
  total_practice_time_seconds: number;
  daily_streak: number;
  total_notes_played: number;
  accuracy_average: number;
  best_performances: any[];
  recent_sessions: any[];
}

class ApiClient {
  private token: string | null = null;
  public isOffline = false;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errDetail = 'Request failed';
        try {
          const errData = await response.json();
          errDetail = errData.detail || JSON.stringify(errData);
        } catch (_) {}
        throw new Error(errDetail);
      }

      this.isOffline = false;
      return await response.json();
    } catch (err: any) {
      // If server unreachable, mark offline
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
        this.isOffline = true;
      }
      throw err;
    }
  }

  // Auth
  public async register(payload: { username: string; email: string; password: string; guest_sessions?: any[] }) {
    const res = await this.request<{ access_token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.access_token);
    // Clear merged guest sessions from local storage
    localStorage.removeItem(GUEST_SESSIONS_KEY);
    return res;
  }

  public async login(payload: { email_or_username: string; password: string; guest_sessions?: any[] }) {
    const res = await this.request<{ access_token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.access_token);
    localStorage.removeItem(GUEST_SESSIONS_KEY);
    return res;
  }

  public async getMe(): Promise<UserProfile | null> {
    if (!this.token) return null;
    try {
      return await this.request<UserProfile>('/auth/me');
    } catch (e) {
      return null;
    }
  }

  // Songs
  public async getSongs(category?: string, difficulty?: string, search?: string): Promise<Song[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All' && category !== 'All Pieces') params.append('category', category);
      if (difficulty && difficulty !== 'All' && difficulty !== 'All Levels') params.append('difficulty', difficulty);
      if (search && search.trim()) params.append('search', search.trim());
      const query = params.toString() ? `?${params.toString()}` : '';
      return await this.request<Song[]>(`/songs${query}`);
    } catch (e) {
      console.warn('Backend unavailable, providing bundled songs fallback:', e);
      this.isOffline = true;
      let filtered = [...BUNDLED_SONGS];
      if (category && category !== 'All' && category !== 'All Pieces') {
        filtered = filtered.filter(s => s.category.toLowerCase() === category.toLowerCase());
      }
      if (difficulty && difficulty !== 'All' && difficulty !== 'All Levels') {
        filtered = filtered.filter(s => s.difficulty.toLowerCase() === difficulty.toLowerCase());
      }
      if (search && search.trim()) {
        const sLower = search.toLowerCase().trim();
        filtered = filtered.filter(s => 
          s.title.toLowerCase().includes(sLower) || 
          s.artist.toLowerCase().includes(sLower)
        );
      }
      return filtered;
    }
  }

  public async extractSong(payload: {
    query: string;
    genre?: string;
    difficulty?: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced';
    notes_input?: string;
  }): Promise<Song> {
    try {
      return await this.request<Song>('/songs/extract', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Backend extraction failed or offline, using client dynamic generator:', e);
      this.isOffline = true;
      return extractOrSearchClientSong(
        payload.query,
        payload.notes_input,
        payload.difficulty
      );
    }
  }

  public async createCustomSong(payload: {
    title: string;
    artist?: string;
    difficulty?: string;
    category?: string;
    bpm?: number;
    notes: any[];
    sections?: any[];
  }): Promise<Song> {
    try {
      return await this.request<Song>('/songs/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Backend create failed or offline, saving locally:', e);
      this.isOffline = true;
      const customSong: Song = {
        id: `custom-${Date.now()}`,
        title: payload.title,
        artist: payload.artist || 'User Recording',
        difficulty: (payload.difficulty as any) || 'Intermediate',
        category: (payload.category as any) || 'Practice',
        bpm: payload.bpm || 90,
        timeSignature: '4/4',
        sections: payload.sections || [{ name: 'Session', startBeat: 0.0 }],
        notes: payload.notes
      };
      return customSong;
    }
  }

  public async getSong(id: string): Promise<Song> {
    try {
      return await this.request<Song>(`/songs/${id}`);
    } catch (e) {
      this.isOffline = true;
      const found = BUNDLED_SONGS.find(s => s.id === id);
      if (found) return found;
      throw new Error('Unable to load this song.');
    }
  }

  public async importMidi(file: File): Promise<Song> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/songs/import`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errDetail = 'Failed to import MIDI file';
      try {
        const errJson = await response.json();
        errDetail = errJson.detail || errDetail;
      } catch (_) {}
      throw new Error(errDetail);
    }

    return await response.json();
  }

  // Sessions & Progress
  public async recordSession(sessionData: any): Promise<any> {
    try {
      return await this.request('/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
    } catch (e) {
      this.isOffline = true;
      // Save locally to localStorage for guests or when offline
      const stored = this.getLocalGuestSessions();
      stored.unshift({
        ...sessionData,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(stored.slice(0, 50)));
      return { offlineSaved: true };
    }
  }

  public async getProgress(): Promise<ProgressSummary> {
    try {
      return await this.request<ProgressSummary>('/progress');
    } catch (e) {
      this.isOffline = true;
      // Construct summary from local storage
      const sessions = this.getLocalGuestSessions();
      let totalPractice = 0;
      let totalNotes = 0;
      let accSum = 0;
      const bestMap: Record<string, any> = {};

      sessions.forEach(s => {
        totalPractice += s.duration_seconds || s.durationSeconds || 0;
        totalNotes += (s.correct || 0) + (s.wrong || 0);
        const acc = s.accuracy || 0;
        accSum += acc;
        const key = `${s.song_id}_${s.mode}`;
        if (!bestMap[key] || acc > bestMap[key].accuracy) {
          bestMap[key] = s;
        }
      });

      return {
        total_practice_time_seconds: totalPractice,
        daily_streak: sessions.length > 0 ? 1 : 0,
        total_notes_played: totalNotes,
        accuracy_average: sessions.length > 0 ? Math.round(accSum / sessions.length) : 100,
        best_performances: Object.values(bestMap),
        recent_sessions: sessions.slice(0, 15),
      };
    }
  }

  public async getLeaderboard(songId: string, mode: string = 'performance'): Promise<any[]> {
    try {
      return await this.request<any[]>(`/leaderboard/${songId}?mode=${mode}`);
    } catch (e) {
      return [];
    }
  }

  public getLocalGuestSessions(): any[] {
    try {
      const data = localStorage.getItem(GUEST_SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (_) {
      return [];
    }
  }
}

export const api = new ApiClient();
