import React from "react";
import LogoSection from "../components/auth/LogoSection";
import AuthForm from "../components/auth/AuthForm";
import "../styles/pages/AuthPage.css";

const AuthPage = () => (
  <div className="container">
    <div className="main-wrapper">
      <div className="left-section">
        <div className="top-bar"></div>
        <LogoSection />
        <AuthForm />
      </div>
      <div className="right-section">{/* Background image is in CSS */}</div>
    </div>
  </div>
);

export default AuthPage;
