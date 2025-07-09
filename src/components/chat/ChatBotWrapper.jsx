import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatBot from './ChatBot';
import '../../styles/chat/ChatBot.css';

const ChatBotWrapper = () => {
  const { 
    isChatbotOpen, 
    isChatbotMinimized, 
    handleClose, 
    handleMinimize,
    handleMaximize 
  } = useChat();

  if (!isChatbotOpen) return null;

  return (
    <>
      <div className={`chatbot-overlay ${isChatbotMinimized ? 'minimized' : ''}`}>
        <ChatBot 
          onClose={handleClose} 
          onMinimize={handleMinimize}
        />
      </div>

      {isChatbotMinimized && (
        <button 
          className="chatbot-minimized"
          onClick={handleMaximize}
        >
          <span className="icon">👩‍💼</span>
          <span>Chat with HR Assistant</span>
        </button>
      )}
    </>
  );
};

export default ChatBotWrapper; 