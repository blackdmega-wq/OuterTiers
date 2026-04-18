import { X } from 'lucide-react';

interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>How Tiers Work</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p>OuterTiers ranks players across 9 Minecraft PvP game modes. Each player receives a tier from <strong>Tier 1</strong> (best) to <strong>Tier 5</strong> (entry level) in each mode.</p>

          <div className="modal-tiers">
            {[
              { tier: 'Tier 1', color: '#5ba4f5', desc: 'Elite — top players in the world' },
              { tier: 'Tier 2', color: '#4cc768', desc: 'High — consistently dominant players' },
              { tier: 'Tier 3', color: '#c07ef5', desc: 'Mid-High — skilled, competitive players' },
              { tier: 'Tier 4', color: '#d4a017', desc: 'Mid — solid players with room to grow' },
              { tier: 'Tier 5', color: '#888',    desc: 'Entry — ranked, developing players' },
            ].map(({ tier, color, desc }) => (
              <div className="modal-tier-row" key={tier}>
                <span className="modal-tier-badge" style={{ color, borderColor: color }}>{tier}</span>
                <span className="modal-tier-desc">{desc}</span>
              </div>
            ))}
          </div>

          <p className="modal-note">Rankings are updated regularly by the OuterTiers staff based on competitive performance.</p>
        </div>
      </div>
    </div>
  );
}
