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
      const cx = e.clientX;
      const cy = e.clientY;

      // ── Main burst container (core glow + first ring via ::before / ::after)
      const burst = document.createElement('span');
      burst.className = 'tap-burst';
      burst.style.left = `${cx}px`;
      burst.style.top = `${cy}px`;

      // ── Outer shockwave ring (expands further, delayed)
      const shockwave = document.createElement('span');
      shockwave.className = 'tap-shockwave';
      shockwave.style.left = `${cx}px`;
      shockwave.style.top = `${cy}px`;

      // ── Long sparks (angled streaks)
      const SPARK_COUNT = 14;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const spark = document.createElement('span');
        spark.className = 'tap-spark';
        const baseAngle = (i / SPARK_COUNT) * 360;
        const jitter = (Math.random() - 0.5) * 22;
        const isGold = i % 3 === 0;
        spark.style.setProperty('--angle', `${baseAngle + jitter}deg`);
        spark.style.setProperty('--spark-len', `${9 + Math.random() * 10}px`);
        spark.style.setProperty('--spark-dist', `${22 + Math.random() * 22}px`);
        spark.style.setProperty('--spark-color', isGold ? 'rgba(240,192,64,0.95)' : 'rgba(255,255,255,0.95)');
        spark.style.animationDelay = `${Math.random() * 0.05}s`;
        burst.appendChild(spark);
      }

      // ── Small debris dots scattered in all directions
      const DEBRIS_COUNT = 10;
      for (let i = 0; i < DEBRIS_COUNT; i++) {
        const debris = document.createElement('span');
        debris.className = 'tap-debris';
        const angle = Math.random() * 360;
        const dist = 20 + Math.random() * 32;
        const isBlue = i % 2 === 0;
        debris.style.setProperty('--debris-angle', `${angle}deg`);
        debris.style.setProperty('--debris-dist', `${dist}px`);
        debris.style.setProperty('--debris-color', isBlue ? 'rgba(91,164,245,0.9)' : 'rgba(240,192,64,0.85)');
        debris.style.setProperty('--debris-size', `${2 + Math.random() * 3}px`);
        debris.style.animationDelay = `${Math.random() * 0.04}s`;
        burst.appendChild(debris);
      }

      document.body.appendChild(burst);
      document.body.appendChild(shockwave);
      setTimeout(() => { burst.remove(); shockwave.remove(); }, 850);
    }

    function spawnRipple(target: HTMLElement, e: PointerEvent) {
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.8;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;

      const glow = document.createElement('span');
      glow.className = 'ripple-glow';
      glow.style.cssText = `width:${size * 0.6}px;height:${size * 0.6}px;left:${x + size * 0.2}px;top:${y + size * 0.2}px`;

      const computed = getComputedStyle(target);
      const hadRelative = computed.position !== 'static';
      const hadOverflow = computed.overflow === 'hidden' || computed.overflow === 'clip';

      if (!hadRelative) target.style.position = 'relative';
      if (!hadOverflow) target.style.overflow = 'hidden';

      target.appendChild(glow);
      target.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
        glow.remove();
        if (!hadRelative) target.style.position = '';
        if (!hadOverflow) target.style.overflow = '';
      }, 900);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return null;
}

function ScrollTrail() {
  useEffect(() => {
    let lastY = 0;
    let lastX = 0;
    let ticking = false;

    function spawnScrollTrail(x: number, y: number, dy: number) {
      const trail = document.createElement('span');
      trail.className = 'scroll-trail';
      trail.style.left = `${x}px`;
      trail.style.top = `${y}px`;
      trail.style.setProperty('--scroll-dy', `${dy > 0 ? -1 : 1}`);
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 600);
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const touch = e.touches[0];
          if (!touch) { ticking = false; return; }
          const dx = touch.clientX - lastX;
          const dy = touch.clientY - lastY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 6) {
            spawnScrollTrail(touch.clientX, touch.clientY, dy);
            lastX = touch.clientX;
            lastY = touch.clientY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) { lastX = touch.clientX; lastY = touch.clientY; }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
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
      <GlobalGlow />
      <ParticleBackground />
      <RippleLayer />
      <ScrollTrail />
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
