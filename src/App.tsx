import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SiteShield from './components/SiteShield';
import SiteFooter from './components/SiteFooter';
import ParticleBackground from './components/ParticleBackground';
import GlobalGlow from './components/GlobalGlow';
import Home from './pages/Home';
import Rankings from './pages/Rankings';
import PlayerProfile from './pages/PlayerProfile';
import ApiDocs from './pages/ApiDocs';

function NotFound() {
  return (
    <div className="not-found-page">
      <h1>PAGE NOT FOUND</h1>
      <p>The page you were looking for does not exist.</p>
      <a href="/" className="go-home-btn">⬅ Go Home</a>
    </div>
  );
}

// ── Detect touch-primary devices once at module load time.
//    Used by ClickLayer and TouchTrail to reduce DOM work on mobile.
const IS_TOUCH = typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

function ClickLayer() {
  useEffect(() => {
    const SELECTOR = [
      'button', 'a', '.nav-link', '.nav-dropdown-trigger',
      '.hero-btn', '.discord-btn', '.tier-player-row',
      '.player-row', '.apidocs-endpoint-card', '.dj-choice', '.info-btn',
      '.modal-tab-btn', '.modal-close', '.stat-card', '.feature-card',
    ].join(',');

    const onPointerDown = (e: PointerEvent) => {
      spawnClickEffect(e.clientX, e.clientY);
      const target = (e.target as Element).closest(SELECTOR) as HTMLElement | null;
      if (!target) return;
      const el = target.closest('.dropdown-menu')
        ? ((e.target as Element).closest('.dropdown-item') as HTMLElement | null) ?? target
        : target;
      spawnRipple(el, e);
      el.classList.remove('click-bounce');
      void el.offsetWidth;
      el.classList.add('click-bounce');
      const onEnd = () => { el.classList.remove('click-bounce'); el.removeEventListener('animationend', onEnd); };
      el.addEventListener('animationend', onEnd);
    };

    function spawnClickEffect(x: number, y: number) {
      // ── Dot: always shown ──
      const dot = document.createElement('span');
      dot.className = 'click-dot';
      dot.style.left = `${x}px`;
      dot.style.top  = `${y}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 650);

      // ── Ring: 1 ring on mobile (lighter), 2 on desktop ──
      const ringCount = IS_TOUCH ? 1 : 2;
      for (let i = 0; i < ringCount; i++) {
        const ring = document.createElement('span');
        ring.className = 'click-ring';
        ring.style.left = `${x}px`;
        ring.style.top  = `${y}px`;
        ring.style.animationDelay = `${i * 80}ms`;
        if (i === 1) ring.style.borderColor = 'rgba(240,192,64,0.75)';
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 600 + i * 80);
      }

      // ── Sparks: skipped on touch devices.
      //    Each click spawns 6 DOM nodes + 6 CSS animations. On a phone
      //    with fast tap-repeat this floods the compositor queue. ──
      if (!IS_TOUCH) {
        const SPARK_COLORS = ['rgba(255,255,255,1)','rgba(150,210,255,0.95)','rgba(240,192,64,0.9)','rgba(91,164,245,1)'];
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const dist  = 20 + Math.random() * 20;
          const spark = document.createElement('span');
          spark.className = 'click-spark';
          spark.style.left = `${x}px`;
          spark.style.top  = `${y}px`;
          spark.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
          spark.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
          spark.style.background = SPARK_COLORS[i % SPARK_COLORS.length];
          spark.style.animationDelay = `${Math.random() * 25}ms`;
          document.body.appendChild(spark);
          setTimeout(() => spark.remove(), 480);
        }
      }
    }

    function spawnRipple(target: HTMLElement, e: PointerEvent) {
      const rect   = target.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2.8;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      const computed    = getComputedStyle(target);
      const hadRelative = computed.position !== 'static';
      const hadOverflow = computed.overflow === 'hidden' || computed.overflow === 'clip';
      if (!hadRelative) target.style.position = 'relative';
      if (!hadOverflow) target.style.overflow  = 'hidden';
      target.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
        if (!hadRelative) target.style.position = '';
        if (!hadOverflow) target.style.overflow  = '';
      }, 700);
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);
  return null;
}

function TouchTrail() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483645;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;

    // ── Cap DPR at 1 on touch devices: the trail canvas is full-screen and
    //    redrawn every touchmove. At DPR 2 (iPhone retina) that's 4× the
    //    pixels to clear+paint per frame. Trail quality is imperceptibly
    //    different at DPR 1 on a 375px-wide screen. ──
    const dpr = IS_TOUCH
      ? Math.min(window.devicePixelRatio || 1, 1)
      : Math.min(window.devicePixelRatio || 1, 2);

    let W = window.innerWidth, H = window.innerHeight;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ── Fewer trail points on mobile: halves the per-frame arc() calls ──
    const MAX_PTS      = IS_TOUCH ? 55 : 100;
    const TRAIL_LIFE_MS = 380;
    const pts: { x: number; y: number; t: number }[] = [];
    let rafId = 0, isActive = false;

    function draw(now: number) {
      rafId = 0;
      ctx.clearRect(0, 0, W, H);
      const cutoff = now - TRAIL_LIFE_MS;
      while (pts.length > 0 && pts[pts.length - 1].t < cutoff) pts.pop();
      if (pts.length > 1) {
        ctx.save();
        ctx.shadowColor = 'rgba(91,164,245,0.85)';
        ctx.shadowBlur  = IS_TOUCH ? 8 : 12; // lighter shadow on mobile
        for (let i = 0; i < pts.length; i++) {
          const ageFrac  = (now - pts[i].t) / TRAIL_LIFE_MS;
          const idxFrac  = i / (pts.length - 1);
          const fade     = Math.max(0, 1 - ageFrac);
          const alpha    = fade * (1 - idxFrac * 0.55) * 0.92;
          const radius   = Math.max(1.5, 8.5 * (1 - idxFrac * 0.72) * fade);
          if (alpha < 0.01) continue;
          const isMid = idxFrac > 0.3 && idxFrac < 0.7;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(pts[i].x, pts[i].y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${isMid ? 230 : 180},${isMid ? 195 : 225},255)`;
          ctx.fill();
        }
        ctx.restore();
      }
      if (isActive || pts.length > 0) { rafId = requestAnimationFrame(draw); }
    }

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      isActive    = true;
      pts.length  = 0;
      pts.unshift({ x: t.clientX, y: t.clientY, t: performance.now() });
      if (!rafId) rafId = requestAnimationFrame(draw);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      pts.unshift({ x: t.clientX, y: t.clientY, t: performance.now() });
      if (pts.length > MAX_PTS) pts.length = MAX_PTS;
      if (!rafId) rafId = requestAnimationFrame(draw);
    };
    const onTouchEnd = () => { isActive = false; };

    document.addEventListener('touchstart',  onTouchStart,  { passive: true });
    document.addEventListener('touchmove',   onTouchMove,   { passive: true });
    document.addEventListener('touchend',    onTouchEnd,    { passive: true });
    document.addEventListener('touchcancel', onTouchEnd,    { passive: true });

    return () => {
      document.removeEventListener('touchstart',  onTouchStart);
      document.removeEventListener('touchmove',   onTouchMove);
      document.removeEventListener('touchend',    onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
      canvas.remove();
    };
  }, []);
  return null;
}

