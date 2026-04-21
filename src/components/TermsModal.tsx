interface Props { onClose: () => void; }

export default function TermsModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Terms of Service</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p>Welcome to <strong>OuterTiers</strong> — a community-run Minecraft PvP ranking project. By accessing or using this website you agree to the following terms.</p>

          <div className="terms-section">
            <h3 className="terms-section-title">1. Nature of the Project</h3>
            <p>OuterTiers is an unofficial, community-run platform. It is not a registered company and is not affiliated with, endorsed by, or sponsored by Mojang Studios, Microsoft, or any official Minecraft project. The website is provided free of charge for the competitive Minecraft PvP community.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">2. Use of the Website</h3>
            <p>You agree to use the website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the site. You may not attempt to disrupt the service, scrape it abusively, or copy the website or its source code in whole or in part for the purpose of impersonating or cloning the platform.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">3. Player Data &amp; Rankings</h3>
            <p>Tier placements and points are produced by community testers and reflect their judgement at the time of testing. Rankings may be updated, retested, or revoked at any time. We do not guarantee that any ranking is permanent or fully accurate.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">4. Intellectual Property</h3>
            <p>The OuterTiers name, logo, and original design elements belong to the OuterTiers project. Minecraft, Mojang, and all related names are property of Mojang Studios / Microsoft. You may not reproduce or redistribute content from this site without permission.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">5. Third-Party Links</h3>
            <p>Our website contains links to third-party sites such as Discord, TikTok and YouTube. We are not responsible for the content, policies, or practices of those services.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">6. Limitation of Liability</h3>
            <p>The website is provided "as is" without warranty of any kind. We do not guarantee that the service will be error-free or uninterrupted, and we are not liable for any damages resulting from your use of the site.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">7. Changes to the Terms</h3>
            <p>We may update these Terms from time to time. Updates will be posted on this page, and continued use of the site after changes means you accept the updated Terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
