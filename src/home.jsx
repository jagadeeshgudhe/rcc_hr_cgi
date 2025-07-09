import React, { useState } from "react";
import { LogOut, FileText, Upload, Languages, Home as HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UploadForm from "./uploadform";
import DocumentCards from "./documentcards";
import Translate from "./translate";  
import { Link } from "react-router-dom";


import "./uploadform.css";
import "./documentcards.css";
import "./home.css";
import "./translate.css"

const Home = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);

  // Upload Handler (NEW document first)
  const handleUpload = (newDoc) => {
    setDocuments([newDoc, ...documents]);
  };

  // Delete Handler
  const handleDelete = (index) => {
    const updated = [...documents];
    updated.splice(index, 1);
    setDocuments(updated);
  };

  return (
    <div className="home-container">
      {/* Stylish Gradient Header */}
      <header className="header gradient-header">
        <div className="header-left">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/CGI_logo.svg/2560px-CGI_logo.svg.png"
            alt="CGI Logo"
            className="logo"
          />

<nav className="nav-links">
  <Link to="/home" className="nav-link"><HomeIcon size={16} /> Home</Link>
  <Link to="/documents" className="nav-link"><FileText size={16} /> Document Set</Link>
  <Link to="/translate" className="nav-link"><Languages size={16} /> Translate</Link>
  <Link to="/export" className="nav-link"><Upload size={16} /> Help</Link>
</nav>

        </div>

        <button className="logout-button" onClick={() => navigate("/")}>
          <LogOut size={18} style={{ marginRight: '6px' }} />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <UploadForm onUpload={handleUpload} />
        <DocumentCards documents={documents} onDelete={handleDelete} />
      </main>
    </div>
  );
};

export default Home;
