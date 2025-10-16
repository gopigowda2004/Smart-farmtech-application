import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import MapComponent from "../components/MapComponent";

export default function OwnerRequests() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState("");
  const navigate = useNavigate();
  const [loginTimestamp, setLoginTimestamp] = useState(localStorage.getItem("loginTimestamp"));

  const fetchData = () => {
    // Read ownerId and userId fresh from localStorage each time
    const ownerId = localStorage.getItem("farmerId");
    const userId = localStorage.getItem("userId");
    
    // Only redirect if BOTH farmerId and userId are missing (truly not logged in)
    if (!ownerId && !userId) {
      console.log("❌ No ownerId or userId found in OwnerRequests, redirecting to login");
      navigate("/");
      return;
    }
    
    // If no farmerId but have userId, we can't fetch bookings yet
    if (!ownerId) {
      console.log("⚠️ No ownerId found (new user system), cannot fetch owner requests");
      setError("Unable to load owner requests. Please contact support.");
      setLoading(false);
      return;
    }
    
    console.log("🔄 Fetching owner requests for ownerId:", ownerId, "userId:", userId);
    setLoading(true);
    setError(""); // Clear previous errors
    
    api
      .get(`/bookings/owner/${ownerId}`)
      .then((res) => {
        console.log("✅ Owner requests fetched:", res.data?.length || 0, "bookings");
        setBookings(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Error fetching owner bookings:", err?.response?.data || err.message);
        setError(`${t("common.error")}: Failed to load booking requests. Please try again.`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Update loginTimestamp state if it changed in localStorage
    const currentTimestamp = localStorage.getItem("loginTimestamp");
    if (currentTimestamp !== loginTimestamp) {
      console.log("🔄 Login timestamp changed in OwnerRequests, updating state");
      setLoginTimestamp(currentTimestamp);
    }
    
    // Clear bookings when user changes
    console.log("🧹 Clearing owner requests for fresh fetch");
    setBookings([]);
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginTimestamp]);

  const handleAccept = async (booking) => {
    try {
      await api.patch(`/bookings/${booking.id}/status`, null, { params: { status: "CONFIRMED" } });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: "CONFIRMED" } : b)));
      // Show map with the location
      if (booking.location) {
        setMapLocation(booking.location);
        setShowMap(true);
      } else {
        alert("No location provided for this booking.");
      }
    } catch (err) {
      console.error("Failed to accept booking:", err?.response?.data || err.message);
      alert(`${t("common.error")}: Could not accept booking. Try again.`);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, null, { params: { status: "CANCELLED" } });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b)));
    } catch (err) {
      console.error("Failed to reject booking:", err?.response?.data || err.message);
      alert(`${t("common.error")}: Could not reject booking. Try again.`);
    }
  };

  if (loading) return <div style={styles.page}>{t("common.loading")}</div>;
  if (error) return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>📨 {t("ownerRequests.title")}</h2>
        <button style={styles.secondaryBtn} onClick={() => navigate("/dashboard")}>
          {t("ownerRequests.backToDashboard")}
        </button>
      </div>
      <p>{error}</p>
    </div>
  );

  return (
    <div style={newStyles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .request-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(220, 38, 38, 0.2);
        }
        .accept-btn:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: scale(1.05);
        }
        .reject-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: scale(1.05);
        }
        .pending-card {
          animation: pulse 2s infinite;
        }
      `}</style>

      {/* Header */}
      <div style={newStyles.header}>
        <div style={newStyles.headerContent}>
          <div style={newStyles.headerLeft}>
            <div style={newStyles.iconContainer}>
              <span style={newStyles.headerIcon}>📨</span>
            </div>
            <div>
              <h1 style={newStyles.headerTitle}>Booking Requests</h1>
              <p style={newStyles.headerSubtitle}>Manage incoming equipment rental requests</p>
            </div>
          </div>
          <div style={newStyles.headerActions}>
            <button style={newStyles.refreshButton} onClick={fetchData}>
              <span style={newStyles.buttonIcon}>🔄</span>
              Refresh
            </button>
            <LanguageSwitcher inline />
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {bookings.length === 0 ? (
        <div style={newStyles.emptyState}>
          <div style={newStyles.emptyIcon}>📭</div>
          <h3 style={newStyles.emptyTitle}>No Booking Requests</h3>
          <p style={newStyles.emptyDescription}>
            You don't have any pending booking requests at the moment. When someone wants to rent your equipment, their requests will appear here.
          </p>
          <button 
            style={newStyles.dashboardButton}
            onClick={() => navigate("/dashboard")}
          >
            <span style={newStyles.buttonIcon}>🏠</span>
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div style={newStyles.requestsGrid}>
          {bookings.map((booking, index) => (
            <div 
              key={booking.id} 
              style={{
                ...newStyles.requestCard,
                ...(booking.status === 'PENDING' ? newStyles.pendingCard : {}),
                animationDelay: `${index * 0.1}s`
              }}
              className={`request-card ${booking.status === 'PENDING' ? 'pending-card' : ''}`}
            >
              {/* Request Header */}
              <div style={newStyles.cardHeader}>
                <div style={newStyles.requestId}>
                  <span style={newStyles.idLabel}>Request</span>
                  <span style={newStyles.idValue}>#{booking.id}</span>
                </div>
                <div style={newStyles.statusBadge}>
                  <span style={newStyles.statusIcon}>
                    {booking.status === 'PENDING' ? '⏳' : booking.status === 'CONFIRMED' ? '✅' : '❌'}
                  </span>
                  <span style={newStyles.statusText}>{booking.status}</span>
                </div>
              </div>

              {/* Equipment Info */}
              <div style={newStyles.equipmentSection}>
                <div style={newStyles.equipmentIcon}>🚜</div>
                <div style={newStyles.equipmentInfo}>
                  <h3 style={newStyles.equipmentName}>{booking.equipment?.name}</h3>
                  <p style={newStyles.equipmentDetails}>
                    {booking.hours} hours • Starting {new Date(booking.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Renter Info */}
              <div style={newStyles.renterSection}>
                <div style={newStyles.renterAvatar}>
                  <span style={newStyles.renterInitial}>
                    {booking.renter?.name?.charAt(0)?.toUpperCase() || 'R'}
                  </span>
                </div>
                <div style={newStyles.renterDetails}>
                  <h4 style={newStyles.renterName}>{booking.renter?.name}</h4>
                  <p style={newStyles.renterContact}>📞 {booking.renter?.phone}</p>
                  <p style={newStyles.renterEmail}>📧 {booking.renter?.email}</p>
                </div>
              </div>

              {/* Location */}
              {booking.location && (
                <div style={newStyles.locationSection}>
                  <span style={newStyles.locationIcon}>📍</span>
                  <span style={newStyles.locationText}>{booking.location}</span>
                </div>
              )}

              {/* Booking Details */}
              <div style={newStyles.bookingDetails}>
                <div style={newStyles.detailRow}>
                  <span style={newStyles.detailLabel}>📅 Start Date</span>
                  <span style={newStyles.detailValue}>
                    {new Date(booking.startDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div style={newStyles.detailRow}>
                  <span style={newStyles.detailLabel}>⏱️ Duration</span>
                  <span style={newStyles.detailValue}>{booking.hours} hours</span>
                </div>
                <div style={newStyles.detailRow}>
                  <span style={newStyles.detailLabel}>💰 Total Cost</span>
                  <span style={newStyles.detailValue}>₹{booking.totalCost || 'TBD'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {booking.status === "PENDING" ? (
                <div style={newStyles.actionButtons}>
                  <button 
                    style={newStyles.acceptButton}
                    className="accept-btn"
                    onClick={() => handleAccept(booking)}
                  >
                    <span style={newStyles.buttonIcon}>✅</span>
                    Accept Request
                  </button>
                  <button 
                    style={newStyles.rejectButton}
                    className="reject-btn"
                    onClick={() => handleReject(booking.id)}
                  >
                    <span style={newStyles.buttonIcon}>❌</span>
                    Decline
                  </button>
                </div>
              ) : (
                <div style={newStyles.completedSection}>
                  <span style={newStyles.completedIcon}>
                    {booking.status === 'CONFIRMED' ? '🎉' : '💔'}
                  </span>
                  <span style={newStyles.completedText}>
                    {booking.status === 'CONFIRMED' ? 'Request Accepted' : 'Request Declined'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Map Modal */}
      {showMap && mapLocation && (
        <div style={newStyles.mapModal}>
          <div style={newStyles.mapContainer}>
            <div style={newStyles.mapHeader}>
              <h3 style={newStyles.mapTitle}>📍 Booking Location</h3>
              <button style={newStyles.closeButton} onClick={() => setShowMap(false)}>
                ✕
              </button>
            </div>
            <p style={newStyles.mapAddress}><strong>Address:</strong> {mapLocation}</p>
            <div style={newStyles.mapWrapper}>
              <MapComponent location={mapLocation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const newStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 60%, #020617 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
  dashboardButton: {
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
  requestsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '25px',
  },
  requestCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    animation: 'slideIn 0.6s ease-out',
  },
  pendingCard: {
    border: '2px solid #fbbf24',
    boxShadow: '0 10px 30px rgba(251, 191, 36, 0.2)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  requestId: {
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
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: 'white',
  },
  statusIcon: {
    fontSize: '14px',
  },
  statusText: {
    fontSize: '12px',
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
  renterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
    padding: '15px',
    background: '#fef3c7',
    borderRadius: '12px',
    border: '1px solid #fbbf24',
  },
  renterAvatar: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renterInitial: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
  },
  renterDetails: {
    flex: 1,
  },
  renterName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 5px 0',
  },
  renterContact: {
    fontSize: '14px',
    color: '#92400e',
    margin: '0 0 3px 0',
    fontWeight: '500',
  },
  renterEmail: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
  },
  locationSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    padding: '12px',
    background: '#ecfdf5',
    borderRadius: '10px',
    border: '1px solid #a7f3d0',
  },
  locationIcon: {
    fontSize: '16px',
  },
  locationText: {
    fontSize: '14px',
    color: '#065f46',
    fontWeight: '500',
  },
  bookingDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
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
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  acceptButton: {
    flex: 1,
    padding: '15px 20px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  rejectButton: {
    flex: 1,
    padding: '15px 20px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  completedSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px',
    background: '#f3f4f6',
    borderRadius: '12px',
    color: '#6b7280',
    fontWeight: '600',
  },
  completedIcon: {
    fontSize: '20px',
  },
  completedText: {
    fontSize: '14px',
  },
  mapModal: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  mapContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  mapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  mapTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '5px',
  },
  mapAddress: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  mapWrapper: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  buttonIcon: {
    fontSize: '16px',
  },
};

const styles = {
  page: { padding: 20, fontFamily: "Arial, sans-serif" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { margin: 0 },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  empty: { background: "#fff", border: "1px solid #e5e7eb", padding: 24, borderRadius: 8 },
  secondaryBtn: { padding: "8px 10px", background: "#374151", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  acceptBtn: { padding: "6px 10px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  rejectBtn: { padding: "6px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
};