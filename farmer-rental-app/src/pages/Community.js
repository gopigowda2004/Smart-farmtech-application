import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Community() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const communityFeatures = [
    {
      icon: "💬",
      title: "Discussion Forums",
      description: "Join conversations with other farmers, share experiences, and get advice from the community."
    },
    {
      icon: "📸",
      title: "Success Stories",
      description: "Read inspiring stories of farmers who have transformed their operations with FarmTech."
    },
    {
      icon: "🏆",
      title: "Leaderboards",
      description: "Celebrate top contributors and recognize community members making a difference."
    },
    {
      icon: "📢",
      title: "Local Groups",
      description: "Connect with farmers in your region, organize meetups, and build local networks."
    },
    {
      icon: "🎓",
      title: "Workshops & Events",
      description: "Attend free online workshops and participate in community events."
    },
    {
      icon: "🤝",
      title: "Mentorship Program",
      description: "Get guidance from experienced farmers and agricultural experts."
    }
  ];

  const communityStats = [
    { number: "50K+", label: "Active Farmers" },
    { number: "10K+", label: "Equipment Listed" },
    { number: "25K+", label: "Successful Rentals" },
    { number: "100+", label: "Local Communities" }
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
          <li onClick={() => navigate("/resources")}>{t("nav.resources")}</li>
          <li onClick={() => navigate("/community")} style={{fontWeight: "bold"}}>{t("nav.community")}</li>
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
          <h1 style={styles.heroTitle}>Join Our Farming Community</h1>
          <p style={styles.heroText}>Connect, collaborate, and grow together with farmers across the nation</p>
        </div>
      </section>

      {/* Community Stats */}
      <section style={styles.statsSection}>
        <h2>Community Impact</h2>
        <div style={styles.statsGrid}>
          {communityStats.map((stat, idx) => (
            <div key={idx} style={styles.statCard}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Features */}
      <section style={styles.featuresSection}>
        <h2>Community Features</h2>
        <div style={styles.featuresGrid}>
          {communityFeatures.map((feature, idx) => (
            <div key={idx} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Stories */}
      <section style={{...styles.section, background: "#f3f9f5"}}>
        <h2>Success Stories</h2>
        <div style={styles.storiesGrid}>
          <div style={styles.storyCard}>
            <div style={styles.storyHeader}>
              <div style={styles.avatar}>👨‍🌾</div>
              <div>
                <h3>Ramesh Kumar</h3>
                <p style={{fontSize: "0.9rem", color: "#666"}}>Karnataka</p>
              </div>
            </div>
            <p style={{lineHeight: "1.6", marginTop: "15px"}}>
              "Using FarmTech, I was able to save 60% on equipment costs. Now I can afford high-quality tools for my farm without the burden of ownership."
            </p>
          </div>
          <div style={styles.storyCard}>
            <div style={styles.storyHeader}>
              <div style={styles.avatar}>👩‍🌾</div>
              <div>
                <h3>Priya Singh</h3>
                <p style={{fontSize: "0.9rem", color: "#666"}}>Punjab</p>
              </div>
            </div>
            <p style={{lineHeight: "1.6", marginTop: "15px"}}>
              "I started renting out my tractor through FarmTech. It's now my additional income source and helps neighboring farmers at the same time!"
            </p>
          </div>
          <div style={styles.storyCard}>
            <div style={styles.storyHeader}>
              <div style={styles.avatar}>👨‍🌾</div>
              <div>
                <h3>Gopi Gowda</h3>
                <p style={{fontSize: "0.9rem", color: "#666"}}>Tamil Nadu</p>
              </div>
            </div>
            <p style={{lineHeight: "1.6", marginTop: "15px"}}>
              "The FarmTech community has been incredibly supportive. I've learned new farming techniques and made great connections with farmers in my region."
            </p>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section style={styles.section}>
        <h2>Get Involved</h2>
        <div style={styles.involvedGrid}>
          <div style={styles.involvedCard}>
            <h3>🔗 Join Our Network</h3>
            <p>Become part of thousands of farmers making a difference. Share your knowledge and learn from others.</p>
            <button style={styles.involvedBtn} onClick={() => navigate("/register")}>
              Join Now
            </button>
          </div>
          <div style={styles.involvedCard}>
            <h3>💡 Share Your Story</h3>
            <p>Tell us about your farming journey and how FarmTech has helped you. Inspire other farmers!</p>
            <button style={styles.involvedBtn} onClick={() => navigate("/contact")}>
              Share Story
            </button>
          </div>
          <div style={styles.involvedCard}>
            <h3>🎤 Become an Ambassador</h3>
            <p>Help spread the word about FarmTech in your community and become a community leader.</p>
            <button style={styles.involvedBtn} onClick={() => navigate("/contact")}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section style={{...styles.section, background: "#f3f9f5"}}>
        <h2>Upcoming Events</h2>
        <div style={styles.eventsGrid}>
          <div style={styles.eventCard}>
            <div style={styles.eventDate}>Dec 15</div>
            <h3>Farm Mechanization Workshop</h3>
            <p>Learn about the latest farm machinery and best practices for equipment operation.</p>
            <button style={styles.eventBtn}>Register</button>
          </div>
          <div style={styles.eventCard}>
            <div style={styles.eventDate}>Dec 22</div>
            <h3>Community Farmers Meetup</h3>
            <p>Network with farmers in your region and share experiences over refreshments.</p>
            <button style={styles.eventBtn}>Register</button>
          </div>
          <div style={styles.eventCard}>
            <div style={styles.eventDate}>Jan 10</div>
            <h3>Sustainable Farming Webinar</h3>
            <p>Expert discussion on eco-friendly farming techniques and crop sustainability.</p>
            <button style={styles.eventBtn}>Register</button>
          </div>
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

  statsSection: {
    padding: "60px",
    background: "#388e3c",
    color: "#fff",
    textAlign: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "30px",
    marginTop: "40px",
  },
  statCard: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "3rem",
    fontWeight: "800",
    marginBottom: "10px",
  },
  statLabel: {
    fontSize: "1.1rem",
  },

  featuresSection: {
    padding: "80px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  featureCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  featureIcon: {
    fontSize: "2.5rem",
    marginBottom: "15px",
  },

  section: {
    padding: "80px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  storiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  storyCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  storyHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  avatar: {
    fontSize: "2.5rem",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f0f0",
  },

  involvedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  involvedCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  involvedBtn: {
    background: "#388e3c",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "25px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
  },

  eventsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  eventCard: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    paddingLeft: "30px",
  },
  eventDate: {
    background: "#fdd835",
    color: "#333",
    padding: "15px",
    fontWeight: "bold",
    textAlign: "center",
  },
  eventBtn: {
    background: "#388e3c",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "25px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
    marginBottom: "15px",
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

export default Community;
