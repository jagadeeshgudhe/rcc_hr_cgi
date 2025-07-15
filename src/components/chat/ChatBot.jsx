import React, { useState, useRef, useEffect } from "react";
import { hrPoliciesData } from "../../data/hrPolicies";
import { useChat } from "../../context/ChatContext";
import Suggestions from "./Suggestions";
import HistoryPanel from "./HistoryPanel";
import "../../styles/chat/ChatBot.css";
import { categorySuggestions } from '../../data/categorySuggestions';
import { getActiveCountries, getHRPolicyDocuments, askQA, submitFeedback } from '../../api/authApi';
import Modal from '../layout/Modal';
import { FaRegStar, FaStar } from 'react-icons/fa';

const API_URL = '/api/QA';  // This will be proxied by Vite
const API_KEY = 'AIzaSyCR7AMuBCl2zj8wwX_xGxVGm6pWkA2vha';


// Format the API response into a structured message
const formatResponse = (data) => {
  const response = {
    text: data.answer || "I apologize, but I couldn't find a specific answer to your question.",
    sources: [],
    relatedQuestions: []
  };

  // Add sources if available
  if (data.sources && Array.isArray(data.sources)) {
    response.sources = data.sources.map(source => ({
      name: source.title || source.name || 'Policy Document',
      url: source.url || '#'
    }));
  }

  // Add related questions if available
  if (data.relatedQuestions && Array.isArray(data.relatedQuestions)) {
    response.relatedQuestions = data.relatedQuestions;
  }

  return response;
};

// Format the response text into the exact requested structure
const formatStructuredResponse = (text, sources = []) => {
  // Extract the policy title and document name
  const titleMatch = text.match(/(.*?)\s*\((.*?)\)/);
  if (!titleMatch) return text;

  const [, title, docName] = titleMatch;
  let formattedText = `<div style="font-family: 'Times New Roman', Times, serif;">
<strong>${title}</strong>
(${docName})

`;

  // Split content into sections by asterisk and bold headers
  const sections = text.split(/\*\s*\*\*/).filter(Boolean);

  sections.forEach(section => {
    if (!section.includes(':')) return;

    // Extract heading and content
    let [heading, ...content] = section.split(':');
    heading = heading.replace(/\*\*/g, '').trim();
    content = content.join(':').trim();

    if (!heading) return;

    // Format main heading
    formattedText += `<strong>${heading}</strong>\n`;

    // Handle nested sections
    if (content.includes('*')) {
      const subSections = content.split('*').filter(Boolean);
      let paragraphContent = '';
      
      subSections.forEach(subSection => {
        const trimmedSection = subSection.trim();
        if (trimmedSection.includes(':')) {
          // This is a sub-heading
          const [subHeading, subContent] = trimmedSection.split(':').map(s => s.trim());
          if (paragraphContent) {
            formattedText += paragraphContent + '\n\n';
            paragraphContent = '';
          }
          formattedText += `<strong>${subHeading}</strong>: `;
          
          // Format sub-content as paragraph
          if (subContent) {
            const points = subContent.split('*')
              .filter(Boolean)
              .map(point => point.trim())
              .filter(point => point)
              .join('. ');
            formattedText += points + '\n\n';
          }
        } else if (trimmedSection) {
          // Add to paragraph content
          if (paragraphContent) {
            paragraphContent += '. ';
          }
          paragraphContent += trimmedSection.replace(/\*\*/g, '');
        }
      });
      
      if (paragraphContent) {
        formattedText += paragraphContent + '\n\n';
      }
    } else if (content) {
      // Single level content as paragraph
      formattedText += content.replace(/\*\*/g, '') + '\n\n';
    }
  });

  // Add document URL if present
  const urlMatch = text.match(/Document URL:\s*(\S+)/);
  if (urlMatch) {
    formattedText += `<strong>Document URL</strong>\n${urlMatch[1]}\n`;
  }

  formattedText += '</div>';
  return formattedText;
};

const INITIAL_MESSAGE = {
  text: "Hi, I am your HR Assistant. Please select the country whose HR policies you would like to explore",
  sender: "bot",
  timestamp: new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }),
  isNew: true,
  sources: [],
  relatedQuestions: [],
  showCountrySelection: true,
  hideFeedback: true,
  hideSuggestions: true
};

