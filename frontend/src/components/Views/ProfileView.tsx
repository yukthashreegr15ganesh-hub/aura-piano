import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { api, ProgressSummary } from '../../api/client';
import { User, Flame, Clock, Activity, Award, Calendar, Sparkles, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfileView: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, isOffline } = useAuthStore();
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProgress();
      setProgress(data);
    } catch (e) {
      console.warn('Progress load fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const totalMinutes = progress ? Math.round(progress.total_practice_time_seconds / 60) : 0;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const practiceTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 relative z-10">
      {/* Profile Header */}
      <div className="bg-studio-panel backdrop-blur-md border border-studio-border rounded-2xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center font-serif text-2xl font-black text-black shadow-gold-glow">
            {isAuthenticated && user ? user.username.slice(0, 1).toUpperCase() : 'G'}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-serif font-bold text-white">
                {isAuthenticated && user ? user.username : 'Guest Pianist'}
              </h2>
              {isAuthenticated ? (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  Cloud Synced
                </span>
              ) : (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Local Session
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {isAuthenticated && user
                ? user.email
                : 'Guest mode: Your practice metrics are stored safely in this browser.'}
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <button
            onClick={() => openAuthModal('register')}
            className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs transition-all shadow-gold-glow flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Create Account to Sync</span>
          </button>
        )}
      </div>

      {/* Highlights Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-studio-surface border border-studio-border text-center shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
            {progress ? progress.daily_streak : 1}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">
            Day Streak
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-studio-surface border border-studio-border text-center shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
            {practiceTimeStr}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">
            Practice Time
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-studio-surface border border-studio-border text-center shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
            {progress ? progress.accuracy_average : 95}%
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">
            Avg Accuracy
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-studio-surface border border-studio-border text-center shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
            {progress ? progress.total_notes_played : 0}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">
            Notes Struck
          </div>
        </div>
      </div>

      {/* Best Performances & Repertoire Masteries */}
      <div className="mb-8">
        <h3 className="text-lg font-serif font-bold text-white mb-3">
          Personal Best Records
        </h3>
        {progress && progress.best_performances && progress.best_performances.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.best_performances.map((bp: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-studio-surface border border-studio-border flex items-center justify-between"
              >
                <div>
                  <h4 className="font-serif text-sm font-semibold text-white">
                    {bp.song_title || bp.songTitle || 'Piece'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span className="capitalize">{bp.mode}</span>
                    <span>•</span>
                    <span>Streak: {bp.best_streak || bp.bestStreak || 0}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-gold-300">
                    {bp.accuracy}%
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Best Score</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-studio-panel border border-studio-border text-center text-xs text-gray-400">
            No completed performances recorded yet. Pick any song from the Library and play to log your records!
          </div>
        )}
      </div>

      {/* Practice History List */}
      <div>
        <h3 className="text-lg font-serif font-bold text-white mb-3">
          Recent Practice History
        </h3>
        {progress && progress.recent_sessions && progress.recent_sessions.length > 0 ? (
          <div className="space-y-2.5">
            {progress.recent_sessions.map((sess: any) => {
              const dt = new Date(sess.created_at || Date.now()).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-xl bg-studio-surface border border-white/5 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-serif font-semibold text-white text-sm">
                      {sess.song_title}
                    </span>
                    <div className="flex items-center gap-2 text-gray-400 mt-0.5 text-[11px]">
                      <span className="capitalize">{sess.mode}</span>
                      <span>•</span>
                      <span>{dt}</span>
                      <span>•</span>
                      <span>Speed: {Math.round((sess.speed || 1.0) * 100)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-mono font-bold text-gold-300">{sess.accuracy}%</div>
                      <div className="text-[10px] text-gray-500 uppercase">Accuracy</div>
                    </div>

                    <div className="hidden sm:block">
                      <div className="font-mono font-bold text-emerald-400">
                        {sess.correct} / {(sess.correct || 0) + (sess.wrong || 0)}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">Notes</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-studio-panel border border-studio-border text-center text-xs text-gray-400">
            Play a song to begin logging your session journey.
          </div>
        )}
      </div>
    </div>
  );
};
