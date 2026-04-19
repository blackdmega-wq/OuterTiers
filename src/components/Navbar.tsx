import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, X } from 'lucide-react';

export default function Navbar() {
  const [discordsOpen, setDiscordsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDiscordsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
            <Link to="/rankings/overall" className={`nav-link${isActive('/rankings') ? ' nav-link-active' : ''}`}>
              <img src="/nav_icons/rankings.svg" alt="Rankings" width={16} height={16} className="nav-icon" />
              <span>Rankings</span>
            </Link>
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                className={`nav-link nav-dropdown-trigger${discordsOpen ? ' nav-link-active' : ''}`}
                onClick={() => setDiscordsOpen(!discordsOpen)}
              >
                <img src="/nav_icons/discord.svg" alt="Discords" width={16} height={16} className="nav-icon" />
                <span>Discords</span>
                <ChevronDown size={14} className={discordsOpen ? 'rotated' : ''} style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
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
        <div className="navbar-search">
          <Search size={14} className="search-icon" />
          <input
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
    </nav>
  );
}
