import React, { useState } from 'react';
import { FaRegQuestionCircle, FaRegCommentDots } from 'react-icons/fa';
import ChatBot from './ChatBot';
import Modal from '../layout/Modal';

const HistoryPanel = ({ isOpen, onClose, history, onHistoryItemClick, onClearHistory }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    // Remove any remaining HTML entities
    text = text.replace(/&[^;]+;/g, '');
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatAnswer = (text) => {
    if (!text) return '';
    // Split into sentences (or lines)
    const lines = text.split(/\n|\.\s+/).filter(s => s.trim());
    const bullets = [];
    for (let i = 0; i < lines.length; i += 4) {
      const group = lines.slice(i, i + 4).join('. ') + '.';
      bullets.push(group);
    }
    return bullets;
  };

  const toggleExpand = (index, type) => {
    setExpandedItems(prev => ({
      ...prev,
      [`${index}-${type}`]: !prev[`${index}-${type}`]
    }));
  };

  // Create a reversed copy of the history array to show newest first
  const reversedHistory = [...(history || [])].reverse();

  const handleClearHistory = () => {
    setShowConfirmModal(true);
  };
  const confirmClearHistory = () => {
    onClearHistory();
    onClose();
    setShowConfirmModal(false);
  };

  const formatBotReply = (text) => {
    if (!text) return '';
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
      return (line === line.toUpperCase() && line.length > 3 && !line.includes('http')) ||
             line.startsWith('#') ||
             (line.endsWith(':') && line.length > 3);
    };

    const isSubHeading = (line) => {
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
        formattedLine = formattedLine.replace(/^#+\s*/, '');
        formattedLine = formattedLine.replace(/:$/, '');
        result += `<h3 style="margin: 1.5rem 0 0.5rem 0; font-weight: 600; color: #2c3e50;">${formattedLine}</h3>`;
        currentSection = formattedLine;
      } else if (isSubHeading(formattedLine)) {
        processList();
        formattedLine = formattedLine.replace(/\*\*/g, '');
        result += `<h4 style="margin: 1rem 0 0.5rem 0; font-weight: 500; color: #34495e;">${formattedLine}</h4>`;
      } else if (formattedLine.startsWith('•') || formattedLine.startsWith('*') || formattedLine.startsWith('-')) {
        inList = true;
        formattedLine = formattedLine.replace(/^[•\*\-]\s*/, '');
        formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedLine = autoLink(formattedLine);
        listItems.push(`<li style="margin-bottom: 0.3rem;">${formattedLine}</li>`);
      } else if (formattedLine.startsWith('➢')) {
        inList = true;
        formattedLine = formattedLine.replace(/^➢\s*/, '');
        formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedLine = autoLink(formattedLine);
        listItems.push(`<li style="margin-bottom: 0.3rem; list-style-type: none;">➢ ${formattedLine}</li>`);
      } else {
        processList();
        if (formattedLine) {
          formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          formattedLine = autoLink(formattedLine);
          result += `<p style="margin: 0.5rem 0; line-height: 1.5;">${formattedLine}</p>`;
        }
      }
    });

    processList();

    return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #333; line-height: 1.6;">
      ${result}
    </div>`;
  };

  const autoLink = (text) => {
    const urlPattern = /(https?:\/\/[^\s<]+)/g;
    return text.replace(urlPattern, (url) => {
      const cleanUrl = url.replace(/[.,;:!?]$/, '');
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${cleanUrl}</a>`;
    });
  };

  return (
    <div className={`history-panel professional ${isOpen ? 'open' : ''}`}>
      <div className="history-panel-header">
        <h3>Chat History</h3>
        <button 
          className="history-close-btn" 
          onClick={onClose}
          aria-label="Close history"
        >
          ×
        </button>
      </div>
      
      <div className="history-panel-content">
        {!reversedHistory || reversedHistory.length === 0 ? (
          <div className="no-history-message">
            No chat history available
          </div>
        ) : (
          reversedHistory.map((entry, index) => (
            <div 
              key={index} 
              className="history-item"
            >
              <div className="history-timestamp">
                {formatTimestamp(entry.timestamp)}
              </div>
              <div className="history-question">
                <div className="history-text">
                  <strong>Q:</strong> <span className="query-text">{expandedItems[`${index}-question`] 
                    ? entry.userMessage?.text 
                    : truncateText(entry.userMessage?.text || '', 100)}</span>
                </div>
                {(entry.userMessage?.text || '').length > 100 && (
                  <button 
                    className="show-more-btn"
                    onClick={() => toggleExpand(index, 'question')}
                  >
                    {expandedItems[`${index}-question`] ? 'Show Less' : 'Show More'}
                  </button>
                )}
                <button 
                  className="resend-btn"
                  onClick={() => onHistoryItemClick(entry.userMessage?.text || '')}
                  title="Resend this question"
                >
                  ↺ Ask Again
                </button>
              </div>
              <div className="history-answer">
                <div className="history-text">
                  <strong>A:</strong>
                  <div className="answer-text message-text" style={{padding: 0, margin: 0}} 
                    dangerouslySetInnerHTML={{ __html: expandedItems[`${index}-answer`] 
                      ? formatBotReply(entry.botMessage?.text)
                      : formatBotReply(truncateText(entry.botMessage?.text || '', 200)) }}
                  />
                </div>
                {(entry.botMessage?.text || '').length > 200 && (
                  <button 
                    className="show-more-btn"
                    onClick={() => toggleExpand(index, 'answer')}
                  >
                    {expandedItems[`${index}-answer`] ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {reversedHistory && reversedHistory.length > 0 && (
        <div className="history-panel-footer">
          <button 
            className="clear-history-btn" 
            onClick={handleClearHistory}
          >
            Clear History
          </button>
        </div>
      )}
      <Modal
        open={showConfirmModal}
        title="Clear Chat History"
        onClose={() => setShowConfirmModal(false)}
        actions={[
          <button key="cancel" className="modal-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>,
          <button key="confirm" className="modal-confirm" onClick={confirmClearHistory}>Clear</button>
        ]}
      >
        <div>Are you sure you want to clear all chat history?</div>
      </Modal>
    </div>
  );
};

export default HistoryPanel; 