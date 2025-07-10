import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import VirtualAssistanceButton from "../components/chat/VirtualAssistanceButton";
import { FaFileAlt } from 'react-icons/fa';
import "../styles/pages/HomePage.css";
import { getActiveCountries, getFileReport } from "../api/authApi";

const AdminHomePage = () => {
  const navigate = useNavigate();
  
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

  const [countries, setCountries] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getActiveCountries();
        if (data.countries) setCountries(data.countries);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();

    // Fetch reports
    const fetchReports = async () => {
      try {
        const res = await getFileReport();
        if (res.files) setReports(res.files);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div className="welcome-section">
          <h1>WELCOME TO CGI</h1>
          <p className="subtitle">Admin Dashboard - Manage Your HR System</p>
          <p className="user-role">Administrator Panel</p>
        </div>
        <div className="policy-grid">
          {reports.map((report, index) => (
            <div key={report.md5_text || index} className="policy-card" onClick={() => window.open(report.doc_url, '_blank', 'noopener,noreferrer')} style={{ cursor: 'pointer' }}>
              <span className="policy-icon">
                <FaFileAlt />
              </span>
              <h3>{report.file_name}</h3>
            </div>
          ))}
        </div>
      </main>
      <VirtualAssistanceButton />
    </div>
  );
};

export default AdminHomePage; 