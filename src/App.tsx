import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
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

function ClickLayer() {
  useEffect(() => {
    const SELECTOR = [
      'button',
      'a',
      '.nav-link',
      '.nav-dropdown-trigger',
      '.hero-btn',
      '.discord-btn',
      '.category-tab',
      '.tier-player-row',
      '.player-row',
      '.apidocs-endpoint-card',
      '.dj-choice',
      '.info-btn',
      '.modal-tab-btn',
      '.modal-close',
      '.stat-card',
      '.feature-card',
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
      const onEnd = () => {
        el.classList.remove('click-bounce');
        el.removeEventListener('animationend', onEnd);
      };
      el.addEventListener('animationend', onEnd);
    };

    function spawnClickEffect(x: number, y: number) {
      const dot = document.createElement('span');
      dot.className = 'click-dot';
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 700);

      for (let i = 0; i < 2; i++) {
        const ring = document.createElement('span');
        ring.className = 'click-ring';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        ring.style.animationDelay = `${i * 90}ms`;
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 750 + i * 90);
      }

      const SPARK_COUNT = 6;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const angle = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 30 + Math.random() * 24;
        const spark = document.createElement('span');
        spark.className = 'click-spark';
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
        spark.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
        spark.style.animationDelay = `${Math.random() * 40}ms`;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 520);
      }
    }

    function spawnRipple(target: HTMLElement, e: PointerEvent) {
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.8;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;

      const computed = getComputedStyle(target);
      const hadRelative = computed.position !== 'static';
      const hadOverflow = computed.overflow === 'hidden' || computed.overflow === 'clip';

      if (!hadRelative) target.style.position = 'relative';
      if (!hadOverflow) target.style.overflow = 'hidden';

      target.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
        if (!hadRelative) target.style.position = '';
        if (!hadOverflow) target.style.overflow = '';
      }, 700);
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return null;
}

function TouchTrail() {
  useEffect(() => {
    const TRAIL_COUNT = 9;
    const MAX_HISTORY = 120;
    const dots: HTMLSpanElement[] = [];

    // All touch positions are pushed here on EVERY touchmove event (not once per frame).
    // This is the key fix: we capture the full path, not just the last known position.
    const posLog: { x: number; y: number }[] = [];
    let rafId = 0;
    let isActive = false;
    let hideTimer = 0;

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const dot = document.createElement('span');
      dot.className = 'touch-trail-dot';
      dot.style.opacity = '0';
      document.body.appendChild(dot);
      dots.push(dot);
    }

    const tick = () => {
      rafId = 0;
      const len = posLog.length;
      if (len === 0) return;

      dots.forEach((dot, i) => {
        // Spread dots evenly over the full position history.
        // i=0 → newest position, i=TRAIL_COUNT-1 → oldest captured position.
        const t = TRAIL_COUNT > 1 ? i / (TRAIL_COUNT - 1) : 0;
        const idx = Math.min(Math.round(t * (len - 1)), len - 1);
        const pos = posLog[idx];
        const size = Math.max(4, 14 - i * 1.1);
        const opacity = isActive ? Math.max(0, 1 - i * 0.11) : 0;
        dot.style.transform = `translate(${pos.x}px,${pos.y}px) translate(-50%,-50%)`;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.opacity = String(opacity);
      });

      if (posLog.length > MAX_HISTORY) posLog.length = MAX_HISTORY;

      if (isActive) rafId = requestAnimationFrame(tick);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      isActive = true;
      clearTimeout(hideTimer);
      posLog.length = 0;
      posLog.push({ x: t.clientX, y: t.clientY });
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      // Prepend so index 0 = newest
      posLog.unshift({ x: t.clientX, y: t.clientY });
      if (posLog.length > MAX_HISTORY) posLog.length = MAX_HISTORY;
      // Kick off a new frame if none is scheduled
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const hide = () => {
      isActive = false;
      // Fade out dots gracefully over next few frames
      hideTimer = window.setTimeout(() => {
        dots.forEach(dot => { dot.style.opacity = '0'; });
        posLog.length = 0;
      }, 120);
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', hide, { passive: true });
    document.addEventListener('touchcancel', hide, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', hide);
      document.removeEventListener('touchcancel', hide);
      dots.forEach(d => d.remove());
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(hideTimer);
    };
  }, []);

  return null;
}

function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="page-bg" aria-hidden="true" />
      <div className="page-bg-grid" aria-hidden="true" />
      <GlobalGlow />
      <ParticleBackground />
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
    </BrowserRouter>
  );
}
