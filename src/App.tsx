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

function RippleLayer() {
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

    const handlePointerDown = (e: PointerEvent) => {
      spawnTapBurst(e);
      const target = (e.target as Element).closest(SELECTOR) as HTMLElement | null;
      if (!target) return;
      if (target.closest('.dropdown-menu')) {
        const item = (e.target as Element).closest('.dropdown-item') as HTMLElement | null;
        if (!item) return;
        spawnRipple(item, e);
        return;
      }
      spawnRipple(target, e);
    };

    function spawnTapBurst(e: PointerEvent) {
      const burst = document.createElement('span');
      burst.className = 'tap-burst';
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;

      for (let i = 0; i < 6; i++) {
        const spark = document.createElement('span');
        spark.className = 'tap-spark';
        spark.style.setProperty('--angle', `${i * 60}deg`);
        burst.appendChild(spark);
      }

      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 620);
    }

    function spawnRipple(target: HTMLElement, e: PointerEvent) {
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.4;
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

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
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
      <GlobalGlow />
      <ParticleBackground />
      <RippleLayer />
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
