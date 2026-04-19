import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  fadeDir: number;
  color: string;
  type: 'dot' | 'orb' | 'spark';
  pulse: number;
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

    let animId = 0;
    let lastTime = performance.now();
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compact = width < 720;
    const TARGET_FPS = reducedMotion ? 18 : compact ? 30 : 45;
    const FRAME_MS = 1000 / TARGET_FPS;
    const DOT_COUNT = reducedMotion ? 10 : compact ? 16 : 26;
    const ORB_COUNT = reducedMotion ? 1 : compact ? 2 : 3;
    const SPARK_COUNT = reducedMotion ? 0 : compact ? 4 : 7;
    const MAX_DIST = compact ? 78 : 105;
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
    const particles: Particle[] = [];
    const dots: Particle[] = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < DOT_COUNT; i++) {
      particles.push({
        x:       Math.random() * width,
        y:       Math.random() * height,
        vx:      (Math.random() - 0.5) * 0.24,
        vy:      (Math.random() - 0.5) * 0.24,
        radius:  Math.random() * 1.25 + 0.55,
        opacity: Math.random() * 0.35 + 0.08,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color:   COLORS[Math.floor(Math.random() * COLORS.length)],
        type:    'dot',
        pulse:   Math.random() * Math.PI * 2,
      });
      dots.push(particles[particles.length - 1]);
    }

    for (let i = 0; i < ORB_COUNT; i++) {
      particles.push({
        x:       Math.random() * width,
        y:       Math.random() * height,
        vx:      (Math.random() - 0.5) * 0.065,
        vy:      (Math.random() - 0.5) * 0.065,
        radius:  Math.random() * 52 + 42,
        opacity: Math.random() * 0.035 + 0.012,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color:   COLORS[Math.floor(Math.random() * 2)],
        type:    'orb',
        pulse:   Math.random() * Math.PI * 2,
      });
    }

    for (let i = 0; i < SPARK_COUNT; i++) {
      particles.push({
        x:       Math.random() * width,
        y:       Math.random() * height,
        vx:      Math.random() * 0.34 + 0.16,
        vy:      Math.random() * 0.18 + 0.06,
        radius:  Math.random() * 1.1 + 0.7,
        opacity: Math.random() * 0.28 + 0.12,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color:   COLORS[Math.floor(Math.random() * COLORS.length)],
        type:    'spark',
        pulse:   Math.random() * Math.PI * 2,
      });
    }

    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      if (now - lastTime < FRAME_MS) return;
      const delta = Math.min((now - lastTime) / 16.67, 2.2);
      lastTime = now;

      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.pulse += 0.015 * delta;

        if (p.type === 'orb') {
          p.opacity += p.fadeDir * 0.00025 * delta;
          if (p.opacity > 0.052 || p.opacity < 0.01) p.fadeDir *= -1;
        } else if (p.type === 'spark') {
          p.opacity += p.fadeDir * 0.0014 * delta;
          if (p.opacity > 0.42 || p.opacity < 0.08) p.fadeDir *= -1;
        } else {
          p.opacity += p.fadeDir * 0.0016 * delta;
          if (p.opacity > 0.45 || p.opacity < 0.05) p.fadeDir *= -1;
        }

        if (p.x < -p.radius - 24) p.x = width + p.radius;
        if (p.x > width + p.radius + 24) p.x = -p.radius;
        if (p.y < -p.radius - 24) p.y = height + p.radius;
        if (p.y > height + p.radius + 24) p.y = -p.radius;

        if (p.type === 'orb') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(${p.color},${p.opacity})`);
          grad.addColorStop(1, `rgba(${p.color},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else if (p.type === 'spark') {
          const tail = 18 + Math.sin(p.pulse) * 5;
          ctx.beginPath();
          ctx.moveTo(p.x - tail, p.y - tail * 0.35);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(${p.color},${p.opacity * 0.55})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
          ctx.fill();
        } else {
          const r = p.radius + Math.sin(p.pulse) * 0.18;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
          ctx.fill();
        }
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx   = dots[i].x - dots[j].x;
          const dy   = dots[i].y - dots[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MAX_DIST_SQ) {
            const dist = Math.sqrt(distSq);
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
      ctx.globalCompositeOperation = 'source-over';
    }

    animId = requestAnimationFrame(draw);

    function handleVisibilityChange() {
      lastTime = performance.now();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', opacity: 0.82,
      }}
    />
  );
}
