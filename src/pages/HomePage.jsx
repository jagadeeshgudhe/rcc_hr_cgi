import React from "react";
import Header from "../components/layout/Header";
import VirtualAssistanceButton from "../components/chat/VirtualAssistanceButton";
import { FaFileAlt } from 'react-icons/fa';
import "../styles/pages/HomePage.css";

const HomePage = () => {
  const policies = [
    "Leave Management Rule",
    "Captive Allowance",
    "Dress Code and Personal Hygiene",
    "Non Standard Working Hours Management Rule",
    "Notice Period and Recovery Management Rule",
    "Disciplinary Actions",
    "Travel Policy",
    "Work From Home Policy",
    "Compensation Policy",
    "Performance Management"
  ];

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div className="welcome-section">
          <h1>WELCOME TO CGI</h1>
          <p className="subtitle">Your HR Assistant - Here to Help</p>
        </div>
        <div className="policy-grid">
          {policies.map((policy, index) => (
            <div key={index} className="policy-card">
              <span className="policy-icon">
                <FaFileAlt />
              </span>
              <h3>{policy}</h3>
            </div>
          ))}
        </div>
      </main>
      <VirtualAssistanceButton />
    </div>
  );
};

export default HomePage;
