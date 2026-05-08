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
  type: 'dot' | 'orb' | 'spark' | 'ember';
  pulse: number;
  cachedCanvas?: HTMLCanvasElement;
}

const COLORS = [
  '91,164,245',
  '37,99,235',
  '240,192,64',
  '220,38,38',
  '239,68,68',
];

function buildCachedCanvas(radius: number, color: string): HTMLCanvasElement {
  const size = Math.ceil(radius * 2) + 2;
  const oc = document.createElement('canvas');
  oc.width = size;
  oc.height = size;
  const cx = size / 2;
  const octx = oc.getContext('2d')!;
  const grad = octx.createRadialGradient(cx, cx, 0, cx, cx, radius);
  grad.addColorStop(0, `rgba(${color},1)`);
  grad.addColorStop(1, `rgba(${color},0)`);
  octx.beginPath();
  octx.arc(cx, cx, radius, 0, Math.PI * 2);
  octx.fillStyle = grad;
  octx.fill();
  return oc;
}

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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compact = width < 768; // treat tablets as mobile too

    // ── Mobile: cap DPR at 1.0 to halve canvas pixel count on retina phones.
    //    Desktop: cap at 1.5 (was 1.35, slight upgrade for sharp screens).
    let dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.0 : 1.5);

    // ── Mobile: 20 fps is smooth-enough for ambient background particles and
    //    burns ≈30% less GPU time than 28 fps.
    const TARGET_FPS = reducedMotion ? 15 : compact ? 20 : 38;
    const FRAME_MS   = 1000 / TARGET_FPS;

    // ── Particle counts: mobile gets fewer of everything.
    //    Sparks are removed on mobile — their atan2() + stroke call per
    //    particle is disproportionately expensive on A-series GPUs.
    const DOT_COUNT   = reducedMotion ? 6  : compact ? 9  : 26;
    const ORB_COUNT   = reducedMotion ? 0  : compact ? 1  : 3;
    const SPARK_COUNT = reducedMotion ? 0  : compact ? 0  : 7;  // always 0 on mobile
    const EMBER_COUNT = reducedMotion ? 2  : compact ? 5  : 14;

    // ── Connection lines: O(n²) distance checks + sqrt() every frame.
    //    On mobile with 9 dots → 36 checks/frame = fine.
    //    But we draw 0 lines on mobile anyway — too small to see clearly.
    const DRAW_LINES  = !compact && !reducedMotion;
    const MAX_DIST    = 108;
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST;

    const particles: Particle[] = [];
    const dots: Particle[] = [];

    function resize() {
      width  = window.innerWidth;
      height = window.innerHeight;
      dpr    = Math.min(window.devicePixelRatio || 1, compact ? 1.0 : 1.5);
      canvas!.width  = Math.floor(width  * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width  = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < DOT_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        radius: Math.random() * 1.35 + 0.55,
        opacity: Math.random() * 0.35 + 0.08,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color: COLORS[Math.floor(Math.random() * 3)],
        type: 'dot',
        pulse: Math.random() * Math.PI * 2,
      });
      dots.push(particles[particles.length - 1]);
    }

    for (let i = 0; i < ORB_COUNT; i++) {
      const radius = Math.random() * 64 + 52;
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
        radius,
        opacity: Math.random() * 0.035 + 0.012,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color,
        type: 'orb',
        pulse: Math.random() * Math.PI * 2,
        cachedCanvas: buildCachedCanvas(radius, color),
      });
    }

    for (let i = 0; i < SPARK_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: -Math.random() * 0.95 - 0.25,
        radius: Math.random() * 1.15 + 0.55,
        opacity: Math.random() * 0.45 + 0.16,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        type: 'spark',
        pulse: Math.random() * Math.PI * 2,
      });
    }

    for (let i = 0; i < EMBER_COUNT; i++) {
      const radius     = Math.random() * 1.55 + 0.75;
      const color      = Math.random() > 0.72 ? '240,192,64' : '239,68,68';
      const drawRadius = radius * 3.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.26,
        vy: -Math.random() * 0.5 - 0.12,
        radius,
        opacity: Math.random() * 0.48 + 0.16,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
        color,
        type: 'ember',
        pulse: Math.random() * Math.PI * 2,
        cachedCanvas: buildCachedCanvas(drawRadius, color),
      });
    }

    function draw(now: number) {
      animId = requestAnimationFrame(draw);
      if (now - lastTime < FRAME_MS) return;
      const delta = Math.min((now - lastTime) / 16.67, 2.1);
      lastTime = now;

      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        if (p.type === 'ember') p.x += Math.sin(now * 0.001 + p.pulse) * 0.34 * delta;

        p.x     += p.vx * delta;
        p.y     += p.vy * delta;
        p.pulse += 0.018 * delta;

        if (p.type === 'orb') {
          p.opacity += p.fadeDir * 0.00024 * delta;
          if (p.opacity > 0.055 || p.opacity < 0.01) p.fadeDir *= -1;
        } else if (p.type === 'spark') {
          p.opacity += p.fadeDir * 0.0032 * delta;
          if (p.opacity > 0.58 || p.opacity < 0.02) {
            p.x       = Math.random() * width;
            p.y       = height + 10;
            p.opacity = 0.09;
            p.fadeDir = 1;
            p.vx      = (Math.random() - 0.5) * 0.9;
            p.vy      = -Math.random() * 0.95 - 0.25;
          }
        } else if (p.type === 'ember') {
          p.opacity += p.fadeDir * 0.0015 * delta;
          if (p.opacity > 0.62 || p.opacity < 0.08) p.fadeDir *= -1;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else {
          p.opacity += p.fadeDir * 0.0016 * delta;
          if (p.opacity > 0.48 || p.opacity < 0.06) p.fadeDir *= -1;
        }

        if (p.type === 'dot' || p.type === 'orb') {
          if (p.x < -p.radius - 26) p.x = width  + p.radius;
          if (p.x > width  + p.radius + 26) p.x = -p.radius;
          if (p.y < -p.radius - 26) p.y = height + p.radius;
          if (p.y > height + p.radius + 26) p.y = -p.radius;
        }

        if (p.type === 'orb' && p.cachedCanvas) {
          ctx.globalAlpha = p.opacity;
          ctx.drawImage(p.cachedCanvas, p.x - p.radius - 1, p.y - p.radius - 1);
          ctx.globalAlpha = 1;
        } else if (p.type === 'spark') {
          const tail  = 20 + Math.sin(p.pulse) * 7;
          const angle = Math.atan2(p.vy, p.vx);
          ctx.beginPath();
          ctx.moveTo(p.x - Math.cos(angle) * tail, p.y - Math.sin(angle) * tail);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(${p.color},${p.opacity * 0.55})`;
          ctx.lineWidth   = 1.2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.9})`;
          ctx.fill();
        } else if (p.type === 'ember' && p.cachedCanvas) {
          const dr = p.radius * 3.2;
          ctx.globalAlpha = p.opacity;
          ctx.drawImage(p.cachedCanvas, p.x - dr - 1, p.y - dr - 1);
          ctx.globalAlpha = 1;
        } else if (p.type === 'dot') {
          const r = p.radius + Math.sin(p.pulse) * 0.18;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
          ctx.fill();
        }
      }

      // ── Connection lines: skipped on mobile (DRAW_LINES = false).
      //    On desktop this is the same O(n²) loop as before.
      if (DRAW_LINES) {
        for (let i = 0; i < dots.length; i++) {
          for (let j = i + 1; j < dots.length; j++) {
            const dx     = dots[i].x - dots[j].x;
            const dy     = dots[i].y - dots[j].y;
            const distSq = dx * dx + dy * dy;
            if (distSq < MAX_DIST_SQ) {
              const dist  = Math.sqrt(distSq);
              const alpha = (1 - dist / MAX_DIST) * 0.12;
              ctx.beginPath();
              ctx.moveTo(dots[i].x, dots[i].y);
              ctx.lineTo(dots[j].x, dots[j].y);
              ctx.strokeStyle = `rgba(91,164,245,${alpha})`;
              ctx.lineWidth   = 0.65;
              ctx.stroke();
            }
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
        zIndex: 0, pointerEvents: 'none', opacity: 0.92,
        mixBlendMode: 'screen',
        willChange: 'auto',
      }}
    />
  );
}
