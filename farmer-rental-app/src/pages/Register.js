import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const Register = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    aadharNumber: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false); // lock fields after Aadhaar fetch (Flipkart-style)
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Fetch farmer details using Aadhaar
  const handleFetchDetails = async () => {
    if (!formData.aadharNumber) {
      alert(`⚠️ ${t("register.alerts.enterAadhar")}`);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8090/api/farmers/fetch/${formData.aadharNumber}`
      );
      setFormData({
        ...formData,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        address: res.data.address,
      });
      setLocked(true); // lock fields once details are fetched
    } catch (err) {
      alert(`❌ ${t("register.alerts.farmerNotFound")}`);
      setLocked(false);
    } finally {
      setLoading(false);
    }
  };

  // Register Farmer
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8090/api/auth/register", formData);
      alert(`✅ ${t("register.alerts.success")}`);
      navigate("/login");
    } catch (error) {
      alert(`❌ ${t("register.alerts.failed")}: ` + (error.response?.data?.message || "Server error"));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={styles.heading}>{t("register.title")}</h2>
          <LanguageSwitcher inline />
        </div>

        {locked && (
          <div style={styles.banner}>
            Details fetched via Aadhaar. Name, email, phone, and address are locked (Flipkart-style).
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="aadharNumber"
            placeholder={t("register.aadhar")}
            value={formData.aadharNumber}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button
            type="button"
            onClick={handleFetchDetails}
            style={styles.fetchButton}
            disabled={loading}
          >
            {loading ? t("register.fetching") : t("register.fetchDetails")}
          </button>

          <input
            type="text"
            name="name"
            placeholder={t("register.name")}
            value={formData.name}
            onChange={handleChange}
            style={{ ...styles.input, ...(locked ? styles.disabledInput : {}) }}
            required
            disabled={locked}
          />
          <input
            type="email"
            name="email"
            placeholder={t("register.email")}
            value={formData.email}
            onChange={handleChange}
            style={{ ...styles.input, ...(locked ? styles.disabledInput : {}) }}
            required
            disabled={locked}
          />
          <input
            type="text"
            name="phone"
            placeholder={t("register.phone")}
            value={formData.phone}
            onChange={handleChange}
            style={{ ...styles.input, ...(locked ? styles.disabledInput : {}) }}
            required
            disabled={locked}
          />
          <input
            type="text"
            name="address"
            placeholder={t("register.address")}
            value={formData.address}
            onChange={handleChange}
            style={{ ...styles.input, ...(locked ? styles.disabledInput : {}) }}
            disabled={locked}
          />
          <input
            type="password"
            name="password"
            placeholder={t("register.password")}
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.submitButton}>
            {t("register.register")}
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    background: "#f0f4f8",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  formWrapper: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    borderRadius: "10px",
    padding: "30px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#2c3e50",
  },
  banner: {
    marginBottom: 12,
    padding: "10px 12px",
    background: "#fff7e6", // light amber (Flipkart-like)
    border: "1px solid #ffe8b3",
    color: "#8a6d3b",
    borderRadius: 8,
    fontSize: 13,
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    cursor: "not-allowed",
  },
  fetchButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#2980b9",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "12px",
    cursor: "pointer",
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Register;