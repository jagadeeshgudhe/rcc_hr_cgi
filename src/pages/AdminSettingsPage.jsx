import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaArrowLeft } from 'react-icons/fa';
import { FiExternalLink, FiCopy, FiDownload } from 'react-icons/fi';
import "../styles/pages/AdminSettingsPage.css";
import { hrPoliciesData } from "../data/hrPolicies";
import { getFileReport, deleteFileEntries } from '../api/authApi';

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('file');
  const [documents, setDocuments] = useState([]);

  // Use HR policies for the documents table
  useEffect(() => {
    getFileReport()
      .then(res => {
        if (res.files) {
          // Sort by embedding_created_date descending
          const sorted = [...res.files].sort((a, b) => new Date(b.embedding_created_date) - new Date(a.embedding_created_date));
          setDocuments(sorted);
        }
      })
      .catch(() => setDocuments([]));
  }, []);

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }, () => {
      alert('Failed to copy link.');
    });
  };

  // Delete handler
  const handleDelete = async (file_name, md5_text) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteFileEntries({ file_name, md5_text });
      // Refresh the file list
      const res = await getFileReport();
      setDocuments(res.files || []);
      alert('File deleted successfully!');
    } catch (err) {
      alert('Error deleting file.');
    }
  };

  return (
    <div className="admin-settings-container">
      <Header />
      
      <main className="settings-main-content">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate("/admin")}>
            <FaArrowLeft /> Back to Admin Dashboard
          </button>
          <h1>System Settings</h1>
        </div>

        <div className="settings-content">
          <div className="documents-report-section">
            <h2>Documents Report</h2>
            <div className="documents-table-container">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc, index) => (
                      <tr key={doc.md5_text}>
                        <td>{doc.file_name}</td>
                        <td className="actions-cell">
                          <button className="link-button open" onClick={() => window.open(doc.doc_url, '_blank', 'noopener,noreferrer')}>
                            Open <FiExternalLink />
                          </button>
                          <button className="link-button delete" onClick={() => handleDelete(doc.file_name, doc.md5_text)} style={{marginLeft: '8px', color: 'red'}}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No documents to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage; 