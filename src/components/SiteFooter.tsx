import { useState } from 'react';
import { Link } from 'react-router-dom';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';
import DiscordJoinModal from './DiscordJoinModal';

const DISCORD_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TIKTOK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
  </svg>
);

const YOUTUBE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function SiteFooter() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDiscord, setShowDiscord] = useState(false);

  return (
    <>
      <footer className="site-footer">
        <div className="footer-inner">

          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <span className="logo-outer">OUTER</span><span className="logo-tiers">TIERS</span>
            </div>
            <p className="footer-brand-sub">
              The competitive Minecraft PvP ranking platform.
              Every tier. Every category. Every player.
            </p>
            <div className="footer-social-row">
              <button className="footer-social-btn" title="Discord servers" aria-label="Discord servers" onClick={() => setShowDiscord(true)}>
                {DISCORD_ICON}
              </button>
              <a href="https://www.tiktok.com/@0utversal" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="TikTok">
                {TIKTOK_ICON}
              </a>
              <a href="https://youtube.com/@outversal" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="YouTube">
                {YOUTUBE_ICON}
              </a>
            </div>
          </div>

          {/* Columns */}
          <div className="footer-cols">
            <div className="footer-col">
              <div className="footer-col-title">Navigation</div>
              <Link to="/" className="footer-col-link">Home</Link>
              <Link to="/rankings/overall" className="footer-col-link">Rankings</Link>
              <Link to="/api-docs" className="footer-col-link">API Docs</Link>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Game Modes</div>
              <Link to="/rankings/ogvanilla" className="footer-col-link">OG Vanilla</Link>
              <Link to="/rankings/vanilla" className="footer-col-link">Vanilla</Link>
              <Link to="/rankings/uhc" className="footer-col-link">UHC</Link>
              <Link to="/rankings/pot" className="footer-col-link">Pot</Link>
              <Link to="/rankings/sword" className="footer-col-link">Sword</Link>
              <Link to="/rankings/axe" className="footer-col-link">Axe</Link>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Community</div>
              <button className="footer-col-link footer-col-btn" onClick={() => setShowDiscord(true)}>Discord Servers</button>
              <button className="footer-col-link footer-col-btn" onClick={() => setShowTerms(true)}>Terms of Service</button>
              <button className="footer-col-link footer-col-btn" onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © 2025 OuterTiers FZCO · Registered in the United Arab Emirates · Not affiliated with Mojang Studios
          </p>
        </div>
      </footer>

      {showTerms   && <TermsModal   onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showDiscord && <DiscordJoinModal onClose={() => setShowDiscord(false)} />}
    </>
  );
}
