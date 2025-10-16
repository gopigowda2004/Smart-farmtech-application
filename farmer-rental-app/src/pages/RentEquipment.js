import React, { useMemo, useState, useEffect } from "react";
import api from "../api/axiosInstance"; // shared axios instance
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { isAdminUser, checkAdminStatus } from "../utils/adminUtils";
import { useNavigate } from "react-router-dom";

const RentEquipment = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  // Internal form state kept in English for backend consistency
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerHour: "",
    image: "",
  });
  const [selectedId, setSelectedId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
    
  const farmerId = localStorage.getItem("farmerId");

  // Check admin status on component mount
  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
      setLoading(false);
      
      // Redirect non-admin users
      if (!adminStatus) {
        alert("Access denied. Only administrators can add equipment.");
        navigate("/dashboard");
      }
    };
    checkAdmin();
  }, [navigate]);

  // Predefined equipment list (source of truth)
  const equipments = useMemo(
    () => [
      {
        id: "tractor",
        tKey: "equip.tractor",
        nameEn: "Tractor",
        descEn: "Powerful tractor suitable for plowing, tilling, and hauling.",
        pricePerHour: 800,
        image: "/images/tractor.png",
      },
      {
        id: "harvester",
        tKey: "equip.harvester",
        nameEn: "Harvester",
        descEn: "Efficient harvester for cutting and threshing crops.",
        pricePerHour: 1000,
        image: "/images/harvester.jpg",
      },
      {
        id: "rotavator",
        tKey: "equip.rotavator",
        nameEn: "Rotavator",
        descEn: "Used for seedbed preparation and soil conditioning.",
        pricePerHour: 400,
        image: "/images/rotavator.jpg",
      },
      {
        id: "plough",
        tKey: "equip.plough",
        nameEn: "Plough",
        descEn: "Used for primary tillage to loosen and turn the soil.",
        pricePerHour: 150,
        image: "/images/plough.jpg",
      },
      {
        id: "seedDrill",
        tKey: "equip.seedDrill",
        nameEn: "Seed Drill",
        descEn: "For precise sowing of seeds in rows with proper depth.",
        pricePerHour: 200,
        image: "/images/seed-drill.jpg",
      },
      {
        id: "sprayer",
        tKey: "equip.sprayer",
        nameEn: "Sprayer",
        descEn: "Used for spraying pesticides, herbicides, and fertilizers.",
        pricePerHour: 50,
        image: "/images/sprayer.jpg",
      },
      {
        id: "cultivator",
        tKey: "equip.cultivator",
        nameEn: "Cultivator",
        descEn: "Used for secondary tillage and soil preparation.",
        pricePerHour: 200,
        image: "/images/cultivator.jpg",
      },
      
      {
        id: "powerTiller",
        tKey: "equip.powerTiller",
        nameEn: "Power Tiller",
        descEn: "Compact machine for plowing, weeding, and small farm operations.",
        pricePerHour: 300,
        image: "/images/power-tiller.jpg",
      },
      {
        id: "discHarrow",
        tKey: "equip.discHarrow",
        nameEn: "Disc Harrow",
        descEn: "Used for breaking clods, mixing soil, and weed control.",
        pricePerHour: 250,
        image: "/images/disc-harrow.jpg",
      },
      {
        id: "riceTransplanter",
        tKey: "equip.riceTransplanter",
        nameEn: "Rice Transplanter",
        descEn:
          "Specialized machine for transplanting rice seedlings into paddy fields.",
        pricePerHour: 400,
        image: "/images/rice-transplanter.jpg",
      },
      {
        id: "thresher",
        tKey: "equip.thresher",
        nameEn: "Threshing Machine",
        descEn: "Separates grain from stalks and husks efficiently.",
        pricePerHour: 1200,
        image: "/images/thresher.jpg",
      },
      {
        id: "waterPump",
        tKey: "equip.waterPump",
        nameEn: "Water Pump",
        descEn: "Irrigation equipment for pumping water into fields.",
        pricePerHour: 90,
        image: "/images/water-pump.jpg",
      },
    ],
    []
  );

  const selectedEq = useMemo(
    () => equipments.find((eq) => eq.id === selectedId),
    [selectedId, equipments]
  );

  // Handle dropdown change → auto fill EN details for backend; display uses t()
  const handleEquipmentSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const selected = equipments.find((eq) => eq.id === id);
    if (selected) {
      setFormData({
        name: selected.nameEn,
        description: selected.descEn,
        pricePerHour: selected.pricePerHour,
        image: selected.image,
      });
    } else {
      setFormData({ name: "", description: "", pricePerHour: "", image: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!farmerId) {
        alert("Please login again. Missing farmerId in localStorage.");
        return;
      }
      const payload = {
        ...formData,
        pricePerHour: Number(formData.pricePerHour), // ensure number
      };
      const res = await api.post(`/equipments/add/${farmerId}`, payload);
      if (res?.data?.id) {
        alert("✅ Equipment listed for rent successfully!");
        setSelectedId("");
        setFormData({ name: "", description: "", pricePerHour: "", image: "" });
      } else {
        alert("Server did not return an equipment ID. Please try again.");
      }
    } catch (error) {
      console.error("Add equipment error:", error?.response?.data || error.message);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        error.message ||
        "Unknown error";
      alert(`❌ Error listing equipment: ${msg}`);
    }
  };

  // Derived values for UI (translated)
  // eslint-disable-next-line no-unused-vars
  const displayName = selectedEq ? t(`${selectedEq.tKey}.name`) : "";
  const displayDescription = selectedEq ? t(`${selectedEq.tKey}.description`) : "";

  // Show loading state while checking admin status
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin (will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideIn {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .equipment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(220, 38, 38, 0.2);
        }
        .rent-button:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: scale(1.05);
        }
        .equipment-grid {
          animation: slideIn 0.6s ease-out;
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.iconContainer}>
              <span style={styles.headerIcon}>🚜</span>
            </div>
            <div>
              <h1 style={styles.headerTitle}>List Equipment</h1>
              <p style={styles.headerSubtitle}>Share your farm equipment with others</p>
            </div>
          </div>
          <LanguageSwitcher inline />
        </div>
      </div>

      {/* Equipment Selection Grid */}
      <div style={styles.equipmentGrid} className="equipment-grid">
        <h2 style={styles.sectionTitle}>Choose Equipment to List</h2>
        <div style={styles.grid}>
          {equipments.map((eq) => (
            <div
              key={eq.id}
              style={{
                ...styles.equipmentCard,
                ...(selectedId === eq.id ? styles.selectedCard : {})
              }}
              className="equipment-card"
              onClick={() => handleEquipmentSelect({ target: { value: eq.id } })}
            >
              <div style={styles.cardImageContainer}>
                <img src={eq.image} alt={eq.nameEn} style={styles.cardImage} />
                {selectedId === eq.id && (
                  <div style={styles.selectedOverlay}>
                    <span style={styles.checkIcon}>✓</span>
                  </div>
                )}
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{t(`${eq.tKey}.name`)}</h3>
                <p style={styles.cardDescription}>{t(`${eq.tKey}.description`)}</p>
                <div style={styles.priceContainer}>
                  <span style={styles.priceLabel}>Price per hour</span>
                  <span style={styles.priceValue}>₹{eq.pricePerHour}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Equipment Details */}
      {selectedEq && (
        <div style={styles.detailsCard}>
          <h2 style={styles.detailsTitle}>Equipment Details</h2>
          <div style={styles.detailsContent}>
            <div style={styles.detailsLeft}>
              <img src={selectedEq.image} alt={selectedEq.nameEn} style={styles.detailsImage} />
            </div>
            <div style={styles.detailsRight}>
              <h3 style={styles.detailsName}>{t(`${selectedEq.tKey}.name`)}</h3>
              <p style={styles.detailsDesc}>{t(`${selectedEq.tKey}.description`)}</p>
              <div style={styles.detailsPrice}>
                <span style={styles.detailsPriceLabel}>Hourly Rate</span>
                <span style={styles.detailsPriceValue}>₹{selectedEq.pricePerHour}</span>
              </div>
              
              <form onSubmit={handleSubmit} style={styles.form}>
                <button type="submit" style={styles.submitButton} className="rent-button">
                  <span style={styles.buttonIcon}>🚀</span>
                  List This Equipment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedEq && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎯</div>
          <h3 style={styles.emptyTitle}>Select Equipment to Continue</h3>
          <p style={styles.emptyDescription}>
            Choose from our wide range of farm equipment to list for rent
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 60%, #020617 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: '40px',
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
  equipmentGrid: {
    maxWidth: '1200px',
    margin: '0 auto 40px auto',
  },
  sectionTitle: {
    color: 'white',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '30px',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  equipmentCard: {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    border: '3px solid transparent',
  },
  selectedCard: {
    border: '3px solid #dc2626',
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px rgba(220, 38, 38, 0.2)',
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
  selectedOverlay: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '40px',
    height: '40px',
    background: '#dc2626',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 10px 0',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 15px 0',
    lineHeight: '1.4',
  },
  priceContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  detailsCard: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  detailsTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '30px',
    textAlign: 'center',
  },
  detailsContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    alignItems: 'center',
  },
  detailsLeft: {
    textAlign: 'center',
  },
  detailsImage: {
    width: '100%',
    maxWidth: '300px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  detailsRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailsName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0',
  },
  detailsDesc: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: '0',
  },
  detailsPrice: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  detailsPriceLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailsPriceValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#dc2626',
  },
  form: {
    marginTop: '20px',
  },
  submitButton: {
    width: '100%',
    padding: '15px 20px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
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
  buttonIcon: {
    fontSize: '18px',
  },
  emptyState: {
    maxWidth: '400px',
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
    margin: '0',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '500',
  },
};

export default RentEquipment;