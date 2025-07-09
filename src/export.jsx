import React, { useState, useEffect, useRef } from "react";
import { LogOut, FileText, Upload, Languages, Home as HomeIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./export.css";

// Import header styling
import "./home.css"; 

const Export = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I'm your HR Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    const botMessage = {
      from: "bot",
      text: getBotResponse(input)
    };

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const getBotResponse = (input) => {
    const lower = input.toLowerCase();

    // Common greetings and responses
    if (lower.includes("hi") || lower.includes("hello")) {
      return "👋 Hello! How can I assist you today?";
    }
    if (lower.includes("how are you")) {
      return "😊 I'm just a bot, but I'm doing great! How can I help you today?";
    }
    // Add more responses here...

    return "🤖 I'm sorry, I didn't understand that. Please try rephrasing or ask something else.";
  };

  return (
    <div className="chat-wrapper">
      {/* Header */}
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

      {/* Chatbot */}
      <div className="chat-container">
        <h2>HR Chatbot</h2>
        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.from}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me something..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Export;
