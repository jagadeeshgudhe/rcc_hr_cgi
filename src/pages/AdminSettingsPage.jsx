import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { FaArrowLeft } from 'react-icons/fa';
import { FiExternalLink, FiCopy, FiDownload } from 'react-icons/fi';
import "../styles/pages/AdminSettingsPage.css";
import { hrPoliciesData } from "../data/hrPolicies";
import { getFileReport, deleteFileEntries, loginUser, toggleFileActiveStatus } from '../api/authApi';
import Modal from '../components/layout/Modal';

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('file');
  const [documents, setDocuments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteUsername, setDeleteUsername] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteStep, setDeleteStep] = useState(1); // 1: credentials, 2: confirm
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [multiDeleteMode, setMultiDeleteMode] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState("");
  // Remove the loading modal and related state/logic

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
  const handleDelete = (file_name, md5_text) => {
    setDeleteTarget({ file_name, md5_text });
    setDeleteUsername("");
    setDeletePassword("");
    setDeleteError("");
    setDeleteStep(1);
    setShowDeleteModal(true);
  };

  const handleSelectFile = (md5_text) => {
    setSelectedFiles((prev) =>
      prev.includes(md5_text)
        ? prev.filter((id) => id !== md5_text)
        : [...prev, md5_text]
    );
  };
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedFiles(documents.map(doc => doc.md5_text));
    } else {
      setSelectedFiles([]);
    }
  };
  const handleMultiDelete = () => {
    setMultiDeleteMode(true);
    setDeleteTarget(selectedFiles.map(md5 => {
      const doc = documents.find(d => d.md5_text === md5);
      return doc ? { file_name: doc.file_name, md5_text: doc.md5_text } : null;
    }).filter(Boolean));
    setDeleteUsername("");
    setDeletePassword("");
    setDeleteError("");
    setDeleteStep(1);
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = async () => {
    if (deleteStep === 1) {
      if (!deleteUsername || !deletePassword) {
        setDeleteError("Username and password are required.");
        return;
      }
      try {
        await loginUser({ username: deleteUsername, password: deletePassword });
        setDeleteStep(2);
        setDeleteError("");
      } catch (err) {
        setDeleteError("Invalid credentials. File not deleted.");
      }
      return;
    }
    // Step 2: Confirm delete
    try {
      if (multiDeleteMode && Array.isArray(deleteTarget)) {
        for (const target of deleteTarget) {
          await deleteFileEntries(target);
        }
        setMultiDeleteMode(false);
        setSelectedFiles([]);
      } else {
        await deleteFileEntries(deleteTarget);
      }
      // Refresh the file list
      const res = await getFileReport();
      setDocuments(res.files || []);
      setShowDeleteModal(false);
      setInfoMessage('File(s) deleted successfully!');
      setShowInfoModal(true);
    } catch (err) {
      setDeleteError('Error deleting file(s).');
    }
  };

  const handleToggleActive = (file_name, md5_text, isActive) => {
    setActiveTarget({ file_name, md5_text, active_flag: isActive }); // use current state
    setActiveError("");
    setShowActiveModal(true);
  };
  const handleActiveConfirm = async () => {
    setActiveLoading(true);
    setActiveError("");
    // Determine the new flag based on current state
    const newFlag = activeTarget.active_flag ? 0 : 1;
    // Optimistically update UI
    const prevDocs = documents;
    setDocuments(prevDocs => prevDocs.map(doc =>
      doc.md5_text === activeTarget.md5_text
        ? { ...doc, active_file: String(newFlag) }
        : doc
    ));
    setShowActiveModal(false); // Close modal immediately for instant feedback
    try {
      await toggleFileActiveStatus({ file_name: activeTarget.file_name, md5_text: activeTarget.md5_text, active_flag: String(newFlag) });
      const res = await getFileReport();
      setDocuments(res.files || []);
      setInfoMessage(`File Active Flag changed for-->${activeTarget.file_name}`);
      setShowInfoModal(true);
    } catch (err) {
      setDocuments(prevDocs); // Revert on error
      setInfoMessage('Error changing file active status.');
      setShowInfoModal(true);
    } finally {
      setActiveLoading(false);
    }
  };

  return (
    <div className="admin-settings-container settings-bg">
      <Header />
      <main className="settings-main-content">
        <div className="settings-header-card">
          <button className="back-button" onClick={() => navigate("/admin")}> <FaArrowLeft /> Back to Admin Dashboard </button>
          <h1 className="settings-title">System Settings</h1>
          <div style={{ width: 180 }}></div> {/* Placeholder for symmetry, like upload button in records page */}
        </div>
        <div className="settings-content settings-content-centered">
          <div className="documents-report-section card">
            <h2>Documents Report</h2>
            {selectedFiles.length > 0 && (
              <div className="multi-delete-bar">
                <span>{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</span>
                <button className="modal-confirm" onClick={handleMultiDelete}>Delete Selected</button>
              </div>
            )}
            <div className="settings-table-wrapper">
              <div className="settings-table-container">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th className="checkbox-col"><input type="checkbox" checked={selectedFiles.length === documents.length && documents.length > 0} onChange={e => handleSelectAll(e.target.checked)} /></th>
                      <th>File Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <tr key={doc.md5_text} className="settings-table-row">
                          <td className="checkbox-col"><input type="checkbox" checked={selectedFiles.includes(doc.md5_text)} onChange={() => handleSelectFile(doc.md5_text)} /></td>
                          <td className="file-name-cell">{doc.file_name}</td>
                          <td>{doc.active_file === '1' ? 'Active' : 'Inactive'}</td>
                          <td className="actions-cell">
                            <button className="link-button" style={{ background: doc.active_file === '1' ? '#f59e42' : '#22c55e', color: '#fff' }} onClick={() => handleToggleActive(doc.file_name, doc.md5_text, doc.active_file === '1')} title={doc.active_file === '1' ? 'Deactivate this file (make unavailable)' : 'Activate this file (make available)'} aria-label={doc.active_file === '1' ? 'Deactivate file' : 'Activate file'}>{doc.active_file === '1' ? 'Deactivate' : 'Activate'}</button>
                            <button className="link-button" style={{ background: '#dc2626', color: '#fff' }} onClick={() => handleDelete(doc.file_name, doc.md5_text)} title={'Delete this file'} aria-label="Delete file">Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="settings-no-files">No documents to display.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h3>Confirm File Deletion</h3>
            {deleteStep === 1 ? (
              <>
                <p>Enter your username and password to confirm deletion.</p>
                <input
                  type="text"
                  placeholder="Username"
                  value={deleteUsername}
                  onChange={e => setDeleteUsername(e.target.value)}
                  className="modal-input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  className="modal-input"
                />
              </>
            ) : (
              <>
                <p style={{ color: '#ba2222', fontWeight: 500 }}>Are you sure you want to delete this file? This action cannot be undone.</p>
              </>
            )}
            {deleteError && <p style={{ color: 'red', margin: '0.5rem 0' }}>{deleteError}</p>}
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="modal-cancel">Cancel</button>
              <button onClick={handleDeleteConfirm} className="modal-confirm">
                {deleteStep === 1 ? 'Next' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Deactivate/Activate Confirmation Modal */}
      {showActiveModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h3 style={{ color: '#b91c1c', fontWeight: 700, fontSize: '1.18rem', marginBottom: '0.7rem', lineHeight: 1.3 }}>
              Sure to change ActiveFlag of<br/>
              <span style={{ fontWeight: 700, color: '#b91c1c', wordBreak: 'break-all' }}>{activeTarget?.file_name}</span> file?
            </h3>
            <p style={{ color: '#ba2222', fontWeight: 500, fontSize: '1.05rem', margin: '0.7rem 0 1.2rem 0', textAlign: 'center' }}>
              {activeTarget?.active_flag
                ? "If you Deactivate, the file won't be available for QA however you can activate again."
                : "If you Activate, the file will be available for QA."}
            </p>
            {activeError && <p style={{ color: 'red', margin: '0.5rem 0' }}>{activeError}</p>}
            <div className="modal-actions">
              <button onClick={() => setShowActiveModal(false)} className="modal-cancel">Cancel</button>
              <button onClick={handleActiveConfirm} className="modal-confirm" disabled={activeLoading}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Remove Modal for loading */}
      <Modal
        open={showInfoModal}
        title="Info"
        onClose={() => setShowInfoModal(false)}
      >
        <div style={{ textAlign: 'center', fontSize: '1.08rem', fontWeight: 500 }}>
          File Active Flag changed for<br/>
          <span style={{ fontWeight: 700, color: '#1e293b', wordBreak: 'break-all' }}>{infoMessage.replace('File Active Flag changed for-->', '')}</span>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSettingsPage; 