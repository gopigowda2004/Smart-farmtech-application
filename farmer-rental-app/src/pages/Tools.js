import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Tools() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const tools = [
    {
      icon: "🚜",
      title: "Equipment Rental Marketplace",
      description: "Browse and rent a wide variety of farm equipment from tractors to harvesters with flexible rental periods.",
      link: "/rent-equipment"
    },
    {
      icon: "📋",
      title: "Booking Management",
      description: "Manage your equipment bookings, track rental status, and communicate with equipment owners in one place.",
      link: "/my-bookings"
    },
    {
      icon: "🌾",
      title: "Crop Recommendation",
      description: "Get AI-powered crop recommendations based on your soil, climate, and location for optimal yield.",
      link: "/ml/crop-recommendation"
    },
    {
      icon: "💧",
      title: "Fertilizer Prediction",
      description: "Smart fertilizer recommendations tailored to your crop type and soil conditions.",
      link: "/ml/fertilizer-prediction"
    },
    {
      icon: "📊",
      title: "Crop Yield Estimation",
      description: "Predict your crop yield with advanced analytics and historical data insights.",
      link: "/ml/crop-yield-estimation"
    },
    {
      icon: "🔬",
      title: "Soil Analysis",
      description: "Comprehensive soil analysis to understand soil health and nutrient composition.",
      link: "/ml/soil-analysis"
    },
    {
      icon: "🦠",
      title: "Plant Disease Detection",
      description: "Identify plant diseases early using AI image recognition for quick intervention.",
      link: "/ml/plant-disease"
    },
    {
      icon: "👤",
      title: "Equipment Management",
      description: "List and manage your equipment, track bookings, and earn income from your assets.",
      link: "/manage-my-equipment"
    }
  ];

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={{...styles.logo, cursor: "pointer"}} onClick={() => navigate("/")}>
          {t("app.name")}
        </h2>
        <ul style={styles.navLinks}>
          <li onClick={() => navigate("/")}>{t("nav.home")}</li>
          <li onClick={() => navigate("/about")}>{t("nav.about")}</li>
          <li onClick={() => navigate("/tools")} style={{fontWeight: "bold"}}>{t("nav.tools")}</li>
          <li onClick={() => navigate("/resources")}>{t("nav.resources")}</li>
          <li onClick={() => navigate("/community")}>{t("nav.community")}</li>
          <li onClick={() => navigate("/contact")}>{t("nav.contact")}</li>
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSwitcher inline />
          <div style={styles.navButtons}>
            <button style={styles.adminBtn} onClick={() => navigate("/login")}>
              Admin
            </button>
            <button style={styles.loginBtn} onClick={() => navigate("/role-selection")}>
              {t("btn.login")}
            </button>
            <button style={styles.signUpBtn} onClick={() => navigate("/register")}>
              {t("btn.signup")}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>FarmTech Tools & Features</h1>
          <p style={styles.heroText}>Explore our comprehensive suite of tools designed to enhance your farming experience</p>
        </div>
      </section>

      {/* Tools Grid */}
      <section style={styles.section}>
        <h2>Available Tools</h2>
        <div style={styles.toolsGrid}>
          {tools.map((tool, index) => (
            <div 
              key={index} 
              style={styles.toolCard}
              onClick={() => navigate(tool.link)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"}
            >
              <div style={styles.toolIcon}>{tool.icon}</div>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              <button style={styles.exploreBtn}>Explore →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Overview */}
      <section style={{...styles.section, background: "#f3f9f5"}}>
        <h2>Why Use FarmTech Tools?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <h3>⚡ Efficiency</h3>
            <p>Save time and effort with automated tools and real-time data.</p>
          </div>
          <div style={styles.featureItem}>
            <h3>📈 Better Yields</h3>
            <p>Make informed decisions with AI-powered recommendations.</p>
          </div>
          <div style={styles.featureItem}>
            <h3>💰 Cost Savings</h3>
            <p>Reduce expenses through smart equipment rental and resource management.</p>
          </div>
          <div style={styles.featureItem}>
            <h3>🎯 Precision Farming</h3>
            <p>Leverage advanced analytics for precise agricultural practices.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of farmers already using FarmTech to optimize their operations</p>
          <button style={styles.ctaBtn} onClick={() => navigate("/register")}>
            Sign Up Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 FarmTech. {t("sections.footerRights")}</p>
        <p>Contact: info@farmtech.com</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Open Sans, Roboto, Arial, sans-serif",
    background: "#f8fafc",
    margin: 0,
    padding: 0,
    overflowX: "hidden",
    width: "100vw",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    background: "#388e3c",
    color: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: { fontSize: "1.8rem", fontWeight: "bold" },
  navLinks: {
    listStyle: "none",
    display: "flex",
    gap: "30px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  navButtons: {
    display: "flex",
    gap: "15px",
  },
  adminBtn: {
    background: "#fdd835",
    color: "#333",
    border: "none",
    padding: "10px 20px",
    borderRadius: "30px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  loginBtn: {
    background: "transparent",
    color: "#fff",
    border: "2px solid #fff",
    padding: "10px 20px",
    borderRadius: "30px",
    fontWeight: "600",
    cursor: "pointer",
  },
  signUpBtn: {
    background: "#fff",
    color: "#333",
    padding: "10px 22px",
    border: "none",
    borderRadius: "30px",
    fontWeight: "600",
    cursor: "pointer",
  },

  hero: {
    background:
      "url(https://images.yourstory.com/cs/5/f02aced0d86311e98e0865c1f0fe59a2/indian-farmer-1610471656527.png?mode=crop&crop=faces&ar=2%3A1&format=auto&w=1920&q=75) center/cover no-repeat",
    color: "#fff",
    textAlign: "left",
    padding: "100px 60px",
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
  },
  heroOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: "40px",
    borderRadius: "12px",
    maxWidth: "700px",
  },
  heroTitle: { fontSize: "3.5rem", fontWeight: "800", marginBottom: "20px" },
  heroText: {
    fontSize: "1.2rem",
    marginBottom: "20px",
    lineHeight: "1.6",
  },

  section: {
    padding: "80px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  toolsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  toolCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  toolIcon: {
    fontSize: "3rem",
    marginBottom: "15px",
  },
  exploreBtn: {
    background: "#388e3c",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "25px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  featureItem: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
  },

  ctaSection: {
    background: "#388e3c",
    color: "#fff",
    padding: "80px 60px",
    textAlign: "center",
  },
  ctaContent: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  ctaBtn: {
    background: "#fdd835",
    color: "#333",
    border: "none",
    padding: "14px 28px",
    fontWeight: "700",
    borderRadius: "30px",
    cursor: "pointer",
    marginTop: "20px",
  },

  footer: {
    background: "#2e7d32",
    color: "#fff",
    textAlign: "center",
    padding: "20px",
    marginTop: "20px",
    width: "100%",
  },
};

export default Tools;
