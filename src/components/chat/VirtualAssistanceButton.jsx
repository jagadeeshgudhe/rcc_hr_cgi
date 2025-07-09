import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/chat/ChatBot.css';

const VirtualAssistanceButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/export');
  };

  return (
    <button 
      className="virtual-assistance-btn" 
      onClick={handleClick}
    >
      <span className="icon">👩‍💼</span>
      <span className="text">Need Virtual Assistance?</span>
    </button>
  );
};

export default VirtualAssistanceButton; 