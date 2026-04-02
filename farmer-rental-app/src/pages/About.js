import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

function About() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo} onClick={() => navigate("/")} style={{...styles.logo, cursor: "pointer"}}>
          {t("app.name")}
        </h2>
        <ul style={styles.navLinks}>
          <li onClick={() => navigate("/")}>{t("nav.home")}</li>
          <li onClick={() => navigate("/about")} style={{fontWeight: "bold"}}>{t("nav.about")}</li>
          <li onClick={() => navigate("/tools")}>{t("nav.tools")}</li>
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
          <h1 style={styles.heroTitle}>About FarmTech</h1>
          <p style={styles.heroText}>Revolutionizing farm equipment accessibility through community-driven rental solutions</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={styles.section}>
        <h2>Our Mission & Vision</h2>
        <div style={styles.contentGrid}>
          <div style={styles.contentCard}>
            <h3>🎯 Our Mission</h3>
            <p>
              To empower farmers by making quality farm equipment affordable and accessible through a sustainable, community-driven marketplace that connects equipment owners with farmers who need them.
            </p>
          </div>
          <div style={styles.contentCard}>
            <h3>🌟 Our Vision</h3>
            <p>
              A future where every farmer has access to the tools they need to succeed, regardless of their financial constraints. We envision a connected agricultural community where equipment is shared efficiently and sustainably.
            </p>
          </div>
        </div>
      </section>

      {/* Why We Started */}
      <section style={{...styles.section, background: "#f3f9f5"}}>
        <h2>Why We Started FarmTech</h2>
        <div style={styles.paragraph}>
          <p>
            Farm equipment is essential for modern agriculture, but it comes with tremendous costs. Most farmers use equipment for only a few months per year, leaving expensive machinery idle for the rest of the time. This inefficiency impacts farm profitability and sustainability.
          </p>
          <p>
            FarmTech was born from a simple idea: what if farmers could share equipment with their neighbors? By creating a platform that connects equipment owners with farmers who need specific tools, we're addressing a critical gap in the agricultural market.
          </p>
          <p>
            Our platform enables equipment owners to generate income from assets that would otherwise sit unused, while helping farmers reduce operational costs by up to 70% and access quality equipment on-demand.
          </p>
        </div>
      </section>

      {/* Our Values */}
      <section style={styles.section}>
        <h2>Our Core Values</h2>
        <div style={styles.valueGrid}>
          <div style={styles.valueCard}>
            <h3>💚 Sustainability</h3>
            <p>We promote efficient resource sharing to reduce waste and environmental impact in agriculture.</p>
          </div>
          <div style={styles.valueCard}>
            <h3>🤝 Community</h3>
            <p>We believe in building strong connections between farmers and equipment owners in local communities.</p>
          </div>
          <div style={styles.valueCard}>
            <h3>💡 Innovation</h3>
            <p>We leverage technology to solve real agricultural challenges and improve farmers' livelihoods.</p>
          </div>
          <div style={styles.valueCard}>
            <h3>🎯 Accessibility</h3>
            <p>We are committed to making quality farm equipment accessible to all farmers, regardless of their economic status.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{...styles.section, background: "#f3f9f5"}}>
        <h2>Who We Are</h2>
        <p style={{textAlign: "center", marginBottom: "40px"}}>
          FarmTech is built by agricultural professionals, software engineers, and farming enthusiasts who understand the challenges faced by farmers and equipment owners.
        </p>
        <p style={{textAlign: "center", fontSize: "1rem", lineHeight: "1.8", maxWidth: "800px", margin: "0 auto"}}>
          Our diverse team brings together expertise in agriculture, technology, and community development. We're passionate about creating solutions that make a real difference in the farming industry and support sustainable agricultural practices.
        </p>
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
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginTop: "40px",
  },
  contentCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    lineHeight: "1.8",
  },
  paragraph: {
    marginTop: "30px",
    lineHeight: "1.8",
  },
  valueGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  valueCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    lineHeight: "1.6",
  },

  footer: {
    background: "#388e3c",
    color: "#fff",
    textAlign: "center",
    padding: "20px",
    marginTop: "20px",
    width: "100%",
  },
};

export default About;
