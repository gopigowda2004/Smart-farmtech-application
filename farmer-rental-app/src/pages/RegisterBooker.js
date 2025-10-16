import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RegisterBooker = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    farmSize: "",
    cropType: "",
    password: "",
    role: "RENTER" // Equipment Booker = RENTER
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("http://localhost:8090/api/auth/register", formData);
      alert("✅ Registration successful! You can now login as an Equipment Booker.");
      navigate("/login");
    } catch (error) {
      alert("❌ Registration failed: " + (error.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={styles.heading}>Equipment Booker Registration</h2>
          <LanguageSwitcher inline />
        </div>

        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>🚜</span>
          <p>Register as an Equipment Booker to rent farming equipment from other farmers</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.row}>
            <input
              type="text"
              name="name"
              placeholder="Name *"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <input
            type="text"
            name="address"
            placeholder="Address *"
            value={formData.address}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <div style={styles.row}>
            <input
              type="text"
              name="district"
              placeholder="District"
              value={formData.district}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="text"
              name="farmSize"
              placeholder="Farm Size (acres)"
              value={formData.farmSize}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <input
            type="text"
            name="cropType"
            placeholder="Crop Type (e.g., Rice, Wheat, Cotton)"
            value={formData.cropType}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? "Registering..." : "Register as Equipment Booker"}
          </button>
        </form>

        <div style={styles.loginLink}>
          <p>Already have an account? <span style={styles.link} onClick={() => navigate("/login")}>Login here</span></p>
          <p>Want to provide equipment? <span style={styles.link} onClick={() => navigate("/register-accepter")}>Register as Accepter</span></p>
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
  formWrapper: {
    width: "100%",
    maxWidth: "600px",
    background: "#fff",
    borderRadius: "15px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "24px",
    color: "#2c3e50",
  },
  infoBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#e8f5e8",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "25px",
    border: "1px solid #c3e6c3",
  },
  infoIcon: {
    fontSize: "24px",
  },
  row: {
    display: "flex",
    gap: "15px",
    marginBottom: "15px",
  },
  input: {
    flex: "1",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  submitButton: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#27ae60",
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
    marginTop: "25px",
    fontSize: "14px",
    color: "#7f8c8d",
  },
  link: {
    color: "#667eea",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default RegisterBooker;