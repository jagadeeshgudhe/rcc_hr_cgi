import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import VirtualAssistanceButton from "../components/chat/VirtualAssistanceButton";
import { FaFileAlt, FaCog, FaUsers } from 'react-icons/fa';
import "../styles/pages/HomePage.css";

const AdminHomePage = () => {
  const navigate = useNavigate();
  
  const adminFeatures = [
    {
      title: "Records Management",
      description: "Upload, edit, and manage HR policy documents",
      icon: <FaFileAlt />,
      onClick: () => navigate("/admin/records"),
      color: "#3b82f6"
    },
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: <FaUsers />,
      onClick: () => navigate("/admin/users"),
      color: "#10b981"
    },
    {
      title: "Settings",
      description: "Configure system-wide settings and preferences",
      icon: <FaCog />,
      onClick: () => navigate("/admin/settings"),
      color: "#8B5CF6",
      center: true
    }
  ];

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div className="welcome-section">
          <h1>WELCOME TO CGI</h1>
          <p className="subtitle">Admin Dashboard - Manage Your HR System</p>
          <p className="user-role">Administrator Panel</p>
        </div>
        
        {/* Admin Features Section */}
        <div className="admin-features-section">
          <h2>Admin Tools</h2>
          <div className="admin-features-grid">
            {adminFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`admin-feature-card${feature.center ? ' center-card' : ''}`}
                onClick={feature.onClick}
                style={{ borderLeft: `4px solid ${feature.color}` }}
              >
                <div className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <VirtualAssistanceButton />
    </div>
  );
};

export default AdminHomePage; 