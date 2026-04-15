import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  return (
    <nav>
      <Link to="/" className="nav-left">
        <img
          src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
          alt="GitHub Logo"
        />
        <h3>CodeForge</h3>
      </Link>
      <div className="nav-right">
        <Link to="/create">Create a Repository</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;
