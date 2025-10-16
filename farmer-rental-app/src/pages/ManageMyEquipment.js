import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { isAdminUser, checkAdminStatus } from "../utils/adminUtils";

export default function ManageMyEquipment() {
  const { t } = useI18n();
  const [loginTimestamp, setLoginTimestamp] = useState(localStorage.getItem("loginTimestamp"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [items, setItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");

  // Load my equipment
  const load = useCallback(async () => {
    // Read farmerId and userId fresh from localStorage
    const farmerId = localStorage.getItem("farmerId");
    const userId = localStorage.getItem("userId");
    const ownerId = farmerId || userId;
    
    if (!ownerId) {
      console.log("❌ No ownerId found in ManageMyEquipment (neither farmerId nor userId)");
      setError(t("addEquipment.alerts.missingFarmer"));
      return;
    }
    
    console.log("🔄 Loading equipment for ownerId:", ownerId, "(farmerId:", farmerId, "userId:", userId, ")");
    setLoading(true);
    setError("");
    
    try {
      const res = await api.get(`/equipments/my/${ownerId}`);
      console.log("✅ Equipment loaded:", res.data?.length || 0, "items");
      setItems(res.data || []);
    } catch (e) {
      console.error("❌ Error loading equipment:", e);
      setError(t("manageMy.updateFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    // Update loginTimestamp state if it changed in localStorage
    const currentTimestamp = localStorage.getItem("loginTimestamp");
    if (currentTimestamp !== loginTimestamp) {
      console.log("🔄 Login timestamp changed in ManageMyEquipment, updating state");
      setLoginTimestamp(currentTimestamp);
    }
    
    // Clear equipment when user changes
    console.log("🧹 Clearing equipment for fresh fetch");
    setItems([]);
    
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginTimestamp]);

  const remove = async (id) => {
    if (!window.confirm(t("manageMy.deleteConfirm"))) return;
    try {
      // Read farmerId and userId fresh from localStorage
      const farmerId = localStorage.getItem("farmerId");
      const userId = localStorage.getItem("userId");
      const ownerId = farmerId || userId;
      
      if (!ownerId) {
        console.log("❌ No ownerId found for delete operation");
        setError(t("manageMy.deleteFailed"));
        return;
      }
      
      console.log("🗑️ Deleting equipment:", id, "for ownerId:", ownerId, "(farmerId:", farmerId, "userId:", userId, ")");
      await api.delete(`/equipments/${id}`, { params: { farmerId: ownerId } });
      await load();
      setToast(t("manageMy.deleteSuccess"));
    } catch (e) {
      console.error("❌ Delete failed:", e);
      setError(t("manageMy.deleteFailed"));
    }
  };

  // ✅ filter + sort
  const filteredItems = useMemo(() => {
    let list = [...items];
    if (search) {
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(search.toLowerCase()) ||
          it.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sort === "lowPrice") list.sort((a, b) => (a.pricePerHour || a.price / 24) - (b.pricePerHour || b.price / 24));
    if (sort === "highPrice") list.sort((a, b) => (b.pricePerHour || b.price / 24) - (a.pricePerHour || a.price / 24));
    return list;
  }, [items, search, sort]);

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
        .equipment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(220, 38, 38, 0.2);
        }
        .delete-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: scale(1.05);
        }
        .search-input:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
      `}</style>

      {/* Header */}
      <div style={newStyles.header}>
        <div style={newStyles.headerContent}>
          <div style={newStyles.headerLeft}>
            <div style={newStyles.iconContainer}>
              <span style={newStyles.headerIcon}>⚙️</span>
            </div>
            <div>
              <h1 style={newStyles.headerTitle}>My Equipment</h1>
              <p style={newStyles.headerSubtitle}>Manage your listed farm equipment</p>
            </div>
          </div>
          <LanguageSwitcher inline />
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div style={newStyles.controlsSection}>
        <div style={newStyles.searchContainer}>
          <div style={newStyles.searchInputContainer}>
            <span style={newStyles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search your equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={newStyles.searchInput}
              className="search-input"
            />
          </div>
        </div>

        <div style={newStyles.sortContainer}>
          <label style={newStyles.sortLabel}>Sort by:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={newStyles.sortSelect}
          >
            <option value="recent">Recently Added</option>
            <option value="lowPrice">Price: Low to High</option>
            <option value="highPrice">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={newStyles.errorCard}>
          <span style={newStyles.errorIcon}>⚠️</span>
          <p style={newStyles.errorText}>{error}</p>
        </div>
      )}

      {/* Success Toast */}
      {toast && (
        <div style={newStyles.successToast} onClick={() => setToast("")}>
          <span style={newStyles.toastIcon}>✅</span>
          <p style={newStyles.toastText}>{toast}</p>
          <button style={newStyles.toastClose}>×</button>
        </div>
      )}

      {/* Equipment Grid */}
      {loading ? (
        <div style={newStyles.loadingContainer}>
          <div style={newStyles.loadingSpinner}></div>
          <p style={newStyles.loadingText}>Loading your equipment...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={newStyles.emptyState}>
          <div style={newStyles.emptyIcon}>📦</div>
          <h3 style={newStyles.emptyTitle}>No Equipment Listed</h3>
          <p style={newStyles.emptyDescription}>
            {isAdmin 
              ? "You haven't listed any equipment yet. Start by adding your first piece of farm equipment!"
              : "No equipment available. Only administrators can add equipment to the system."
            }
          </p>
          {isAdmin && (
            <button 
              style={newStyles.addButton}
              onClick={() => window.location.href = '/rent-equipment'}
            >
              <span style={newStyles.buttonIcon}>➕</span>
              Add Equipment
            </button>
          )}
        </div>
      ) : (
        <div style={newStyles.equipmentGrid}>
          {filteredItems.map((equipment, index) => (
            <div 
              key={equipment.id} 
              style={{...newStyles.equipmentCard, animationDelay: `${index * 0.1}s`}}
              className="equipment-card"
            >
              {/* Equipment Image */}
              <div style={newStyles.cardImageContainer}>
                <img 
                  src={equipment.image || '/images/default-equipment.jpg'} 
                  alt={equipment.name}
                  style={newStyles.cardImage}
                />
                <div style={newStyles.statusBadge}>
                  <span style={newStyles.statusIcon}>✅</span>
                  <span style={newStyles.statusText}>Active</span>
                </div>
              </div>

              {/* Equipment Details */}
              <div style={newStyles.cardContent}>
                <h3 style={newStyles.equipmentName}>{equipment.name}</h3>
                <p style={newStyles.equipmentDescription}>{equipment.description}</p>
                
                {/* Pricing Info */}
                <div style={newStyles.pricingSection}>
                  <div style={newStyles.priceContainer}>
                    <span style={newStyles.priceLabel}>Per Hour</span>
                    <span style={newStyles.priceValue}>₹{equipment.pricePerHour || (equipment.price ? (equipment.price / 24).toFixed(2) : 0)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div style={newStyles.statsSection}>
                  <div style={newStyles.statItem}>
                    <span style={newStyles.statIcon}>👁️</span>
                    <span style={newStyles.statValue}>24</span>
                    <span style={newStyles.statLabel}>Views</span>
                  </div>
                  <div style={newStyles.statItem}>
                    <span style={newStyles.statIcon}>📞</span>
                    <span style={newStyles.statValue}>5</span>
                    <span style={newStyles.statLabel}>Inquiries</span>
                  </div>
                  <div style={newStyles.statItem}>
                    <span style={newStyles.statIcon}>✅</span>
                    <span style={newStyles.statValue}>2</span>
                    <span style={newStyles.statLabel}>Bookings</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={newStyles.actionButtons}>
                  {isAdmin && (
                    <button 
                      style={newStyles.deleteButton}
                      className="delete-btn"
                      onClick={() => remove(equipment.id)}
                    >
                      <span style={newStyles.buttonIcon}>🗑️</span>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ================= NEW STYLES =================
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
  controlsSection: {
    maxWidth: '1200px',
    margin: '0 auto 30px auto',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchContainer: {
    flex: 1,
    minWidth: '300px',
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: '#6b7280',
  },
  searchInput: {
    width: '100%',
    padding: '15px 15px 15px 50px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    outline: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sortLabel: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
  },
  sortSelect: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
    cursor: 'pointer',
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
  successToast: {
    maxWidth: '1200px',
    margin: '0 auto 30px auto',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
  },
  toastIcon: {
    fontSize: '24px',
  },
  toastText: {
    color: 'white',
    fontSize: '16px',
    margin: '0',
    flex: 1,
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
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
  addButton: {
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
  equipmentGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '25px',
  },
  equipmentCard: {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    animation: 'slideIn 0.6s ease-out',
  },
  cardImageContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  statusIcon: {
    fontSize: '12px',
  },
  statusText: {
    fontSize: '12px',
  },
  cardContent: {
    padding: '25px',
  },
  equipmentName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 10px 0',
  },
  equipmentDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  pricingSection: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#dc2626',
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    padding: '15px',
    background: '#f9fafb',
    borderRadius: '12px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  },
  statIcon: {
    fontSize: '16px',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    flex: 1,
    padding: '12px 16px',
    background: 'white',
    color: '#dc2626',
    border: '2px solid #dc2626',
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
  deleteButton: {
    flex: 1,
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
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
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  buttonIcon: {
    fontSize: '16px',
  },
};

// ================= OLD STYLES =================
const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px",
    background: "#f9fafb",
    minHeight: "100vh",
  },
  banner: {
    background: "linear-gradient(135deg, #2f855a, #38a169)",
    padding: "30px 20px",
    borderRadius: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    color: "#fff",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  searchSort: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
  },
  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    outline: "none",
    flex: 1,
    fontSize: "0.95rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 28,
  },
  card: {
    background: "#fff",
    padding: 18,
    borderRadius: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 14,
    marginBottom: 14,
  },
  cardTitle: {
    margin: "8px 0",
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#374151",
  },
  cardDesc: {
    fontSize: "1rem",
    color: "#6b7280",
    marginBottom: 10,
    minHeight: 48,
  },
  price: {
    margin: "8px 0",
    fontWeight: "700",
    color: "#2f855a",
    fontSize: "1.05rem",
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 14,
  },
  dangerBtn: {
    flex: 1,
    padding: "10px 16px",
    border: "none",
    borderRadius: 9999, // pill button
    background: "linear-gradient(135deg,#dc2626,#b91c1c)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.3s",
  },
  error: { color: "#dc2626", marginBottom: 12, fontWeight: "600" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40 },
  toast: {
    background: "#2f855a",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 12,
    marginBottom: 18,
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "600",
    boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
  },
};
