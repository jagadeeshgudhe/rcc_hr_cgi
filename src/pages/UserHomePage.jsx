import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import VirtualAssistanceButton from "../components/chat/VirtualAssistanceButton";
import { FaFileAlt } from 'react-icons/fa';
import "../styles/pages/HomePage.css";
import { getActiveCountries } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const UserHomePage = () => {
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

  const { token } = useAuth();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getActiveCountries(token);
        setCountries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCountries();
  }, [token]);

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div className="welcome-section">
          <h1>WELCOME TO CGI</h1>
          <p className="subtitle">Your HR Assistant - Here to Help</p>
          <p className="user-role">User Dashboard</p>
        </div>
        <div className="active-countries-section">
          <h3>Active Countries</h3>
          {loading && <p>Loading countries...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <ul>
            {countries.map((country, idx) => (
              <li key={idx}>{country}</li>
            ))}
          </ul>
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

export default UserHomePage; 