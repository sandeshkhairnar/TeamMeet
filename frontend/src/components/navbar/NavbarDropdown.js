// src/components/navbar/NavbarDropdown.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LayoutDashboard, Package, UserCog, LogOut } from 'lucide-react';
import './NavbarDropdown.css';
import logo from '../../assets/logo.png'; // Import the logo image

const NavbarDropdown = ({ user, logout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          {/* Logo with a click handler to navigate to the Home page */}
          <img 
            src={logo} 
            alt="Logo" 
            className="logo-image" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }} // Adding a pointer cursor for a clickable effect
          />
        </div>

        
        <div className="navbar-actions">
          <div className="navbar-icons">
            <Bell className="nav-icon" onClick={() => navigate('/notifications')} />
          </div>
          
          <div className="profile-dropdown" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="profile-button"
              aria-label="Open user menu"
            >
              <User className="profile-icon" />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="user-email">{user?.email}</p>
                </div>

                <div className="dropdown-content">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsDropdownOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <LayoutDashboard className="dropdown-icon" />
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      navigate('/my-orders');
                      setIsDropdownOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <Package className="dropdown-icon" />
                    My Orders
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsDropdownOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <UserCog className="dropdown-icon" />
                    Update Profile
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="dropdown-item logout"
                  >
                    <LogOut className="dropdown-icon" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarDropdown;
