import React from "react";
import "./documentcards.css";

const DocumentCards = ({ documents, onDelete }) => {
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
              <button className="edit-btn" onClick={() => alert('Edit feature coming soon!')}>Edit</button>
              <button className="delete-btn" onClick={() => onDelete(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentCards;
