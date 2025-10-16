import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function MyBookings() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loginTimestamp, setLoginTimestamp] = useState(localStorage.getItem("loginTimestamp"));

  const fetchData = () => {
    // Read farmerId and userId fresh from localStorage each time
    const farmerId = localStorage.getItem("farmerId");
    const userId = localStorage.getItem("userId");
    
    // Only redirect if BOTH farmerId and userId are missing (truly not logged in)
    if (!farmerId && !userId) {
      console.log("❌ No farmerId or userId found in MyBookings, redirecting to login");
      navigate("/");
      return;
    }
    
    // 🔍 Use farmerId if available, otherwise use userId (backend will handle conversion)
    const renterId = farmerId || userId;
    
    console.log("🔄 Fetching bookings for renterId:", renterId, "(farmerId:", farmerId, "userId:", userId, ")");
    setLoading(true);
    setError(""); // Clear previous errors
    
    api
      .get(`/bookings/renter/${renterId}`)
      .then((res) => {
        console.log("✅ Bookings fetched:", res.data?.length || 0, "bookings");
        setBookings(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Error fetching my bookings:", err?.response?.data || err.message);
        setError(`${t("common.error")}: Failed to load your bookings. Please try again.`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Update loginTimestamp state if it changed in localStorage
    const currentTimestamp = localStorage.getItem("loginTimestamp");
    if (currentTimestamp !== loginTimestamp) {
      console.log("🔄 Login timestamp changed, updating state");
      setLoginTimestamp(currentTimestamp);
    }
    
    // Clear bookings when user changes
    console.log("🧹 Clearing bookings for fresh fetch");
    setBookings([]);
    
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginTimestamp]);

  const StatusBadge = ({ status }) => {
    const s = String(status || "PENDING").toUpperCase();
    const statusConfig = {
      PENDING: {
        bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        color: 'white',
        icon: '⏳',
        text: 'Waiting for Owner'
      },
      AWAITING_OWNER: {
        bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        color: 'white',
        icon: '📬',
        text: 'Owner Notified'
      },
      PENDING_NO_CANDIDATES: {
        bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        color: 'white',
        icon: '🕑',
        text: 'Waiting for Owners Nearby'
      },
      CONFIRMED: {
        bg: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        icon: '✅',
        text: 'Accepted'
      },
      CANCELLED: {
        bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
        icon: '❌',
        text: 'Cancelled'
      },
    };

    const config = statusConfig[s] || statusConfig.PENDING;

    return (
      <div style={{
        background: config.bg,
        color: config.color,
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <span>{config.icon}</span>
        {config.text}
      </div>
    );
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Loading your bookings...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .booking-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(220, 38, 38, 0.2);
        }
        .refresh-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: scale(1.05);
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.iconContainer}>
              <span style={styles.headerIcon}>📋</span>
            </div>
            <div>
              <h1 style={styles.headerTitle}>My Bookings</h1>
              <p style={styles.headerSubtitle}>Track your equipment rental requests</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.refreshButton} className="refresh-btn" onClick={fetchData}>
              <span style={styles.buttonIcon}>🔄</span>
              Refresh
            </button>
            <LanguageSwitcher inline />
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📝</div>
          <h3 style={styles.emptyTitle}>No Bookings Yet</h3>
          <p style={styles.emptyDescription}>
            You haven't made any equipment rental requests yet. Browse available equipment to get started!
          </p>
          <button 
            style={styles.browseButton}
            onClick={() => navigate("/bookings")}
          >
            <span style={styles.buttonIcon}>🔍</span>
            Browse Equipment
          </button>
        </div>
      ) : (
        <div style={styles.bookingsGrid}>
          {bookings.map((booking, index) => {
            const normalizedStatus = String(booking.status || "").toUpperCase();

            return (
              <div 
                key={booking.id} 
                style={{...styles.bookingCard, animationDelay: `${index * 0.1}s`}} 
                className="booking-card"
              >
                {/* Booking Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.bookingId}>
                    <span style={styles.idLabel}>Booking</span>
                    <span style={styles.idValue}>#{booking.id}</span>
                  </div>
                  <StatusBadge status={normalizedStatus} />
                </div>

                {/* Equipment Info */}
                <div style={styles.equipmentSection}>
                  <div style={styles.equipmentIcon}>🚜</div>
                  <div style={styles.equipmentInfo}>
                    <h3 style={styles.equipmentName}>{booking.equipment?.name}</h3>
                    <p style={styles.equipmentDetails}>
                      {booking.hours} hours • Starting {new Date(booking.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Owner Info - Enhanced for accepted bookings */}
                {normalizedStatus === 'CONFIRMED' && (booking.acceptedOwner || booking.owner) ? (
                  <div style={styles.ownerAcceptedSection}>
                    <div style={styles.acceptedBanner}>
                      <span style={styles.acceptedIcon}>🎉</span>
                      <span style={styles.acceptedText}>Accepted by Owner!</span>
                    </div>
                    <div style={styles.ownerCard}>
                      <div style={styles.ownerAvatar}>
                        <span style={styles.ownerInitial}>
                          {(booking.acceptedOwner?.name || booking.owner?.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={styles.ownerDetails}>
                        <h4 style={styles.ownerName}>{booking.acceptedOwner?.name || booking.owner?.name}</h4>
                        {(booking.acceptedOwner?.phone || booking.owner?.phone) && (
                          <p style={styles.ownerContact}>📞 {booking.acceptedOwner?.phone || booking.owner?.phone}</p>
                        )}
                        {(booking.acceptedOwner?.email || booking.owner?.email) && (
                          <p style={styles.ownerEmail}>📧 {booking.acceptedOwner?.email || booking.owner?.email}</p>
                        )}
                      </div>
                    </div>
                    <div style={styles.contactActions}>
                      {(booking.acceptedOwner?.phone || booking.owner?.phone) && (
                        <button 
                          style={styles.callButton}
                          onClick={() => window.open(`tel:${booking.acceptedOwner?.phone || booking.owner?.phone}`)}
                        >
                          <span style={styles.buttonIcon}>📞</span>
                          Call Owner
                        </button>
                      )}
                      {(booking.acceptedOwner?.phone || booking.owner?.phone) && (
                        <button 
                          style={styles.messageButton}
                          onClick={() => window.open(`sms:${booking.acceptedOwner?.phone || booking.owner?.phone}`)}
                        >
                          <span style={styles.buttonIcon}>💬</span>
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                ) : ['PENDING', 'AWAITING_OWNER', 'PENDING_NO_CANDIDATES'].includes(normalizedStatus) ? (
                  <div style={styles.pendingSection}>
                    <div style={styles.pendingIcon}>⏳</div>
                    <div style={styles.pendingText}>
                      <h4 style={styles.pendingTitle}>Waiting for Owner Response</h4>
                      <p style={styles.pendingDesc}>Your request is being reviewed by equipment owners in your area</p>
                    </div>
                  </div>
                ) : (
                  <div style={styles.cancelledSection}>
                    <div style={styles.cancelledIcon}>❌</div>
                    <div style={styles.cancelledText}>
                      <h4 style={styles.cancelledTitle}>Booking Cancelled</h4>
                      <p style={styles.cancelledDesc}>This booking request was cancelled</p>
                    </div>
                  </div>
                )}

                {/* Booking Details */}
                <div style={styles.bookingDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>📅 Start Date</span>
                    <span style={styles.detailValue}>
                      {new Date(booking.startDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>⏱️ Duration</span>
                    <span style={styles.detailValue}>{booking.hours} hours</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>💰 Total Cost</span>
                    <span style={styles.detailValue}>₹{booking.totalCost || 'TBD'}</span>
                  </div>
                  {booking.location && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>📍 Location</span>
                      <span style={styles.detailValue}>{booking.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 60%, #020617 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 60%, #020617 100%)',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '500',
  },
  header: {
    marginBottom: '30px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  iconContainer: {
    width: '60px',
    height: '60px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerIcon: {
    fontSize: '28px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '16px',
    margin: '5px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  refreshButton: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  errorCard: {
    maxWidth: '1200px',
    margin: '0 auto 30px auto',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backdropFilter: 'blur(10px)',
  },
  errorIcon: {
    fontSize: '24px',
  },
  errorText: {
    color: 'white',
    fontSize: '16px',
    margin: '0',
  },
  emptyState: {
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.1)',
    padding: '60px 40px',
    borderRadius: '24px',
    backdropFilter: 'blur(10px)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyTitle: {
    color: 'white',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 15px 0',
  },
  emptyDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '0 0 30px 0',
  },
  browseButton: {
    padding: '15px 30px',
    background: 'white',
    color: '#dc2626',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  bookingsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '25px',
  },
  bookingCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    animation: 'slideIn 0.6s ease-out',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  bookingId: {
    display: 'flex',
    flexDirection: 'column',
  },
  idLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  idValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
  },
  equipmentSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
    padding: '15px',
    background: '#f9fafb',
    borderRadius: '12px',
  },
  equipmentIcon: {
    fontSize: '32px',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 5px 0',
  },
  equipmentDetails: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
  },
  ownerAcceptedSection: {
    marginBottom: '20px',
  },
  acceptedBanner: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
    fontWeight: '600',
  },
  acceptedIcon: {
    fontSize: '20px',
  },
  acceptedText: {
    fontSize: '16px',
  },
  ownerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: '#f0fdf4',
    borderRadius: '12px',
    border: '1px solid #bbf7d0',
    marginBottom: '15px',
  },
  ownerAvatar: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitial: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 5px 0',
  },
  ownerContact: {
    fontSize: '14px',
    color: '#059669',
    margin: '0 0 3px 0',
    fontWeight: '500',
  },
  ownerEmail: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
  },
  contactActions: {
    display: 'flex',
    gap: '10px',
  },
  callButton: {
    flex: 1,
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
  },
  messageButton: {
    flex: 1,
    padding: '12px 16px',
    background: 'white',
    color: '#10b981',
    border: '2px solid #10b981',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
  },
  pendingSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: '#fef3c7',
    borderRadius: '12px',
    border: '1px solid #fbbf24',
    marginBottom: '20px',
  },
  pendingIcon: {
    fontSize: '32px',
  },
  pendingText: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#92400e',
    margin: '0 0 5px 0',
  },
  pendingDesc: {
    fontSize: '14px',
    color: '#a16207',
    margin: '0',
  },
  cancelledSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: '#fee2e2',
    borderRadius: '12px',
    border: '1px solid #ef4444',
    marginBottom: '20px',
  },
  cancelledIcon: {
    fontSize: '32px',
  },
  cancelledText: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#991b1b',
    margin: '0 0 5px 0',
  },
  cancelledDesc: {
    fontSize: '14px',
    color: '#dc2626',
    margin: '0',
  },
  bookingDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600',
  },
  buttonIcon: {
    fontSize: '16px',
  },
};