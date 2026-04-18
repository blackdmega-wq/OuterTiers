import { useState } from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  onClose: () => void;
}

const TITLES = [
  {
    name: 'Combat Grandmaster',
    req: 'Obtained 400+ total points.',
    color: '#f0c040',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.3L12 14.8l-4.9 2.4.9-5.3L4 8l5.6-.2L12 2z" fill="#f0c040" stroke="#c88010" strokeWidth="0.5"/>
        <path d="M12 4.5l1.8 3.6L18 9l-3 2.9.7 4L12 14l-3.7 1.9.7-4L6 9l4.2-.9L12 4.5z" fill="#ffe566" opacity="0.6"/>
      </svg>
    ),
  },
  {
    name: 'Combat Master',
    req: 'Obtained 250+ total points.',
    color: '#f0c040',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.3L12 14.8l-4.9 2.4.9-5.3L4 8l5.6-.2L12 2z" fill="#d4a017" stroke="#9a6800" strokeWidth="0.5"/>
        <path d="M12 4.5l1.8 3.6L18 9l-3 2.9.7 4L12 14l-3.7 1.9.7-4L6 9l4.2-.9L12 4.5z" fill="#f0c040" opacity="0.5"/>
      </svg>
    ),
  },
  {
    name: 'Combat Ace',
    req: 'Obtained 100+ total points.',
    color: '#f07070',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.3L12 14.8l-4.9 2.4.9-5.3L4 8l5.6-.2L12 2z" fill="#f07070" stroke="#b04040" strokeWidth="0.5"/>
        <path d="M12 4.5l1.8 3.6L18 9l-3 2.9.7 4L12 14l-3.7 1.9.7-4L6 9l4.2-.9L12 4.5z" fill="#ffa0a0" opacity="0.5"/>
      </svg>
    ),
  },
  {
    name: 'Combat Specialist',
    req: 'Obtained 50+ total points.',
    color: '#b07ef5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.3L12 14.8l-4.9 2.4.9-5.3L4 8l5.6-.2L12 2z" fill="#b07ef5" stroke="#7040b8" strokeWidth="0.5"/>
        <path d="M12 4.5l1.8 3.6L18 9l-3 2.9.7 4L12 14l-3.7 1.9.7-4L6 9l4.2-.9L12 4.5z" fill="#d0a8ff" opacity="0.5"/>
      </svg>
    ),
  },
  {
    name: 'Combat Cadet',
    req: 'Obtained 20+ total points.',
    color: '#7090e0',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l1.5 3 3.3.5-2.4 2.3.6 3.2L12 10.5 9 12l.6-3.2-2.4-2.3 3.3-.5L12 3z" fill="#7090e0" stroke="#4060b0" strokeWidth="0.5"/>
      </svg>
    ),
  },
  {
    name: 'Combat Novice',
    req: 'Obtained 10+ total points.',
    color: '#6070c0',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="8" y="8" width="8" height="8" rx="1" transform="rotate(45 12 12)" fill="#6070c0" stroke="#3040a0" strokeWidth="0.5"/>
      </svg>
    ),
  },
  {
    name: 'Rookie',
    req: 'Starting rank for players with less than 10 points.',
    color: '#909090',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="8" y="8" width="8" height="8" rx="1" transform="rotate(45 12 12)" fill="#707070" stroke="#505050" strokeWidth="0.5"/>
      </svg>
    ),
  },
];

const TIER_POINTS = [
  { tier: 'Tier 1', htPts: 60, ltPts: 45, color: '#f0c040', border: '#c88010', trophy: '🏆', bg: 'rgba(212,160,23,0.12)' },
  { tier: 'Tier 2', htPts: 30, ltPts: 20, color: '#c0c8d8', border: '#8090a8', trophy: '🏆', bg: 'rgba(160,170,185,0.10)' },
  { tier: 'Tier 3', htPts: 10, ltPts: 6,  color: '#c87840', border: '#905030', trophy: '🏆', bg: 'rgba(160,90,30,0.10)' },
  { tier: 'Tier 4', htPts: 4,  ltPts: 3,  color: '#8899bb', border: '#505a70', trophy: '',    bg: 'transparent' },
  { tier: 'Tier 5', htPts: 2,  ltPts: 1,  color: '#606878', border: '#404550', trophy: '',    bg: 'transparent' },
];

export default function InfoModal({ onClose }: InfoModalProps) {
  const [tab, setTab] = useState<'titles' | 'points'>('titles');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-tabs">
            <button
              className={`modal-tab-btn ${tab === 'titles' ? 'active' : ''}`}
              onClick={() => setTab('titles')}
            >Titles</button>
            <button
              className={`modal-tab-btn ${tab === 'points' ? 'active' : ''}`}
              onClick={() => setTab('points')}
            >Points</button>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          {tab === 'titles' ? (
            <>
              <p className="modal-section-title">
                How to obtain <span className="modal-underline">Achievement Titles</span>
              </p>
              <div className="modal-titles-list">
                {TITLES.map(({ name, req, color, icon }) => (
                  <div className="modal-title-row" key={name}>
                    <div className="modal-title-icon">{icon}</div>
                    <div className="modal-title-info">
                      <span className="modal-title-name" style={{ color }}>{name}</span>
                      <span className="modal-title-req">{req}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="modal-section-title">
                How <span className="modal-underline">ranking points</span> are calculated
              </p>
              <div className="modal-points-list">
                {TIER_POINTS.map(({ tier, htPts, ltPts, color, border, trophy, bg }) => (
                  <div className="modal-points-tier" key={tier} style={{ background: bg, borderLeft: `3px solid ${border}` }}>
                    <div className="modal-points-tier-header">
                      {trophy && <span className="modal-points-trophy" style={{ filter: tier === 'Tier 2' ? 'grayscale(1) brightness(1.3)' : tier === 'Tier 3' ? 'sepia(1) saturate(2) hue-rotate(-20deg) brightness(0.85)' : '' }}>{trophy}</span>}
                      <span className="modal-points-tier-name" style={{ color }}>{tier}</span>
                    </div>
                    <div className="modal-points-badges">
                      <span className="modal-points-badge" style={{ background: `${border}30`, borderColor: border, color }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="17 11 12 6 7 11"/>
                          <polyline points="17 18 12 13 7 18"/>
                        </svg>
                        {htPts} Points
                      </span>
                      <span className="modal-points-badge" style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#333', color: '#8899aa' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="18 15 12 9 6 15"/>
                        </svg>
                        {ltPts} {ltPts === 1 ? 'Point' : 'Points'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
