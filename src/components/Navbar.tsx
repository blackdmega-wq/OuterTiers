import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, X } from 'lucide-react';
import { CATEGORIES } from '../data/players';

export default function Navbar() {
  const [discordsOpen, setDiscordsOpen] = useState(false);
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const discordRef  = useRef<HTMLDivElement>(null);
  const rankingsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (discordRef.current && !discordRef.current.contains(e.target as Node)) {
        setDiscordsOpen(false);
      }
      if (rankingsRef.current && !rankingsRef.current.contains(e.target as Node)) {
        setRankingsOpen(false);
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
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setDiscordsOpen(false);
        setRankingsOpen(false);
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/player/${searchValue.trim()}`);
      setSearchValue('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
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

            {/* Rankings dropdown */}
            <div className="nav-dropdown" ref={rankingsRef}>
              <button
                className={`nav-link nav-dropdown-trigger${isActive('/rankings') || rankingsOpen ? ' nav-link-active' : ''}`}
                onClick={() => { setRankingsOpen(o => !o); setDiscordsOpen(false); }}
              >
                <img src="/nav_icons/rankings.svg" alt="Rankings" width={16} height={16} className="nav-icon" />
                <span>Rankings</span>
                <ChevronDown size={14} className={rankingsOpen ? 'rotated' : ''} style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0 }} />
              </button>
              {rankingsOpen && (
                <div className="dropdown-menu dropdown-menu-wide animate-fade-down">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/rankings/${cat.id}`}
                      className={`dropdown-item${location.pathname === `/rankings/${cat.id}` ? ' dropdown-item-active' : ''}`}
                      onClick={() => setRankingsOpen(false)}
                    >
                      <img src={cat.icon} alt={cat.label} width={14} height={14} style={{ opacity: 0.75, flexShrink: 0 }} />
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Discords dropdown */}
            <div className="nav-dropdown" ref={discordRef}>
              <button
                className={`nav-link nav-dropdown-trigger${discordsOpen ? ' nav-link-active' : ''}`}
                onClick={() => { setDiscordsOpen(o => !o); setRankingsOpen(false); }}
              >
                <img src="/nav_icons/discord.svg" alt="Discords" width={16} height={16} className="nav-icon" />
                <span>Discords</span>
                <ChevronDown size={14} className={discordsOpen ? 'rotated' : ''} style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0 }} />
              </button>
              {discordsOpen && (
                <div className="dropdown-menu animate-fade-down">
                  <a href="https://discord.gg/6eAaPqg4up" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                    <img src="/nav_icons/discord.svg" alt="" width={13} height={13} style={{ opacity: 0.7 }} />
                    OuterTiers Official
                  </a>
                  <a href="https://discord.gg/teAFSB5EvF" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                    <img src="/nav_icons/discord.svg" alt="" width={13} height={13} style={{ opacity: 0.7 }} />
                    Outer Community
                  </a>
                </div>
              )}
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
          <div className="navbar-search">
            <Search size={14} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search player..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              className="search-input"
            />
            {searchValue && (
              <button className="search-clear" onClick={() => setSearchValue('')}>
                <X size={12} />
              </button>
            )}
            <span className="search-shortcut">/</span>
          </div>
        </div>

      </div>
    </nav>
  );
}
