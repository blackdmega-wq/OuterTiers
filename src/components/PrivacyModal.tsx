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
          <p>This Privacy Policy explains how <strong>OuterTiers</strong> collects, uses, and protects your information when you use our website.</p>

          <div className="terms-section">
            <h3 className="terms-section-title">1. Information We Collect</h3>
            <p>We may collect information such as your Minecraft username, region, and gameplay statistics for the purpose of maintaining accurate rankings on the platform.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">2. How We Use Your Information</h3>
            <p>Your data is used solely to provide and improve the OuterTiers ranking service. We do not sell or share your personal information with third parties.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">3. Cookies</h3>
            <p>Our website may use cookies to enhance your browsing experience. You can choose to disable cookies in your browser settings, though some features may not function properly as a result.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">4. Data Security</h3>
            <p>We take reasonable steps to protect your data from unauthorized access. However, no method of transmission over the Internet is 100% secure.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">5. Changes to This Policy</h3>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page. Continued use of the site after changes constitutes acceptance of the new policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
