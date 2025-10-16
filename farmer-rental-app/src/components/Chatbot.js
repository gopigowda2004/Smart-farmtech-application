import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8090';

  useEffect(() => {
    // Initial greeting when chatbot opens
    if (isOpen && messages.length === 0) {
      addBotMessage(
        language === 'en' 
          ? "Hello! Welcome to FarmTech. How can I help you today?" 
          : "ನಮಸ್ಕಾರ! FarmTech ಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
        language === 'en'
          ? ["Find equipment", "How to rent", "Pricing info", "My bookings"]
          : ["ಉಪಕರಣ ಹುಡುಕಿ", "ಬಾಡಿಗೆ ಹೇಗೆ", "ಬೆಲೆ ಮಾಹಿತಿ", "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು"]
      );
    }
  }, [isOpen, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text, newSuggestions = []) => {
    setMessages(prev => [...prev, { text, sender: 'bot', timestamp: new Date() }]);
    setSuggestions(newSuggestions);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { text, sender: 'user', timestamp: new Date() }]);
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    addUserMessage(messageText);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to:', `${API_BASE}/api/ml/chatbot/chat`);
      console.log('Message:', messageText, 'Language:', language);
      
      const response = await fetch(`${API_BASE}/api/ml/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          language: language,
          context: {
            // Add user context if available
            userId: localStorage.getItem('userId'),
            location: localStorage.getItem('userLocation'),
          }
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        addBotMessage(data.response, data.suggestions || []);
      } else {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        addBotMessage(
          language === 'en' 
            ? "Sorry, I'm having trouble connecting. Please try again." 
            : "ಕ್ಷಮಿಸಿ, ನನಗೆ ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        );
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      addBotMessage(
        language === 'en' 
          ? "Sorry, I'm currently unavailable. Please try again later." 
          : "ಕ್ಷಮಿಸಿ, ನಾನು ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'kn' : 'en';
    setLanguage(newLang);
    setMessages([]);
    setSuggestions([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h3>FarmTech Assistant</h3>
                <span className="chatbot-status">Online</span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button 
                className="language-toggle"
                onClick={toggleLanguage}
                title={language === 'en' ? 'Switch to Kannada' : 'Switch to English'}
              >
                {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
              </button>
              <button 
                className="close-button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="chatbot-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'en' ? 'Type your message...' : 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...'}
              rows="1"
              disabled={isLoading}
            />
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="send-button"
              aria-label="Send message"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;