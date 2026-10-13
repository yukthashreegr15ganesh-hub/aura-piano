import React from 'react';
import { useAudioStore } from '../../store/useAudioStore';
import { Volume2, Loader2, AlertTriangle } from 'lucide-react';

export const AudioSuspendedBanner: React.FC = () => {
  const { loadState, isSuspended, resumeAudio } = useAudioStore();

  if (loadState === 'loading') {
    return (
      <div className="w-full bg-amber-950/80 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs flex items-center justify-center gap-2 z-50">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        <span>Loading piano samples (Salamander Concert Grand)...</span>
      </div>
    );
  }

  if (loadState === 'fallback_synth') {
    return (
      <div className="w-full bg-amber-950/60 border-b border-amber-600/40 text-amber-300 px-4 py-1.5 text-xs flex items-center justify-center gap-2 z-50">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>Salamander samples offline — running with high-fidelity soft piano fallback synth.</span>
      </div>
    );
  }

  if (isSuspended) {
    return (
      <div
        onClick={resumeAudio}
        className="w-full bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg z-50 animate-pulse"
      >
        <Volume2 className="w-4 h-4 fill-black" />
        <span>Click anywhere to enable audio</span>
      </div>
    );
  }

  return null;
};
