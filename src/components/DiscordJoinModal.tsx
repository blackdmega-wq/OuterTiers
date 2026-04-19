interface Props { onClose: () => void; }

const DISCORD_OFFICIAL  = 'https://discord.gg/6eAaPqg4up';
const DISCORD_COMMUNITY = 'https://discord.gg/teAFSB5EvF';

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function DiscordJoinModal({ onClose }: Props) {
  return (
    <div className="modal-overlay dj-overlay" onClick={onClose}>
      <div className="dj-modal" onClick={e => e.stopPropagation()}>
        <button className="dj-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="dj-icon-ring">
          <DiscordIcon />
        </div>

        <h2 className="dj-title">Want to join?</h2>
        <p className="dj-sub">Choose the Discord server you want to join.</p>

        <div className="dj-choices">
          <a
            href={DISCORD_OFFICIAL}
            target="_blank"
            rel="noopener noreferrer"
            className="dj-choice dj-choice-official"
            onClick={onClose}
          >
            <div className="dj-choice-icon"><DiscordIcon /></div>
            <div className="dj-choice-text">
              <span className="dj-choice-label">OuterTiers</span>
              <span className="dj-choice-desc">Official Server</span>
            </div>
            <svg className="dj-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>

          <a
            href={DISCORD_COMMUNITY}
            target="_blank"
            rel="noopener noreferrer"
            className="dj-choice dj-choice-community"
            onClick={onClose}
          >
            <div className="dj-choice-icon"><DiscordIcon /></div>
            <div className="dj-choice-text">
              <span className="dj-choice-label">Outer Community</span>
              <span className="dj-choice-desc">Community Server</span>
            </div>
            <svg className="dj-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
