import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function RoleSelection() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Store selected role temporarily for login page
    localStorage.setItem("selectedRole", role);
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🌿 FarmRental Platform</h1>
          <LanguageSwitcher inline />
        </div>
        
        <div style={styles.content}>
          <h2 style={styles.subtitle}>Select Your Role to Continue</h2>
          <p style={styles.description}>
            Choose your role to access the appropriate dashboard and features
          </p>
          
          <div style={styles.roleGrid}>
            {/* Admin Role */}
            <div 
              style={styles.roleCard}
              onClick={() => handleRoleSelect("ADMIN")}
            >
              <div style={styles.roleIcon}>🔧</div>
              <h3 style={styles.roleTitle}>Administrator</h3>
              <p style={styles.roleDescription}>
                Complete system control - manage users, equipment, and all platform operations
              </p>
              <ul style={styles.roleFeatures}>
                <li>✅ Manage all users</li>
                <li>✅ Add/Edit/Delete equipment</li>
                <li>✅ View all bookings</li>
                <li>✅ System analytics</li>
              </ul>
              <button style={styles.selectButton}>
                Login as Admin
              </button>
            </div>

            {/* Owner Role */}
            <div 
              style={styles.roleCard}
              onClick={() => handleRoleSelect("OWNER")}
            >
              <div style={styles.roleIcon}>🚜</div>
              <h3 style={styles.roleTitle}>Equipment Owner</h3>
              <p style={styles.roleDescription}>
                Accept booking requests and manage your equipment rentals
              </p>
              <ul style={styles.roleFeatures}>
                <li>✅ Accept/Reject bookings</li>
                <li>✅ Manage rental schedules</li>
                <li>✅ Track earnings</li>
                <li>❌ Cannot add equipment</li>
              </ul>
              <button style={styles.selectButton}>
                Login as Owner
              </button>
            </div>

            {/* Renter Role */}
            <div 
              style={styles.roleCard}
              onClick={() => handleRoleSelect("RENTER")}
            >
              <div style={styles.roleIcon}>🌾</div>
              <h3 style={styles.roleTitle}>Equipment Renter</h3>
              <p style={styles.roleDescription}>
                Browse and book equipment for your farming needs
              </p>
              <ul style={styles.roleFeatures}>
                <li>✅ Browse equipment</li>
                <li>✅ Make bookings</li>
                <li>✅ Track rental history</li>
                <li>✅ ML farming insights</li>
              </ul>
              <button style={styles.selectButton}>
                Login as Renter
              </button>
            </div>
          </div>
          
          <div style={styles.footer}>
            <p style={styles.footerText}>
              <span 
                style={styles.backLink}
                onClick={() => navigate("/")}
              >
                ← Back to Home
              </span>
              {" | "}
              Don't have an account? 
              <span 
                style={styles.registerLink}
                onClick={() => navigate("/register")}
              >
                Register here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  container: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
    maxWidth: "1200px",
    width: "100%",
  },
  header: {
    background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
    color: "white",
    padding: "30px",
    textAlign: "center",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "bold",
  },
  content: {
    padding: "40px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "28px",
    color: "#333",
    marginBottom: "10px",
  },
  description: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "40px",
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginBottom: "40px",
  },
  roleCard: {
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    padding: "30px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#fafafa",
    ":hover": {
      borderColor: "#4CAF50",
      transform: "translateY(-5px)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    },
  },
  roleIcon: {
    fontSize: "48px",
    marginBottom: "20px",
  },
  roleTitle: {
    fontSize: "24px",
    color: "#333",
    marginBottom: "15px",
  },
  roleDescription: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  roleFeatures: {
    listStyle: "none",
    padding: 0,
    margin: "20px 0",
    textAlign: "left",
  },
  selectButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    transition: "background-color 0.3s ease",
  },
  footer: {
    borderTop: "1px solid #e0e0e0",
    paddingTop: "20px",
  },
  footerText: {
    color: "#666",
    fontSize: "14px",
  },
  registerLink: {
    color: "#4CAF50",
    cursor: "pointer",
    fontWeight: "bold",
    marginLeft: "5px",
  },
  backLink: {
    color: "#666",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "5px",
  },
};