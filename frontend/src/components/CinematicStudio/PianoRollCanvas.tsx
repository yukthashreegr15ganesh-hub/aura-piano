import React, { useRef, useEffect } from 'react';
import { useSongStore } from '../../store/useSongStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { pianoEngine } from '../../engine/PianoEngine';
import { PLAYABLE_NOTES, isBlackKey } from '../../songs/keyMap';

interface HitParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

const WHITE_NOTES = PLAYABLE_NOTES.filter((n) => !n.includes('#'));
const BLACK_NOTES_CONFIG: Record<string, { leftRatio: number; widthRatio: number }> = {
  'C#4': { leftRatio: (1 - 0.33) / 17, widthRatio: 0.0385 },
  'D#4': { leftRatio: (2 - 0.27) / 17, widthRatio: 0.0385 },
  'F#4': { leftRatio: (4 - 0.34) / 17, widthRatio: 0.0385 },
  'G#4': { leftRatio: (5 - 0.30) / 17, widthRatio: 0.0385 },
  'A#4': { leftRatio: (6 - 0.26) / 17, widthRatio: 0.0385 },
  'C#5': { leftRatio: (8 - 0.33) / 17, widthRatio: 0.0385 },
  'D#5': { leftRatio: (9 - 0.27) / 17, widthRatio: 0.0385 },
  'F#5': { leftRatio: (11 - 0.34) / 17, widthRatio: 0.0385 },
  'G#5': { leftRatio: (12 - 0.30) / 17, widthRatio: 0.0385 },
  'A#5': { leftRatio: (13 - 0.26) / 17, widthRatio: 0.0385 },
  'C#6': { leftRatio: (15 - 0.33) / 17, widthRatio: 0.0385 },
  'D#6': { leftRatio: (16 - 0.27) / 17, widthRatio: 0.0385 },
};

export const PianoRollCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentSong = useSongStore((state) => state.currentSong);
  const { particleEffects, reducedMotion } = useSettingsStore();

  const particlesRef = useRef<HitParticle[]>([]);

  // Trigger spark bursts on note hits
  useEffect(() => {
    const unsub = pianoEngine.subscribeKeyFeedback((feedback) => {
      if (feedback.isActive && particleEffects && !reducedMotion) {
        spawnHitSparks(feedback.note);
      }
    });
    return () => unsub();
  }, [particleEffects, reducedMotion]);

  const spawnHitSparks = (note: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const targetY = h - 6;

    const keyX = getKeyBounds(note, w);
    const centerX = keyX.x + keyX.width / 2;

    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * (Math.random() - 0.5)) - Math.PI / 2;
      const speed = Math.random() * 4.5 + 2;
      particlesRef.current.push({
        x: centerX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color: isBlackKey(note) ? 'rgba(245, 158, 11, ' : 'rgba(253, 224, 71, ',
        size: Math.random() * 3 + 1.5,
      });
    }
  };

  const getKeyBounds = (note: string, totalWidth: number): { x: number; width: number } => {
    const isBlack = isBlackKey(note);
    if (!isBlack) {
      const idx = WHITE_NOTES.indexOf(note);
      const whiteWidth = totalWidth / 17;
      const x = (idx >= 0 ? idx : 0) * whiteWidth;
      return { x: x + 2.5, width: whiteWidth - 5 };
    } else {
      const cfg = BLACK_NOTES_CONFIG[note];
      if (cfg) {
        return {
          x: cfg.leftRatio * totalWidth + 1,
          width: cfg.widthRatio * totalWidth - 2,
        };
      }
      return { x: 0, width: 22 };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const targetY = height - 6;

      ctx.clearRect(0, 0, width, height);

      // Subtle vertical lane guidelines aligned to keys
      const whiteWidth = width / 17;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 17; i++) {
        ctx.beginPath();
        ctx.moveTo(i * whiteWidth, 0);
        ctx.lineTo(i * whiteWidth, targetY);
        ctx.stroke();
      }

      // Audio clock synchronization (single source of truth)
      const currentBeat = pianoEngine.clock.getCurrentBeat();
      const lookaheadBeats = 4.2; // 4.2 beats ahead on screen
      const pixelsPerBeat = (targetY - 10) / lookaheadBeats;

      // Draw falling glass-like notes
      if (currentSong && currentSong.notes) {
        for (let i = 0; i < currentSong.notes.length; i++) {
          const n = currentSong.notes[i];
          const deltaBeats = n.startBeat - currentBeat;
          const noteBottomY = targetY - deltaBeats * pixelsPerBeat;
          const noteHeight = Math.max(18, n.durationBeats * pixelsPerBeat);
          const noteTopY = noteBottomY - noteHeight;

          // Culling
          if (noteBottomY < -30 || noteTopY > targetY + 40) continue;

          const bounds = getKeyBounds(n.note, width);
          const isBlack = isBlackKey(n.note);

          // Faint light trail extending above note
          const trailGrad = ctx.createLinearGradient(bounds.x, noteTopY - 45, bounds.x, noteTopY);
          trailGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
          trailGrad.addColorStop(1, isBlack ? 'rgba(245, 158, 11, 0.22)' : 'rgba(212, 175, 55, 0.22)');
          ctx.fillStyle = trailGrad;
          ctx.fillRect(bounds.x + 2, Math.max(0, noteTopY - 45), bounds.width - 4, Math.min(45, noteTopY));

          // Glass-like bronze/gold gradient bar
          const noteGrad = ctx.createLinearGradient(bounds.x, noteTopY, bounds.x, noteBottomY);
          if (isBlack) {
            noteGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
            noteGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.92)');
            noteGrad.addColorStop(1, 'rgba(180, 83, 9, 0.98)');
          } else {
            noteGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
            noteGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.92)');
            noteGrad.addColorStop(1, 'rgba(180, 135, 30, 0.98)');
          }

          ctx.save();
          ctx.beginPath();
          const radius = Math.min(6, bounds.width / 2);
          ctx.roundRect(bounds.x, noteTopY, bounds.width, noteHeight, radius);
          ctx.fillStyle = noteGrad;
          ctx.shadowColor = isBlack ? 'rgba(245, 158, 11, 0.5)' : 'rgba(212, 175, 55, 0.45)';
          ctx.shadowBlur = 12;
          ctx.fill();

          // Glass specular stroke
          ctx.strokeStyle = isBlack ? 'rgba(254, 240, 138, 0.6)' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Pitch label on bar if enough vertical space
          if (noteHeight > 26) {
            ctx.fillStyle = isBlack ? '#ffffff' : '#1a1200';
            ctx.font = 'bold 10px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(n.note, bounds.x + bounds.width / 2, noteBottomY - 4);
          }

          ctx.restore();
        }
      }

      // Glowing Target Line Beam at bottom
      ctx.save();
      const targetGrad = ctx.createLinearGradient(0, targetY - 2, 0, targetY + 2);
      targetGrad.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
      targetGrad.addColorStop(0.5, 'rgba(255, 235, 175, 0.95)');
      targetGrad.addColorStop(1, 'rgba(212, 175, 55, 0.1)');

      ctx.fillStyle = targetGrad;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
      ctx.shadowBlur = 14;
      ctx.fillRect(0, targetY - 1.5, width, 3);
      ctx.restore();

      // Render & update hit spark particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16; // Gravity
        p.alpha -= 0.024;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [currentSong]);

  return (
    <div className="w-full max-w-6xl h-64 sm:h-72 md:h-80 relative overflow-hidden rounded-t-2xl z-10 pointer-events-none mb-[-4px]">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
