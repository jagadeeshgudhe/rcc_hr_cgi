// header.jsx
import React from "react";
import { LogOut, FileText, Upload, Languages, Home as HomeIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./header.css";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="header gradient-header">
      <div className="header-left">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/CGI_logo.svg/2560px-CGI_logo.svg.png"
          alt="CGI Logo"
          className="logo"
        />
        <nav className="nav-links">
          <Link to="/home" className="nav-link"><HomeIcon size={16} /> Home</Link>
          <Link to="/documents" className="nav-link"><FileText size={16} /> Document Set</Link>
          <Link to="/export" className="nav-link"><Upload size={16} /> Export</Link>
          <Link to="/translate" className="nav-link"><Languages size={16} /> Translate</Link>
        </nav>
      </div>
      <button className="logout-button" onClick={() => navigate("/")}>
        <LogOut size={18} style={{ marginRight: '6px' }} />
        Logout
      </button>
    </header>
  );
};

export default Header;