// Add a function to detect the category from the answer text
function detectCategory(answerText) {
  if (!answerText) return 'General';
  const lower = answerText.toLowerCase();
  if (lower.includes('leave')) return 'Leave Management';
  if (lower.includes('captive allowance')) return 'Captive Allowance';
  if (lower.includes('non-standard working hours')) return 'Non-Standard Working Hours';
  if (lower.includes('notice period')) return 'Notice Period and Recovery';
  if (lower.includes('disciplinary')) return 'Disciplinary Actions';
  if (lower.includes('dress') || lower.includes('hygiene')) return 'Dress Code and Hygiene';
  return 'General';
}

// Add a function to format the answer with headings and points
function formatAnswerWithHeadings(answer) {
  if (!answer) return '';
  const lines = answer.split('\n').map(l => l.trim()).filter(Boolean);
  let result = '';
  let inList = false;
  let listItems = [];
  const processList = () => {
    if (listItems.length > 0) {
      result += '<ul style="margin: 0.5rem 0 0.5rem 1.2rem;">' + listItems.join('') + '</ul>';
      listItems = [];
    }
    inList = false;
  };
  lines.forEach(line => {
    if (/^([A-Z\s]+:|[A-Z\s]{4,})$/.test(line)) {
      processList();
      result += `<div style='font-weight:600; margin-top:0.7em; color:#1e293b;'>${line.replace(/:$/, '')}</div>`;
    } else if (/^[-*•]/.test(line)) {
      inList = true;
      listItems.push(`<li>${line.replace(/^[-*•]\s*/, '')}</li>`);
    } else if (line.endsWith(':')) {
      processList();
      result += `<div style='font-weight:500; margin-top:0.5em; color:#374151;'>${line.replace(/:$/, '')}</div>`;
    } else {
      processList();
      result += `<p style='margin:0.3em 0;'>${line}</p>`;
    }
  });
  processList();
  return result;
}

