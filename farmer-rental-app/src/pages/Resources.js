import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Resources() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const resources = [
    {
      category: "Getting Started",
      items: [
        "How to Register on FarmTech",
        "Setting Up Your Profile",
        "Understanding Equipment Categories",
        "First Time Rental Guide"
      ]
    },
    {
      category: "Equipment Rental",
      items: [
        "Browse Available Equipment",
        "How to Book Equipment",
        "Rental Payment Options",
        "Cancellation and Refund Policy",
        "Equipment Care Guidelines"
      ]
    },
    {
      category: "For Equipment Owners",
      items: [
        "List Your Equipment",
        "Pricing Guidelines",
        "Managing Bookings",
        "Equipment Maintenance",
        "Earning on FarmTech"
      ]
    },
    
    {
      category: "Technical Support",
      items: [
        "Troubleshooting Guide",
        "Payment Issues",
        "Booking Cancellations",
        "Account Recovery",
        "FAQ"
      ]
    },
    {
      category: "Community Guidelines",
      items: [
        "Code of Conduct",
        "Safety Protocols",
        "Dispute Resolution",
        "Feedback and Reviews",
        "Reporting Issues"
      ]
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
          <li onClick={() => navigate("/tools")}>{t("nav.tools")}</li>
          <li onClick={() => navigate("/resources")} style={{fontWeight: "bold"}}>{t("nav.resources")}</li>
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
          <h1 style={styles.heroTitle}>Resources & Learning Center</h1>
          <p style={styles.heroText}>Comprehensive guides and resources to help you succeed with FarmTech</p>
        </div>
      </section>

      {/* Resources Grid */}
      <section style={styles.section}>
        <h2>Knowledge Base</h2>
        <div style={styles.resourcesGrid}>
          {resources.map((resource, idx) => (
            <div key={idx} style={styles.resourceCard}>
              <h3 style={styles.categoryTitle}>{resource.category}</h3>
              <ul style={styles.itemList}>
                {resource.items.map((item, itemIdx) => (
                  <li key={itemIdx} style={styles.listItem}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Video Tutorials */}
      <section style={{...styles.section, background: "#f3f9f5"}}>
        <h2>Video Tutorials</h2>
        <p style={{textAlign: "center", marginBottom: "40px"}}>
          Watch step-by-step video guides to master FarmTech features
        </p>
        <div style={styles.videosGrid}>
          <div style={styles.videoCard}>
            <div style={styles.videoPlaceholder}>📹 Registration Tutorial</div>
            <p>Learn how to register and set up your account</p>
          </div>
          <div style={styles.videoCard}>
            <div style={styles.videoPlaceholder}>📹 How to Rent Equipment</div>
            <p>Complete guide to booking equipment on FarmTech</p>
          </div>
          <div style={styles.videoCard}>
            <div style={styles.videoPlaceholder}>📹 Equipment Listing</div>
            <p>How to list and manage your equipment</p>
          </div>
          <div style={styles.videoCard}>
            <div style={styles.videoPlaceholder}>📹 Payment & Checkout</div>
            <p>Understanding payment options and security</p>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section style={styles.section}>
        <h2>Documentation</h2>
        <div style={styles.docGrid}>
          <div style={styles.docCard}>
            <h3>📖 User Manual</h3>
            <p>Complete user guide covering all features and functions of FarmTech platform.</p>
            
          </div>
          <div style={styles.docCard}>
            <h3>🛡️ Safety Guide</h3>
            <p>Essential safety protocols and best practices for equipment handling and operation.</p>
            
          </div>
          <div style={styles.docCard}>
            <h3>💼 Business Guide</h3>
            <p>For equipment owners: tips on maximizing earnings and managing rentals efficiently.</p>
            
          </div>
          <div style={styles.docCard}>
            <h3>🌱 Agriculture Tips</h3>
            <p>Practical agricultural advice and sustainable farming techniques from experts.</p>
            
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section style={{...styles.section, background: "#f3f9f5", textAlign: "center"}}>
        <h2>Need More Help?</h2>
        <p style={{marginBottom: "30px", fontSize: "1.1rem"}}>
          Can't find what you're looking for? Our support team is here to help!
        </p>
        <button style={styles.supportBtn} onClick={() => navigate("/contact")}>
          Contact Support
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 FarmTech. {t("sections.footerRights")}</p>
        <p>Contact: farmertech34.com</p>
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
  resourcesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  resourceCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  categoryTitle: {
    color: "#388e3c",
    marginBottom: "15px",
  },
  itemList: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "color 0.3s",
  },

  videosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  videoCard: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  videoPlaceholder: {
    background: "#e0e0e0",
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
  },

  docGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  docCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  docBtn: {
    background: "#388e3c",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "25px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
  },

  supportBtn: {
    background: "#388e3c",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    fontWeight: "700",
    borderRadius: "30px",
    cursor: "pointer",
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

export default Resources;
