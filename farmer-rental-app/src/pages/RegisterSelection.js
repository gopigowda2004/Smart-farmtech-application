import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RegisterSelection = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSelection = (userType) => {
    if (userType === "booker") {
      navigate("/register-booker");
    } else if (userType === "accepter") {
      navigate("/register-accepter");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.selectionWrapper}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2 style={styles.heading}>Choose Your Account Type</h2>
          <LanguageSwitcher inline />
        </div>

        <div style={styles.optionsContainer}>
          <div style={styles.optionCard} onClick={() => handleSelection("booker")}>
            <div style={styles.iconContainer}>
              <span style={styles.icon}>🚜</span>
            </div>
            <h3 style={styles.optionTitle}>Equipment Booker</h3>
            <p style={styles.optionDescription}>
              I want to rent farming equipment for my agricultural needs
            </p>
            <ul style={styles.featureList}>
              <li>Browse available equipment</li>
              <li>Book equipment for rent</li>
              <li>Track booking status</li>
              <li>View accepted requests</li>
            </ul>
            <button style={styles.selectButton}>Select Booker</button>
          </div>

          <div style={styles.optionCard} onClick={() => handleSelection("accepter")}>
            <div style={styles.iconContainer}>
              <span style={styles.icon}>🏭</span>
            </div>
            <h3 style={styles.optionTitle}>Equipment Accepter</h3>
            <p style={styles.optionDescription}>
              I have farming equipment to rent out to other farmers
            </p>
            <ul style={styles.featureList}>
              <li>List your equipment</li>
              <li>Accept booking requests</li>
              <li>Manage equipment availability</li>
              <li>View location on map</li>
            </ul>
            <button style={styles.selectButton}>Select Accepter</button>
          </div>
        </div>

        <div style={styles.loginLink}>
          <p>Already have an account? <span style={styles.link} onClick={() => navigate("/login")}>Login here</span></p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  selectionWrapper: {
    width: "100%",
    maxWidth: "900px",
    background: "#fff",
    borderRadius: "15px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  heading: {
    textAlign: "center",
    fontSize: "28px",
    color: "#2c3e50",
    marginBottom: "10px",
  },
  optionsContainer: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  optionCard: {
    flex: "1",
    minWidth: "300px",
    maxWidth: "400px",
    background: "#f8f9fa",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "2px solid transparent",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
      borderColor: "#667eea",
    }
  },
  iconContainer: {
    marginBottom: "20px",
  },
  icon: {
    fontSize: "60px",
    display: "block",
  },
  optionTitle: {
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "15px",
  },
  optionDescription: {
    fontSize: "16px",
    color: "#7f8c8d",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  featureList: {
    textAlign: "left",
    marginBottom: "25px",
    paddingLeft: "20px",
  },
  selectButton: {
    width: "100%",
    padding: "12px 24px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  loginLink: {
    textAlign: "center",
    marginTop: "30px",
    fontSize: "16px",
    color: "#7f8c8d",
  },
  link: {
    color: "#667eea",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default RegisterSelection;