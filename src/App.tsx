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
      spawnClickDot(e.clientX, e.clientY);

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

    function spawnClickDot(x: number, y: number) {
      const dot = document.createElement('span');
      dot.className = 'click-dot';
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 600);
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
    const TRAIL_COUNT = 7;
    const dots: HTMLSpanElement[] = [];
    const history: { x: number; y: number }[] = [];
    let rafId = 0;
    let currentX = -200;
    let currentY = -200;
    let isActive = false;

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const dot = document.createElement('span');
      dot.className = 'touch-trail-dot';
      dot.style.opacity = '0';
      document.body.appendChild(dot);
      dots.push(dot);
    }

    const tick = () => {
      rafId = 0;
      if (!isActive) return;

      history.unshift({ x: currentX, y: currentY });
      if (history.length > TRAIL_COUNT * 4) history.length = TRAIL_COUNT * 4;

      dots.forEach((dot, i) => {
        const pos = history[i * 2] ?? history[history.length - 1];
        if (!pos) return;
        const size = Math.max(4, 14 - i * 1.5);
        const opacity = Math.max(0, 0.92 - i * 0.12);
        dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.opacity = String(opacity);
      });

      rafId = requestAnimationFrame(tick);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      isActive = true;
      currentX = t.clientX;
      currentY = t.clientY;
      history.length = 0;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        currentX = t.clientX;
        currentY = t.clientY;
      }
    };

    const hide = () => {
      isActive = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      dots.forEach(dot => { dot.style.opacity = '0'; });
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
