import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import api from "../api/axiosInstance";

function Equipments() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/equipments/all');
      setEquipments(response.data || []);
    } catch (error) {
      console.error('Error fetching equipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Equipment', icon: '🚜' },
    { id: 'tractor', name: 'Tractors', icon: '🚜' },
    { id: 'harvester', name: 'Harvesters', icon: '🌾' },
    { id: 'plough', name: 'Ploughs', icon: '🔧' },
    { id: 'sprayer', name: 'Sprayers', icon: '💧' },
  ];

  const filteredEquipments = equipments.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           eq.name.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleRentNow = (equipment) => {
    // Navigate to booking page with equipment details
    navigate('/checkout', { state: { equipment } });
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Loading equipment...</p>
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
        .equipment-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px rgba(220, 38, 38, 0.25);
        }
        .rent-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: scale(1.05);
        }
        .category-btn:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          transform: scale(1.05);
        }
        .search-input:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.iconContainer}>
              <span style={styles.headerIcon}>🔍</span>
            </div>
            <div>
              <h1 style={styles.headerTitle}>Browse Equipment</h1>
              <p style={styles.headerSubtitle}>Find the perfect equipment for your farming needs</p>
            </div>
          </div>
          <LanguageSwitcher inline />
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchInputContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              className="search-input"
            />
          </div>
        </div>

        <div style={styles.categoriesContainer}>
          <h3 style={styles.categoriesTitle}>Categories</h3>
          <div style={styles.categoriesGrid}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === category.id ? styles.activeCategoryButton : {})
                }}
                className="category-btn"
              >
                <span style={styles.categoryIcon}>{category.icon}</span>
                <span style={styles.categoryName}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div style={styles.equipmentSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Equipment' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <p style={styles.resultsCount}>
            {filteredEquipments.length} equipment{filteredEquipments.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {filteredEquipments.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>No Equipment Found</h3>
            <p style={styles.emptyDescription}>
              Try adjusting your search terms or browse different categories
            </p>
          </div>
        ) : (
          <div style={styles.equipmentGrid}>
            {filteredEquipments.map((equipment, index) => (
              <div 
                key={equipment.id} 
                style={{...styles.equipmentCard, animationDelay: `${index * 0.1}s`}}
                className="equipment-card"
              >
                <div style={styles.cardImageContainer}>
                  <img 
                    src={equipment.image || '/images/default-equipment.jpg'} 
                    alt={equipment.name}
                    style={styles.cardImage}
                  />
                  <div style={styles.availabilityBadge}>
                    <span style={styles.availabilityIcon}>✅</span>
                    <span style={styles.availabilityText}>Available</span>
                  </div>
                </div>

                <div style={styles.cardContent}>
                  <h3 style={styles.equipmentName}>{equipment.name}</h3>
                  <p style={styles.equipmentDescription}>{equipment.description}</p>
                  
                  <div style={styles.ownerInfo}>
                    <div style={styles.ownerAvatar}>
                      <span style={styles.ownerInitial}>
                        {equipment.owner?.name?.charAt(0)?.toUpperCase() || 'O'}
                      </span>
                    </div>
                    <div style={styles.ownerDetails}>
                      <p style={styles.ownerName}>{equipment.owner?.name || 'Equipment Owner'}</p>
                      <p style={styles.ownerLocation}>📍 {equipment.owner?.address || 'Location not specified'}</p>
                    </div>
                  </div>

                  <div style={styles.pricingSection}>
                    <div style={styles.priceContainer}>
                      <span style={styles.priceLabel}>Per Hour</span>
                      <span style={styles.priceValue}>₹{equipment.pricePerHour || (equipment.price ? (equipment.price / 24).toFixed(2) : 0)}</span>
                    </div>
                    <div style={styles.ratingContainer}>
                      <span style={styles.stars}>⭐⭐⭐⭐⭐</span>
                      <span style={styles.ratingText}>4.8</span>
                    </div>
                  </div>

                  <button 
                    style={styles.rentButton}
                    className="rent-btn"
                    onClick={() => handleRentNow(equipment)}
                  >
                    <span style={styles.buttonIcon}>🚀</span>
                    Rent Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
  filtersSection: {
    maxWidth: '1200px',
    margin: '0 auto 40px auto',
  },
  searchContainer: {
    marginBottom: '30px',
  },
  searchInputContainer: {
    position: 'relative',
    maxWidth: '500px',
    margin: '0 auto',
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
  categoriesContainer: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '25px',
    backdropFilter: 'blur(10px)',
  },
  categoriesTitle: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  categoryButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '15px',
    padding: '15px 10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  activeCategoryButton: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    transform: 'scale(1.05)',
  },
  categoryIcon: {
    fontSize: '24px',
  },
  categoryName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
  },
  equipmentSection: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeader: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 10px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  resultsCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '16px',
    margin: '0',
  },
  equipmentGrid: {
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
  availabilityBadge: {
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
  availabilityIcon: {
    fontSize: '12px',
  },
  availabilityText: {
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
  ownerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '12px',
  },
  ownerAvatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitial: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 3px 0',
  },
  ownerLocation: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0',
  },
  pricingSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: '24px',
    fontWeight: '700',
    color: '#dc2626',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  stars: {
    fontSize: '14px',
  },
  ratingText: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  rentButton: {
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
};

export default Equipments;