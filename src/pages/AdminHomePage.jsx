import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import VirtualAssistanceButton from "../components/chat/VirtualAssistanceButton";
import { FaTshirt, FaCalendarCheck, FaClock, FaGavel, FaFileContract, FaMoneyBillWave, FaFilePdf } from 'react-icons/fa';
import "../styles/pages/HomePage.css";
import { getActiveCountries, getFileReport } from "../api/authApi";

const AdminHomePage = () => {
  const navigate = useNavigate();
  
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

  // Icon mapping function
  const getPolicyIcon = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('dress_code') || name.includes('personal_hygiene')) return <FaTshirt className="policy-icon" />;
    if (name.includes('leave')) return <FaCalendarCheck className="policy-icon" />;
    if (name.includes('working_hours') || name.includes('non_standard')) return <FaClock className="policy-icon" />;
    if (name.includes('disciplinary')) return <FaGavel className="policy-icon" />;
    if (name.includes('notice_period') || name.includes('recovery')) return <FaFileContract className="policy-icon" />;
    if (name.includes('captive_allowance')) return <FaMoneyBillWave className="policy-icon" />;
    return <FaFilePdf className="policy-icon" />;
  };

  // Add a label mapping function
  const getPolicyLabel = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('dress_code') || name.includes('personal_hygiene')) return 'Dress Code';
    if (name.includes('leave')) return 'Leave Management';
    if (name.includes('working_hours') || name.includes('non_standard')) return 'Working Hours';
    if (name.includes('disciplinary')) return 'Disciplinary Actions';
    if (name.includes('notice_period') || name.includes('recovery')) return 'Notice Period & Recovery';
    if (name.includes('captive_allowance')) return 'Captive Allowance';
    return 'Policy Document';
  };

  return (
    <div className="home-container">
      <Header />
      <main className="main-content fade-in">
        <div className="homepage-header-card">
          <h1 className="homepage-title">HR QA PORTAL</h1>
        </div>
        <div className="policy-grid-card">
          <div className={`policy-grid${reports.length > 8 ? ' scrollable' : ''}`}>
            {reports.map((report, index) => (
              <div key={report.md5_text || index} className="policy-card" onClick={() => window.open(report.doc_url, '_blank', 'noopener,noreferrer')} style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                {getPolicyIcon(report.file_name)}
                <div style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '1.08rem', color: '#072141' }}>{getPolicyLabel(report.file_name)}</div>
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