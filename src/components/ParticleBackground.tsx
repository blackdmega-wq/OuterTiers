import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  opacity: number; fadeDir: number;
  color: string;
  type: 'dot' | 'orb';
}

const COLORS = [
  '91,164,245',
  '91,164,245',
  '91,164,245',
  '240,192,64',
  '160,100,240',
  '64,200,140',
];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    const TARGET_FPS = 30;
    const FRAME_MS  = 1000 / TARGET_FPS;

    const DOT_COUNT = 22;
    const ORB_COUNT = 3;
    const MAX_DIST  = 90;
    const particles: Particle[] = [];

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < DOT_COUNT; i++) {
      particles.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        vx:      (Math.random() - 0.5) * 0.28,
        vy:      (Math.random() - 0.5) * 0.28,
        radius:  Math.random() * 1.3 + 0.5,
        opacity: Math.random() * 0.35 + 0.08,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color:   COLORS[Math.floor(Math.random() * COLORS.length)],
        type:    'dot',
      });
    }

    for (let i = 0; i < ORB_COUNT; i++) {
      particles.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        vx:      (Math.random() - 0.5) * 0.08,
        vy:      (Math.random() - 0.5) * 0.08,
        radius:  Math.random() * 60 + 40,
        opacity: Math.random() * 0.04 + 0.015,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color:   COLORS[Math.floor(Math.random() * 2)],
        type:    'orb',
      });
    }

    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      if (now - lastTime < FRAME_MS) return;
      lastTime = now;

      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'orb') {
          p.opacity += p.fadeDir * 0.0003;
          if (p.opacity > 0.06 || p.opacity < 0.01) p.fadeDir *= -1;
        } else {
          p.opacity += p.fadeDir * 0.002;
          if (p.opacity > 0.45 || p.opacity < 0.05) p.fadeDir *= -1;
        }

        if (p.x < -p.radius) p.x = canvas.width + p.radius;
        if (p.x > canvas.width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = canvas.height + p.radius;
        if (p.y > canvas.height + p.radius) p.y = -p.radius;

        if (p.type === 'orb') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(${p.color},${p.opacity})`);
          grad.addColorStop(1, `rgba(${p.color},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
          ctx.fill();
        }
      }

      const dots = particles.filter(p => p.type === 'dot');
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx   = dots[i].x - dots[j].x;
          const dy   = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.09;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(91,164,245,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', opacity: 0.75,
      }}
    />
  );
}
