import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAudioStore } from '../../store/useAudioStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Volume2, VolumeX, Eye, Sparkles, Monitor, Keyboard, RefreshCw, Music2, ShieldCheck, LogOut } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    showKeyLabels,
    toggleKeyLabels,
    reducedMotion,
    toggleReducedMotion,
    particleEffects,
    toggleParticleEffects,
    setKeyboardGuideOpen,
  } = useSettingsStore();

  const { volume, isMuted, setVolume, toggleMute, loadState, activeInstrumentName } = useAudioStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleClearLocalStorage = () => {
    if (window.confirm('Clear all local guest practice sessions and reset settings?')) {
      localStorage.removeItem('aura_piano_guest_sessions');
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-gold-400 font-semibold">
          Preferences & Audio Configuration
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
          Studio Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Customize acoustics, keyboard mappings, and cinematic visual fidelity.
        </p>
      </div>

      <div className="space-y-6">
        {/* Acoustic Engine Card */}
        <div className="bg-studio-panel backdrop-blur-md border border-studio-border rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-gold-400" />
            <span>Acoustics & Instrument</span>
          </h3>

          <div className="space-y-4">
            {/* Master Volume */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-gray-200">Concert Master Volume</span>
                <span className="font-mono text-gold-300 font-bold">{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 text-gray-300 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-gold-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-gold-500 h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Active Engine State */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block text-[11px] uppercase">Active Sound Engine</span>
                <span className="font-semibold text-white mt-0.5 block">{activeInstrumentName}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold uppercase">
                  {loadState === 'fallback_synth' ? 'Synthesizer Active' : 'Salamander Samples Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Experience Card */}
        <div className="bg-studio-panel backdrop-blur-md border border-studio-border rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gold-400" />
            <span>Display & Performance</span>
          </h3>

          <div className="divide-y divide-white/5">
            {/* Key Labels */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-white">Show Physical Key Labels</div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Display computer keyboard letters and note pitches on the piano keys.
                </div>
              </div>
              <button
                onClick={toggleKeyLabels}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  showKeyLabels ? 'bg-gold-500' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    showKeyLabels ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Ambient Particles */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-white">Concert Hall Dust & Sparks</div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Render slow-drifting dust bokeh particles lit by the spotlight and hit spark bursts.
                </div>
              </div>
              <button
                onClick={toggleParticleEffects}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  particleEffects ? 'bg-gold-500' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    particleEffects ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-white">Reduced Motion</div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Disable camera parallax and rapid animations for accessibility.
                </div>
              </div>
              <button
                onClick={toggleReducedMotion}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  reducedMotion ? 'bg-gold-500' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Input & Key Mapping Card */}
        <div className="bg-studio-panel backdrop-blur-md border border-studio-border rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-gold-400" />
              <span>Keyboard Layout & Mappings</span>
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Review full computer keyboard mappings, octave shifting (-8va / +8va), sustain pedal, and velocity.
            </p>
          </div>
          <button
            onClick={() => setKeyboardGuideOpen(true)}
            className="px-4 py-2 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 font-semibold text-xs transition-all shadow-gold-glow shrink-0"
          >
            Open Guide
          </button>
        </div>

        {/* Account & Storage Card */}
        <div className="bg-studio-panel backdrop-blur-md border border-studio-border rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <span>Account & Storage</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-300 font-medium block">
                {isAuthenticated && user
                  ? `Signed in as ${user.username} (${user.email})`
                  : 'Playing as Guest Pianist'}
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                {isAuthenticated
                  ? 'All practice sessions and custom songs are cloud-synced.'
                  : 'Sessions are stored in your local browser cache.'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 hover:bg-red-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={handleClearLocalStorage}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:border-red-500/40 hover:text-red-300 text-gray-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Local Cache</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
