import { useEffect } from 'react';

/**
 * Lightweight client-side hardening for the OuterTiers site.
 *
 * Important: this only RAISES THE BAR for casual cloners and inspectors.
 * Anything served to a browser can ultimately be read by a determined user.
 * The real security boundary lives on the API and at the host (CSP, HTTPS,
 * rate limiting, framing rules). This component complements those.
 */
export default function SiteShield() {
  useEffect(() => {
    // 1. Block right-click context menu on production builds (keeps casual
    //    users from "Save image as" / "View page source").
    const onContext = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
    };

    // 2. Block common devtools / view-source / save shortcuts.
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // F12
      if (e.key === 'F12') { e.preventDefault(); return; }
      // Ctrl/Cmd+U (view source), Ctrl/Cmd+S (save), Ctrl/Cmd+P (print to PDF clone)
      if ((e.ctrlKey || e.metaKey) && (k === 'u' || k === 's' || k === 'p')) {
        e.preventDefault(); return;
      }
      // Ctrl+Shift+I/J/C and Cmd+Opt+I/J/C — devtools / inspect element
      if ((e.ctrlKey && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) ||
          (e.metaKey  && e.altKey   && (k === 'i' || k === 'j' || k === 'c'))) {
        e.preventDefault(); return;
      }
    };

    // 3. Disable image dragging — stops drag-to-desktop image theft of avatars/logo.
    const onDragStart = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === 'IMG') e.preventDefault();
    };

    // 4. Disable text selection on chrome elements (keep it on data tables).
    document.body.classList.add('shield-no-select');

    document.addEventListener('contextmenu', onContext);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('dragstart', onDragStart);

    // 5. Frame-busting — refuse to be loaded inside an iframe on a foreign origin.
    try {
      if (window.top && window.top !== window.self) {
        const ourHost = window.location.hostname;
        const topHost = (() => {
          try { return window.top.location.hostname; } catch { return null; }
        })();
        if (topHost === null || topHost !== ourHost) {
          // Cross-origin iframe — try to break out, otherwise hide content.
          try { window.top.location.href = window.location.href; }
          catch { document.documentElement.style.display = 'none'; }
        }
      }
    } catch { /* ignore */ }

    // 6. Console deterrent — quiet, non-intrusive notice.
    try {
      const tag = ['%cOuterTiers', 'color:#5BA4F5;font-size:18px;font-weight:800;'];
      // eslint-disable-next-line no-console
      console.log(...tag);
      // eslint-disable-next-line no-console
      console.log('%cThis is a community PvP ranking project. Please do not paste any code here — it can be used to compromise your account.',
        'color:#f0c040;font-size:13px;');
    } catch { /* ignore */ }

    return () => {
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('dragstart', onDragStart);
      document.body.classList.remove('shield-no-select');
    };
  }, []);

  return null;
}
