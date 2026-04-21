interface Props { onClose: () => void; }

export default function PrivacyModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Privacy Policy</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p>This Privacy Policy explains what information <strong>OuterTiers</strong> — a community-run Minecraft PvP ranking project — collects when you use our website, and how it is used.</p>

          <div className="terms-section">
            <h3 className="terms-section-title">1. Information We Collect</h3>
            <p>We only collect information that is publicly available or that you choose to share with us:</p>
            <ul>
              <li>Public Minecraft usernames and UUIDs of players who are tested or ranked.</li>
              <li>Tier placements, points, and region tags submitted by community testers.</li>
              <li>Basic technical data your browser sends with every request (IP address, user-agent, request path) and a short-lived anonymous session id used to count how many viewers are currently online.</li>
            </ul>
            <p>We do not ask for, and do not knowingly store, real names, email addresses, passwords, or payment information.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">2. How We Use Information</h3>
            <p>The data above is used solely to operate the ranking platform: to display leaderboards, render player profiles, show how many people are currently viewing the site, and protect the service from abuse. We do not sell or rent your data.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">3. Cookies &amp; Local Storage</h3>
            <p>We use a small amount of local browser storage (sessionStorage) to keep an anonymous viewer id so the live "online now" counter works. We do not use advertising or tracking cookies. You can clear this data at any time from your browser settings.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">4. Third-Party Services</h3>
            <p>We use Mojang's public APIs and PlayerDB to look up Minecraft profile information, and we host on third-party infrastructure providers. Those providers may process the technical request data described above according to their own privacy policies.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">5. Data Removal</h3>
            <p>If you are a Minecraft player who appears on the site and you would like your username removed from the rankings, contact us via our Discord server. We will remove your entry on reasonable request.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">6. Data Security</h3>
            <p>We take reasonable steps to protect the data we hold, but no method of transmission over the Internet is 100% secure.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">7. Changes to This Policy</h3>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page. Continued use of the site after changes constitutes acceptance of the new policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
