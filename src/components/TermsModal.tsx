interface Props { onClose: () => void; }

export default function TermsModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Terms and Conditions</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p>Welcome to <strong>OuterTiers</strong>! By accessing or using our website, you agree to be bound by the following terms and conditions.</p>

          <div className="terms-section">
            <h3 className="terms-section-title">1. Use of the Website</h3>
            <p>You agree to use the website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the site.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">2. Intellectual Property</h3>
            <p>All content on this website (text, graphics, logos, etc.) is the property of <strong>OuterTiers FZCO</strong> and is protected by copyright and other laws. You may not reproduce or distribute any content without permission.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">3. Third-Party Links</h3>
            <p>Our website may contain links to third-party sites. We are not responsible for the content, policies, or practices of any third-party websites.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">4. Limitation of Liability</h3>
            <p>We do our best to keep the website accurate and functional, but we do not guarantee it will be error-free or uninterrupted. We are not liable for any damages resulting from your use of the site.</p>
          </div>

          <div className="terms-section">
            <h3 className="terms-section-title">5. Changes to the Terms</h3>
            <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page, and your continued use of the site after changes means you accept the updated Terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
