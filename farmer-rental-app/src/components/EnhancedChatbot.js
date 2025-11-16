import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useI18n } from '../i18n/i18n';

const EnhancedChatbot = () => {
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [workflowData, setWorkflowData] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen]);

  const addWelcomeMessage = () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    let welcomeText = language === 'en' 
      ? `👋 Hi! I'm your FarmRental AI Assistant.\n\nI can help you with:\n\n🚜 Browse & Book Equipment\n📋 View Your Bookings\n✅ Manage Requests (Owners)\n💰 Payment Processing\n📊 View Statistics\n👤 Profile Management\n\nWhat would you like to do?`
      : `👋 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ FarmRental AI ಸಹಾಯಕ.\n\nನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n\n🚜 ಉಪಕರಣ ಬ್ರೌಸ್ ಮತ್ತು ಬುಕ್ ಮಾಡಿ\n📋 ನಿಮ್ಮ ಬುಕಿಂಗ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ\n✅ ವಿನಂತಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ (ಮಾಲೀಕರು)\n💰 ಪಾವತಿ ಪ್ರಕ್ರಿಯೆ\n📊 ಅಂಕಿಅಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ\n👤 ಪ್ರೊಫೈಲ್ ನಿರ್ವಹಣೆ\n\nನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?`;

    const quickActions = userRole === 'OWNER' 
      ? [
          { label: language === 'en' ? '📋 My Pending Requests' : '📋 ನನ್ನ ಬಾಕಿ ವಿನಂತಿಗಳು', action: 'show_pending_requests' },
          { label: language === 'en' ? '🚜 My Equipment' : '🚜 ನನ್ನ ಉಪಕರಣ', action: 'show_my_equipment' },
          { label: language === 'en' ? '📊 My Statistics' : '📊 ನನ್ನ ಅಂಕಿಅಂಶಗಳು', action: 'show_statistics' }
        ]
      : [
          { label: language === 'en' ? '🚜 Book Equipment' : '🚜 ಉಪಕರಣ ಬುಕ್ ಮಾಡಿ', action: 'start_booking' },
          { label: language === 'en' ? '📋 My Bookings' : '📋 ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು', action: 'show_my_bookings' },
          { label: language === 'en' ? '💰 Payment History' : '💰 ಪಾವತಿ ಇತಿಹಾಸ', action: 'show_payment_history' }
        ];

    setMessages([{
      role: 'assistant',
      content: welcomeText,
      buttons: quickActions
    }]);
  };

  const handleButtonClick = async (action, data = null) => {
    setIsLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      const farmerId = localStorage.getItem('farmerId');

      switch (action) {
        case 'start_booking':
          await startBookingWorkflow();
          break;
        case 'show_my_bookings':
          await showMyBookings(userId);
          break;
        case 'show_pending_requests':
          await showPendingRequests(farmerId);
          break;
        case 'show_my_equipment':
          await showMyEquipment(farmerId);
          break;
        case 'show_statistics':
          await showStatistics(farmerId);
          break;
        case 'show_payment_history':
          await showPaymentHistory(userId);
          break;
        case 'select_equipment':
          await selectEquipment(data);
          break;
        case 'approve_request':
          await approveRequest(data);
          break;
        case 'cancel_booking':
          await cancelBooking(data);
          break;
        default:
          addMessage('assistant', language === 'en' ? 'Action not recognized.' : 'ಕ್ರಿಯೆ ಗುರುತಿಸಲಾಗಿಲ್ಲ.');
      }
    } catch (error) {
      console.error('Action error:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Sorry, something went wrong. Please try again.' 
        : '❌ ಕ್ಷಮಿಸಿ, ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (role, content, buttons = null, customData = null) => {
    setMessages(prev => [...prev, { role, content, buttons, customData }]);
  };

  // ==================== BOOKING WORKFLOW ====================
  const startBookingWorkflow = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await api.get(`/chatbot-data/available-equipment?_t=${timestamp}`);
      const equipment = response.data;

      if (equipment.length === 0) {
        addMessage('assistant', language === 'en' 
          ? '❌ No equipment available at the moment. Please check back later.' 
          : '❌ ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಉಪಕರಣ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪರಿಶೀಲಿಸಿ.');
        return;
      }

      const equipmentButtons = equipment.map(eq => ({
        label: `${eq.name} - ₹${eq.pricePerHour}/hr`,
        action: 'select_equipment',
        data: eq
      }));

      addMessage('assistant', 
        language === 'en' 
          ? '🚜 Available Equipment:\n\nSelect the equipment you want to book:' 
          : '🚜 ಲಭ್ಯವಿರುವ ಉಪಕರಣ:\n\nನೀವು ಬುಕ್ ಮಾಡಲು ಬಯಸುವ ಉಪಕರಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
        equipmentButtons
      );

      setCurrentWorkflow('booking');
    } catch (error) {
      console.error('Error fetching equipment:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to load equipment. Please try again.' 
        : '❌ ಉಪಕರಣ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    }
  };

  const selectEquipment = async (equipment) => {
    setWorkflowData({ ...workflowData, equipment });
    
    addMessage('user', `Selected: ${equipment.name}`);
    
    const dateTimeForm = (
      <div style={styles.formContainer}>
        <p>{language === 'en' ? '📅 Enter booking details:' : '📅 ಬುಕಿಂಗ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ:'}</p>
        <input 
          type="datetime-local" 
          id="startTime"
          style={styles.input}
          placeholder={language === 'en' ? 'Start Time' : 'ಪ್ರಾರಂಭ ಸಮಯ'}
        />
        <input 
          type="number" 
          id="duration"
          style={styles.input}
          placeholder={language === 'en' ? 'Duration (hours)' : 'ಅವಧಿ (ಗಂಟೆಗಳು)'}
          min="1"
        />
        <input 
          type="text" 
          id="location"
          style={styles.input}
          placeholder={language === 'en' ? 'Your Location' : 'ನಿಮ್ಮ ಸ್ಥಳ'}
        />
        <button 
          onClick={() => handleBookingSubmit(equipment)}
          style={styles.submitButton}
        >
          {language === 'en' ? '✅ Confirm Booking' : '✅ ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಿ'}
        </button>
      </div>
    );

    addMessage('assistant', '', null, { customComponent: dateTimeForm });
  };

  const handleBookingSubmit = async (equipment) => {
    const startTime = document.getElementById('startTime').value;
    const duration = document.getElementById('duration').value;
    const location = document.getElementById('location').value;

    if (!startTime || !duration || !location) {
      alert(language === 'en' ? 'Please fill all fields' : 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ');
      return;
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const totalCost = equipment.pricePerHour * parseInt(duration);

      const bookingData = {
        equipmentId: equipment.id,
        renterId: userId,
        startTime,
        duration: parseInt(duration),
        location,
        totalCost
      };

      const response = await api.post('/chatbot-data/create-booking', bookingData);

      addMessage('assistant', 
        language === 'en'
          ? `✅ Booking created successfully!\n\n📋 Booking ID: #${response.data.bookingId}\n🚜 Equipment: ${equipment.name}\n⏰ Duration: ${duration} hours\n💰 Total Cost: ₹${totalCost}\n\nWaiting for owner approval...`
          : `✅ ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!\n\n📋 ಬುಕಿಂಗ್ ID: #${response.data.bookingId}\n🚜 ಉಪಕರಣ: ${equipment.name}\n⏰ ಅವಧಿ: ${duration} ಗಂಟೆಗಳು\n💰 ಒಟ್ಟು ವೆಚ್ಚ: ₹${totalCost}\n\nಮಾಲೀಕರ ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ...`,
        [
          { label: language === 'en' ? '📋 View My Bookings' : '📋 ನನ್ನ ಬುಕಿಂಗ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ', action: 'show_my_bookings' },
          { label: language === 'en' ? '🚜 Book Another' : '🚜 ಇನ್ನೊಂದನ್ನು ಬುಕ್ ಮಾಡಿ', action: 'start_booking' }
        ]
      );

      setCurrentWorkflow(null);
      setWorkflowData({});
    } catch (error) {
      console.error('Booking error:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to create booking. Please try again.' 
        : '❌ ಬುಕಿಂಗ್ ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== VIEW BOOKINGS ====================
  const showMyBookings = async (userId) => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await api.get(`/chatbot-data/renter-bookings?userId=${userId}&_t=${timestamp}`);
      const bookings = response.data;

      if (bookings.length === 0) {
        addMessage('assistant', language === 'en' 
          ? '📋 You have no bookings yet.\n\nWould you like to book equipment now?' 
          : '📋 ನಿಮಗೆ ಇನ್ನೂ ಯಾವುದೇ ಬುಕಿಂಗ್‌ಗಳಿಲ್ಲ.\n\nನೀವು ಈಗ ಉಪಕರಣವನ್ನು ಬುಕ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?',
          [{ label: language === 'en' ? '🚜 Book Equipment' : '🚜 ಉಪಕರಣ ಬುಕ್ ಮಾಡಿ', action: 'start_booking' }]
        );
        return;
      }

      let bookingText = language === 'en' ? '📋 Your Bookings:\n\n' : '📋 ನಿಮ್ಮ ಬುಕಿಂಗ್‌ಗಳು:\n\n';
      const bookingButtons = [];

      bookings.forEach((booking, index) => {
        bookingText += `${index + 1}. ${booking.equipmentName}\n`;
        bookingText += `   Status: ${booking.status}\n`;
        bookingText += `   Duration: ${booking.duration} hrs\n`;
        bookingText += `   Cost: ₹${booking.totalCost}\n\n`;

        if (booking.status === 'PENDING') {
          bookingButtons.push({
            label: `❌ Cancel #${booking.id}`,
            action: 'cancel_booking',
            data: booking.id
          });
        }
      });

      addMessage('assistant', bookingText, bookingButtons.length > 0 ? bookingButtons : null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to load bookings.' 
        : '❌ ಬುಕಿಂಗ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.');
    }
  };

  // ==================== OWNER: PENDING REQUESTS ====================
  const showPendingRequests = async (farmerId) => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await api.get(`/chatbot-data/owner-requests?farmerId=${farmerId}&_t=${timestamp}`);
      const requests = response.data;

      if (requests.length === 0) {
        addMessage('assistant', language === 'en' 
          ? '✅ No pending requests at the moment.' 
          : '✅ ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಬಾಕಿ ವಿನಂತಿಗಳಿಲ್ಲ.');
        return;
      }

      let requestText = language === 'en' ? '📋 Pending Requests:\n\n' : '📋 ಬಾಕಿ ವಿನಂತಿಗಳು:\n\n';
      const requestButtons = [];

      requests.forEach((req, index) => {
        requestText += `${index + 1}. ${req.equipmentName}\n`;
        requestText += `   Renter: ${req.renterName}\n`;
        requestText += `   Duration: ${req.duration} hrs\n`;
        requestText += `   Location: ${req.location}\n`;
        requestText += `   Distance: ${req.distance} km\n\n`;

        // Only show Accept button, no Reject button
        requestButtons.push(
          { label: `✅ Accept #${req.candidateId}`, action: 'approve_request', data: req.candidateId }
        );
      });

      addMessage('assistant', requestText, requestButtons);
    } catch (error) {
      console.error('Error fetching requests:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to load requests.' 
        : '❌ ವಿನಂತಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.');
    }
  };

  // ==================== OWNER: MY EQUIPMENT ====================
  const showMyEquipment = async (farmerId) => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await api.get(`/chatbot-data/owner-equipment?farmerId=${farmerId}&_t=${timestamp}`);
      const equipment = response.data;

      if (equipment.length === 0) {
        addMessage('assistant', language === 'en' 
          ? '🚜 You have no equipment listed yet.' 
          : '🚜 ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಉಪಕರಣವನ್ನು ಪಟ್ಟಿ ಮಾಡಿಲ್ಲ.');
        return;
      }

      let equipmentText = language === 'en' ? '🚜 Your Equipment:\n\n' : '🚜 ನಿಮ್ಮ ಉಪಕರಣ:\n\n';

      equipment.forEach((eq, index) => {
        equipmentText += `${index + 1}. ${eq.name}\n`;
        equipmentText += `   Type: ${eq.type}\n`;
        equipmentText += `   Price: ₹${eq.pricePerHour}/hr\n\n`;
      });

      addMessage('assistant', equipmentText);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to load equipment.' 
        : '❌ ಉಪಕರಣ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.');
    }
  };

  // ==================== ACTIONS ====================
  const approveRequest = async (candidateId) => {
    try {
      const userId = localStorage.getItem('userId');
      await api.post('/chatbot-data/action', {
        action: 'approve_request',
        userId,
        candidateId
      });

      addMessage('assistant', 
        language === 'en' 
          ? `✅ Request #${candidateId} approved successfully!\n\nThe renter has been notified.` 
          : `✅ ವಿನಂತಿ #${candidateId} ಯಶಸ್ವಿಯಾಗಿ ಅನುಮೋದಿಸಲಾಗಿದೆ!\n\nಬಾಡಿಗೆದಾರರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.`,
        [{ label: language === 'en' ? '📋 View Requests' : '📋 ವಿನಂತಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ', action: 'show_pending_requests' }]
      );
    } catch (error) {
      console.error('Approve error:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to approve request.' 
        : '❌ ವಿನಂತಿ ಅನುಮೋದಿಸಲು ವಿಫಲವಾಗಿದೆ.');
    }
  };

  const rejectRequest = async (candidateId) => {
    try {
      const userId = localStorage.getItem('userId');
      await api.post('/chatbot-data/action', {
        action: 'reject_request',
        userId,
        candidateId
      });

      addMessage('assistant', 
        language === 'en' 
          ? `✅ Request #${candidateId} rejected.\n\nThe renter has been notified.` 
          : `✅ ವಿನಂತಿ #${candidateId} ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.\n\nಬಾಡಿಗೆದಾರರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.`,
        [{ label: language === 'en' ? '📋 View Requests' : '📋 ವಿನಂತಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ', action: 'show_pending_requests' }]
      );
    } catch (error) {
      console.error('Reject error:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to reject request.' 
        : '❌ ವಿನಂತಿ ತಿರಸ್ಕರಿಸಲು ವಿಫಲವಾಗಿದೆ.');
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const userId = localStorage.getItem('userId');
      await api.post('/chatbot-data/action', {
        action: 'cancel_booking',
        userId,
        bookingId
      });

      addMessage('assistant', 
        language === 'en' 
          ? `✅ Booking #${bookingId} cancelled successfully!` 
          : `✅ ಬುಕಿಂಗ್ #${bookingId} ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಂಡಿದೆ!`,
        [{ label: language === 'en' ? '📋 View Bookings' : '📋 ಬುಕಿಂಗ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ', action: 'show_my_bookings' }]
      );
    } catch (error) {
      console.error('Cancel error:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to cancel booking.' 
        : '❌ ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಲು ವಿಫಲವಾಗಿದೆ.');
    }
  };

  const showStatistics = async (farmerId) => {
    try {
      const response = await api.get(`/analytics/owner/${farmerId}`);
      const stats = response.data;

      const statsText = language === 'en'
        ? `📊 Your Statistics:\n\n💰 Total Earnings: ₹${stats.totalEarnings || 0}\n📋 Total Bookings: ${stats.totalBookings || 0}\n🚜 Equipment Listed: ${stats.equipmentCount || 0}\n⭐ Average Rating: ${stats.averageRating || 'N/A'}`
        : `📊 ನಿಮ್ಮ ಅಂಕಿಅಂಶಗಳು:\n\n💰 ಒಟ್ಟು ಗಳಿಕೆ: ₹${stats.totalEarnings || 0}\n📋 ಒಟ್ಟು ಬುಕಿಂಗ್‌ಗಳು: ${stats.totalBookings || 0}\n🚜 ಪಟ್ಟಿ ಮಾಡಿದ ಉಪಕರಣ: ${stats.equipmentCount || 0}\n⭐ ಸರಾಸರಿ ರೇಟಿಂಗ್: ${stats.averageRating || 'N/A'}`;

      addMessage('assistant', statsText);
    } catch (error) {
      console.error('Stats error:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Failed to load statistics.' 
        : '❌ ಅಂಕಿಅಂಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.');
    }
  };

  const showPaymentHistory = async (userId) => {
    addMessage('assistant', language === 'en' 
      ? '💰 Payment history feature coming soon!' 
      : '💰 ಪಾವತಿ ಇತಿಹಾಸ ವೈಶಿಷ್ಟ್ಯ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ!');
  };

  // ==================== TEXT MESSAGE HANDLING ====================
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const response = await api.post('/ml/personalized-chat', {
        message: userMessage,
        language,
        userId
      });

      addMessage('assistant', response.data.response, response.data.suggestions?.map(s => ({
        label: s,
        action: 'send_text',
        data: s
      })));
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', language === 'en' 
        ? '❌ Sorry, I couldn\'t process that. Please try again.' 
        : '❌ ಕ್ಷಮಿಸಿ, ನಾನು ಅದನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
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

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={styles.toggleButton} title="AI Assistant">
          🤖
        </button>
      )}

      {/* Chat Window */}
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
                  {language === 'en' ? 'Online' : 'ಆನ್‌ಲೈನ್'}
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeButton}>✕</button>
          </div>

          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div key={index} style={{
                ...styles.messageWrapper,
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  ...styles.message,
                  ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage)
                }}>
                  {message.content && <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>}
                  
                  {message.customData?.customComponent && message.customData.customComponent}
                  
                  {message.buttons && (
                    <div style={styles.buttonContainer}>
                      {message.buttons.map((btn, btnIndex) => (
                        <button
                          key={btnIndex}
                          onClick={() => handleButtonClick(btn.action, btn.data)}
                          style={styles.actionButton}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={styles.messageWrapper}>
                <div style={{ ...styles.message, ...styles.assistantMessage }}>
                  <div style={styles.typingIndicator}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'en' ? 'Ask me anything...' : 'ನನಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ...'}
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
  },
  chatWindow: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '420px',
    height: '650px',
    maxHeight: '85vh',
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
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.5',
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
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  actionButton: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    background: 'rgba(30, 41, 59, 0.5)',
    color: '#e2e8f0',
    fontSize: '14px',
  },
  submitButton: {
    padding: '12px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid rgba(148, 163, 184, 0.2)',
    display: 'flex',
    gap: '8px',
  },
  sendButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    color: '#fff',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '20px',
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
  },
};

export default EnhancedChatbot;