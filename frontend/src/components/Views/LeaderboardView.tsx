import React, { useState, useEffect } from 'react';
import { useSongStore } from '../../store/useSongStore';
import { api } from '../../api/client';
import { Trophy, Medal, Flame, Activity, Disc3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const LeaderboardView: React.FC = () => {
  const { songs, currentSong } = useSongStore();
  const [selectedSongId, setSelectedSongId] = useState<string>(currentSong ? currentSong.id : 'c-major-scale');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard(selectedSongId);
  }, [selectedSongId]);

  const loadLeaderboard = async (songId: string) => {
    setIsLoading(true);
    try {
      const data = await api.getLeaderboard(songId, 'performance');
      setLeaderboard(data);
    } catch (e) {
      console.warn('Leaderboard fetch note:', e);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSong = songs.find((s) => s.id === selectedSongId);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-black flex items-center justify-center font-bold text-xs shadow-gold-glow">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-black flex items-center justify-center font-bold text-xs shadow">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-xs shadow">
          3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-black/40 text-gray-400 flex items-center justify-center font-mono text-xs border border-white/5">
        {rank}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-gold-400 font-semibold">
            Hall of Virtuosos
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
            Performance Leaderboard
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-lg">
            Global rankings in Performance Mode, judged by note strike precision and timing offset windows.
          </p>
        </div>

        {/* Piece Selector Dropdown */}
        <div className="min-w-[240px]">
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-semibold">
            Select Piece
          </label>
          <select
            value={selectedSongId}
            onChange={(e) => setSelectedSongId(e.target.value)}
            className="w-full bg-studio-panel border border-studio-border text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-gold-500 cursor-pointer shadow-lg font-serif"
          >
            {songs.map((song) => (
              <option key={song.id} value={song.id} className="bg-neutral-900 text-white">
                {song.title} ({song.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Piece Details Card */}
      {selectedSong && (
        <div className="bg-studio-panel backdrop-blur-md border border-studio-border rounded-2xl p-5 mb-6 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-400">
              <Disc3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white">
                {selectedSong.title}
              </h3>
              <p className="text-xs text-gray-400">
                {selectedSong.artist} • {selectedSong.bpm} BPM • {selectedSong.notes.length} notes
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-gray-400">
            <span>Mode: </span>
            <span className="font-mono text-gold-300 font-bold uppercase">Performance</span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-studio-surface border border-studio-border rounded-2xl shadow-xl overflow-hidden">
        {/* Table Head */}
        <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-black/40 border-b border-white/5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
          <div className="col-span-4 sm:col-span-5">Pianist</div>
          <div className="col-span-3 sm:col-span-2 text-center">Accuracy</div>
          <div className="col-span-3 sm:col-span-2 text-center">Timing Score</div>
          <div className="hidden sm:block sm:col-span-2 text-right">Streak</div>
        </div>

        {/* Rows */}
        {leaderboard.length > 0 ? (
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 gap-3 px-6 py-4 items-center text-xs hover:bg-white/[0.02] transition-colors"
              >
                {/* Rank */}
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                  {getRankBadge(entry.rank)}
                </div>

                {/* Username */}
                <div className="col-span-4 sm:col-span-5">
                  <span className="font-semibold text-white text-sm block truncate">
                    {entry.username}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(entry.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                {/* Accuracy */}
                <div className="col-span-3 sm:col-span-2 text-center">
                  <span className="font-mono font-bold text-gold-300 text-sm">
                    {entry.accuracy}%
                  </span>
                </div>

                {/* Timing */}
                <div className="col-span-3 sm:col-span-2 text-center">
                  <span className="font-mono font-semibold text-emerald-400 text-xs">
                    {entry.timing_accuracy}%
                  </span>
                </div>

                {/* Streak */}
                <div className="hidden sm:flex sm:col-span-2 items-center justify-end gap-1 text-amber-400 font-mono font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{entry.best_streak}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-gray-400">
            {isLoading ? (
              <span>Loading hall of virtuosos...</span>
            ) : (
              <span>
                No performance entries yet for this piece. Play this song in Performance mode to claim the #1 spot!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
