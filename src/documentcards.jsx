import React, { useState } from "react";
import "./documentcards.css";
import Modal from './components/layout/Modal';

const DocumentCards = ({ documents, onDelete }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  return (
    <div className="card-wrapper">
      <h2>Uploaded Documents</h2>
      <div className="card-grid">
        {documents.map((doc, index) => (
          <div key={index} className="doc-card">
            <div className="doc-id">PSID#{index + 101}</div>
            <h3 className="file-title">{doc.title}</h3>
            <p><strong>Type:</strong> {doc.classification}</p>
            <p><strong>Uploaded by:</strong> {doc.uploadedBy}</p>
            <p><strong>Date:</strong> {doc.date}</p>
            <div className="card-actions">
              <button className="edit-btn" onClick={() => { setInfoMessage('Edit feature coming soon!'); setShowInfoModal(true); }}>Edit</button>
              <button className="delete-btn" onClick={() => onDelete(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
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

export default DocumentCards;
