import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaUpload, FaEye, FaEdit, FaTrash, FaArrowLeft, FaFileAlt, FaDownload } from 'react-icons/fa';
import "../styles/pages/AdminRecordsPage.css";
import { getActiveCountries, getFileReport, deleteFileEntries } from '../api/authApi';

const AdminRecordsPage = () => {
  const navigate = useNavigate();
  // Remove all state and logic related to documents and file listing
  const [previewDocument, setPreviewDocument] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  // Remove all useEffect hooks related to file fetching

  const saveDocuments = (newDocuments) => {
    // This function is no longer needed
  };

  const handleDelete = async (file_name, md5_text) => {
    // This function is no longer needed
  };

  const handlePreview = (document) => {
    setPreviewDocument(document);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-records-container">
      <Header />
      
      <main className="records-main-content">
        <div className="records-header">
          <button className="back-button" onClick={() => navigate("/admin")}>
            <FaArrowLeft /> Back to Admin Dashboard
          </button>
          <h1>Records Management</h1>
          <button 
            className="upload-button"
            onClick={() => navigate('/admin/records/upload')}
          >
            <FaUpload /> Upload HR Policy File
          </button>
        </div>
        {/* Remove file listing and empty state UI */}
      </main>

      {/* Preview Modal */}
      {previewDocument && (
        <div className="modal-overlay">
          <div className="modal preview-modal">
            <div className="modal-header">
              <h2>{previewDocument.name}</h2>
              <button 
                className="close-button"
                onClick={() => setPreviewDocument(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="preview-info">
                <p><strong>Category:</strong> {previewDocument.category}</p>
                {previewDocument.fileName && <p><strong>File:</strong> {previewDocument.fileName}</p>}
                {previewDocument.fileSize && <p><strong>Size:</strong> {formatFileSize(previewDocument.fileSize)}</p>}
                {previewDocument.uploadDate && <p><strong>Uploaded:</strong> {formatDate(previewDocument.uploadDate)}</p>}
                {previewDocument.url && <p><strong>URL:</strong> <a href={previewDocument.url} target="_blank" rel="noopener noreferrer">{previewDocument.url}</a></p>}
                {previewDocument.description && <p><strong>Description:</strong> {previewDocument.description}</p>}
              </div>
              <div className="preview-content">
                <div className="document-preview">
                  <FaFileAlt className="preview-icon" />
                  <p>Document preview would be displayed here</p>
                  <p>In a real application, this would show the actual document content</p>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="download-button"
                onClick={() => alert("Download functionality would be implemented here")}
              >
                <FaDownload /> Download
              </button>
              <button 
                className="close-button"
                onClick={() => setPreviewDocument(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecordsPage; 