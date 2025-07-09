import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'chat_history';
const MAX_HISTORY_ITEMS = 50;

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading chat history:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      // Limit the history to MAX_HISTORY_ITEMS
      const limitedHistory = chatHistory.slice(-MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [chatHistory]);

  const handleVirtualAssistance = () => {
    setIsChatbotOpen(true);
    setIsChatbotMinimized(false);
  };

  const handleMinimize = () => {
    setIsChatbotMinimized(true);
  };

  const handleMaximize = () => {
    setIsChatbotMinimized(false);
  };

  const handleClose = () => {
    setIsChatbotOpen(false);
    setIsChatbotMinimized(false);
  };

  const addToHistory = (userMessage, botMessage) => {
    const historyItem = {
      timestamp: new Date().toISOString(),
      userMessage: {
        text: userMessage.text,
        timestamp: userMessage.timestamp
      },
      botMessage: {
        text: botMessage.text,
        timestamp: botMessage.timestamp
      }
    };
    setChatHistory(prev => [...prev, historyItem]);
  };

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getTopQuestions = () => {
    // Get questions with positive feedback
    const positiveQuestions = chatHistory
      .filter(msg => msg.sender === 'user' && msg.feedback === true)
      .map(msg => msg.text);

    // Count occurrences of each question
    const questionCounts = positiveQuestions.reduce((acc, question) => {
      acc[question] = (acc[question] || 0) + 1;
      return acc;
    }, {});

    // Sort by count and get top 5
    return Object.entries(questionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([question]) => question);
  };

  return (
    <ChatContext.Provider
      value={{
        isChatbotOpen,
        isChatbotMinimized,
        chatHistory,
        handleVirtualAssistance,
        handleMinimize,
        handleMaximize,
        handleClose,
        addToHistory,
        clearHistory,
        getTopQuestions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 