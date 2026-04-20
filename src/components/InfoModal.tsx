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
  { num: 1, htPts: 60, ltPts: 45, htColor: '#f0c040', ltColor: '#e0b030', htBorder: '#c88010', ltBorder: '#a86800', bg: 'rgba(212,160,23,0.10)' },
  { num: 2, htPts: 30, ltPts: 20, htColor: '#7ab8ff', ltColor: '#5a98df', htBorder: '#4488cc', ltBorder: '#336699', bg: 'rgba(91,164,245,0.08)' },
  { num: 3, htPts: 10, ltPts: 6,  htColor: '#5ddb78', ltColor: '#3dbb58', htBorder: '#2a9a40', ltBorder: '#1a7a30', bg: 'rgba(76,199,104,0.07)' },
  { num: 4, htPts: 4,  ltPts: 3,  htColor: '#cf97f8', ltColor: '#af77d8', htBorder: '#8855cc', ltBorder: '#6633aa', bg: 'rgba(192,126,245,0.07)' },
  { num: 5, htPts: 2,  ltPts: 1,  htColor: '#999',    ltColor: '#777',    htBorder: '#555',    ltBorder: '#444',    bg: 'rgba(100,100,100,0.05)' },
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
              <p className="modal-points-note">
                Each category tier gives points. <strong>HT</strong> = High Tier (harder), <strong>LT</strong> = Low Tier (easier).
              </p>
              <div className="modal-points-header-row">
                <span className="modal-points-col-tier">Tier</span>
                <span className="modal-points-col-ht">HT Points</span>
                <span className="modal-points-col-lt">LT Points</span>
              </div>
              <div className="modal-points-list">
                {TIER_POINTS.map(({ num, htPts, ltPts, htColor, ltColor, htBorder, ltBorder, bg }) => (
                  <div className="modal-points-tier" key={num} style={{ background: bg }}>
                    <span className="modal-points-tier-label" style={{ color: htColor }}>Tier {num}</span>
                    <span className="modal-points-val" style={{ color: htColor, borderColor: htBorder, background: `${htBorder}22` }}>
                      ↑ {htPts} {htPts === 1 ? 'pt' : 'pts'}
                    </span>
                    <span className="modal-points-val" style={{ color: ltColor, borderColor: ltBorder, background: `${ltBorder}22` }}>
                      ↓ {ltPts} {ltPts === 1 ? 'pt' : 'pts'}
                    </span>
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
