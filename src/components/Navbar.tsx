import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Trophy, MessageCircle, BookOpen, Search, ChevronDown, X } from 'lucide-react';

export default function Navbar() {
  const [discordsOpen, setDiscordsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
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

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/player/${searchValue.trim()}`);
      setSearchValue('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="logo-outer">OUTER</span><span className="logo-tiers">TIERS</span>
          </Link>
          <div className="navbar-links">
            <Link to="/" className="nav-link">
              <Home size={16} />
              <span>Home</span>
            </Link>
            <Link to="/rankings/overall" className="nav-link">
              <Trophy size={16} />
              <span>Rankings</span>
            </Link>
            <div className="nav-dropdown" ref={dropdownRef}>
              <button className="nav-link nav-dropdown-trigger" onClick={() => setDiscordsOpen(!discordsOpen)}>
                <MessageCircle size={16} />
                <span>Discords</span>
                <ChevronDown size={14} className={discordsOpen ? 'rotated' : ''} />
              </button>
              {discordsOpen && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">OuterTiers Official</a>
                  <a href="#" className="dropdown-item">NA Community</a>
                  <a href="#" className="dropdown-item">EU Community</a>
                </div>
              )}
            </div>
            <Link to="/api-docs" className="nav-link">
              <BookOpen size={16} />
              <span>API Docs</span>
            </Link>
          </div>
        </div>
        <div className="navbar-search">
          <Search size={15} className="search-icon" />
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
              <X size={13} />
            </button>
          )}
          <span className="search-shortcut">/</span>
        </div>
      </div>
    </nav>
  );
}
