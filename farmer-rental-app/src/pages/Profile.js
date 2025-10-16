import React, { useEffect, useState } from "react";
import axios from "axios";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Profile() {
  const { t } = useI18n();
  const [farmer, setFarmer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loginTimestamp, setLoginTimestamp] = useState(localStorage.getItem("loginTimestamp"));
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [farmerId, setFarmerId] = useState(localStorage.getItem("farmerId"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  useEffect(() => {
    // Update loginTimestamp state if it changed in localStorage
    const currentTimestamp = localStorage.getItem("loginTimestamp");
    if (currentTimestamp !== loginTimestamp) {
      console.log("🔄 Login timestamp changed in Profile, updating state");
      setLoginTimestamp(currentTimestamp);
    }
    
    // Read farmerId, userId and userRole fresh from localStorage
    const currentFarmerId = localStorage.getItem("farmerId");
    const currentUserId = localStorage.getItem("userId");
    const currentUserRole = localStorage.getItem("userRole");
    const profileId = currentFarmerId || currentUserId;
    
    // Update state variables
    setFarmerId(currentFarmerId);
    setUserId(currentUserId);
    setUserRole(currentUserRole);
    
    console.log("🔄 Fetching profile for profileId:", profileId, "(farmerId:", currentFarmerId, "userId:", currentUserId, ") role:", currentUserRole);
    
    // Clear profile when user changes
    console.log("🧹 Clearing profile for fresh fetch");
    setFarmer(null);
    setEditForm({});
    
    if (profileId) {
      // Try Users API first (new system), fallback to Farmers API (legacy)
      const fetchProfile = async () => {
        try {
          let response;
          if (currentUserId) {
            // New system - fetch from Users API
            console.log("📡 Fetching from Users API for userId:", currentUserId);
            response = await axios.get(`http://localhost:8090/api/users/${currentUserId}`);
          } else if (currentFarmerId) {
            // Legacy system - fetch from Farmers API
            console.log("📡 Fetching from Farmers API for farmerId:", currentFarmerId);
            response = await axios.get(`http://localhost:8090/api/farmers/profile/${currentFarmerId}`);
          }
          
          if (response && response.data) {
            console.log("✅ Profile fetched for:", response.data?.name);
            setFarmer(response.data);
            setEditForm(response.data);
          }
        } catch (err) {
          console.error("❌ Error fetching profile:", err);
          // Try fallback to Farmers API if Users API fails
          if (currentUserId && currentFarmerId) {
            try {
              console.log("🔄 Trying fallback to Farmers API...");
              const fallbackResponse = await axios.get(`http://localhost:8090/api/farmers/profile/${currentFarmerId}`);
              setFarmer(fallbackResponse.data);
              setEditForm(fallbackResponse.data);
            } catch (fallbackErr) {
              console.error("❌ Fallback also failed:", fallbackErr);
            }
          }
        }
      };
      
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginTimestamp]);

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // Read farmerId and userId fresh from localStorage
      const farmerId = localStorage.getItem("farmerId");
      const userId = localStorage.getItem("userId");
      const profileId = farmerId || userId;
      
      if (!profileId) {
        alert("❌ User session expired. Please log in again.");
        return;
      }
      
      console.log("💾 Saving profile for profileId:", profileId, "(farmerId:", farmerId, "userId:", userId, ")");
      console.log("📤 Profile data being saved:", editForm);
      
      // Use the correct API based on which ID we have
      let response;
      if (userId) {
        // New system - save to Users API
        console.log("💾 Saving to Users API for userId:", userId);
        response = await axios.put(`http://localhost:8090/api/users/${userId}`, editForm);
      } else if (farmerId) {
        // Legacy system - save to Farmers API
        console.log("💾 Saving to Farmers API for farmerId:", farmerId);
        response = await axios.put(`http://localhost:8090/api/farmers/profile/${farmerId}`, editForm);
      }
      
      if (response && response.data) {
        console.log("✅ Profile saved successfully:", response.data);
        setFarmer(response.data);
        setIsEditing(false);
        alert("✅ Profile updated successfully!");
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("❌ Failed to update profile. Please try again.");
    }
  };

  if (!farmer) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>{t("profile.loading")}</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .profile-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(220, 38, 38, 0.2);
        }
        .edit-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: scale(1.05);
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.iconContainer}>
              <span style={styles.headerIcon}>👤</span>
            </div>
            <div>
              <h1 style={styles.headerTitle}>My Profile</h1>
              <p style={styles.headerSubtitle}>
                {userRole === "OWNER" ? "Manage your equipment provider account" :
                 userRole === "RENTER" ? "Manage your equipment booking account" :
                 "Manage your account details"}
              </p>
            </div>
          </div>
          <LanguageSwitcher inline />
        </div>
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard} className="profile-card">
        <div style={styles.profileHeader}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              <span style={styles.avatarText}>{farmer.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div style={styles.onlineIndicator}></div>
          </div>
          <div style={styles.profileInfo}>
            <h2 style={styles.profileName}>{farmer.name}</h2>
            <p style={styles.profileRole}>
              {userRole === "OWNER" ? "🚜 Equipment Provider" :
               userRole === "RENTER" ? "🌾 Equipment Booker" :
               "Farm Equipment User"}
            </p>
            <div style={styles.ratingContainer}>
              <span style={styles.stars}>⭐⭐⭐⭐⭐</span>
              <span style={styles.ratingText}>4.8 Rating</span>
            </div>
          </div>
          <button 
            style={styles.editButton} 
            className="edit-btn"
            onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          >
            {isEditing ? "💾 Save" : "✏️ Edit"}
          </button>
        </div>

        <div style={styles.divider}></div>

        {/* Profile Details */}
        <div style={styles.detailsContainer}>
          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>👤</div>
            <div style={styles.detailContent}>
              <label style={styles.detailLabel}>Full Name</label>
              {isEditing ? (
                <input
                  style={styles.editInput}
                  value={editForm.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <p style={styles.detailValue}>{farmer.name}</p>
              )}
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>📧</div>
            <div style={styles.detailContent}>
              <label style={styles.detailLabel}>Email Address</label>
              {isEditing ? (
                <input
                  style={styles.editInput}
                  value={editForm.email || ''}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              ) : (
                <p style={styles.detailValue}>{farmer.email}</p>
              )}
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>📱</div>
            <div style={styles.detailContent}>
              <label style={styles.detailLabel}>Phone Number</label>
              {isEditing ? (
                <input
                  style={styles.editInput}
                  value={editForm.phone || ''}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p style={styles.detailValue}>{farmer.phone}</p>
              )}
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>📍</div>
            <div style={styles.detailContent}>
              <label style={styles.detailLabel}>Address</label>
              {isEditing ? (
                <textarea
                  style={styles.editTextarea}
                  value={editForm.address || ''}
                  onChange={(e) => handleEditChange('address', e.target.value)}
                  placeholder="Enter your address"
                  rows="2"
                />
              ) : (
                <p style={styles.detailValue}>{farmer.address}</p>
              )}
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>🏘️</div>
            <div style={styles.detailContent}>
              <label style={styles.detailLabel}>Village</label>
              {isEditing ? (
                <input
                  style={styles.editInput}
                  value={editForm.village || ''}
                  onChange={(e) => handleEditChange('village', e.target.value)}
                  placeholder="Enter your village"
                />
              ) : (
                <p style={styles.detailValue}>{farmer.village}</p>
              )}
            </div>
          </div>

          {/* Location Coordinates Section */}
          <div style={styles.locationSection}>
            <div style={styles.locationHeader}>
              <div style={styles.detailIcon}>🗺️</div>
              <div>
                <label style={styles.detailLabel}>Location Coordinates</label>
                <p style={styles.locationHint}>
                  {userRole === "OWNER" 
                    ? "Required for Google Maps directions when accepting bookings"
                    : "Used to help owners find your location for equipment delivery"}
                </p>
              </div>
            </div>
            
            {isEditing && (
              <button
                type="button"
                style={styles.locationButton}
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        handleEditChange('latitude', position.coords.latitude);
                        handleEditChange('longitude', position.coords.longitude);
                        alert(`✅ Location captured!\nLatitude: ${position.coords.latitude}\nLongitude: ${position.coords.longitude}`);
                      },
                      (error) => {
                        console.error("Error getting location:", error);
                        alert("❌ Could not get your location. Please enable location access in your browser settings or enter coordinates manually.");
                      }
                    );
                  } else {
                    alert("❌ Geolocation is not supported by your browser. Please enter coordinates manually.");
                  }
                }}
              >
                📍 Use Current Location
              </button>
            )}

            <div style={styles.coordinatesGrid}>
              <div style={styles.coordinateField}>
                <label style={styles.coordinateLabel}>Latitude</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="any"
                    style={styles.editInput}
                    value={editForm.latitude || ''}
                    onChange={(e) => handleEditChange('latitude', parseFloat(e.target.value))}
                    placeholder="e.g., 12.9716"
                  />
                ) : (
                  <p style={styles.detailValue}>
                    {farmer.latitude ? farmer.latitude : <span style={styles.missingValue}>Not set</span>}
                  </p>
                )}
              </div>

              <div style={styles.coordinateField}>
                <label style={styles.coordinateLabel}>Longitude</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="any"
                    style={styles.editInput}
                    value={editForm.longitude || ''}
                    onChange={(e) => handleEditChange('longitude', parseFloat(e.target.value))}
                    placeholder="e.g., 77.5946"
                  />
                ) : (
                  <p style={styles.detailValue}>
                    {farmer.longitude ? farmer.longitude : <span style={styles.missingValue}>Not set</span>}
                  </p>
                )}
              </div>
            </div>

            {!isEditing && farmer.latitude && farmer.longitude && (
              <a
                href={`https://www.google.com/maps?q=${farmer.latitude},${farmer.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.viewMapLink}
              >
                🗺️ View on Google Maps
              </a>
            )}
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>🆔</div>
            <div style={styles.detailContent}>
              <label style={styles.detailLabel}>User ID</label>
              <p style={styles.detailValue}>#{farmerId}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🚜</div>
            <div style={styles.statNumber}>12</div>
            <div style={styles.statLabel}>Equipment Rented</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏱️</div>
            <div style={styles.statNumber}>48</div>
            <div style={styles.statLabel}>Total Hours</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statNumber}>₹15,240</div>
            <div style={styles.statLabel}>Total Spent</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button style={styles.primaryButton}>
            <span style={styles.buttonIcon}>🔒</span>
            Change Password
          </button>
          <button style={styles.secondaryButton}>
            <span style={styles.buttonIcon}>📊</span>
            View Activity
          </button>
        </div>
      </div>
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
    maxWidth: '800px',
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
  profileCard: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)',
  },
  avatarText: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    width: '20px',
    height: '20px',
    background: '#10b981',
    borderRadius: '50%',
    border: '3px solid white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 5px 0',
  },
  profileRole: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 10px 0',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stars: {
    fontSize: '16px',
  },
  ratingText: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  editButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)',
    margin: '30px 0',
  },
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '40px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  detailIcon: {
    fontSize: '24px',
    width: '40px',
    textAlign: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 5px 0',
  },
  detailValue: {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500',
    margin: '0',
  },
  locationSection: {
    padding: '20px',
    background: '#f0fdf4',
    borderRadius: '12px',
    border: '2px solid #86efac',
    marginTop: '10px',
  },
  locationHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '15px',
  },
  locationHint: {
    fontSize: '13px',
    color: '#059669',
    margin: '5px 0 0 0',
    fontStyle: 'italic',
  },
  locationButton: {
    width: '100%',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '15px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  coordinatesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  coordinateField: {
    display: 'flex',
    flexDirection: 'column',
  },
  coordinateLabel: {
    fontSize: '12px',
    color: '#059669',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  missingValue: {
    color: '#dc2626',
    fontStyle: 'italic',
    fontSize: '14px',
  },
  viewMapLink: {
    display: 'inline-block',
    marginTop: '15px',
    padding: '10px 20px',
    background: '#fff',
    color: '#059669',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #86efac',
    transition: 'all 0.3s ease',
  },
  editInput: {
    width: '100%',
    padding: '10px 15px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },
  editTextarea: {
    width: '100%',
    padding: '10px 15px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#dc2626',
    margin: '0 0 5px 0',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    flex: 1,
    padding: '15px 20px',
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  secondaryButton: {
    flex: 1,
    padding: '15px 20px',
    background: 'white',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
  },
  buttonIcon: {
    fontSize: '18px',
  },
};