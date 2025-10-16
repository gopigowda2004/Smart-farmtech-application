import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

function HomePage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>{t("app.name")}</h2>
        <ul style={styles.navLinks}>
          <li>{t("nav.home")}</li>
          <li>{t("nav.about")}</li>
          <li>{t("nav.tools")}</li>
          <li>{t("nav.resources")}</li>
          <li>{t("nav.community")}</li>
          <li>{t("nav.contact")}</li>
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSwitcher inline />
          <div style={styles.navButtons}>
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
          <h1 style={styles.heroTitle}>{t("hero.title")}</h1>
          <p style={styles.heroText}>{t("hero.text")}</p>
          <div>
            <button style={styles.ctaBtn} onClick={() => navigate("/register")}>
              {t("btn.joinNow")}
            </button>
            <button
              style={styles.ctaBtnOutline}
              onClick={() => navigate("/about")}
            >
              {t("btn.learnMore")}
            </button>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section style={styles.partners}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/58/Logitech_logo.svg"
          alt="logitech"
          style={styles.logoImg}
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
          alt="amazon"
          style={styles.logoImg}
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Google-logo.png"
          alt="google"
          style={styles.logoImg}
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/99/Salesforce_logo.svg"
          alt="salesforce"
          style={styles.logoImg}
        />
      </section>

      {/* Our Story */}
      <section style={styles.story}>
        <h2>{t("sections.ourStoryTitle")}</h2>
        <p>
          Agriculture is the backbone of our world, providing essential
          resources and sustaining communities. At <b>AgriTech</b>, we are
          passionate about supporting farmers by offering innovative tools,
          comprehensive resources, and a vibrant community. Our mission is to
          empower agriculture through knowledge, technology, and collaboration.
        </p>
      </section>

      {/* Why Choose Us */}
      <section style={styles.why}>
        <h2>{t("sections.whyTitle")}</h2>
        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>🌦 Weather Forecast Tool</h3>
            <p>
              Stay updated with accurate weather reports to plan your farming
              activities efficiently.
            </p>
          </div>
          <div style={styles.card}>
            <h3>🚜 Crop Planning Calculator</h3>
            <p>Smart tools to help you plan your crops and maximize yield.</p>
          </div>
          <div style={styles.card}>
            <h3>💰 Cost Saving Choice</h3>
            <p>
              Access affordable rental services and reduce operational costs
              significantly.
            </p>
          </div>
          <div style={styles.card}>
            <h3>🌱 Modern Farm Tracker</h3>
            <p>
              Monitor and track your farm growth with real-time data and
              analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={styles.testimonial}>
        <p style={{ fontSize: "1.2rem", fontStyle: "italic" }}>
          "I've booked an AgriTech tool, and it made farming simple and
          efficient. Truly a game changer for us farmers!"
        </p>
        <h4>- Gopi Gowda, Farmer</h4>
      </section>

      {/* CTA Banner */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaOverlay}>
          <h2>{t("sections.ctaBannerTitle")}</h2>
          <button style={styles.ctaBtn} onClick={() => navigate("/register")}>
            {t("btn.getStarted")}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 AgriTech. {t("sections.footerRights")}</p>
        <p>Contact: info@agritech.com</p>
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

  /* Navbar */
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 10,
    color: "#fff",
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

  /* Hero Section */
  hero: {
    background:
      "url(https://images.yourstory.com/cs/5/f02aced0d86311e98e0865c1f0fe59a2/indian-farmer-1610471656527.png?mode=crop&crop=faces&ar=2%3A1&format=auto&w=1920&q=75) center/cover no-repeat",
    color: "#fff",
    textAlign: "left",
    padding: "160px 60px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: "100%",
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
    marginBottom: "40px",
    lineHeight: "1.6",
  },
  ctaBtn: {
    background: "#fdd835",
    color: "#333",
    border: "none",
    padding: "14px 28px",
    margin: "0 10px 0 0",
    fontWeight: "700",
    borderRadius: "30px",
    cursor: "pointer",
  },
  ctaBtnOutline: {
    background: "#fff",
    color: "#333",
    border: "none",
    padding: "14px 28px",
    fontWeight: "700",
    borderRadius: "30px",
    cursor: "pointer",
  },

  /* Partner Logos */
  partners: {
    display: "flex",
    justifyContent: "center",
    gap: "50px",
    padding: "40px 20px",
    background: "#fff",
    width: "100%",
  },
  logoImg: { height: "40px" },

  /* Story Section */
  story: {
    padding: "80px 20px",
    textAlign: "center",
    maxWidth: "900px",
    margin: "auto",
    lineHeight: "1.6",
  },

  /* Why Choose Us */
  why: { background: "#f3f9f5", padding: "80px 20px", textAlign: "center" },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  /* Testimonial */
  testimonial: {
    textAlign: "center",
    padding: "60px 20px",
    fontStyle: "italic",
    background: "#fff",
  },

  /* CTA Banner */
  ctaBanner: {
    background:
      "url(https://images.yourstory.com/cs/5/f02aced0d86311e98e0865c1f0fe59a2/indian-farmer-1610471656527.png?mode=crop&crop=faces&ar=2%3A1&format=auto&w=1920&q=75) center/cover no-repeat",
    color: "#fff",
    textAlign: "center",
    padding: "100px 20px",
    width: "100%",
    position: "relative",
  },
  ctaOverlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: "40px",
    borderRadius: "12px",
    display: "inline-block",
  },

  /* Footer */
  footer: {
    background: "#388e3c",
    color: "#fff",
    textAlign: "center",
    padding: "20px",
    marginTop: "20px",
    width: "100%",
  },
};

export default HomePage;
