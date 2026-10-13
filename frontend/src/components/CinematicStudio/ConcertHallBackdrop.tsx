import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { pianoEngine } from '../../engine/PianoEngine';

interface DustParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  dx: number;
  dy: number;
  twinkleSpeed: number;
}

export const ConcertHallBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { particleEffects, reducedMotion } = useSettingsStore();
  const ambientPulseRef = useRef<number>(0);

  useEffect(() => {
    // Pulse ambient lighting when user plays notes
    const unsubscribe = pianoEngine.subscribeKeyFeedback((feedback) => {
      if (feedback.isActive) {
        ambientPulseRef.current = Math.min(1.0, ambientPulseRef.current + (feedback.velocity || 0.8) * 0.4);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!particleEffects || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize 60 drifting bokeh dust particles
    const particleCount = 45;
    const particles: DustParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.45 + 0.1,
        dx: (Math.random() - 0.5) * 0.25,
        dy: -Math.random() * 0.35 - 0.08, // slow upward drift
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Decay ambient pulse
      ambientPulseRef.current *= 0.94;
      const pulse = ambientPulseRef.current;

      // Draw subtle warm spotlight beam
      const spotlightGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.15,
        50,
        width / 2,
        height * 0.6,
        width * 0.65
      );
      spotlightGrad.addColorStop(0, `rgba(212, 175, 55, ${0.08 + pulse * 0.07})`);
      spotlightGrad.addColorStop(0.4, `rgba(180, 130, 40, ${0.03 + pulse * 0.04})`);
      spotlightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = spotlightGrad;
      ctx.fillRect(0, 0, width, height);

      // Render dust particles lit by spotlight
      for (let p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        p.alpha += Math.sin(Date.now() * p.twinkleSpeed) * 0.005;

        // Wrap around bounds
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Distance to spotlight center determines illumination
        const distFromCenter = Math.abs(p.x - width / 2) / (width / 2);
        const illumination = Math.max(0.2, 1 - distFromCenter * 0.8) + pulse * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 215, 140, ${Math.min(0.65, p.alpha * illumination)})`;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleEffects, reducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep concert hall charcoal vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 25%, #151821 0%, #0d0e13 55%, #050608 100%)',
        }}
      />
      {/* Subtle warm atmospheric glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] opacity-30 rounded-full blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(180, 83, 9, 0.1) 45%, transparent 70%)',
        }}
      />
      {/* Particle Canvas */}
      {particleEffects && !reducedMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
};
