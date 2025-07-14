import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaUpload, FaArrowLeft } from 'react-icons/fa';
import "../styles/pages/AdminRecordsPage.css";
import Modal from '../components/layout/Modal';

const AdminRecordsPage = () => {
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  return (
    <div className="admin-records-container fade-in">
      <Header />
      <main className="records-main-content">
        <div className="records-header-card">
          <button className="back-button" onClick={() => navigate("/admin")}> <FaArrowLeft /> Back to Admin Dashboard </button>
          <h1 className="records-title">Document Management</h1>
          <div style={{ width: 180 }}></div> {/* Placeholder for symmetry, no upload button */}
        </div>
        <div className="center-upload-container">
          <div className="center-upload-card">
            <button className="center-upload-button" onClick={() => navigate('/admin/records/upload')}>
              <FaUpload style={{ marginRight: '10px' }} /> Upload Document
            </button>
            <p className="center-upload-desc">Upload new HR policy documents here. Accepted formats: PDF, DOCX, etc.</p>
          </div>
        </div>
        {/* Placeholder for future document grid */}
        {/* <div className="documents-grid"></div> */}
      </main>
      <Modal
        open={showInfoModal}
        title="Info"
        onClose={() => setShowInfoModal(false)}
      >
        <div>{infoMessage}</div>
      </Modal>
    </div>
  );
};

export default AdminRecordsPage; 