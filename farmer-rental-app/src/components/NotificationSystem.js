import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const farmerId = localStorage.getItem("farmerId");
    const userRole = localStorage.getItem("userRole");
    
    if (!farmerId) return;

    const fetchNotifications = async () => {
      try {
        let response;
        if (userRole === "RENTER") {
          // Fetch confirmed bookings for renter
          response = await api.get(`/bookings/renter/${farmerId}/confirmed`);
          const confirmedBookings = response.data || [];
          
          // Create notifications for recently confirmed bookings
          const recentNotifications = confirmedBookings
            .filter(booking => {
              const confirmedAt = new Date(booking.confirmedAt);
              const now = new Date();
              const timeDiff = now - confirmedAt;
              return timeDiff < 24 * 60 * 60 * 1000; // Last 24 hours
            })
            .map(booking => ({
              id: `booking-${booking.id}`,
              type: "booking_confirmed",
              title: "Booking Confirmed! 🎉",
              message: `Your booking for ${booking.equipment?.name} has been confirmed by ${booking.acceptedOwner?.name || "the owner"}`,
              timestamp: booking.confirmedAt,
              read: false
            }));
          
          setNotifications(recentNotifications);
        } else if (userRole === "OWNER") {
          // Fetch pending booking invitations for owner
          response = await api.get(`/bookings/owner/${farmerId}/pending-invitations`);
          const pendingInvitations = response.data || [];
          
          const pendingNotifications = pendingInvitations.map(candidate => ({
            id: `pending-${candidate.booking.id}`,
            type: "booking_request",
            title: "New Booking Request 📋",
            message: `${candidate.booking.renter?.name} wants to rent ${candidate.booking.equipment?.name} (${candidate.distanceKm?.toFixed(1)}km away)`,
            timestamp: candidate.invitedAt,
            read: false
          }));
          
          setNotifications(pendingNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.container}>
      <button 
        style={styles.notificationButton}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        🔔 {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>
      
      {showNotifications && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <h4>Notifications</h4>
            <button 
              style={styles.closeButton}
              onClick={() => setShowNotifications(false)}
            >
              ×
            </button>
          </div>
          
          <div style={styles.notificationList}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>No new notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  style={{
                    ...styles.notificationItem,
                    backgroundColor: notification.read ? "#f8f9fa" : "#e3f2fd"
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div style={styles.notificationTitle}>{notification.title}</div>
                  <div style={styles.notificationMessage}>{notification.message}</div>
                  <div style={styles.notificationTime}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    display: "inline-block",
  },
  notificationButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    position: "relative",
    padding: "8px",
  },
  badge: {
    position: "absolute",
    top: "0",
    right: "0",
    backgroundColor: "#e74c3c",
    color: "white",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: "0",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    width: "320px",
    maxHeight: "400px",
    overflow: "hidden",
    zIndex: 1000,
  },
  header: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#666",
  },
  notificationList: {
    maxHeight: "300px",
    overflowY: "auto",
  },
  emptyState: {
    padding: "20px",
    textAlign: "center",
    color: "#666",
  },
  notificationItem: {
    padding: "12px 15px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  notificationTitle: {
    fontWeight: "bold",
    marginBottom: "4px",
    color: "#333",
  },
  notificationMessage: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
  },
  notificationTime: {
    fontSize: "12px",
    color: "#999",
  },
};

export default NotificationSystem;