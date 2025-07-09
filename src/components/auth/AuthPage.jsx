import React from 'react';
import LogoSection from './LogoSection';
import AuthForm from './AuthForm';
import '../../styles/pages/AuthPage.css';

const AuthPage = () => {
  return (
    <div className="container">
      <div className="main-wrapper">
        <div className="left-section">
          <div className="logo-wrapper">
            <LogoSection />
          </div>
          <div className="auth-form-wrapper">
            <AuthForm />
          </div>
        </div>
        <div className="right-section professional-bg" />
      </div>
    </div>
  );
};

export default AuthPage; 