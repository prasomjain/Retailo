import React, { useState } from 'react';
import './Layout.css';

const Layout = ({ children }) => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [invoicesOpen, setInvoicesOpen] = useState(true);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="retailo-section">
            <div className="retailo-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 4C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V5C18 4.44772 17.5523 4 17 4H7Z" fill="currentColor"/>
                <path d="M8 8H16V10H8V8Z" fill="#1a1a2e"/>
                <path d="M8 12H14V14H8V12Z" fill="#1a1a2e"/>
                <circle cx="10" cy="17" r="1.5" fill="#1a1a2e"/>
                <circle cx="14" cy="17" r="1.5" fill="#1a1a2e"/>
                <path d="M6 7L5 6V4L6 3H8L9 4V6L8 7H6Z" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            <div className="retailo-brand">
              <span className="retailo-label">Retailo</span>
              <span className="retailo-tagline">Sales Hub</span>
            </div>
          </div>
          <div className="user-info">
            <div className="profile-image">
              <img 
                src="https://ui-avatars.com/api/?name=Prasom+Jain&background=4a90e2&color=fff&size=128&bold=true" 
                alt="Profile"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="profile-fallback">PJ</div>
            </div>
            <div className="user-details">
              <span className="user-name">Prasom Jain</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item">Dashboard</a>
          <a href="#" className="nav-item">Nexus</a>
          <a href="#" className="nav-item">Intake</a>
          
          <div className="nav-section">
            <div 
              className="nav-item nav-section-header"
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              <span>Services</span>
              <span>{servicesOpen ? '▼' : '▶'}</span>
            </div>
            {servicesOpen && (
              <div className="nav-subsection">
                <a href="#" className="nav-item sub-item">Pre-active</a>
                <a href="#" className="nav-item sub-item">Active</a>
                <a href="#" className="nav-item sub-item">Blocked</a>
                <a href="#" className="nav-item sub-item">Closed</a>
              </div>
            )}
          </div>
          
          <div className="nav-section">
            <div 
              className="nav-item nav-section-header active"
              onClick={() => setInvoicesOpen(!invoicesOpen)}
            >
              <span>Invoices</span>
              <span>{invoicesOpen ? '▼' : '▶'}</span>
            </div>
            {invoicesOpen && (
              <div className="nav-subsection">
                <a href="#" className="nav-item sub-item active">Proforma Invoices</a>
                <a href="#" className="nav-item sub-item">Final Invoices</a>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

