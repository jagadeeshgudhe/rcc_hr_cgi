import React from "react";
import Header from "../components/layout/Header";
import ChatBot from "../components/chat/ChatBot";
import "../styles/pages/ExportPage.css";

const ExportPage = () => {
  return (
    <div className="export-container">
      <Header />

      <main className="main-content">
        <div className="page-header">
          <h1></h1>
        </div>

        <div className="export-content">
          <div className="help-section">
            {/* <h2>How can we help you?</h2>
            <p>Our virtual HR assistant is available 24/7 to help you with any HR-related questions.</p> */}
          </div>
          <div className="chatbot-section">
            <ChatBot />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExportPage;