const ChatBot = ({ onClose, onMinimize }) => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { chatHistory, addToHistory, clearHistory } = useChat();
  const [historicalData, setHistoricalData] = useState(() => {
    const savedHistoricalData = localStorage.getItem('historicalChatData');
    return savedHistoricalData ? JSON.parse(savedHistoricalData) : [];
  });
  const typingTimeoutRef = useRef(null);
  const [countryOptions, setCountryOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countryError, setCountryError] = useState("");
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [loadingQA, setLoadingQA] = useState(false);
  const [feedbackState, setFeedbackState] = useState({}); // { [msgIdx]: { show: bool, rating: 5|1, feedback: string, submitted: bool } }
  const [feedbackModal, setFeedbackModal] = useState({ open: false, msgIdx: null, rating: 0, feedback: '', error: '', submitted: false });
  const [apiErrorModal, setApiErrorModal] = useState({ open: false, message: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  const scrollToBottom = (force = false) => {
    if (shouldAutoScroll || force) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle manual scrolling
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setShouldAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(prev =>
        prev.map(msg => ({ ...msg, isNew: false }))
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [messages]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Function to check if a chat is from a previous day
  const isFromPreviousDay = (timestamp) => {
    const today = new Date();
    const chatDate = new Date(timestamp);
    return chatDate.getDate() !== today.getDate() ||
           chatDate.getMonth() !== today.getMonth() ||
           chatDate.getFullYear() !== today.getFullYear();
  };

  // Move current day's chats to historical data at midnight
  useEffect(() => {
    const checkDayChange = () => {
      const currentHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const currentHistorical = JSON.parse(localStorage.getItem('historicalChatData') || '[]');
      
      // Filter out chats from previous days
      const previousDayChats = currentHistory.filter(chat => isFromPreviousDay(chat.timestamp));
      const todayChats = currentHistory.filter(chat => !isFromPreviousDay(chat.timestamp));
      
      if (previousDayChats.length > 0) {
        // Add previous day's chats to historical data
        const updatedHistorical = [...currentHistorical, ...previousDayChats];
        localStorage.setItem('historicalChatData', JSON.stringify(updatedHistorical));
        setHistoricalData(updatedHistorical);
        
        // Update current history to only include today's chats
        localStorage.setItem('chatHistory', JSON.stringify(todayChats));
        clearHistory(); // Clear context history
        // Optionally, you can add today's chats back if needed
        // But context will reload from localStorage on next mount
      }
    };

    // Check on component mount
    checkDayChange();

    // Set up interval to check at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;

    const midnightTimeout = setTimeout(() => {
      checkDayChange();
      // Set up daily interval after first midnight
      const dailyInterval = setInterval(checkDayChange, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  useEffect(() => {
    // Fetch active countries on mount
    setLoadingCountries(true);
    getActiveCountries()
      .then(res => {
        if (res && Array.isArray(res.countries)) {
          setCountryOptions(res.countries);
        } else if (res && Array.isArray(res)) {
          setCountryOptions(res);
        } else {
          setCountryOptions([]);
        }
        setLoadingCountries(false);
      })
      .catch(err => {
        setCountryError("Failed to load countries");
        setLoadingCountries(false);
      });
  }, []);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set user as typing
    setIsUserTyping(true);

    // Set a timeout to clear the typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
  };

  const handleCountrySelection = async (country) => {
    setSelectedCountry(country);
    const userMessage = {
      text: country,
      sender: "user",
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      isNew: true
    };
    setMessages(prev => [...prev, userMessage]);
    setLoadingPolicies(true);
    try {
      const res = await getHRPolicyDocuments(country);
      setLoadingPolicies(false);
      let botText = '';
      if (res && Array.isArray(res.documents) && res.documents.length > 0) {
        botText = `<strong>Available HR Policy Documents for ${country}:</strong><ul style='margin-top:8px;'>` +
          res.documents.map(doc => {
            if (typeof doc === 'string') return `<li>${doc}</li>`;
            return `<li>${doc.file_name || doc.name || doc.title || 'Untitled Document'}</li>`;
          }).join('') +
          '</ul>';
      } else {
        botText = `No HR policy documents found for <strong>${country}</strong>.`;
      }
      const botResponse = {
        text: botText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        sources: [],
        relatedQuestions: [],
        hideFeedback: true,
        hideSuggestions: true
      };
      setMessages(prev => [...prev, botResponse]);
      addToHistory(userMessage, botResponse);
    } catch (err) {
      setLoadingPolicies(false);
      setMessages(prev => [...prev, {
        text: `Failed to load HR policy documents for <strong>${country}</strong>.`,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        isError: true,
        sources: [],
        relatedQuestions: [],
        hideFeedback: true,
        hideSuggestions: true
      }]);
    }
  };

  const handleSendMessage = async (e, messageText = null) => {
    e?.preventDefault();
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;
    if (!selectedCountry) return;
    // Add user message
    const userMessage = {
      text: textToSend,
      sender: "user",
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      isNew: true
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setLoadingQA(true);
    setIsBotTyping(true);
    setIsError(false);
    try {
      const res = await askQA({ question: textToSend, region: selectedCountry });
      setLoadingQA(false);
      setIsBotTyping(false);
      let answerText = '';
      if (res && res.answer) {
        if (typeof res.answer === 'string') {
          answerText = formatBotReply(res.answer);
        } else if (typeof res.answer.answer === 'string') {
          answerText = formatBotReply(res.answer.answer);
        } else {
          answerText = 'No relevant details found.';
        }
      } else {
        answerText = 'No relevant details found.';
      }
      const botMessage = {
        text: answerText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true
      };
      setMessages(prev => [...prev, botMessage]);
      addToHistory(userMessage, botMessage);
    } catch (error) {
      setLoadingQA(false);
      setIsBotTyping(false);
      setMessages(prev => [...prev, {
        text: "I apologize, but I'm having trouble connecting to the server. Please try again later.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        isError: true
      }]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    console.log('Suggestion clicked:', suggestion); // Debug log
    handleSendMessage(null, suggestion);
  };

  const handleEditMessage = (index) => {
    setEditingMessageId(index);
    setEditText(messages[index].text);
  };

  const formatBotReply = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const htmlList = lines.map(line => {
      let formattedLine = line.trim();
      // Remove leading asterisk if present (with optional space after it)
      formattedLine = formattedLine.replace(/^\*\s*/, '');
      // Replace **bold** with <strong>bold</strong>
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Auto-link URLs
      formattedLine = autoLink(formattedLine);
      return `<li>${formattedLine}</li>`;
    });
    return `<ul style="padding-left: 1.2rem; margin: 0;">${htmlList.join('')}</ul>`;
  };

  const autoLink = (text) => {
    // URL regex pattern - more precise to avoid matching partial URLs
    const urlPattern = /(https?:\/\/[^\s<]+)/g;
    
    // Replace URLs with anchor tags
    return text.replace(urlPattern, (url) => {
      // Clean up URL (remove trailing punctuation)
      const cleanUrl = url.replace(/[.,;:!?]$/, '');
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${cleanUrl}</a>`;
    });
  };

  // Utility to strip HTML tags from a string
  function stripHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  const handleSaveEdit = async (index) => {
    if (!editText.trim()) return;

    // Update the edited message
    const updatedMessages = [...messages];
    updatedMessages[index] = {
      ...updatedMessages[index],
      text: editText.trim(),
      isEdited: true
    };

    // Remove all messages after the edited message
    const messagesBeforeEdit = updatedMessages.slice(0, index + 1);
    setMessages(messagesBeforeEdit);
    setEditingMessageId(null);
    setEditText("");
    setIsBotTyping(true);

    try {
      // Add a minimum delay to show typing indicator
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          question: editText.trim(),
          region: "IND-HR Policies"
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.answer) throw new Error('No answer in response');

      const formattedResponse = formatResponse(data);
      
      // Add another small delay before showing bot response
      await new Promise(resolve => setTimeout(resolve, 500));

      const botMessage = {
        text: formattedResponse.text,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        sources: formattedResponse.sources,
        relatedQuestions: formattedResponse.relatedQuestions
      };

      setMessages(prev => [...prev, botMessage]);
      // Strip HTML tags and store clean text in history
      const stripHtml = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
      };

      addToHistory({
        text: editText.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }, {
        text: stripHtml(formattedResponse.text),
        timestamp: botMessage.timestamp
      });
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: "I apologize, but I'm having trouble processing your edited message.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        isError: true,
        sources: [],
        relatedQuestions: [
          "Could you try rephrasing your question?",
          "Would you like to ask something else?"
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
      scrollToBottom(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleClearChat = () => {
    setShowClearModal(true);
  };

  const handleClearHistory = () => {
    clearHistory();
    setIsHistoryOpen(false);
  };

  const confirmClearChat = () => {
    setMessages([INITIAL_MESSAGE]); // Reset messages to initial state
    setShowClearModal(false);
  };

  const cancelClearChat = () => {
    setShowClearModal(false);
  };

  // Handle history item click
  const handleHistoryItemClick = (question) => {
    handleSendMessage(null, question);
    setIsHistoryOpen(false);
  };

  // Add feedback handling
  const handleFeedback = async (messageId, isPositive) => {
    try {
      // Update the message with feedback
      setMessages(prev => prev.map((msg, idx) => 
        idx === messageId 
          ? { ...msg, feedback: isPositive, feedbackSubmitted: true }
          : msg
      ));

      // Send feedback to backend
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          feedback: isPositive,
          question: messages[messageId - 1]?.text, // User's question
          answer: messages[messageId].text, // Bot's answer
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Feedback handler
  const handleFeedbackClick = (msgIdx, rating) => {
    setFeedbackModal({ open: true, msgIdx, rating, feedback: '', error: '', submitted: false });
  };
  const handleStarClick = (star) => {
    setFeedbackModal(prev => ({ ...prev, rating: star }));
  };
  const handleFeedbackInput = (value) => {
    setFeedbackModal(prev => ({ ...prev, feedback: value }));
  };
  const handleFeedbackSubmit = async () => {
    if (!feedbackModal.rating) {
      setFeedbackModal(prev => ({ ...prev, error: 'Please select a rating.' }));
      return;
    }
    if (!feedbackModal.feedback.trim()) {
      setFeedbackModal(prev => ({ ...prev, error: 'Please enter your feedback.' }));
      return;
    }
    const msgIdx = feedbackModal.msgIdx;
    const msg = messages[msgIdx];
    try {
      const res = await submitFeedback({
        id: msg.id || msg.responseId || msg._id || msgIdx,
        question: msg.question || (messages[msgIdx-1]?.text) || '',
        response: stripHtml(msg.text), // Ensure plain text only
        rating: feedbackModal.rating,
        feedback: feedbackModal.feedback
      });
      if (res && res.status === 'error' && res.message) {
        setApiErrorModal({ open: true, message: res.message });
        setFeedbackModal(prev => ({ ...prev, error: '' }));
        return;
      }
      setFeedbackModal(prev => ({ ...prev, submitted: true, error: '' }));
    } catch (e) {
      let errorMsg = 'Failed to submit feedback.';
      if (e && e.message) {
        try {
          const errObj = JSON.parse(e.message);
          if (errObj && errObj.message) errorMsg = errObj.message;
        } catch {
          // If not JSON, use e.message directly if it's not the default
          if (e.message !== 'Failed to submit feedback.') errorMsg = e.message;
        }
      }
      setFeedbackModal(prev => ({ ...prev, error: errorMsg }));
    }
  };
  const closeFeedbackModal = () => {
    setFeedbackModal({ open: false, msgIdx: null, rating: 0, feedback: '', error: '', submitted: false });
  };

  return (
    <>
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="header-left">
            <div className="header-content">
              <img
                src="https://cdn-icons-png.flaticon.com/128/16683/16683439.png"
                alt="HR Assistant"
                className="header-avatar"
              />
              <div className="header-title-status">
                <span className="header-title">HR Assistant</span>
                <div className="header-status">
                  <span className="status-dot"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="header-controls">
            <button
              className="control-btn history"
              onClick={() => setIsHistoryOpen(true)}
              title="Chat History"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
              </svg>
            </button>
            <button 
              className="control-btn clear" 
              onClick={handleClearChat}
              title="Clear current chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
            {window.location.pathname === '/' && onMinimize && (
              <button className="control-btn minimize" onClick={onMinimize} title="Minimize">
                <span>─</span>
              </button>
            )}
            {window.location.pathname === '/' && onClose && (
              <button className="control-btn close" onClick={onClose} title="Close">
                <span>×</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear Chat Confirmation Modal */}
        {showClearModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Clear Current Chat</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to clear the current chat? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="modal-btn cancel" onClick={cancelClearChat}>
                  Cancel
                </button>
                <button className="modal-btn confirm" onClick={confirmClearChat}>
                  Clear Chat
                </button>
              </div>
            </div>
          </div>
        )}

        <div 
          className={`chatbot-messages ${shouldAutoScroll ? 'force-scroll' : ''}`}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender} ${message.isNew ? 'new' : ''} ${message.isError ? 'error' : ''}`}
            >
              <div className={`message-icon ${message.sender} ${message.isNew ? 'speaking' : ''}`}>
                {message.sender === "bot" ? (
                  <div className="bot-avatar-container">
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/16683/16683439.png"
                      alt="Bot avatar"
                      className="icon"
                    />
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21h13a2 2 0 002-2v-1a6 6 0 00-6-6h-5a6 6 0 00-6 6v1a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
                {editingMessageId === index && message.sender === 'user' ? (
                  <div className="edit-message">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button onClick={() => handleSaveEdit(index)} className="save-btn">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="message-text" dangerouslySetInnerHTML={{ __html: message.text }} />
                    {message.showCountrySelection && (
                      <div className="country-selection">
                        {loadingCountries ? (
                          <span style={{ color: '#888', fontSize: '1rem' }}>Loading countries...</span>
                        ) : countryError ? (
                          <span style={{ color: 'red', fontSize: '1rem' }}>{countryError}</span>
                        ) : countryOptions.length > 0 ? (
                          countryOptions.map((country, idx) => (
                            <button
                              key={country.code || country.name || idx}
                              onClick={() => handleCountrySelection(country.name || country)}
                              className="country-btn"
                            >
                              {country.code ? <span style={{fontWeight:'bold',marginRight:8}}>{country.code}</span> : null}
                              {country.name || country}
                            </button>
                          ))
                        ) : (
                          <span style={{ color: '#888', fontSize: '1rem' }}>No countries available</span>
                        )}
                      </div>
                    )}
                    {loadingPolicies && (
                      <div style={{ color: '#888', fontSize: '1rem', margin: '1rem 0' }}>Loading HR policy documents...</div>
                    )}
                    {message.isEdited && <span className="edited-tag">(edited)</span>}
                    {message.sender === 'user' && (
                      <button 
                        onClick={() => handleEditMessage(index)} 
                        className="edit-btn"
                        title="Edit message"
                      >
                        ✎
                      </button>
                    )}
                  </>
                )}
                {message.sender === 'bot' && !message.isError && !message.hideFeedback && (
                  <div className="message-feedback-card">
                    <div className="feedback-label">Was this helpful?</div>
                    <div className="message-feedback-icons">
                      <button
                        className="feedback-btn thumbs-up"
                        onClick={() => handleFeedbackClick(index, 5)}
                        title="Helpful"
                      >
                        👍
                      </button>
                      <button
                        className="feedback-btn thumbs-down"
                        onClick={() => handleFeedbackClick(index, 1)}
                        title="Not helpful"
                      >
                        👎
                      </button>
                    </div>
                  </div>
                )}
                {message.sender === 'bot' && !message.isError && !message.hideSuggestions && (
                  <Suggestions
                    category={message.category}
                    suggestions={message.suggestions}
                    onSuggestionClick={(suggestion) => handleSendMessage(null, suggestion)}
                  />
                )}
                <div className="message-time">{message.timestamp}</div>
              </div>
            </div>
          ))}
          {isBotTyping && (
            <div className="message bot typing">
              <div className="message-icon">
                <div className="bot-avatar-container">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/16683/16683439.png"
                    alt="Bot avatar"
                    className="icon"
                  />
                </div>
              </div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="message-anchor" />
        </div>

        {showScrollButton && (
          <button 
            className="scroll-to-bottom visible"
            onClick={() => scrollToBottom(true)}
            title="Scroll to bottom"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 15.5l-4.5-4.5h9l-4.5 4.5z" />
            </svg>
          </button>
        )}

        <form className="chatbot-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message here..."
            value={inputText}
            onChange={handleInputChange}
            onBlur={() => setIsUserTyping(false)}
            autoFocus
            spellCheck="false"
            maxLength={300}
            disabled={isBotTyping}
          />
          <button type="submit" disabled={!inputText.trim() || isBotTyping} aria-label="Send">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
      
      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={chatHistory}
        onHistoryItemClick={handleHistoryItemClick}
        onClearHistory={handleClearHistory}
      />

      {/* Feedback Modal */}
      <Modal
        open={feedbackModal.open}
        title={<span style={{color:'#b91c1c',fontWeight:600,fontSize:'1.05rem'}}>Feedback</span>}
        onClose={closeFeedbackModal}
        style={{ maxWidth: 250, minWidth: 180, padding: '0.2rem 0.2rem' }}
        actions={feedbackModal.submitted ? [<button className="modal-confirm" style={{fontSize:'0.92rem',padding:'6px 18px',minWidth:70}} onClick={closeFeedbackModal}>Close</button>] : [
          <button className="modal-confirm" style={{fontSize:'0.92rem',padding:'6px 18px',minWidth:70}} onClick={handleFeedbackSubmit}>Submit</button>,
          <button className="modal-cancel" style={{fontSize:'0.92rem',padding:'6px 18px',minWidth:70}} onClick={closeFeedbackModal}>Cancel</button>
        ]}
      >
        {feedbackModal.submitted ? (
          <div style={{fontWeight:500, color:'#2563eb', textAlign:'center', fontSize:'0.98rem'}}>Thank you for your feedback!</div>
        ) : (
          <div style={{textAlign:'center', padding:'0.2rem 0'}}>
            <div style={{marginBottom:'0.5rem', fontWeight:500, fontSize:'0.98rem'}}>How would you rate this answer?</div>
            <div style={{marginBottom:'0.5rem', display:'flex', justifyContent:'center', gap:'0.1rem'}}>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  style={{fontSize:'1.15rem', color:(hoveredStar || feedbackModal.rating)>=star?'#fbbf24':'#cbd5e1', cursor:'pointer', transition:'color 0.2s', margin:'0 1px'}}
                  onClick={()=>handleStarClick(star)}
                  data-testid={`star-${star}`}
                  onMouseOver={()=>setHoveredStar(star)}
                  onMouseLeave={()=>setHoveredStar(0)}
                >
                  {(hoveredStar || feedbackModal.rating)>=star ? <FaStar /> : <FaRegStar />}
                </span>
              ))}
            </div>
            <textarea
              value={feedbackModal.feedback}
              onChange={e => handleFeedbackInput(e.target.value)}
              placeholder="Enter your feedback..."
              required
              rows={4}
              style={{padding:'7px 10px',borderRadius:5,border:'1px solid #ccc',width:'90%',marginBottom:'0.5rem', fontSize:'0.93rem', resize:'vertical', minHeight:'60px', maxHeight:'120px'}}
            />
            {feedbackModal.error && <div style={{color:'red',marginTop:'0.3rem', fontSize:'0.92rem'}}>{feedbackModal.error}</div>}
          </div>
        )}
      </Modal>

      {/* API Error Modal */}
      <Modal
        open={apiErrorModal.open}
        title="API Error"
        onClose={() => setApiErrorModal({ open: false, message: '' })}
      >
        <div style={{ color: 'red', fontWeight: 500 }}>{apiErrorModal.message}</div>
      </Modal>
    </>
  );
};

export default ChatBot;
