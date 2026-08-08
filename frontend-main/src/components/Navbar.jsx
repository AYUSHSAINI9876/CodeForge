import { Link, useLocation } from "react-router-dom";
import Logo from "./common/Logo";
import "./navbar.css";

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav>
      <Link to="/" className="nav-left">
        <Logo size={40} />
        <h3>CodeForge</h3>
      </Link>
      <div className="nav-right">
        <Link to="/create" className={pathname === "/create" ? "active" : ""}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Repository
        </Link>
        <Link to="/profile" className={pathname.startsWith("/profile") ? "active" : ""}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
