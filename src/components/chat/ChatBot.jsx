import React, { useState, useRef, useEffect } from "react";
import { hrPoliciesData } from "../../data/hrPolicies";
import { useChat } from "../../context/ChatContext";
import Suggestions from "./Suggestions";
import HistoryPanel from "./HistoryPanel";
import "../../styles/chat/ChatBot.css";
import { categorySuggestions } from '../../data/categorySuggestions';

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

  const handleCountrySelection = (country) => {
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

    let botResponse;
    if (country === "🇮🇳 India") {
      botResponse = {
        text: "Please enter your query or select the HR policy you want information about",
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
        hideSuggestions: false,
        suggestions: [
          "Leave Management Rule",
          "Captive Allowance",
          "Dress Code and Personal Hygiene",
          "Non Standard Working Hours Management Rule",
          "Notice Period and Recovery Management Rule"
        ]
      };
    } else {
      botResponse = {
        text: `Currently, HR policy information for ${country.split(' ')[0]} is not available in this system. We are working to expand our policy database. For now, please contact your local HR representative.`,
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
    }

    setMessages(prev => [...prev, userMessage, botResponse]);
  };

  const handleSendMessage = async (e, messageText = null) => {
    e?.preventDefault();
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    // If no country is selected, don't process the message
    if (!selectedCountry) {
      return;
    }

    // If country is not India, don't process the message
    if (selectedCountry !== "🇮🇳 India") {
      return;
    }

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
    setIsBotTyping(true);
    setIsError(false);

    try {
      // First, try to get a CORS pre-flight response
      const preflightResponse = await fetch(API_URL, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, x-api-key',
          'Origin': window.location.origin
        }
      });

      // Now make the actual request
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          question: textToSend,
          region: "IND-HR Policies"
        })
      });

      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (!data || !data.answer) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from server');
      }

      const formattedResponse = formatResponse(data);
      const formattedText = formatBotReply(formattedResponse.text);

      // Detect the category for suggestions
      const detectedCategory = detectCategory(formattedResponse.text);

      const botMessage = {
        text: formattedText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        sources: formattedResponse.sources,
        relatedQuestions: formattedResponse.relatedQuestions || [],
        category: detectedCategory,
        suggestions: categorySuggestions[detectedCategory]
      };

      setMessages(prev => [...prev, botMessage]);
      // Strip HTML tags and store clean text in history
      const stripHtml = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
      };

      addToHistory({
        text: textToSend,
        timestamp: userMessage.timestamp
      }, {
        text: stripHtml(formattedText),
        timestamp: botMessage.timestamp
      });
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setIsError(true);

      
      
      let errorMessage = "I apologize, but I'm having trouble connecting to the server. ";
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage += "Please check your internet connection and ensure you're not blocking any required domains.";
      } else if (error.message.includes('NetworkError')) {
        errorMessage += "There seems to be a network connectivity issue. Please check your connection.";
      } else if (error.message.includes('401')) {
        errorMessage += "There was an authentication error. Please contact support.";
      } else if (error.message.includes('403')) {
        errorMessage += "Access to the service is forbidden. Please verify your API key.";
      } else if (error.message.includes('429')) {
        errorMessage += "Too many requests. Please try again in a few minutes.";
      } else if (error.message.includes('500')) {
        errorMessage += "The server encountered an error. Please try again later.";
      } else {
        errorMessage += `Error: ${error.message}. Please try again later or contact support if the issue persists.`;
      }



      const botErrorMessage = {
        text: errorMessage,
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
          "Would you like to try asking your question again?",
          "Can I help you with something else?"
        ]
      };
      
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsBotTyping(false);
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
    let result = '';
    let inList = false;
    let listItems = [];
    let currentSection = '';

    const processList = () => {
      if (listItems.length > 0) {
        result += `<ul style="padding-left: 1.2rem; margin: 0.5rem 0;">${listItems.join('')}</ul>`;
        listItems = [];
      }
      inList = false;
    };

    const isHeading = (line) => {
      // Check for main headings (all caps or starts with #)
      return (line === line.toUpperCase() && line.length > 3 && !line.includes('http')) ||
             line.startsWith('#') ||
             // Check for section headings (ends with :)
             (line.endsWith(':') && line.length > 3);
    };

    const isSubHeading = (line) => {
      // Check for subheadings (bold text or specific patterns)
      return line.startsWith('**') && line.endsWith('**') ||
             (line.includes(':') && line.length < 50);
    };

    lines.forEach(line => {
      let formattedLine = line.trim();

      if (formattedLine.startsWith('Document URL:')) {
        processList();
        const url = formattedLine.replace('Document URL:', '').trim();
        result += `<div class="document-url" style="margin-top: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
          <strong>Document URL:</strong> <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${url}</a>
        </div>`;
        return;
      }

      if (isHeading(formattedLine)) {
        processList();
        // Remove # if present
        formattedLine = formattedLine.replace(/^#+\s*/, '');
        // Remove trailing colon for main headings
        formattedLine = formattedLine.replace(/:$/, '');
        result += `<h3 style="margin: 1.5rem 0 0.5rem 0; font-weight: 600; color: #2c3e50;">${formattedLine}</h3>`;
        currentSection = formattedLine;
      } else if (isSubHeading(formattedLine)) {
        processList();
        // Remove ** if present
        formattedLine = formattedLine.replace(/\*\*/g, '');
        result += `<h4 style="margin: 1rem 0 0.5rem 0; font-weight: 500; color: #34495e;">${formattedLine}</h4>`;
      } else if (formattedLine.startsWith('•') || formattedLine.startsWith('*') || formattedLine.startsWith('-')) {
        // Handle bullet points
        inList = true;
        formattedLine = formattedLine.replace(/^[•\*\-]\s*/, '');
        // Replace **bold** with <strong>bold</strong>
        formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Auto-link URLs
        formattedLine = autoLink(formattedLine);
        listItems.push(`<li style="margin-bottom: 0.3rem;">${formattedLine}</li>`);
      } else if (formattedLine.startsWith('➢')) {
        // Handle special bullet points
        inList = true;
        formattedLine = formattedLine.replace(/^➢\s*/, '');
        formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedLine = autoLink(formattedLine);
        listItems.push(`<li style="margin-bottom: 0.3rem; list-style-type: none;">➢ ${formattedLine}</li>`);
      } else {
        // Handle regular paragraphs
        processList();
        if (formattedLine) {
          // Replace **bold** with <strong>bold</strong>
          formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          // Auto-link URLs
          formattedLine = autoLink(formattedLine);
          result += `<p style="margin: 0.5rem 0; line-height: 1.5;">${formattedLine}</p>`;
        }
      }
    });

    // Process any remaining list items
    processList();

    // Wrap the entire content in a styled container
    return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #333; line-height: 1.6;">
      ${result}
    </div>`;
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
              disabled={chatHistory.length === 0}
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
                        <button 
                          onClick={() => handleCountrySelection("🇮🇳 India")}
                          className="country-btn"
                        >
                          🇮🇳 India
                        </button>
                        <button 
                          onClick={() => handleCountrySelection("🇩🇪 Germany")}
                          className="country-btn"
                        >
                          🇩🇪 Germany
                        </button>
                        <button 
                          onClick={() => handleCountrySelection("🇫🇷 France")}
                          className="country-btn"
                        >
                          🇫🇷 France
                        </button>
                      </div>
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
                      {!message.feedbackSubmitted ? (
                        <>
                          <button
                            className="feedback-btn thumbs-up"
                            onClick={() => handleFeedback(index, true)}
                            title="Helpful"
                          >
                            👍
                          </button>
                          <button
                            className="feedback-btn thumbs-down"
                            onClick={() => handleFeedback(index, false)}
                            title="Not helpful"
                          >
                            👎
                          </button>
                        </>
                      ) : (
                        <span className="feedback-submitted">
                          {message.feedback ? '👍 Thanks for your feedback!' : '👎 Thanks for your feedback!'}
                        </span>
                      )}
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
          {isUserTyping && (
            <div className="message user typing">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="message-icon">
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
    </>
  );
};

export default ChatBot;
