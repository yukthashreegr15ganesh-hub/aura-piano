import React, { useState, useEffect, useRef } from 'react';
import { ALL_PIANO_KEYS, PLAYABLE_NOTES } from '../../songs/keyMap';
import { pianoEngine } from '../../engine/PianoEngine';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useEngineStore } from '../../store/useEngineStore';
import { motion } from 'framer-motion';

// 17 white keys from C4 to E6
const WHITE_NOTES = PLAYABLE_NOTES.filter(n => !n.includes('#'));
const BLACK_NOTES_CONFIG: Record<string, { leftPercent: number }> = {
  'C#4': { leftPercent: (1 - 0.33) / 17 * 100 },
  'D#4': { leftPercent: (2 - 0.27) / 17 * 100 },
  'F#4': { leftPercent: (4 - 0.34) / 17 * 100 },
  'G#4': { leftPercent: (5 - 0.30) / 17 * 100 },
  'A#4': { leftPercent: (6 - 0.26) / 17 * 100 },
  'C#5': { leftPercent: (8 - 0.33) / 17 * 100 },
  'D#5': { leftPercent: (9 - 0.27) / 17 * 100 },
  'F#5': { leftPercent: (11 - 0.34) / 17 * 100 },
  'G#5': { leftPercent: (12 - 0.30) / 17 * 100 },
  'A#5': { leftPercent: (13 - 0.26) / 17 * 100 },
  'C#6': { leftPercent: (15 - 0.33) / 17 * 100 },
  'D#6': { leftPercent: (16 - 0.27) / 17 * 100 },
};

