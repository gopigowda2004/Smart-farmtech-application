import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your FarmRental AI Assistant. I can help you with:\n\n• Equipment information\n• Booking questions\n• Pricing details\n• Platform guidance\n\nHow can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Context about the platform for better responses
  const platformContext = `You are an AI assistant for FarmRental, an agricultural equipment rental platform. 
Key features:
- Farmers can rent equipment by the hour
- Equipment includes tractors, power weeders, brush cutters, reapers, tillers
- Booking process: Renter requests → Owner accepts → Equipment delivered
- Pricing is hourly-based
- Real-time booking notifications
- GPS-based location tracking
- Multiple payment options

Answer questions helpfully and concisely. If asked about specific bookings or personal data, politely say you cannot access that information and suggest contacting support.`;

  const getAIResponse = async (userMessage) => {
    try {
      // Using Hugging Face's free inference API with a conversational model
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        {
          inputs: {
            past_user_inputs: messages
              .filter(m => m.role === 'user')
              .slice(-3)
              .map(m => m.content),
            generated_responses: messages
              .filter(m => m.role === 'assistant')
              .slice(-3)
              .map(m => m.content),
            text: userMessage
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.generated_text) {
        return response.data.generated_text;
      }

      // Fallback to rule-based responses if API fails
      return getRuleBasedResponse(userMessage);
    } catch (error) {
      console.error('AI API Error:', error);
      return getRuleBasedResponse(userMessage);
    }
  };

  // Rule-based fallback responses
  const getRuleBasedResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    // Equipment related
    if (lowerMessage.includes('equipment') || lowerMessage.includes('tractor') || lowerMessage.includes('machine')) {
      return 'We offer various agricultural equipment including:\n\n🚜 Tractors\n🌾 Power Weeders\n✂️ Brush Cutters\n🌱 Power Reapers\n🔧 Rotary Tillers\n\nAll equipment is available for hourly rental. You can browse available equipment in the "Browse Equipment" section.';
    }

    // Booking related
    if (lowerMessage.includes('book') || lowerMessage.includes('rent') || lowerMessage.includes('hire')) {
      return 'To book equipment:\n\n1️⃣ Browse available equipment\n2️⃣ Select the equipment you need\n3️⃣ Choose date and duration (hours)\n4️⃣ Enter your location\n5️⃣ Submit booking request\n6️⃣ Wait for owner to accept\n7️⃣ Track delivery in your dashboard\n\nBookings are charged hourly!';
    }

    // Pricing related
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pay')) {
      return 'Our platform uses hourly pricing:\n\n💰 Prices vary by equipment type\n⏰ You pay only for hours used\n📊 Typical rates: ₹50-150/hour\n💳 Payment after service completion\n\nCheck individual equipment listings for exact hourly rates.';
    }

    // Owner related
    if (lowerMessage.includes('owner') || lowerMessage.includes('list') || lowerMessage.includes('add equipment')) {
      return 'For Equipment Owners:\n\n✅ List your equipment for free\n📸 Add photos and descriptions\n💵 Set your hourly rates\n📱 Get instant booking notifications\n🗺️ GPS directions to renters\n💰 Earn from idle equipment\n\nGo to "Manage Equipment" to get started!';
    }

    // Location/delivery related
    if (lowerMessage.includes('location') || lowerMessage.includes('delivery') || lowerMessage.includes('distance')) {
      return 'Location & Delivery:\n\n📍 Enter your exact location when booking\n🗺️ Owners see GPS directions to you\n⏱️ Owners provide estimated arrival time\n📱 Track delivery in real-time\n\nMake sure to provide accurate location for smooth delivery!';
    }

    // Account related
    if (lowerMessage.includes('account') || lowerMessage.includes('register') || lowerMessage.includes('login')) {
      return 'Account Management:\n\n👤 Create free account to get started\n📧 Use email or phone to register\n🔐 Secure login system\n👥 Switch between renter/owner roles\n📊 Track all your bookings\n\nSign up now to start renting or listing equipment!';
    }

    // Help/support
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
      return 'I\'m here to help! 🤝\n\nCommon topics:\n• Equipment information\n• Booking process\n• Pricing details\n• Owner features\n• Account setup\n\nJust ask me anything, or contact support for urgent issues.';
    }

    // Default response
    return 'I\'m here to help with FarmRental! I can answer questions about:\n\n🚜 Equipment types and availability\n📅 Booking process\n💰 Pricing and payments\n👤 Account management\n📍 Location and delivery\n\nWhat would you like to know?';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await getAIResponse(userMessage);
      
      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again or contact support.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I book equipment?",
    "What equipment is available?",
    "How is pricing calculated?",
    "How do I list my equipment?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={styles.toggleButton}
          title="AI Assistant"
        >
          🤖
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <span style={styles.botIcon}>🤖</span>
              <div>
                <div style={styles.botName}>AI Assistant</div>
                <div style={styles.botStatus}>
                  <span style={styles.statusDot}></span>
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...styles.message,
                    ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage)
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={styles.messageWrapper}>
                <div style={{...styles.message, ...styles.assistantMessage}}>
                  <div style={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div style={styles.quickQuestions}>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  style={styles.quickQuestionBtn}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              style={styles.input}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              style={{
                ...styles.sendButton,
                opacity: (!inputMessage.trim() || isLoading) ? 0.5 : 1,
                cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer'
              }}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  toggleButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '380px',
    height: '600px',
    maxHeight: '80vh',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  botIcon: {
    fontSize: '32px',
  },
  botName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px',
  },
  botStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    animation: 'pulse 2s infinite',
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  message: {
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  userMessage: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  assistantMessage: {
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#e2e8f0',
    borderBottomLeftRadius: '4px',
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
    padding: '4px 0',
  },
  quickQuestions: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderTop: '1px solid rgba(148, 163, 184, 0.1)',
  },
  quickQuestionBtn: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    color: '#a5b4fc',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid rgba(148, 163, 184, 0.2)',
    display: 'flex',
    gap: '8px',
    background: 'rgba(15, 23, 42, 0.8)',
  },
  input: {
    flex: 1,
    background: 'rgba(51, 65, 85, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
  },
  sendButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    width: '44px',
    height: '44px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
};

export default AIChatbot;