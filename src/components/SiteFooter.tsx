import { useState } from 'react';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';

export default function SiteFooter() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="site-footer">
        <div className="site-footer-links">
          <button className="footer-link" onClick={() => setShowTerms(true)}>terms of service</button>
          <span className="footer-sep">·</span>
          <button className="footer-link" onClick={() => setShowPrivacy(true)}>privacy policy</button>
        </div>
        <p className="site-footer-copy">
          © 2025 OuterTiers FZCO. Registered in the United Arab Emirates. All rights reserved.
          The OuterTiers server is in no way affiliated with Mojang Studios, nor should it be considered
          a company endorsed by Mojang Studios. Any contributions or purchases made on this store
          goes to the OuterTiers team.
        </p>
      </footer>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  );
}