export const PianoKeyboard: React.FC = () => {
  const { showKeyLabels } = useSettingsStore();
  const nextKeyHint = useEngineStore((state) => state.nextKeyHint);
  const [activeKeys, setActiveKeys] = useState<Map<string, { isMistake?: boolean; isSuccess?: boolean }>>(new Map());
  const keyboardContainerRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to real-time engine feedback
  useEffect(() => {
    const unsub = pianoEngine.subscribeKeyFeedback((feedback) => {
      setActiveKeys((prev) => {
        const next = new Map(prev);
        if (feedback.isActive) {
          next.set(feedback.note, {
            isMistake: feedback.isHitMistake,
            isSuccess: feedback.isHitSuccess,
          });
        } else {
          next.delete(feedback.note);
        }
        return next;
      });
    });
    return () => unsub();
  }, []);

  // Auto-scroll on small screens to next required note in learn mode
  useEffect(() => {
    if (nextKeyHint && keyboardContainerRef.current) {
      const targetKeyEl = keyboardContainerRef.current.querySelector(`[data-note="${nextKeyHint.note}"]`);
      if (targetKeyEl) {
        targetKeyEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [nextKeyHint]);

  // Touch handlers
  const handleKeyTouchStart = (e: React.TouchEvent, note: string) => {
    e.preventDefault();
    const touch = e.touches[0];
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const relY = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
    const vel = 0.5 + relY * 0.5;
    pianoEngine.inputManager.triggerKeyNoteOn(note, vel, true);
  };

  const handleKeyTouchEnd = (e: React.TouchEvent, note: string) => {
    e.preventDefault();
    pianoEngine.inputManager.triggerKeyNoteOff(note, true);
  };

  // Mouse handlers with vertical velocity dynamics
  const handleMouseDown = (e: React.MouseEvent, note: string) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const vel = 0.55 + relY * 0.45;
    pianoEngine.inputManager.triggerKeyNoteOn(note, vel, false);
  };

  const handleMouseUp = (_e: React.MouseEvent, note: string) => {
    pianoEngine.inputManager.triggerKeyNoteOff(note, false);
  };

  const handleMouseLeave = (_e: React.MouseEvent, note: string) => {
    pianoEngine.inputManager.triggerKeyNoteOff(note, false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center select-none perspective-piano">
      {/* Grand Piano Cabinet Casing */}
      <div 
        ref={keyboardContainerRef}
        className="w-full max-w-6xl rounded-t-2xl bg-[#090a0e] relative overflow-x-auto shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)] border-t border-x border-[#232733] piano-chassis pb-3"
      >
        {/* Lacquered Glossy Fallboard with Gold Brass Inlay */}
        <div className="h-12 bg-gradient-to-b from-[#1c1f29] via-[#11131a] to-[#090a0e] flex items-center justify-center relative border-b border-black/80 px-6">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          
          {/* Subtle Fallboard Drop Shadow */}
          <div className="absolute bottom-0 inset-x-0 h-3 bg-gradient-to-b from-transparent to-black/70 pointer-events-none" />
          
          {/* Refined Brass Nameplate */}
          <div className="flex items-center gap-3 tracking-[0.3em] text-[11px] sm:text-xs font-serif text-amber-300/90 uppercase font-semibold gold-text-glow">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-amber-400/40 hidden sm:inline-block" />
            ✦ AURA PIANO • CONCERT GRAND ✦
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-amber-400/40 hidden sm:inline-block" />
          </div>
        </div>

        {/* Crimson Red Velvet Damper Felt Strip */}
        <div className="h-3.5 w-full piano-felt relative z-10 border-b border-[#3b080b]">
          <div 
            className="absolute inset-0 bg-repeat-x opacity-25" 
            style={{ 
              backgroundImage: 'radial-gradient(#000 15%, transparent 16%)', 
              backgroundSize: '4px 4px' 
            }} 
          />
        </div>

        {/* Realistic Keybed with Substantial Height (~250px) */}
        <div className="relative h-60 sm:h-68 md:h-72 min-w-[840px] w-full px-2 pt-0 pb-1 bg-[#050608] flex">
          {/* White Keys Layer */}
          {WHITE_NOTES.map((note) => {
            const keyInfo = ALL_PIANO_KEYS.find(k => k.note === note)!;
            const activeData = activeKeys.get(note);
            const isPressed = !!activeData;
            const isNextHint = nextKeyHint?.note === note;

            return (
              <div
                key={note}
                data-note={note}
                onMouseDown={(e) => handleMouseDown(e, note)}
                onMouseUp={(e) => handleMouseUp(e, note)}
                onMouseLeave={(e) => handleMouseLeave(e, note)}
                onTouchStart={(e) => handleKeyTouchStart(e, note)}
                onTouchEnd={(e) => handleKeyTouchEnd(e, note)}
                className={`relative flex-1 h-full white-key cursor-pointer flex flex-col justify-end items-center pb-4 mx-[1.5px] first:ml-0 last:mr-0 z-0 transition-transform ${
                  isPressed ? 'active' : ''
                } ${isNextHint ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#08090d] shadow-amber-glow' : ''}`}
                style={{
                  boxShadow: isPressed
                    ? activeData?.isMistake
                      ? 'inset 0 3px 8px rgba(239, 68, 68, 0.7), 0 0 25px rgba(239, 68, 68, 0.6)'
                      : 'inset 0 3px 8px rgba(245, 158, 11, 0.7), 0 0 30px rgba(245, 158, 11, 0.65)'
                    : undefined
                }}
              >
                {/* Visual feedback glow spill upwards onto felt strip */}
                {isPressed && (
                  <div className={`absolute inset-x-0 -top-3.5 h-5 blur-sm pointer-events-none ${
                    activeData?.isMistake ? 'bg-red-500/70' : 'bg-amber-400/70'
                  }`} />
                )}

                {/* Key Labels */}
                <div className="flex flex-col items-center pointer-events-none select-none">
                  {showKeyLabels && (
                    <span className={`text-xs sm:text-[13px] font-mono font-bold tracking-tight mb-1 transition-all ${
                      isPressed ? 'text-amber-950 font-black scale-110' : 'text-neutral-500'
                    }`}>
                      {keyInfo.keyboardDisplay}
                    </span>
                  )}
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                    isPressed ? 'text-amber-900' : 'text-neutral-400'
                  }`}>
                    {note}
                  </span>
                </div>

                {/* Learn Mode Floating Key Cap Target */}
                {isNextHint && (
                  <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: [1, 1.12, 1], opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute -top-8 px-2.5 py-1 rounded-full bg-amber-400 text-black text-[11px] font-bold shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center gap-1.5 z-30"
                  >
                    <span>Press</span>
                    <span className="font-mono bg-black/20 px-1.5 py-0.2 rounded font-black">{keyInfo.keyboardDisplay}</span>
                  </motion.div>
                )}
              </div>
            );
          })}

          {/* Black Keys Layer */}
          {Object.entries(BLACK_NOTES_CONFIG).map(([note, config]) => {
            const keyInfo = ALL_PIANO_KEYS.find(k => k.note === note)!;
            const activeData = activeKeys.get(note);
            const isPressed = !!activeData;
            const isNextHint = nextKeyHint?.note === note;

            return (
              <div
                key={note}
                data-note={note}
                onMouseDown={(e) => handleMouseDown(e, note)}
                onMouseUp={(e) => handleMouseUp(e, note)}
                onMouseLeave={(e) => handleMouseLeave(e, note)}
                onTouchStart={(e) => handleKeyTouchStart(e, note)}
                onTouchEnd={(e) => handleKeyTouchEnd(e, note)}
                className={`absolute top-0 h-[61%] w-[3.85%] rounded-b-md black-key cursor-pointer z-20 flex flex-col justify-end items-center pb-3 transition-transform ${
                  isPressed ? 'active' : ''
                } ${isNextHint ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black shadow-amber-glow' : ''}`}
                style={{
                  left: `${config.leftPercent}%`,
                  boxShadow: isPressed
                    ? activeData?.isMistake
                      ? '0 0 25px rgba(239, 68, 68, 0.8), inset 0 2px 5px rgba(0,0,0,0.9)'
                      : '0 0 30px rgba(245, 158, 11, 0.85), inset 0 2px 5px rgba(0,0,0,0.9)'
                    : undefined,
                }}
              >
                {/* Glow spill onto red felt */}
                {isPressed && (
                  <div className={`absolute inset-x-0 -top-3.5 h-5 blur-sm pointer-events-none ${
                    activeData?.isMistake ? 'bg-red-500/80' : 'bg-amber-400/80'
                  }`} />
                )}

                {/* Key Labels */}
                <div className="flex flex-col items-center pointer-events-none select-none z-10">
                  {showKeyLabels && (
                    <span className={`text-[11px] sm:text-xs font-mono font-bold mb-0.5 ${
                      isPressed ? 'text-amber-200 scale-110' : 'text-neutral-300'
                    }`}>
                      {keyInfo.keyboardDisplay}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-neutral-400 font-medium">
                    {note}
                  </span>
                </div>

                {/* Learn Mode Indicator for Black Key */}
                {isNextHint && (
                  <motion.div 
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute -top-8 px-2.5 py-1 rounded-full bg-amber-400 text-black text-[11px] font-bold shadow-[0_0_15px_rgba(245,158,11,0.6)] z-30"
                  >
                    <span>{keyInfo.keyboardDisplay}</span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Polished Lacquer Reflection Bed */}
        <div className="h-5 bg-gradient-to-b from-[#13151c] via-[#0d0f14] to-[#06070a] border-t border-black/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
