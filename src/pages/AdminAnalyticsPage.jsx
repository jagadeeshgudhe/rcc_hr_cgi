import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaArrowLeft, FaChartBar, FaChartLine, FaChartPie, FaDownload } from 'react-icons/fa';
import "../styles/pages/AdminAnalyticsPage.css";

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-analytics-container">
      <Header />
      
      <main className="analytics-main-content">
        <div className="analytics-header">
          <button className="back-button" onClick={() => navigate("/admin")}>
            <FaArrowLeft /> Back to Admin Dashboard
          </button>
          <h1>Analytics Dashboard</h1>
          <button className="export-button">
            <FaDownload /> Export Report
          </button>
        </div>

        <div className="analytics-content">
          <div className="coming-soon">
            <FaChartBar className="coming-soon-icon" />
            <h2>Analytics Dashboard Coming Soon</h2>
            <p>This feature will provide comprehensive insights into system usage, policy access patterns, and user engagement metrics.</p>
            <div className="feature-list">
              <div className="feature-item">
                <FaChartBar />
                <span>Usage statistics</span>
              </div>
              <div className="feature-item">
                <FaChartLine />
                <span>Trend analysis</span>
              </div>
              <div className="feature-item">
                <FaChartPie />
                <span>Policy popularity</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage; 