import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Upload,
  Home as HomeIcon,
  FileText,
  Users,
  Cog,
  User as UserIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="header gradient-header">
      <div className="header-left">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/CGI_logo.svg/2560px-CGI_logo.svg.png"
          alt="CGI Logo"
          className="logo"
        />
        <nav className="nav-links">
          {isAdmin() ? (
            // Admin navigation
            <>
              <Link to="/admin" className="nav-link">
                <HomeIcon size={16} /> Home
              </Link>
              <Link to="/admin/records" className="nav-link">
                <FileText size={16} /> Document Upload
              </Link>
              <Link to="/admin/settings" className="nav-link">
                <Cog size={16} /> Settings
              </Link>
              <Link to="/export" className="nav-link">
                <Upload size={16} /> Help
              </Link>
            </>
          ) : (
            // User navigation
            <>
              <Link to="/user" className="nav-link">
                <HomeIcon size={16} /> Home
              </Link>
              <Link to="/export" className="nav-link">
                <Upload size={16} /> Help
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="header-right">
        {currentUser && (
          <div className="user-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="user-dropdown-toggle"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-label="User menu"
            >
              <span className="user-avatar-circle">
                <UserIcon size={20} />
              </span>
            </button>
            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-info">
                  <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className={`user-role ${currentUser.role}`}>({currentUser.role.toUpperCase()})</span>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                  <LogOut size={18} style={{ marginRight: "6px" }} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