function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    if (!els.length) return;
    let batchTimer = 0, batchQueue: HTMLElement[] = [];
    const flushBatch = () => {
      batchTimer = 0;
      batchQueue.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      batchQueue.forEach((el, i) => {
        const delay = i * 50;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('revealed');
        setTimeout(() => { el.style.transitionDelay = ''; }, 520 + delay);
      });
      batchQueue = [];
    };
    const io = new IntersectionObserver((entries) => {
      let hadIntersecting = false;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          batchQueue.push(entry.target as HTMLElement);
          io.unobserve(entry.target);
          hadIntersecting = true;
        }
      });
      if (hadIntersecting) { clearTimeout(batchTimer); batchTimer = window.setTimeout(flushBatch, 16); }
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => io.observe(el));
    return () => { io.disconnect(); clearTimeout(batchTimer); };
  }, []);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <div className="page-bg" aria-hidden="true" />
      <div className="page-bg-grid" aria-hidden="true" />
      <GlobalGlow />
      <ParticleBackground />
      <SiteShield />
      <ClickLayer />
      <TouchTrail />
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rankings" element={<Navigate to="/rankings/overall" replace />} />
            <Route path="/rankings/:category" element={<Rankings />} />
            <Route path="/player/:username" element={<PlayerProfile />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
      <ScrollReveal />
    </HashRouter>
  );
}
