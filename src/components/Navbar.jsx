import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Menu, X, ArrowRight } from "lucide-react";
import "../styles/Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <GraduationCap size={27} />
        </div>
        <span>Campus<span className="brand-highlight">Flow</span></span>
      </Link>

      <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
        <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
        <Link to="/college/reva" className="nav-mobile-btn" onClick={() => setMobileMenuOpen(false)}>
          REVA Portal
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link to="/college/reva" className="nav-button">
          REVA Portal <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
        </Link>

        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
