import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaCheck } from 'react-icons/fa';
import '../styles/pages/UploadPolicyPage.css';
import { getActiveCountries, uploadFile } from '../api/authApi';
import Modal from '../components/layout/Modal';

const UploadPolicyPage = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isLatestQA, setIsLatestQA] = useState(true);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigateAfterSuccess, setNavigateAfterSuccess] = useState(false);

  useEffect(() => {
    getActiveCountries()
      .then(res => {
        if (res.countries) setCountries(res.countries);
      })
      .catch(() => setCountries([]));
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docName || !docUrl || !description || !file || !country) {
      setInfoMessage('Please fill all required fields and upload a file.');
      setShowInfoModal(true);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_name', docName);
    formData.append('doc_url', docUrl);
    formData.append('selected_region', country);
    formData.append('doc_description', description);
    formData.append('doc_latest', isLatestQA ? 'true' : 'false');
    try {
      await uploadFile(formData);
      setLoading(false);
      setInfoMessage('Document uploaded successfully!');
      setShowInfoModal(true);
      setNavigateAfterSuccess(true);
    } catch (err) {
      setLoading(false);
      setInfoMessage(err.message || 'Failed to upload document.');
      setShowInfoModal(true);
      setNavigateAfterSuccess(false);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-policy-container">
      <div className="upload-page-header">
        <button className="back-to-records-button" onClick={() => navigate('/admin/records')}>
          <FaArrowLeft /> Back to Records
        </button>
      </div>
      <main className="upload-policy-main">
        <form className="upload-form-card" onSubmit={handleSubmit}>
          <div className="form-header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/CGI_logo.svg/100px-CGI_logo.svg.png" alt="CGI Logo" className="form-logo" />
            <h2>Upload HR Policy File</h2>
          </div>
          
          <div className="form-group">
            <label htmlFor="country">Select the Country/Region (Applicable to)</label>
            <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} required>
              <option value="">Select Country/Region</option>
              {countries.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="docName">Enter Document Name (*)</label>
            <input type="text" id="docName" placeholder="Document Name" value={docName} onChange={(e) => setDocName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="docUrl">Enter Document url (*)</label>
            <input type="text" id="docUrl" placeholder="Document URL" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Enter Description about this document (*)</label>
            <textarea id="description" placeholder="Document Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="form-group-checkbox">
            <input type="checkbox" id="latestQA" checked={isLatestQA} onChange={(e) => setIsLatestQA(e.target.checked)} />
            <label htmlFor="latestQA">
              <span className="custom-checkbox">
                {isLatestQA && <FaCheck />}
              </span>
              Latest Document for QA
            </label>
          </div>
          
          <div className="form-group">
            <label>Upload a related pdf here</label>
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input type="file" id="fileUpload" onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
              {file ? (
                <div className="file-preview">
                  <p>{file.name}</p>
                  <span>{formatFileSize(file.size)}</span>
                  <button type="button" onClick={() => setFile(null)}>Remove</button>
                </div>
              ) : (
                <>
                  <FaCloudUploadAlt className="drop-icon" />
                  <p>Drag and drop files here</p>
                  <span>Limit 200MB per file • PDF</span>
                  <button type="button" className="browse-button" onClick={() => document.getElementById('fileUpload').click()}>
                    Browse files
                  </button>
                </>
              )}
            </div>
          </div>
          
          <button type="submit" className="upload-bucket-button">
            Upload into Bucket
          </button>
        </form>
      </main>
      <Modal
        open={loading}
        title="Uploading"
        onClose={() => {}}
      >
        <div>Uploading file, please wait...</div>
      </Modal>
      <Modal
        open={showInfoModal}
        title="Info"
        onClose={() => {
          setShowInfoModal(false);
          if (navigateAfterSuccess) {
            setNavigateAfterSuccess(false);
            navigate('/admin/records');
          }
        }}
        actions={
          <button className="modal-confirm" onClick={() => {
            setShowInfoModal(false);
            if (navigateAfterSuccess) {
              setNavigateAfterSuccess(false);
              navigate('/admin/records');
            }
          }}>OK</button>
        }
      >
        <div>{infoMessage}</div>
      </Modal>
    </div>
  );
};

export default UploadPolicyPage; 