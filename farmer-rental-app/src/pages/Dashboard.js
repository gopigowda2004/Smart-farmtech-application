import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import NotificationSystem from "../components/NotificationSystem";
import AIChatbot from "../components/AIChatbot";
import api from "../api/axiosInstance";
import { isAdminUser, checkAdminStatus } from "../utils/adminUtils";

export default function Dashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [farmerData, setFarmerData] = useState(null);
  const [form, setForm] = useState({ name: "", desc: "", price: "", image: "" });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [showTimeEstimation, setShowTimeEstimation] = useState({});
  const [estimatedTime, setEstimatedTime] = useState("");
  const [globalAnalytics, setGlobalAnalytics] = useState(null);
  const [farmerAnalytics, setFarmerAnalytics] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loginTimestamp, setLoginTimestamp] = useState(localStorage.getItem("loginTimestamp"));
  const [equipments, setEquipments] = useState([]);

  // Fetch pending booking invitations for current user (owner view)
  const fetchPendingBookings = async () => {
    const farmerId = localStorage.getItem("farmerId");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");
    
    if (!farmerId) {
      console.log("❌ No farmerId found in localStorage, skipping pending bookings fetch");
      console.log("   userId:", userId, "role:", role);
      console.log("   This usually means the Farmer record wasn't created during registration/login");
      return;
    }

    setLoadingBookings(true);
    console.log("=== FETCHING PENDING BOOKINGS ===");
    console.log("FarmerId:", farmerId, "UserId:", userId, "Role:", role);
    
    try {
      // For owners, fetch pending invitations (bookings they can accept)
      const response = await api.get(`/bookings/owner/${farmerId}/pending-invitations`);
      console.log("✅ Pending invitations API response:", response.data);
      console.log("Number of invitations:", response.data?.length || 0);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Convert candidates to booking format for compatibility
        const pendingInvitations = response.data.map(candidate => {
          console.log("Processing candidate:", candidate);
          return {
            ...candidate.booking,
            candidateId: candidate.id,
            distanceKm: candidate.distanceKm,
            status: candidate.booking?.status || "PENDING",
            // Ensure we have the booking ID for accept functionality
            id: candidate.booking?.id || candidate.id
          };
        });
        console.log("✅ Processed pending invitations:", pendingInvitations);
        setPendingBookings(pendingInvitations);
      } else {
        console.log("⚠️ No pending invitations found via candidates API");
        console.log("Attempting fallback to show ALL pending bookings...");
        
        // Fallback: Show all pending bookings for owners
        try {
          const fallbackResponse = await api.get("/bookings/pending");
          console.log("📋 All pending bookings:", fallbackResponse.data);
          
          if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
            // For OWNER role, show all pending bookings they can potentially accept
            // Filter out only bookings where they are the renter
            const availableBookings = fallbackResponse.data.filter(booking => {
              const isNotRenter = booking.renter?.id !== parseInt(farmerId, 10);
              const isPending = booking.status === "PENDING" || booking.status === "PENDING_NO_CANDIDATES";
              const needsAcceptance = !booking.acceptedOwner;
              
              console.log(`Booking ${booking.id}:`, {
                isNotRenter,
                isPending,
                needsAcceptance,
                status: booking.status,
                renterId: booking.renter?.id,
                currentFarmerId: farmerId
              });
              
              return isNotRenter && isPending && needsAcceptance;
            });
            
            console.log("✅ Available bookings for owner:", availableBookings);
            setPendingBookings(availableBookings);
          } else {
            console.log("❌ No pending bookings found in fallback");
            setPendingBookings([]);
          }
        } catch (fallbackError) {
          console.error("❌ Fallback fetch failed:", fallbackError);
          setPendingBookings([]);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching pending booking invitations:", error);
      console.log("Error details:", error.response?.data || error.message);
      
      // Try fallback to general pending bookings
      try {
        const response = await api.get("/bookings/pending");
        console.log("📋 Fallback - All pending bookings:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          const filteredBookings = response.data.filter(booking => {
            const isNotRenter = booking.renter?.id !== parseInt(farmerId, 10);
            const needsOwner = !booking.acceptedOwner;
            const isPending = booking.status === "PENDING" || booking.status === "PENDING_NO_CANDIDATES";
            return isNotRenter && needsOwner && isPending;
          });
          
          console.log("✅ Filtered bookings:", filteredBookings);
          setPendingBookings(filteredBookings);
        } else {
          setPendingBookings([]);
        }
      } catch (fallbackError) {
        console.error("❌ Final fallback failed:", fallbackError);
        setPendingBookings([]);
      }
    } finally {
      setLoadingBookings(false);
      console.log("=== FETCH COMPLETE ===");
    }
  };

  // Fetch bookings accepted by current user (owner view)
  const fetchAcceptedBookings = async () => {
    const farmerId = localStorage.getItem("farmerId");
    if (!farmerId) {
      console.log("No farmerId found, skipping accepted bookings fetch");
      return;
    }

    console.log("=== FETCHING ACCEPTED BOOKINGS (OWNER VIEW) ===");
    console.log("Current farmerId:", farmerId);
    try {
      const response = await api.get(`/bookings/owner/${farmerId}/accepted`);
      console.log("✅ Accepted bookings API response:", response.data);
      console.log("Number of accepted bookings:", response.data?.length || 0);
      
      // Log each booking's acceptedOwner to verify filtering
      if (response.data && response.data.length > 0) {
        response.data.forEach(booking => {
          console.log(`Booking ${booking.id}: acceptedOwner ID = ${booking.acceptedOwner?.id}, current farmerId = ${farmerId}`);
        });
      }
      
      setAcceptedBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching accepted bookings:", error);
      setAcceptedBookings([]);
    }
  };

  // Fetch confirmed bookings for current user (renter view)
  const fetchConfirmedBookings = async () => {
    const farmerId = localStorage.getItem("farmerId");
    const userRole = localStorage.getItem("userRole");
    
    console.log("=== FETCHING CONFIRMED BOOKINGS (RENTER VIEW) ===");
    console.log("Current farmerId:", farmerId);
    console.log("Current userRole:", userRole);
    
    if (!farmerId) {
      console.log("❌ No farmerId found, skipping confirmed bookings fetch");
      return;
    }
    
    if (userRole !== "RENTER") {
      console.log("❌ User is not a RENTER, skipping confirmed bookings fetch");
      return;
    }

    try {
      const response = await api.get(`/bookings/renter/${farmerId}/confirmed`);
      console.log("✅ Confirmed bookings API response:", response.data);
      console.log("Number of confirmed bookings:", response.data?.length || 0);
      
      // Log each booking's renter to verify filtering
      if (response.data && response.data.length > 0) {
        response.data.forEach(booking => {
          console.log(`Booking ${booking.id}: renter ID = ${booking.renter?.id}, current farmerId = ${farmerId}, MATCH = ${booking.renter?.id === parseInt(farmerId, 10)}`);
        });
      }
      
      setConfirmedBookings(response.data || []);
    } catch (error) {
      console.error("❌ Error fetching confirmed bookings:", error);
      setConfirmedBookings([]);
    }
  };

  // Fetch equipments based on user role
  const fetchEquipments = async () => {
    try {
      const farmerId = localStorage.getItem("farmerId");
      const role = localStorage.getItem("userRole");
      
      let response;
      if (role === "ADMIN" || role === "OWNER") {
        // Admin and owners see their own equipment for management
        if (farmerId) {
          response = await api.get(`/equipments/my/${farmerId}`);
        } else {
          // Fallback to all equipment if no farmerId
          response = await api.get("/equipments");
        }
      } else {
        // Renters see other farmers' equipment for renting
        if (farmerId) {
          response = await api.get(`/equipments/others/${farmerId}`);
        } else {
          // If no farmerId (new user), show all equipment
          response = await api.get("/equipments");
        }
      }
      
      if (response.data && Array.isArray(response.data)) {
        setEquipments(response.data);
      }
    } catch (error) {
      console.error("Error fetching equipments:", error);
      // Show empty list if API fails
      setEquipments([]);
    }
  };

  useEffect(() => {
    // Update loginTimestamp state if it changed in localStorage
    const currentTimestamp = localStorage.getItem("loginTimestamp");
    if (currentTimestamp !== loginTimestamp) {
      setLoginTimestamp(currentTimestamp);
    }
    
    const farmerId = localStorage.getItem("farmerId");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");
    
    console.log("🔄 Dashboard useEffect triggered");
    console.log("farmerId:", farmerId, "userId:", userId, "role:", role, "timestamp:", currentTimestamp);
    
    // For new users, require userId; for legacy users, require farmerId
    if (!userId && !farmerId) {
      console.log("❌ No userId or farmerId, redirecting to login");
      navigate("/");
      return;
    }
    
    // Get user role from localStorage and set admin status
    const isAdminStored = localStorage.getItem("isAdmin");
    
    console.log("👤 User role:", role, "isAdmin:", isAdminStored);
    
    setUserRole(role);
    // Only set admin to true if role is explicitly ADMIN
    setIsAdmin(role === "ADMIN");
    
    // Clear ALL booking states first to prevent any data leakage
    console.log("🧹 Clearing all booking states...");
    setPendingBookings([]);
    setAcceptedBookings([]);
    setConfirmedBookings([]);
    
    // Then set appropriate states based on role
    if (role === "OWNER" || role === "ADMIN") {
      console.log("✅ User is OWNER/ADMIN - will fetch pending and accepted bookings");
    } else if (role === "RENTER") {
      console.log("✅ User is RENTER - will fetch confirmed bookings");
    }
    
    // Note: Admins can access both regular dashboard and admin dashboard
    // Remove automatic redirect to allow admins to use regular dashboard too
    
    // Fetch user profile data based on userId (preferred) or farmerId (legacy)
    const fetchUserProfile = async () => {
      try {
        let profileData;
        if (userId) {
          // New user system - fetch by userId
          const response = await api.get(`/users/${userId}`);
          profileData = response.data;
        } else if (farmerId) {
          // Legacy system - fetch by farmerId
          const response = await axios.get(`http://localhost:8090/api/farmers/profile/${farmerId}`);
          profileData = response.data;
        }
        
        if (profileData) {
          setFarmerData(profileData);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Try fallback to farmers API if users API fails
        if (userId && farmerId) {
          try {
            const response = await axios.get(`http://localhost:8090/api/farmers/profile/${farmerId}`);
            setFarmerData(response.data);
          } catch (fallbackError) {
            console.error("Fallback profile fetch also failed:", fallbackError);
          }
        }
      }
    };
    
    fetchUserProfile();

    const fetchAnalytics = async () => {
      try {
        const [globalResponse, farmerResponse] = await Promise.all([
          api.get("/analytics/global"),
          api.get(`/analytics/farmer/${farmerId}`),
        ]);
        setGlobalAnalytics(globalResponse.data);
        setFarmerAnalytics(farmerResponse.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalytics();
    fetchEquipments();
    
    // Fetch bookings based on user role
    if (role === "OWNER" || role === "ADMIN") {
      fetchPendingBookings();
      fetchAcceptedBookings();
    }
    
    if (role === "RENTER") {
      fetchConfirmedBookings();
    }

    const interval = setInterval(() => {
      // Re-read role from localStorage in case it changed
      const currentRole = localStorage.getItem("userRole");
      
      fetchAnalytics();
      fetchEquipments();
      
      // Fetch bookings based on user role
      if (currentRole === "OWNER" || currentRole === "ADMIN") {
        fetchPendingBookings();
        fetchAcceptedBookings();
      }
      
      if (currentRole === "RENTER") {
        fetchConfirmedBookings();
      }
    }, 10000);
    
    // Cleanup function: clear interval and booking states when component unmounts
    return () => {
      console.log("🧹 Dashboard unmounting - clearing interval and states");
      clearInterval(interval);
      setPendingBookings([]);
      setAcceptedBookings([]);
      setConfirmedBookings([]);
    };
  }, [navigate, loginTimestamp]);

  const handleLogout = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem("farmerId");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loginTimestamp");
    
    // Clear all booking states to prevent data leakage
    setPendingBookings([]);
    setAcceptedBookings([]);
    setConfirmedBookings([]);
    setLoginTimestamp(null);
    
    navigate("/");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only ADMIN and OWNER can add equipment
    if (!isAdmin && userRole !== "OWNER") {
      alert("❌ Only administrators and equipment owners can add equipment.");
      return;
    }
    
    try {
      const userId = localStorage.getItem("userId");
      const farmerId = localStorage.getItem("farmerId") || "1"; // Default to admin farmer ID
      
      if (!userId) {
        alert("❌ User ID not found. Please log in again.");
        return;
      }
      
      const equipmentData = {
        name: form.name,
        description: form.desc,
        price: parseFloat(form.price),
        image: form.image
      };
      
      // Call the backend API to add equipment
      console.log("Adding equipment for farmerId:", farmerId, "userId:", userId, "role:", userRole);
      const response = await api.post(`/equipments/add/${farmerId}?userId=${userId}`, equipmentData);
      
      // Refresh equipment list from server to get the complete data
      await fetchEquipments();
      setForm({ name: "", desc: "", price: "", image: "" });
      alert(`✅ Equipment added successfully!`);
    } catch (error) {
      console.error("Error adding equipment:", error);
      const errorMsg = error.response?.data || "Failed to add equipment";
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleAddEquipmentClick = () => setActiveTab("equipments");

  // Handle accepting a booking request
  const handleAcceptBooking = async (bookingId) => {
    const farmerId = localStorage.getItem("farmerId");
    const userId = localStorage.getItem("userId");
    const ownerId = farmerId || userId;
    
    console.log("Accepting booking:", bookingId, "for ownerId:", ownerId, "(farmerId:", farmerId, "userId:", userId, ")");
    
    if (!ownerId) {
      alert("❌ User ID not found. Please log in again.");
      return;
    }
    
    try {
      const response = await api.patch(`/bookings/${bookingId}/accept`, null, { 
        params: { ownerId } 
      });
      
      console.log("Booking acceptance response:", response.data);
      
      // Remove the accepted booking from pending list
      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      // Show success message
      alert("✅ Booking accepted successfully! The renter will be notified.");
      
      // Refresh all booking lists
      fetchPendingBookings();
      fetchAcceptedBookings();
      fetchConfirmedBookings();
    } catch (error) {
      console.error("Error accepting booking:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      
      // Handle different error response formats
      let errorMsg = "Failed to accept booking";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        } else {
          errorMsg = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      alert(`❌ ${errorMsg}. Please try again.`);
    }
  };

  // Handle time estimation submission
  const handleTimeEstimation = async (bookingId, estimatedTime) => {
    try {
      await api.patch(`/bookings/${bookingId}/arrival-time`, null, {
        params: { estimatedTime }
      });
      
      // Hide the time estimation form
      setShowTimeEstimation(prev => ({ ...prev, [bookingId]: false }));
      setEstimatedTime("");
      
      // Show success message
      alert("✅ Estimated arrival time sent to renter!");
      
      // Refresh accepted bookings
      fetchAcceptedBookings();
    } catch (error) {
      console.error("Error updating arrival time:", error);
      alert("❌ Failed to update arrival time. Please try again.");
    }
  };

  // Handle deleting equipment
  const handleDeleteEquipment = (index) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      setEquipments(prev => prev.filter((_, i) => i !== index));
      alert("✅ Equipment deleted successfully!");
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "—";
    const amount = Number(value);
    if (Number.isNaN(amount)) return "—";
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMinutes = (minutes) => {
    if (minutes == null) return "—";
    const rounded = Math.round(minutes * 10) / 10;
    if (rounded <= 0) return "<1 min";
    if (rounded >= 60) {
      const hours = (rounded / 60).toFixed(1);
      return `${hours} hrs`;
    }
    return `${rounded} min`;
  };

  const AnalyticsMetric = ({ label, value, highlight }) => (
    <div
      style={{
        ...styles.analyticsMetric,
        ...(highlight ? styles.analyticsMetricHighlight : {}),
      }}
    >
      <span style={styles.analyticsMetricLabel}>{label}</span>
      <span style={styles.analyticsMetricValue}>{value}</span>
    </div>
  );

  // Role-specific metrics
  const getMetricsForRole = () => {
    if (isAdmin) {
      return [
        {
          label: "Total equipment",
          value: equipments.length,
          note: "System-wide equipment",
        },
        {
          label: "All pending requests",
          value: pendingBookings.length,
          note: "Across all users",
        },
        {
          label: "All accepted bookings",
          value: acceptedBookings.length,
          note: "System-wide bookings",
        },
        {
          label: "System revenue",
          value: farmerData?.lifetimeEarnings ? `₹${farmerData.lifetimeEarnings}` : "₹0",
          note: "Total platform earnings",
        },
      ];
    } else if (userRole === "OWNER") {
      return [
        {
          label: "Your bookings received",
          value: pendingBookings.length,
          note: "Requests for your equipment",
        },
        {
          label: "Accepted bookings",
          value: acceptedBookings.length,
          note: "Scheduled with renters",
        },
        {
          label: "Your earnings",
          value: farmerData?.averageDailyRate ? `₹${farmerData.averageDailyRate}` : "₹0",
          note: "From equipment rental",
        },
        {
          label: "Equipment status",
          value: "View only",
          note: "Contact admin to add equipment",
        },
      ];
    } else if (userRole === "RENTER") {
      return [
        {
          label: "Active bookings",
          value: confirmedBookings.length,
          note: "Currently scheduled",
        },
        {
          label: "Total bookings",
          value: farmerAnalytics?.totalBookings || 0,
          note: "All time",
        },
        {
          label: "Total spent",
          value: `₹${farmerAnalytics?.totalSpent || 0}`,
          note: "On equipment rental",
        },
        {
          label: "Favorite equipment",
          value: farmerAnalytics?.favoriteEquipment || "None",
          note: "Most frequently rented",
        },
      ];
    } else {
      // Legacy users without role
      return [
        {
          label: "Active equipment",
          value: equipments.length,
          note: "Ready for rent",
        },
        {
          label: "Pending requests",
          value: pendingBookings.length,
          note: "Awaiting your decision",
        },
        {
          label: "Confirmed rentals",
          value: confirmedBookings.length,
          note: "Scheduled",
        },
        {
          label: "Average daily rate",
          value: farmerData?.averageDailyRate ? `₹${farmerData.averageDailyRate}` : "₹0",
          note: "Across listed equipment",
        },
      ];
    }
  };

  const summaryMetrics = getMetricsForRole();

  const cultivationTips = [
    {
      icon: "🚜",
      title: "Keep machinery primed",
      description:
        "Schedule monthly maintenance checks so renters always receive dependable equipment.",
    },
    {
      icon: "🌾",
      title: "Share field insights",
      description:
        "Add usage notes and crop pairing tips to each listing to help renters choose confidently.",
    },
    {
      icon: "💧",
      title: "Monitor availability",
      description:
        "Block out maintenance days early to avoid double bookings during peak seasons.",
    },
    {
      icon: "🤝",
      title: "Celebrate successful hires",
      description:
        "Follow up with renters for feedback and reviews to boost future bookings.",
    },
  ];

  const featuredEquipments = equipments.slice(0, 4);
  const nextBooking = farmerData?.nextBookingDate || "No bookings scheduled";
  const lifetimeEarnings = farmerData?.lifetimeEarnings ? `₹${farmerData.lifetimeEarnings}` : "₹0";

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>🌿 {t("dashboard.logo")}</h2>
        <div style={styles.profileCard}>
          <span style={styles.roleBadge}>
            {isAdmin ? "Admin Console" : 
             userRole === "OWNER" ? "Equipment Provider" : 
             userRole === "RENTER" ? "Equipment Booker" : 
             "Farmer Console"}
          </span>
          <h3 style={styles.profileName}>
            {farmerData?.name || t("dashboard.welcome").replace("{name}", "User")}
          </h3>
          <p style={styles.profileMeta}>
            {isAdmin ? "System Administration" :
             userRole === "OWNER" ? "Accept bookings and manage rentals" :
             userRole === "RENTER" ? "Find and book equipment for your farm" :
             farmerData?.village || "Welcome to FarmRental"}
          </p>
          {(isAdmin || userRole === "OWNER") && (
            <button style={styles.navButton} onClick={handleAddEquipmentClick}>
              + Add new equipment
            </button>
          )}
          {userRole === "RENTER" && (
            <button style={styles.navButton} onClick={() => navigate("/bookings")}>
              🔍 Browse Equipment
            </button>
          )}
        </div>
        <ul style={styles.navList}>
          <li style={styles.navSectionLabel}>Command Center</li>
          <li
            style={{
              ...styles.navItem,
              ...(activeTab === "dashboard" ? styles.navItemActive : {}),
            }}
            onClick={() => setActiveTab("dashboard")}
          >
            <span>📊 Overview</span>
          </li>
          {(isAdmin || userRole === "OWNER") && (
            <li
              style={{
                ...styles.navItem,
                ...(activeTab === "equipments" ? styles.navItemActive : {}),
              }}
              onClick={handleAddEquipmentClick}
            >
              <span>🛠️ Manage inventory</span>
            </li>
          )}
          <li
            style={{
              ...styles.navItem,
              ...(activeTab === "stats" ? styles.navItemActive : {}),
            }}
            onClick={() => setActiveTab("stats")}
          >
            <span>📈 Performance</span>
          </li>

          <li style={styles.navSectionLabel}>Navigate</li>
          <li style={styles.navItem} onClick={() => navigate("/profile")}>
            <span>{t("dashboard.menu.profile")}</span>
          </li>
          
          {/* Admin-specific navigation */}
          {isAdmin && (
            <li style={styles.navItem} onClick={() => navigate("/rent-equipment")}>
              <span>{t("dashboard.menu.rentEquipments")}</span>
            </li>
          )}
          
          {/* Equipment Owner navigation */}
          {(userRole === "OWNER" || isAdmin) && (
            <>
              <li style={styles.navItem} onClick={() => navigate("/manage-my-equipment")}>
                <span>{isAdmin ? "Manage Equipment (Admin)" : "🛠️ My Equipment"}</span>
              </li>
              <li style={styles.navItem} onClick={() => navigate("/owner-requests")}>
                <span>📋 Rental Requests</span>
              </li>
            </>
          )}
          
          {/* Equipment Renter navigation */}
          {(userRole === "RENTER" || isAdmin) && (
            <>
              <li style={styles.navItem} onClick={() => navigate("/bookings")}>
                <span>🔍 Browse Equipment</span>
              </li>
              <li style={styles.navItem} onClick={() => navigate("/my-bookings")}>
                <span>📅 My Bookings</span>
              </li>
            </>
          )}
          
          {/* Show all for legacy users without role */}
          {!userRole && !isAdmin && (
            <>
              <li style={styles.navItem} onClick={() => navigate("/manage-my-equipment")}>
                <span>{t("managemyEquipments")}</span>
              </li>
              <li style={styles.navItem} onClick={() => navigate("/bookings")}>
                <span>{t("dashboard.menu.browseEquipments")}</span>
              </li>
              <li style={styles.navItem} onClick={() => navigate("/my-bookings")}>
                <span>{t("dashboard.menu.myBookings")}</span>
              </li>
              <li style={styles.navItem} onClick={() => navigate("/owner-requests")}>
                <span>{t("dashboard.menu.ownerRequests")}</span>
              </li>
            </>
          )}
          <li style={styles.navItem} onClick={() => navigate("/ml/crop-recommendation")}>
            <span>{t("dashboard.menu.cropRecommendation")}</span>
          </li>
          <li style={styles.navItem} onClick={() => navigate("/ml/fertilizer-prediction")}
          >
            <span>{t("dashboard.menu.fertilizerPrediction")}</span>
          </li>
          <li style={styles.navItem} onClick={() => navigate("/ml/crop-yield-estimation")}
          >
            <span>{t("dashboard.menu.cropYieldEstimation")}</span>
          </li>
          <li style={styles.navItem} onClick={() => navigate("/ml/soil-analysis")}
          >
            <span>{t("dashboard.menu.soilAnalysis")}</span>
          </li>
          <li style={styles.navItem} onClick={() => navigate("/ml/plant-disease")}
          >
            <span>{t("dashboard.menu.plantDiseaseDetection")}</span>
          </li>
          <li style={styles.logout} onClick={handleLogout}>
            {t("dashboard.menu.logout")}
          </li>
        </ul>
      </aside>

      <main style={styles.mainArea}>
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Farm operations dashboard</h1>
            <p style={styles.pageSubtitle}>
              Plan, monitor, and grow your equipment rentals in one place.
            </p>
          </div>
          <div style={styles.topBarRight}>
            <div style={styles.searchGroup}>
              <input
                type="text"
                placeholder={t("dashboard.searchPlaceholder")}
                style={styles.searchInput}
              />
              <button style={styles.searchBtn}>🔍</button>
            </div>
            <NotificationSystem />
            <LanguageSwitcher inline />
          </div>
        </header>

        {/* AI Chatbot Assistant */}
        <AIChatbot />

        {activeTab === "dashboard" && (
          <>
            {/* Role-specific Hero Section */}
            {userRole === "OWNER" || isAdmin ? (
              <section style={styles.heroCard}>
                <span style={styles.heroBadge}>Equipment Provider</span>
                <h2 style={styles.heroTitle}>
                  Welcome back, {farmerData?.name || "Provider"}!
                </h2>
                <p style={styles.heroSubtitle}>
                  Your equipment is in demand. Keep availability updated to maximise
                  earnings and delight renters.
                </p>
                <div style={styles.heroMeta}>
                  <div style={styles.heroStat}>
                    <span style={styles.heroStatLabel}>Next booking</span>
                    <span style={styles.heroStatValue}>{nextBooking}</span>
                  </div>
                  <div style={styles.heroStat}>
                    <span style={styles.heroStatLabel}>Lifetime revenue</span>
                    <span style={styles.heroStatValue}>{lifetimeEarnings}</span>
                  </div>
                  <button style={styles.heroCta} onClick={handleAddEquipmentClick}>
                    Manage equipment →
                  </button>
                </div>
                <img
                  style={styles.heroImage}
                  alt="Farm equipment illustration"
                  src="https://images.unsplash.com/photo-1591973661334-0689a1c0d227?auto=format&fit=crop&w=1100&q=80"
                />
              </section>
            ) : userRole === "RENTER" ? (
              <section style={styles.heroCard}>
                <span style={styles.heroBadge}>Equipment Booker</span>
                <h2 style={styles.heroTitle}>
                  Welcome back, {farmerData?.name || "Farmer"}!
                </h2>
                <p style={styles.heroSubtitle}>
                  Find the perfect equipment for your farming needs. Browse available 
                  machinery and book instantly from trusted providers.
                </p>
                <div style={styles.heroMeta}>
                  <div style={styles.heroStat}>
                    <span style={styles.heroStatLabel}>Active bookings</span>
                    <span style={styles.heroStatValue}>{confirmedBookings.length}</span>
                  </div>
                  <div style={styles.heroStat}>
                    <span style={styles.heroStatLabel}>Total spent</span>
                    <span style={styles.heroStatValue}>₹{farmerAnalytics?.totalSpent || 0}</span>
                  </div>
                  <button style={styles.heroCta} onClick={() => navigate("/bookings")}>
                    Browse equipment →
                  </button>
                </div>
                <img
                  style={styles.heroImage}
                  alt="Farm equipment illustration"
                  src="https://images.unsplash.com/photo-1591973661334-0689a1c0d227?auto=format&fit=crop&w=1100&q=80"
                />
              </section>
            ) : (
              <section style={styles.heroCard}>
                <span style={styles.heroBadge}>Season ready</span>
                <h2 style={styles.heroTitle}>
                  Welcome back, {farmerData?.name || "Farmer"}!
                </h2>
                <p style={styles.heroSubtitle}>
                  Your equipment is in demand. Keep availability updated to maximise
                  earnings and delight renters.
                </p>
                <div style={styles.heroMeta}>
                  <div style={styles.heroStat}>
                    <span style={styles.heroStatLabel}>Next booking</span>
                    <span style={styles.heroStatValue}>{nextBooking}</span>
                  </div>
                  <div style={styles.heroStat}>
                    <span style={styles.heroStatLabel}>Lifetime revenue</span>
                    <span style={styles.heroStatValue}>{lifetimeEarnings}</span>
                  </div>
                  <button style={styles.heroCta} onClick={handleAddEquipmentClick}>
                    Manage equipment →
                  </button>
                </div>
                <img
                  style={styles.heroImage}
                  alt="Farm equipment illustration"
                  src="https://images.unsplash.com/photo-1591973661334-0689a1c0d227?auto=format&fit=crop&w=1100&q=80"
                />
              </section>
            )}

            <section style={styles.metricsSection}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  {userRole === "OWNER" || isAdmin ? "Equipment business at a glance" :
                   userRole === "RENTER" ? "Your rental activity at a glance" :
                   "Farm performance at a glance"}
                </h3>
                <button style={styles.sectionAction}>Download summary</button>
              </div>
              <div style={styles.metricsGrid}>
                {summaryMetrics.map((metric) => (
                  <div key={metric.label} style={styles.metricCard}>
                    <span style={styles.metricLabel}>{metric.label}</span>
                    <span style={styles.metricValue}>{metric.value}</span>
                    <span style={styles.metricNote}>{metric.note}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Pending Booking Requests Section - Only for Equipment Owners */}
            {(userRole === "OWNER" || isAdmin || !userRole) && (
              <section style={styles.bookingRequestsSection}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>
                    {pendingBookings.length > 0 ? 
                      `🚨 New Booking Requests (${pendingBookings.length})` : 
                      "📋 Booking Requests"
                    }
                  </h3>
                  <button style={styles.sectionAction} onClick={fetchPendingBookings}>
                    {loadingBookings ? "⏳ Loading..." : "↻ Refresh"}
                  </button>
                </div>
                {pendingBookings.length > 0 ? (
                  <div style={styles.bookingRequestsGrid}>
                    {pendingBookings.map((booking) => (
                    <div key={booking.id} style={styles.bookingRequestCard}>
                      <div style={styles.bookingRequestHeader}>
                        <div style={styles.bookingRequestBadge}>NEW REQUEST</div>
                        <div style={styles.bookingRequestTime}>
                          {new Date(booking.createdAt || Date.now()).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div style={styles.bookingRequestContent}>
                        <div style={styles.bookingRequestMain}>
                          <h4 style={styles.bookingRequestTitle}>
                            🚜 {booking.equipment?.name || 'Equipment Rental'}
                          </h4>
                          <div style={styles.bookingRequestDetails}>
                            <div><strong>Renter:</strong> {booking.renter?.name}</div>
                            <div><strong>Contact:</strong> {booking.renter?.phone}</div>
                            <div><strong>Location:</strong> {booking.location || 'Not specified'}</div>
                            {booking.distanceKm && (
                              <div><strong>Distance:</strong> {booking.distanceKm.toFixed(1)} km away</div>
                            )}
                            <div><strong>Start Date:</strong> {booking.startDate}</div>
                            <div><strong>Duration:</strong> {booking.hours} hours</div>
                            <div><strong>Total Amount:</strong> ₹{booking.hours * (booking.equipment?.pricePerHour || 0)}</div>
                          </div>
                        </div>
                        
                        <div style={styles.bookingRequestActions}>
                          <button 
                            style={styles.acceptBookingBtn}
                            onClick={() => handleAcceptBooking(booking.id)}
                          >
                            ✅ Accept Booking
                          </button>
                          <div style={styles.bookingRequestNote}>
                            Accept to confirm this rental and notify the renter
                          </div>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.noBookingsMessage}>
                    <div style={styles.noBookingsIcon}>📋</div>
                    <h4 style={styles.noBookingsTitle}>
                      {!localStorage.getItem("farmerId") ? 
                        "⚠️ Profile Setup Required" : 
                        "No pending booking requests"
                      }
                    </h4>
                    <p style={styles.noBookingsText}>
                      {!localStorage.getItem("farmerId") ? 
                        "Your owner profile is not fully set up. Please update your profile with your location to start receiving booking requests." :
                        userRole === "OWNER" ? 
                          "When renters book your equipment, their requests will appear here for you to accept." :
                          "Booking requests from renters will appear here when they need your equipment."
                      }
                    </p>
                    <div style={styles.noBookingsActions}>
                      {!localStorage.getItem("farmerId") ? (
                        <button style={styles.addEquipmentBtn} onClick={() => navigate("/profile")}>
                          📝 Update Profile
                        </button>
                      ) : (
                        <>
                          {userRole === "ADMIN" && (
                            <button style={styles.addEquipmentBtn} onClick={handleAddEquipmentClick}>
                              🛠️ Add Equipment
                            </button>
                          )}
                          <button style={styles.refreshBtn} onClick={fetchPendingBookings}>
                            ↻ Check Again
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Confirmed Bookings Section - For Renters */}
            {userRole === "RENTER" && confirmedBookings.length > 0 && (
              <section style={styles.confirmedBookingsSection}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>
                    🎉 Your Accepted Bookings ({confirmedBookings.length})
                  </h3>
                  <button style={styles.sectionAction} onClick={fetchConfirmedBookings}>
                    ↻ Refresh
                  </button>
                </div>
                <div style={styles.bookingRequestsGrid}>
                  {confirmedBookings.map((booking) => (
                    <div key={booking.id} style={styles.confirmedBookingCard}>
                      <div style={styles.confirmedBookingHeader}>
                        <div style={styles.confirmedBookingBadge}>ACCEPTED</div>
                        <div style={styles.bookingRequestTime}>
                          {booking.estimatedArrivalTime && `ETA: ${booking.estimatedArrivalTime}`}
                        </div>
                      </div>
                      
                      <div style={styles.bookingRequestContent}>
                        <div style={styles.bookingRequestMain}>
                          <h4 style={styles.bookingRequestTitle}>
                            🚜 {booking.equipment?.name || 'Equipment Rental'}
                          </h4>
                          
                          {/* Owner Details */}
                          {booking.acceptedOwner && (
                            <div style={styles.ownerDetailsSection}>
                              <h5 style={styles.ownerDetailsTitle}>✅ Accepted by Owner:</h5>
                              <div style={styles.ownerInfo}>
                                <div style={styles.ownerAvatar}>
                                  {booking.acceptedOwner.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div style={styles.ownerContactInfo}>
                                  <div><strong>{booking.acceptedOwner.name}</strong></div>
                                  <div>📞 {booking.acceptedOwner.phone}</div>
                                  <div>📧 {booking.acceptedOwner.email}</div>
                                </div>
                              </div>
                              <div style={styles.contactButtons}>
                                <button 
                                  style={styles.callOwnerBtn}
                                  onClick={() => window.open(`tel:${booking.acceptedOwner.phone}`)}
                                >
                                  📞 Call Owner
                                </button>
                                <button 
                                  style={styles.messageOwnerBtn}
                                  onClick={() => window.open(`sms:${booking.acceptedOwner.phone}`)}
                                >
                                  💬 Message
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <div style={styles.bookingRequestDetails}>
                            <div><strong>Location:</strong> {booking.location || 'Not specified'}</div>
                            <div><strong>Start Date:</strong> {booking.startDate}</div>
                            <div><strong>Duration:</strong> {booking.hours} hours</div>
                            <div><strong>Total Amount:</strong> ₹{booking.totalCost}</div>
                            {booking.estimatedArrivalDateTime && (
                              <div><strong>Expected Arrival:</strong> {new Date(booking.estimatedArrivalDateTime).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Google Maps Integration */}
                        {booking.locationLatitude && booking.locationLongitude && (
                          <div style={styles.mapContainer}>
                            <iframe
                              src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${booking.acceptedOwner?.village || 'Current Location'}&destination=${booking.locationLatitude},${booking.locationLongitude}&mode=driving`}
                              style={styles.mapFrame}
                              allowFullScreen=""
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Accepted Bookings Section - For Owners */}
            {(userRole === "OWNER" || isAdmin || !userRole) && acceptedBookings.length > 0 && (
              <section style={styles.acceptedBookingsSection}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>
                    🚛 Your Accepted Deliveries ({acceptedBookings.length})
                  </h3>
                  <button style={styles.sectionAction} onClick={fetchAcceptedBookings}>
                    ↻ Refresh
                  </button>
                </div>
                <div style={styles.bookingRequestsGrid}>
                  {acceptedBookings.map((booking) => (
                    <div key={booking.id} style={styles.acceptedBookingCard}>
                      <div style={styles.acceptedBookingHeader}>
                        <div style={styles.acceptedBookingBadge}>DELIVERING</div>
                        <div style={styles.bookingRequestTime}>
                          Booking #{booking.id}
                        </div>
                      </div>
                      
                      <div style={styles.bookingRequestContent}>
                        <div style={styles.bookingRequestMain}>
                          <h4 style={styles.bookingRequestTitle}>
                            🚜 {booking.equipment?.name || 'Equipment Rental'}
                          </h4>
                          
                          {/* Renter Details */}
                          <div style={styles.renterDetailsSection}>
                            <h5 style={styles.renterDetailsTitle}>📋 Renter Details:</h5>
                            <div style={styles.renterInfo}>
                              <div style={styles.renterAvatar}>
                                {booking.renter?.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div style={styles.renterContactInfo}>
                                <div><strong>{booking.renter?.name}</strong></div>
                                <div>📞 {booking.renter?.phone}</div>
                                <div>📧 {booking.renter?.email}</div>
                                <div>📍 {booking.location}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div style={styles.bookingRequestDetails}>
                            <div><strong>Start Date:</strong> {booking.startDate}</div>
                            <div><strong>Duration:</strong> {booking.hours} hours</div>
                            <div><strong>Total Amount:</strong> ₹{booking.totalCost}</div>
                          </div>
                        </div>
                        
                        {/* Time Estimation Section */}
                        <div style={styles.timeEstimationSection}>
                          {!booking.estimatedArrivalTime ? (
                            <div>
                              {!showTimeEstimation[booking.id] ? (
                                <button 
                                  style={styles.estimateTimeBtn}
                                  onClick={() => setShowTimeEstimation((prev) => ({ ...prev, [booking.id]: true }))}
                                >
                                  ⏰ Set Arrival Time
                                </button>
                              ) : (
                                <div style={styles.timeEstimationForm}>
                                  <h6 style={styles.timeEstimationTitle}>How long will it take to reach the renter?</h6>
                                  <div style={styles.timeEstimationInputs}>
                                    <input
                                      type="text"
                                      placeholder="e.g., 30 minutes, 1 hour"
                                      value={estimatedTime}
                                      onChange={(e) => setEstimatedTime(e.target.value)}
                                      style={styles.timeInput}
                                    />
                                    <button 
                                      style={styles.sendTimeBtn}
                                      onClick={() => handleTimeEstimation(booking.id, estimatedTime)}
                                    >
                                      Send ETA
                                    </button>
                                    <button 
                                      style={styles.cancelTimeBtn}
                                      onClick={() => setShowTimeEstimation(prev => ({ ...prev, [booking.id]: false }))}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={styles.timeEstimationSent}>
                              <span style={styles.timeEstimationIcon}>✅</span>
                              <span>ETA sent: {booking.estimatedArrivalTime}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Map Directions for Owner */}
                        {(() => {
                          // Debug logging for map display
                          console.log('=== MAP DEBUG FOR BOOKING #' + booking.id + ' ===');
                          console.log('Booking location (address):', booking.location);
                          console.log('FarmerData (Your) latitude:', farmerData?.latitude);
                          console.log('FarmerData (Your) longitude:', farmerData?.longitude);
                          console.log('Can show map:', !!(booking.location && farmerData?.latitude && farmerData?.longitude));
                          return null;
                        })()}
                        {booking.location && farmerData?.latitude && farmerData?.longitude ? (
                          <div style={styles.mapContainer}>
                            <h6 style={styles.mapTitle}>🗺️ Get Directions to Renter</h6>
                            <div style={styles.mapDirectionsCard}>
                              <div style={styles.routeInfo}>
                                <div style={styles.routePoint}>
                                  <span style={styles.routeIcon}>📍</span>
                                  <span style={styles.routeLabel}>Your Location</span>
                                </div>
                                <div style={styles.routeArrow}>→</div>
                                <div style={styles.routePoint}>
                                  <span style={styles.routeIcon}>🎯</span>
                                  <span style={styles.routeLabel}>Renter: {booking.location}</span>
                                </div>
                              </div>
                              <button 
                                style={styles.googleMapsBtn}
                                onClick={() => window.open(`https://www.google.com/maps/dir/${farmerData.latitude},${farmerData.longitude}/${encodeURIComponent(booking.location)}`, '_blank')}
                              >
                                🗺️ Open Google Maps Navigation
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={styles.mapPlaceholder}>
                            <div style={styles.mapPlaceholderIcon}>📍</div>
                            <div style={styles.mapPlaceholderText}>
                              <strong>Map directions unavailable</strong>
                              <p>
                                {!booking.location 
                                  ? "Renter's location address is missing" 
                                  : "Your location coordinates are missing. Please update your profile with your address."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Confirmed Bookings Section - For Renters */}
            {userRole === "RENTER" && confirmedBookings.length > 0 && (
              <section style={styles.confirmedBookingsSection}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>
                    📅 Your Confirmed Bookings ({confirmedBookings.length})
                  </h3>
                  <button style={styles.sectionAction} onClick={fetchConfirmedBookings}>
                    ↻ Refresh
                  </button>
                </div>
                <div style={styles.bookingRequestsGrid}>
                  {confirmedBookings.map((booking) => (
                    <div key={booking.id} style={styles.confirmedBookingCard}>
                      <div style={styles.confirmedBookingHeader}>
                        <div style={styles.confirmedBookingBadge}>CONFIRMED</div>
                        <div style={styles.bookingRequestTime}>
                          Booking #{booking.id}
                        </div>
                      </div>
                      
                      <div style={styles.bookingRequestContent}>
                        <div style={styles.bookingRequestMain}>
                          <h4 style={styles.bookingRequestTitle}>
                            🚜 {booking.equipment?.name || 'Equipment Rental'}
                          </h4>
                          
                          <div style={styles.bookingRequestDetails}>
                            <div><strong>Owner:</strong> {booking.acceptedOwner?.name || booking.owner?.name}</div>
                            <div><strong>Contact:</strong> {booking.acceptedOwner?.phone || booking.owner?.phone}</div>
                            <div><strong>Start Date:</strong> {booking.startDate}</div>
                            <div><strong>Duration:</strong> {booking.hours} hours</div>
                            <div><strong>Total Amount:</strong> ₹{booking.hours * (booking.equipment?.pricePerHour || 0)}</div>
                            {booking.estimatedArrivalTime && (
                              <div><strong>Estimated Arrival:</strong> {booking.estimatedArrivalTime}</div>
                            )}
                          </div>
                        </div>
                        
                        <div style={styles.bookingRequestActions}>
                          <div style={styles.bookingStatusInfo}>
                            <span style={styles.statusIcon}>✅</span>
                            <span>Equipment confirmed and on the way!</span>
                          </div>
                          <button 
                            style={styles.contactOwnerBtn}
                            onClick={() => window.open(`tel:${booking.acceptedOwner?.phone || booking.owner?.phone}`, '_self')}
                          >
                            📞 Contact Owner
                          </button>
                        </div>
                        
                        {/* Map Directions to Owner for Renter */}
                        {booking.acceptedOwner?.latitude && booking.acceptedOwner?.longitude && booking.location ? (
                          <div style={styles.mapContainer}>
                            <h6 style={styles.mapTitle}>🗺️ Owner's Location</h6>
                            <div style={styles.mapDirectionsCard}>
                              <div style={styles.routeInfo}>
                                <div style={styles.routePoint}>
                                  <span style={styles.routeIcon}>📍</span>
                                  <span style={styles.routeLabel}>Your Location: {booking.location}</span>
                                </div>
                                <div style={styles.routeArrow}>→</div>
                                <div style={styles.routePoint}>
                                  <span style={styles.routeIcon}>🎯</span>
                                  <span style={styles.routeLabel}>Owner Location</span>
                                </div>
                              </div>
                              <button 
                                style={styles.googleMapsBtn}
                                onClick={() => window.open(`https://www.google.com/maps/dir/${encodeURIComponent(booking.location)}/${booking.acceptedOwner.latitude},${booking.acceptedOwner.longitude}`, '_blank')}
                              >
                                🗺️ Open Google Maps to Owner
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={styles.mapPlaceholder}>
                            <div style={styles.mapPlaceholderIcon}>📍</div>
                            <div style={styles.mapPlaceholderText}>
                              <strong>Map to owner unavailable</strong>
                              <p>Owner's location coordinates are not available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section style={styles.splitSection}>
              <div style={styles.splitColumn}>
                <div style={styles.plannerCard}>
                  <h3 style={styles.sectionTitle}>Today&apos;s focus</h3>
                  <ul style={styles.todoList}>
                    <li style={styles.todoItem}>
                      <span>✅ Confirm availability for upcoming bookings</span>
                      <small style={styles.todoNote}>5 rentals scheduled this week</small>
                    </li>
                    <li style={styles.todoItem}>
                      <span>🧰 Refresh photos for popular tractors</span>
                      <small style={styles.todoNote}>Better imagery increases conversions</small>
                    </li>
                    <li style={styles.todoItem}>
                      <span>✉️ Reply to 2 pending owner requests</span>
                      <small style={styles.todoNote}>Keep response time under 2 hours</small>
                    </li>
                  </ul>
                </div>

                <div style={styles.alertCard}>
                  <h3 style={styles.sectionTitle}>Marketplace highlights</h3>
                  <p style={styles.alertLead}>Seasonal demand is rising for harvester attachments.</p>
                  <p style={styles.alertText}>
                    Consider adding bundled pricing or seasonal discounts to capture
                    more renters this month.
                  </p>
                  <button style={styles.secondaryButton}>Create seasonal offer →</button>
                </div>
              </div>

              <div style={styles.splitColumn}>
                <div style={styles.timelineCard}>
                  <h3 style={styles.sectionTitle}>Upcoming rentals</h3>
                  <div style={styles.timelineItem}>
                    <span style={styles.timelineDot} />
                    <div>
                      <strong>Rotavator - Kurugodu Farms</strong>
                      <p style={styles.timelineMeta}>Apr 22 · 3 day hire · Contact: +91 90000 00001</p>
                    </div>
                  </div>
                  <div style={styles.timelineItem}>
                    <span style={styles.timelineDot} />
                    <div>
                      <strong>Brush Cutter - Bellary Fields</strong>
                      <p style={styles.timelineMeta}>Apr 24 · 1 day hire · Contact: +91 90000 00023</p>
                    </div>
                  </div>
                  <div style={styles.timelineItem}>
                    <span style={styles.timelineDot} />
                    <div>
                      <strong>Power Weeder - Rural Collective</strong>
                      <p style={styles.timelineMeta}>Apr 27 · 2 day hire · Contact: +91 90000 00045</p>
                    </div>
                  </div>
                  <button style={styles.secondaryButton}>Open calendar →</button>
                </div>
              </div>
            </section>

            <section style={styles.equipmentSection}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Featured equipment listing</h3>
                <button style={styles.sectionAction}>View all inventory</button>
              </div>
              <div style={styles.equipmentGrid}>
                {featuredEquipments.map((equipment, index) => (
                  <article key={`${equipment.name}-${index}`} style={styles.equipmentCard}>
                    <div style={styles.equipmentImageWrapper}>
                      <img src={equipment.image} alt={equipment.name} style={styles.equipmentImage} />
                    </div>
                    <h4 style={styles.equipmentName}>{equipment.name}</h4>
                    <p style={styles.equipmentDesc}>{equipment.desc}</p>
                    <div style={styles.equipmentMeta}>
                      <span style={styles.equipmentPrice}>
                        {t("common.priceDay").replace("{price}", equipment.pricePerHour || (equipment.price ? (equipment.price / 24).toFixed(2) : 0))}
                      </span>
                      <button style={styles.equipmentButton}>{t("btn.rentNow")}</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section style={styles.tipsSection}>
              <h3 style={{ ...styles.sectionTitle, marginBottom: 16 }}>Cultivation insights</h3>
              <div style={styles.tipsGrid}>
                {cultivationTips.map((tip) => (
                  <div key={tip.title} style={styles.tipCard}>
                    <span style={styles.tipIcon}>{tip.icon}</span>
                    <h4 style={styles.tipTitle}>{tip.title}</h4>
                    <p style={styles.tipDescription}>{tip.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === "equipments" && (isAdmin || userRole === "OWNER") && (
          <section style={styles.tabSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                {isAdmin ? "Manage equipment library (Admin)" : "Manage your equipment"}
              </h3>
              <p style={styles.sectionSubtext}>
                {isAdmin ? "Add, edit, or remove equipment from the system." : "Add and manage your equipment for rental."}
              </p>
            </div>
            <div style={styles.equipmentManager}>
              <form onSubmit={handleSubmit} style={styles.formCard}>
                <h4 style={styles.formTitle}>Add equipment</h4>
                <div style={styles.formGrid}>
                  <label style={styles.formField}>
                    <span>Name</span>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label style={styles.formField}>
                    <span>Description</span>
                    <input
                      type="text"
                      name="desc"
                      value={form.desc}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label style={styles.formField}>
                    <span>Price per hour (₹/hr)</span>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required
                      placeholder="Enter hourly rate"
                    />
                  </label>
                  <label style={styles.formField}>
                    <span>Image URL</span>
                    <input
                      type="text"
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                    />
                  </label>
                </div>
                <button type="submit" style={styles.primaryButton}>
                  Save equipment
                </button>
              </form>

              <div style={styles.inventoryList}>
                {equipments.map((equipment, index) => (
                  <div key={`${equipment.name}-${index}`} style={styles.inventoryItem}>
                    <div style={styles.inventoryThumb}>
                      <img src={equipment.image} alt={equipment.name} style={styles.inventoryImage} />
                    </div>
                    <div style={styles.inventoryContent}>
                      <h4 style={styles.inventoryTitle}>{equipment.name}</h4>
                      <p style={styles.inventoryDesc}>{equipment.description || equipment.desc}</p>
                    </div>
                    <div style={styles.inventoryMeta}>
                      <span style={styles.inventoryPrice}>
                        {t("common.priceDay").replace("{price}", equipment.pricePerHour || (equipment.price ? (equipment.price / 24).toFixed(2) : 0))}
                      </span>
                      <button 
                        style={styles.deleteButton}
                        onClick={() => handleDeleteEquipment(index)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "stats" && (
          <section style={styles.tabSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Performance analytics</h3>
              <p style={styles.sectionSubtext}>
                Track rental velocity, income trends, and booking confirmations to spot growth opportunities.
              </p>
            </div>

            <div style={styles.analyticsGrid}>
              <div style={styles.analyticsCard}>
                <h4 style={styles.analyticsCardTitle}>Platform snapshot</h4>
                <div style={styles.analyticsMetrics}>
                  <AnalyticsMetric
                    label="Total bookings"
                    value={globalAnalytics?.totalBookings ?? "—"}
                    highlight
                  />
                  <AnalyticsMetric
                    label="Confirmed"
                    value={globalAnalytics?.confirmedBookings ?? "—"}
                  />
                  <AnalyticsMetric
                    label="Pending"
                    value={globalAnalytics?.pendingBookings ?? "—"}
                  />
                  <AnalyticsMetric
                    label="Cancelled"
                    value={globalAnalytics?.cancelledBookings ?? "—"}
                  />
                </div>
                <div style={styles.analyticsFooter}>
                  <span style={styles.analyticsFootnote}>
                    Last updated {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div style={styles.analyticsCard}>
                <h4 style={styles.analyticsCardTitle}>Your farm performance</h4>
                <div style={styles.analyticsMetrics}>
                  <AnalyticsMetric
                    label="Your bookings"
                    value={farmerAnalytics?.totalBookings ?? "—"}
                    highlight
                  />
                  <AnalyticsMetric
                    label="Revenue"
                    value={formatCurrency(farmerAnalytics?.totalRevenue)}
                  />
                  <AnalyticsMetric
                    label="Confirmed revenue"
                    value={formatCurrency(farmerAnalytics?.confirmedRevenue)}
                  />
                  <AnalyticsMetric
                    label="Avg. confirmation time"
                    value={formatMinutes(farmerAnalytics?.averageConfirmationTimeMinutes)}
                  />
                </div>
                <div style={styles.analyticsFooter}>
                  <span style={styles.analyticsFootnote}>
                    Metrics include bookings where you were the owner or accepted owner.
                  </span>
                </div>
              </div>
            </div>

            {!farmerAnalytics && (
              <div style={styles.placeholderCard}>
                <p style={styles.placeholderText}>📈 Analytics will appear once booking data is available.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  // CSS Animations
  "@keyframes pulse": {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0.8 },
  },
  "@keyframes celebration": {
    "0%, 100%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.02)" },
  },
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f172a",
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
  },
  sidebar: {
    width: "280px",
    background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
    color: "#f9fafb",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
  },
  logo: {
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  profileCard: {
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  roleBadge: {
    background: "rgba(34, 197, 94, 0.15)",
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: 600,
    width: "fit-content",
    padding: "4px 10px",
    borderRadius: "999px",
    letterSpacing: "0.04em",
  },
  profileName: {
    fontSize: "20px",
    fontWeight: 700,
  },
  profileMeta: {
    fontSize: "14px",
    color: "#cbd5f5",
    lineHeight: 1.4,
  },
  navButton: {
    marginTop: "6px",
    background: "linear-gradient(90deg, #22d3ee, #06b6d4)",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  navList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navSectionLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
    marginTop: "14px",
    marginBottom: "6px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "12px",
    color: "#e2e8f0",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  },
  navItemActive: {
    background: "rgba(59, 130, 246, 0.22)",
    color: "#f8fafc",
  },
  logout: {
    marginTop: "16px",
    padding: "10px 12px",
    borderRadius: "12px",
    textAlign: "center",
    background: "rgba(239, 68, 68, 0.28)",
    color: "#fecaca",
    cursor: "pointer",
    border: "1px solid rgba(248, 113, 113, 0.35)",
  },
  mainArea: {
    flex: 1,
    background: "linear-gradient(180deg, #111827 0%, #0f172a 60%, #020617 100%)",
    padding: "32px 40px",
    overflowY: "auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  pageTitle: {
    fontSize: "28px",
    color: "#f8fafc",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#cbd5f5",
    marginTop: "6px",
  },
  searchGroup: {
    display: "flex",
    alignItems: "center",
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "999px",
    padding: "6px 10px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    color: "#f1f5f9",
    outline: "none",
    minWidth: "200px",
    fontSize: "14px",
  },
  searchBtn: {
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    border: "none",
    borderRadius: "999px",
    color: "#f8fafc",
    padding: "6px 12px",
    cursor: "pointer",
  },
  heroCard: {
    position: "relative",
    background: "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 60%), rgba(15, 23, 42, 0.9)",
    borderRadius: "28px",
    padding: "36px",
    marginBottom: "36px",
    overflow: "hidden",
    border: "1px solid rgba(148, 163, 184, 0.25)",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(59, 130, 246, 0.2)",
    color: "#93c5fd",
    borderRadius: "999px",
    padding: "6px 14px",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  heroTitle: {
    fontSize: "32px",
    color: "#f8fafc",
    marginTop: "18px",
  },
  heroSubtitle: {
    color: "#cbd5f5",
    marginTop: "12px",
    maxWidth: "520px",
    lineHeight: 1.6,
  },
  heroMeta: {
    marginTop: "24px",
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    alignItems: "center",
  },
  heroStat: {
    background: "rgba(15, 23, 42, 0.65)",
    borderRadius: "18px",
    padding: "14px 18px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    minWidth: "200px",
  },
  heroStatLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  heroStatValue: {
    display: "block",
    color: "#f8fafc",
    fontSize: "20px",
    marginTop: "4px",
    fontWeight: 600,
  },
  heroCta: {
    marginLeft: "auto",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "#052e16",
    border: "none",
    borderRadius: "12px",
    padding: "12px 20px",
    fontWeight: 600,
    cursor: "pointer",
  },
  heroImage: {
    position: "absolute",
    right: "-40px",
    bottom: "-60px",
    width: "360px",
    opacity: 0.9,
    transform: "rotate(-6deg)",
    borderRadius: "40px",
    boxShadow: "0 30px 50px rgba(15, 23, 42, 0.6)",
  },
  metricsSection: {
    background: "rgba(15, 23, 42, 0.85)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(71, 85, 105, 0.4)",
    marginBottom: "32px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  sectionTitle: {
    color: "#e2e8f0",
    margin: 0,
    fontSize: "20px",
  },
  sectionAction: {
    background: "rgba(37, 99, 235, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    color: "#bfdbfe",
    borderRadius: "12px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  sectionSubtext: {
    color: "#94a3b8",
    margin: 0,
    fontSize: "14px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
  },
  metricCard: {
    background: "rgba(15, 23, 42, 0.7)",
    borderRadius: "18px",
    padding: "18px",
    border: "1px solid rgba(148, 163, 184, 0.18)",
  },
  metricLabel: {
    color: "#cbd5f5",
    fontSize: "14px",
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: "28px",
    fontWeight: 700,
    marginTop: "6px",
  },
  metricNote: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "6px",
  },
  splitSection: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "24px",
    marginBottom: "32px",
  },
  splitColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  plannerCard: {
    background: "rgba(15, 23, 42, 0.82)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(71, 85, 105, 0.4)",
  },
  todoList: {
    listStyle: "none",
    padding: 0,
    margin: "18px 0 0",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  todoItem: {
    background: "rgba(17, 24, 39, 0.7)",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    color: "#f8fafc",
  },
  todoNote: {
    display: "block",
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "6px",
  },
  alertCard: {
    background:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.02) 100%)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(59, 130, 246, 0.35)",
    color: "#dbeafe",
  },
  alertLead: {
    fontSize: "16px",
    fontWeight: 600,
  },
  alertText: {
    marginTop: "12px",
    color: "#bfdbfe",
    lineHeight: 1.6,
  },
  secondaryButton: {
    marginTop: "18px",
    background: "transparent",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: "12px",
    color: "#e2e8f0",
    padding: "10px 18px",
    cursor: "pointer",
  },
  timelineCard: {
    background: "rgba(15, 23, 42, 0.82)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(71, 85, 105, 0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  timelineItem: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    background: "rgba(17, 24, 39, 0.72)",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#f1f5f9",
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    marginTop: "6px",
  },
  timelineMeta: {
    marginTop: "4px",
    color: "#94a3b8",
    fontSize: "13px",
  },
  equipmentSection: {
    background: "rgba(15, 23, 42, 0.85)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(71, 85, 105, 0.4)",
    marginBottom: "32px",
  },
  equipmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "22px",
  },
  equipmentCard: {
    background: "rgba(17, 24, 39, 0.82)",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  equipmentImageWrapper: {
    background: "rgba(30, 64, 175, 0.24)",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    justifyContent: "center",
  },
  equipmentImage: {
    width: "72px",
    height: "72px",
    objectFit: "contain",
  },
  equipmentName: {
    fontSize: "18px",
    margin: 0,
    fontWeight: 600,
  },
  equipmentDesc: {
    margin: 0,
    color: "#cbd5f5",
    fontSize: "14px",
  },
  equipmentMeta: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  equipmentPrice: {
    fontWeight: 700,
    color: "#f97316",
  },
  equipmentButton: {
    background: "linear-gradient(90deg, #fb923c, #f97316)",
    border: "none",
    borderRadius: "10px",
    color: "#111827",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  tipsSection: {
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(71, 85, 105, 0.35)",
    marginBottom: "48px",
  },
  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
  },
  tipCard: {
    background: "rgba(17, 24, 39, 0.78)",
    borderRadius: "18px",
    padding: "18px",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  tipIcon: {
    fontSize: "26px",
  },
  tipTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
  },
  tipDescription: {
    margin: 0,
    color: "#cbd5f5",
    lineHeight: 1.5,
  },
  tabSection: {
    background: "rgba(15, 23, 42, 0.82)",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid rgba(71, 85, 105, 0.35)",
  },
  equipmentManager: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)",
    gap: "24px",
    alignItems: "flex-start",
  },
  formCard: {
    background: "rgba(17, 24, 39, 0.85)",
    borderRadius: "20px",
    padding: "22px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    color: "#e2e8f0",
  },
  formTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
  },
  formGrid: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "13px",
  },
  primaryButton: {
    marginTop: "18px",
    width: "100%",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    border: "none",
    borderRadius: "12px",
    color: "#052e16",
    padding: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  inventoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inventoryItem: {
    background: "rgba(17, 24, 39, 0.82)",
    borderRadius: "18px",
    padding: "18px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  inventoryThumb: {
    width: "68px",
    height: "68px",
    borderRadius: "16px",
    background: "rgba(37, 99, 235, 0.12)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  inventoryImage: {
    width: "46px",
    height: "46px",
    objectFit: "contain",
  },
  inventoryContent: {
    flex: 1,
    color: "#e2e8f0",
  },
  inventoryTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
  },
  inventoryDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#cbd5f5",
  },
  inventoryMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  inventoryPrice: {
    fontWeight: 700,
    color: "#22d3ee",
  },
  placeholderCard: {
    marginTop: "20px",
    background: "rgba(17, 24, 39, 0.82)",
    borderRadius: "24px",
    padding: "36px",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    textAlign: "center",
  },
  placeholderText: {
    color: "#e2e8f0",
    fontSize: "18px",
    marginBottom: "12px",
  },
  placeholderSubtext: {
    color: "#94a3b8",
    fontSize: "14px",
    maxWidth: "520px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
  // Booking Requests Styles - Ola/Uber Style
  bookingRequestsSection: {
    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))",
    borderRadius: "24px",
    padding: "24px",
    border: "2px solid rgba(239, 68, 68, 0.2)",
    marginBottom: "24px",
    animation: "pulse 2s infinite",
  },
  bookingRequestsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "16px",
  },
  bookingRequestCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    border: "2px solid #ef4444",
    boxShadow: "0 8px 25px rgba(239, 68, 68, 0.15)",
    transition: "all 0.3s ease",
  },
  bookingRequestHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  bookingRequestBadge: {
    background: "linear-gradient(90deg, #ef4444, #dc2626)",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  bookingRequestTime: {
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "500",
  },
  bookingRequestContent: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
  },
  bookingRequestMain: {
    flex: 1,
  },
  bookingRequestTitle: {
    margin: "0 0 12px 0",
    color: "#1f2937",
    fontSize: "18px",
    fontWeight: "bold",
  },
  bookingRequestDetails: {
    display: "grid",
    gap: "6px",
    fontSize: "14px",
    color: "#374151",
    lineHeight: 1.5,
  },
  bookingRequestActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  acceptBookingBtn: {
    background: "linear-gradient(90deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    minWidth: "140px",
  },
  bookingRequestNote: {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "center",
    maxWidth: "120px",
    lineHeight: 1.3,
  },
  // Confirmed Bookings Styles (Renter View)
  confirmedBookingsSection: {
    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))",
    borderRadius: "24px",
    padding: "24px",
    border: "2px solid rgba(34, 197, 94, 0.2)",
    marginBottom: "24px",
    animation: "celebration 3s ease-in-out infinite",
  },
  confirmedBookingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "20px",
  },
  confirmedBookingCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    border: "2px solid #22c55e",
    boxShadow: "0 10px 30px rgba(34, 197, 94, 0.2)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  celebrationBadge: {
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: "25px",
    fontSize: "13px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
  },
  ownerDetailsSection: {
    background: "rgba(34, 197, 94, 0.05)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid rgba(34, 197, 94, 0.2)",
  },
  ownerHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  ownerAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "24px",
    fontWeight: "bold",
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    margin: "0 0 4px 0",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  ownerContact: {
    margin: "0",
    fontSize: "14px",
    color: "#6b7280",
  },
  contactButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
  contactBtn: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  callBtn: {
    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  messageBtn: {
    background: "linear-gradient(90deg, #10b981, #059669)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  arrivalTimeSection: {
    background: "rgba(59, 130, 246, 0.05)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  arrivalTimeTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1f2937",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  arrivalTimeText: {
    margin: "0",
    fontSize: "14px",
    color: "#374151",
    lineHeight: 1.5,
  },
  // Accepted Bookings Styles (Owner View)
  acceptedBookingsSection: {
    background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.05))",
    borderRadius: "24px",
    padding: "24px",
    border: "2px solid rgba(249, 115, 22, 0.2)",
    marginBottom: "24px",
  },
  acceptedBookingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
    gap: "20px",
  },
  acceptedBookingCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    border: "2px solid #f97316",
    boxShadow: "0 10px 30px rgba(249, 115, 22, 0.2)",
    transition: "all 0.3s ease",
  },
  deliveringBadge: {
    background: "linear-gradient(90deg, #f97316, #ea580c)",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: "25px",
    fontSize: "13px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
  },
  renterDetailsSection: {
    background: "rgba(249, 115, 22, 0.05)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid rgba(249, 115, 22, 0.2)",
  },
  renterHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },
  renterAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "24px",
    fontWeight: "bold",
  },
  renterInfo: {
    flex: 1,
  },
  renterName: {
    margin: "0 0 4px 0",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  renterContact: {
    margin: "0",
    fontSize: "14px",
    color: "#6b7280",
  },
  timeEstimationSection: {
    background: "rgba(168, 85, 247, 0.05)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid rgba(168, 85, 247, 0.2)",
  },
  timeEstimationTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1f2937",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  timeEstimationForm: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  timeInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "2px solid rgba(168, 85, 247, 0.2)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  sendTimeBtn: {
    background: "linear-gradient(90deg, #a855f7, #9333ea)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
  },
  googleMapsSection: {
    marginTop: "20px",
    borderRadius: "16px",
    overflow: "hidden",
    border: "2px solid rgba(59, 130, 246, 0.2)",
    background: "rgba(59, 130, 246, 0.05)",
  },
  googleMapsHeader: {
    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
    color: "#fff",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  googleMapsTitle: {
    margin: "0",
    fontSize: "14px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  openMapsBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  googleMapsFrame: {
    width: "100%",
    height: "200px",
    border: "none",
    display: "block",
  },
  deleteButton: {
    background: "linear-gradient(90deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
  },
  // Confirmed Booking Styles for Renters
  confirmedBookingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  confirmedBookingBadge: {
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: "25px",
    fontSize: "13px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  bookingStatusInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "rgba(34, 197, 94, 0.1)",
    borderRadius: "12px",
    marginBottom: "12px",
    color: "#16a34a",
    fontWeight: "500",
  },
  statusIcon: {
    fontSize: "18px",
  },
  contactOwnerBtn: {
    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    minWidth: "140px",
  },
  // No Bookings Message Styles
  noBookingsMessage: {
    textAlign: "center",
    padding: "40px 20px",
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "16px",
    border: "2px dashed rgba(148, 163, 184, 0.3)",
    color: "#cbd5e1",
  },
  noBookingsIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.7,
  },
  noBookingsTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  noBookingsText: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.6,
    marginBottom: "24px",
    maxWidth: "400px",
    margin: "0 auto 24px auto",
  },
  noBookingsActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  addEquipmentBtn: {
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
  },
  refreshBtn: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#93c5fd",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  // Map Styles
  mapContainer: {
    marginTop: "16px",
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
  },
  mapTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  mapDirectionsCard: {
    background: "rgba(59, 130, 246, 0.05)",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  googleMapsBtn: {
    width: "100%",
    background: "linear-gradient(90deg, #4285f4, #34a853)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "14px 20px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(66, 133, 244, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  routeInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "12px",
    background: "rgba(59, 130, 246, 0.1)",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  routePoint: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  routeIcon: {
    fontSize: "16px",
  },
  routeLabel: {
    fontSize: "13px",
    color: "#cbd5e1",
    fontWeight: "500",
  },
  routeArrow: {
    fontSize: "18px",
    color: "#3b82f6",
    fontWeight: "bold",
  },
  mapPlaceholder: {
    background: "rgba(249, 115, 22, 0.1)",
    border: "2px dashed rgba(249, 115, 22, 0.3)",
    borderRadius: "12px",
    padding: "24px",
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  mapPlaceholderIcon: {
    fontSize: "48px",
    opacity: 0.5,
  },
  mapPlaceholderText: {
    flex: 1,
    color: "#cbd5e1",
  },
};