import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

function Contact() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Address",
      content: "Agricultural Tech Hub, Bangalore, India"
    },
    {
      icon: "📞",
      title: "Phone",
      content: "+91 8904163814"
    },
    {
      icon: "✉️",
      title: "Email",
      content: "farmertech34@gmail.com"
    },
    {
      icon: "⏰",
      title: "Working Hours",
      content: "Monday - Saturday, 9AM - 6PM IST"
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
          <li onClick={() => navigate("/resources")}>{t("nav.resources")}</li>
          <li onClick={() => navigate("/community")}>{t("nav.community")}</li>
          <li onClick={() => navigate("/contact")} style={{fontWeight: "bold"}}>{t("nav.contact")}</li>
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
          <h1 style={styles.heroTitle}>Get In Touch</h1>
          <p style={styles.heroText}>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      {/* Contact Info */}
      <section style={styles.contactInfoSection}>
        <h2>Contact Information</h2>
        <div style={styles.infoGrid}>
          {contactInfo.map((info, idx) => (
            <div key={idx} style={styles.infoCard}>
              <div style={styles.infoIcon}>{info.icon}</div>
              <h3>{info.title}</h3>
              <p>{info.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <section style={{...styles.section, background: "#f3f9f5"}}>
        <h2>Send Us a Message</h2>
        <div style={styles.formContainer}>
          {submitted ? (
            <div style={styles.successMessage}>
              <div style={styles.successIcon}>✓</div>
              <h3>Thank You!</h3>
              <p>Your message has been sent successfully. We'll get back to you soon!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Your name"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="your@email.com"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="What is this about?"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  style={{...styles.input, minHeight: "200px", resize: "vertical"}}
                  placeholder="Tell us more..."
                />
              </div>

              <button type="submit" style={styles.submitBtn}>Send Message</button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={styles.section}>
        <h2>Frequently Asked Questions</h2>
        <div style={styles.faqGrid}>
          <div style={styles.faqCard}>
            <h3>❓ What are your support hours?</h3>
            <p>We provide support Monday to Saturday, 9AM to 6PM IST. You can also email us anytime, and we'll respond within 24 hours.</p>
          </div>
          <div style={styles.faqCard}>
            <h3>❓ How long does it take to get a response?</h3>
            <p>We aim to respond to all inquiries within 24 hours. For urgent issues, please call us during business hours.</p>
          </div>
          <div style={styles.faqCard}>
            <h3>❓ What if I have a billing issue?</h3>
            <p>Please contact our billing team at billing@farmtech.com with details of your booking and transaction ID.</p>
          </div>
          <div style={styles.faqCard}>
            <h3>❓ How do I report a safety concern?</h3>
            <p>Safety is our priority. Report any concerns to safety@farmtech.com or call our emergency hotline immediately.</p>
          </div>
        </div>
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

  contactInfoSection: {
    padding: "80px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  infoCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  infoIcon: {
    fontSize: "2.5rem",
    marginBottom: "15px",
  },

  section: {
    padding: "80px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  formContainer: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxWidth: "700px",
    margin: "40px auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  submitBtn: {
    background: "#388e3c",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    fontWeight: "700",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "10px",
  },

  successMessage: {
    textAlign: "center",
    padding: "40px",
  },
  successIcon: {
    fontSize: "4rem",
    color: "#388e3c",
    marginBottom: "20px",
  },

  faqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginTop: "40px",
  },
  faqCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    lineHeight: "1.6",
  },

  socialLinks: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  socialBtn: {
    background: "#388e3c",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "25px",
    fontWeight: "600",
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

export default Contact;
