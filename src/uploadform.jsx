import React, { useState } from "react";
import "./uploadform.css";
import Modal from './components/layout/Modal';

const UploadForm = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [classification, setClassification] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allFieldsFilled) {
      setInfoMessage('Please fill all fields.');
      setShowInfoModal(true);
      return;
    }
    if (file && title && classification) {
      setShowPreview(true);
    } else {
      alert("Please fill all fields.");
    }
  };

  const handleConfirmUpload = () => {
    onUpload({
      file,
      title,
      classification,
      date: new Date().toLocaleDateString(),
      uploadedBy: "User",
    });
    setFile(null);
    setTitle("");
    setClassification("");
    setShowPreview(false);
  };

  const renderFilePreview = () => {
    if (!file) return null;
    const fileType = file.type;
    if (fileType.startsWith("image/")) {
      return <img src={URL.createObjectURL(file)} alt="Preview" className="preview-thumbnail" />;
    } else if (fileType === "application/pdf") {
      return (
        <iframe
          src={URL.createObjectURL(file)}
          title="PDF Preview"
          className="preview-pdf"
        ></iframe>
      );
    } else {
      return <p className="preview-note">Preview not available for this file type.</p>;
    }
  };

  return (
    <div className="upload-container">
      {showPreview && <div className="blur-overlay" />}
      <form className={`upload-form ${showPreview ? 'blurred' : ''}`} onSubmit={handleSubmit}>
        <h2>Upload Regulatory Document</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={classification} onChange={(e) => setClassification(e.target.value)}>
          <option value="">Select Classification</option>
          <option value="Legal">Legal</option>
          <option value="Finance">Finance</option>
          <option value="HR">HR</option>
          <option value="R&D">R&D</option>
        </select>
        <button type="submit">Upload</button>
      </form>

      {showPreview && (
        <div className="preview-modal">
          <h3>Preview Document</h3>
          <div className="preview-details">
            <div className="preview-meta">
              <p><strong>File Name:</strong> {file?.name}</p>
              <p><strong>Title:</strong> {title}</p>
              <p><strong>Classification:</strong> {classification}</p>
            </div>
            <div className="preview-display">
              {renderFilePreview()}
            </div>
          </div>
          <div className="preview-actions">
            <button className="preview-btn" onClick={() => setShowPreview(false)}>
              Go Back & Edit
            </button>
            <button className="confirm-btn" onClick={handleConfirmUpload}>
              Proceed to Upload
            </button>
          </div>
        </div>
      )}
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

export default UploadForm;
