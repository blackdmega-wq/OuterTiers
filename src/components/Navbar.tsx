import { useState, useRef, useEffect, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, X } from 'lucide-react';
import { CATEGORIES } from '../data/players';
import type { Player } from '../data/players';
import { usePlayers } from '../hooks/usePlayers';
import PlayerAvatar from './PlayerAvatar';

export default function Navbar() {
  const [discordsOpen, setDiscordsOpen] = useState(false);
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [suggOpen, setSuggOpen] = useState(false);
  const [rankingsMenuPos, setRankingsMenuPos] = useState({ top: 0, left: 0, minWidth: 210 });
  const [discordMenuPos, setDiscordMenuPos] = useState({ top: 0, left: 0, minWidth: 210 });
  const navigate = useNavigate();
  const location = useLocation();
  const discordRef  = useRef<HTMLDivElement>(null);
  const rankingsRef = useRef<HTMLDivElement>(null);
  const rankingsButtonRef = useRef<HTMLButtonElement>(null);
  const discordButtonRef = useRef<HTMLButtonElement>(null);
  const rankingsMenuRef = useRef<HTMLDivElement>(null);
  const discordMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const { players } = usePlayers();

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.points - a.points), [players]);

  const getRankClass = (p: Player) => {
    const r = sortedPlayers.findIndex(x => x.id === p.id) + 1;
    if (r === 1) return 'rank-gold';
    if (r === 2) return 'rank-silver';
    if (r === 3) return 'rank-bronze';
    return '';
  };

  const suggestions = useMemo<Player[]>(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return [];
    return sortedPlayers
      .filter(p => p.username.toLowerCase().includes(q))
      .sort((a, b) => {
        const as = a.username.toLowerCase().startsWith(q);
        const bs = b.username.toLowerCase().startsWith(q);
        if (as && !bs) return -1;
        if (!as && bs) return 1;
        return 0;
      })
      .slice(0, 7);
  }, [searchValue, sortedPlayers]);

  const updateMenuPosition = (
    button: HTMLButtonElement | null,
    setter: Dispatch<SetStateAction<{ top: number; left: number; minWidth: number }>>,
    menuWidth = 210
  ) => {
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const padding = 10;
    const maxLeft = window.innerWidth - menuWidth - padding;
    setter({
      top: Math.round(rect.bottom + 8),
      left: Math.round(Math.max(padding, Math.min(rect.left, maxLeft))),
      minWidth: Math.max(menuWidth, Math.round(rect.width)),
    });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (discordRef.current && !discordRef.current.contains(target) && !discordMenuRef.current?.contains(target)) {
        setDiscordsOpen(false);
      }
      if (rankingsRef.current && !rankingsRef.current.contains(target) && !rankingsMenuRef.current?.contains(target)) {
        setRankingsOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) {
        setSuggOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sync = () => {
      if (rankingsOpen) updateMenuPosition(rankingsButtonRef.current, setRankingsMenuPos, 260);
      if (discordsOpen) updateMenuPosition(discordButtonRef.current, setDiscordMenuPos, 220);
    };
    sync();
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('scroll', sync, { passive: true });
    return () => { window.removeEventListener('resize', sync); window.removeEventListener('scroll', sync); };
  }, [rankingsOpen, discordsOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setDiscordsOpen(false);
        setRankingsOpen(false);
        setSuggOpen(false);
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const sanitizeUsername = (raw: string) => raw.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = sanitizeUsername(e.target.value);
    setSearchValue(v);
    setSuggOpen(v.length > 0);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const clean = sanitizeUsername(searchValue.trim());
      if (clean) { navigate(`/player/${encodeURIComponent(clean)}`); setSearchValue(''); setSuggOpen(false); }
    }
    if (e.key === 'Escape') { setSuggOpen(false); searchInputRef.current?.blur(); }
  };

  const handleSuggClick = (username: string) => {
    navigate(`/player/${encodeURIComponent(username)}`);
    setSearchValue(''); setSuggOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const rankingsMenu = rankingsOpen ? createPortal(
    <div ref={rankingsMenuRef} className="dropdown-menu dropdown-menu-wide animate-fade-down" style={rankingsMenuPos}>
      {CATEGORIES.map(cat => (
        <Link key={cat.id} to={`/rankings/${cat.id}`}
          className={`dropdown-item${location.pathname === `/rankings/${cat.id}` ? ' dropdown-item-active' : ''}`}
          onClick={() => setRankingsOpen(false)}>
          <img src={cat.icon} alt={cat.label} width={14} height={14} style={{ opacity: 0.75, flexShrink: 0 }} />
          {cat.label}
        </Link>
      ))}
    </div>, document.body
  ) : null;

  const discordMenu = discordsOpen ? createPortal(
    <div ref={discordMenuRef} className="dropdown-menu animate-fade-down" style={discordMenuPos}>
      <a href="https://discord.gg/6eAaPqg4up" target="_blank" rel="noopener noreferrer" className="dropdown-item">
        <img src="/nav_icons/discord.svg" alt="" width={13} height={13} style={{ opacity: 0.7 }} />
        OuterTiers Official
      </a>
      <a href="https://discord.gg/teAFSB5EvF" target="_blank" rel="noopener noreferrer" className="dropdown-item">
        <img src="/nav_icons/discord.svg" alt="" width={13} height={13} style={{ opacity: 0.7 }} />
        Outer Community
      </a>
    </div>, document.body
  ) : null;

  const rankMedal: Record<string, string> = { 'rank-gold': '🥇', 'rank-silver': '🥈', 'rank-bronze': '🥉' };

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
        <div className="navbar-inner">

          <div className="navbar-left">
            <Link to="/" className="navbar-logo">
              <span className="logo-outer">OUTER</span><span className="logo-tiers">TIERS</span>
            </Link>
            <div className="navbar-links">
              <Link to="/" className={`nav-link${isActive('/') && location.pathname === '/' ? ' nav-link-active' : ''}`}>
                <img src="/nav_icons/home-muted.svg" alt="Home" width={16} height={16} className="nav-icon" />
                <span>Home</span>
              </Link>

              <div className="nav-dropdown" ref={rankingsRef}>
                <button ref={rankingsButtonRef}
                  className={`nav-link nav-dropdown-trigger${isActive('/rankings') || rankingsOpen ? ' nav-link-active' : ''}`}
                  onClick={() => { setRankingsOpen(o => !o); setDiscordsOpen(false); }}>
                  <img src="/nav_icons/rankings.svg" alt="Rankings" width={16} height={16} className="nav-icon" />
                  <span>Rankings</span>
                  <ChevronDown size={14} className={rankingsOpen ? 'rotated' : ''} style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0 }} />
                </button>
              </div>

              <div className="nav-dropdown" ref={discordRef}>
                <button ref={discordButtonRef}
                  className={`nav-link nav-dropdown-trigger${discordsOpen ? ' nav-link-active' : ''}`}
                  onClick={() => { setDiscordsOpen(o => !o); setRankingsOpen(false); }}>
                  <img src="/nav_icons/discord.svg" alt="Discords" width={16} height={16} className="nav-icon" />
                  <span>Discords</span>
                  <ChevronDown size={14} className={discordsOpen ? 'rotated' : ''} style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0 }} />
                </button>
              </div>

              <span className="nav-sep" aria-hidden="true" />

              <Link to="/api-docs" className={`nav-link${isActive('/api-docs') ? ' nav-link-active' : ''}`}>
                <img src="/nav_icons/file_code.svg" alt="API Docs" width={16} height={16} className="nav-icon" />
                <span style={{ whiteSpace: 'nowrap' }}>API Docs</span>
              </Link>
            </div>
          </div>

          <div className="navbar-right">
            <span className="nav-sep" aria-hidden="true" />
            <div className="navbar-search-wrap" ref={searchWrapRef}>
              <div className={`navbar-search${suggOpen && suggestions.length > 0 ? ' navbar-search--open' : ''}`}>
                <Search size={14} className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search player..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => { if (searchValue.length > 0) setSuggOpen(true); }}
                  maxLength={16}
                  onKeyDown={handleSearch}
                  className="search-input"
                  autoComplete="off"
                  spellCheck={false}
                />
                {searchValue && (
                  <button className="search-clear" onClick={() => { setSearchValue(''); setSuggOpen(false); }}>
                    <X size={12} />
                  </button>
                )}
                <span className="search-shortcut">/</span>
              </div>

              {suggOpen && suggestions.length > 0 && (
                <div className="search-suggestions animate-fade-down">
                  {suggestions.map(p => {
                    const rankCls = getRankClass(p);
                    const medal = rankMedal[rankCls] ?? null;
                    return (
                      <button
                        key={p.id}
                        className={`search-sugg-item${rankCls ? ` search-sugg-item--${rankCls}` : ''}`}
                        onClick={() => handleSuggClick(p.username)}
                        type="button"
                      >
                        <div className="search-sugg-avatar">
                          <PlayerAvatar username={p.uuid || p.username} size={40} />
                          {rankCls && <span className={`search-sugg-dot search-sugg-dot--${rankCls}`} />}
                        </div>
                        <div className="search-sugg-info">
                          <span className="search-sugg-name">{p.username}</span>
                          <span className="search-sugg-pts">{p.points.toLocaleString()} pts</span>
                        </div>
                        {medal && <span className="search-sugg-medal">{medal}</span>}
                      </button>
                    );
                  })}
                  <div className="search-sugg-footer">
                    Press <kbd>↵</kbd> to search by name
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </nav>
      {rankingsMenu}
      {discordMenu}
    </>
  );
}
