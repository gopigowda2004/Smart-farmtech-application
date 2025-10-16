import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ phone: "", password: "", selectedRole: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Get pre-selected role from RoleSelection page
  useEffect(() => {
    const preSelectedRole = localStorage.getItem("selectedRole");
    if (preSelectedRole) {
      setFormData(prev => ({ ...prev, selectedRole: preSelectedRole }));
      // Clear the temporary storage
      localStorage.removeItem("selectedRole");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate role selection
    if (!formData.selectedRole) {
      setMessage("❌ Please select your role to continue");
      return;
    }
    
    try {
      // CRITICAL: Clear ALL previous user data before login to prevent data leakage
      localStorage.removeItem("farmerId");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("isAdmin");
      
      const loginData = {
        phone: formData.phone,
        password: formData.password
      };
      
      const res = await api.post(`/auth/login`, loginData);
      if (res.data && (res.data.farmerId || res.data.userId)) {
        // Verify the user's actual role matches selected role
        const userActualRole = res.data.role;
        if (userActualRole !== formData.selectedRole) {
          setMessage(`❌ Access denied. You are registered as ${userActualRole}, not ${formData.selectedRole}`);
          return;
        }
        
        // Store all user information including role
        if (res.data.farmerId) {
          localStorage.setItem("farmerId", res.data.farmerId);
        }
        if (res.data.userId) {
          localStorage.setItem("userId", res.data.userId);
        }
        localStorage.setItem("userRole", res.data.role);
        localStorage.setItem("isAdmin", (res.data.isAdmin || false).toString());
        
        // Add a login timestamp to force Dashboard refresh
        localStorage.setItem("loginTimestamp", Date.now().toString());
        
        setMessage(`✅ ${t("auth.success")}`);
        
        // Navigate based on role
        if (res.data.role === "ADMIN") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        setMessage(`❌ ${t("auth.invalid")}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials";
      setMessage(`❌ ${t("auth.failed")}: ${msg}`);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Left Form Section */}
        <div style={styles.formSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={styles.heading}>{t("auth.loginTitle")}</h2>
            <LanguageSwitcher inline />
          </div>
          {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>{t("auth.phone")}</label>
            <input
              type="text"
              name="phone"
              placeholder={t("auth.phonePlaceholder")}
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <label style={styles.label}>{t("auth.password")}</label>
            <input
              type="password"
              name="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <label style={styles.label}>Selected Role *</label>
            <div style={styles.roleDisplay}>
              {formData.selectedRole === "ADMIN" && "🔧 Administrator"}
              {formData.selectedRole === "OWNER" && "🚜 Equipment Owner (Accepter)"}
              {formData.selectedRole === "RENTER" && "🌾 Equipment Renter (Booker)"}
              {!formData.selectedRole && "No role selected"}
            </div>
            {!formData.selectedRole && (
              <p style={styles.errorText}>
                Please go back and select your role first.{" "}
                <span 
                  style={styles.backLink}
                  onClick={() => navigate("/role-selection")}
                >
                  Select Role
                </span>
              </p>
            )}

            <a href="/forgot-password" style={styles.forgotPassword}>{t("auth.forgot")}</a>

            <button type="submit" style={styles.submitButton}>{t("auth.signIn")}</button>
          </form>
        </div>

        {/* Right Image Section */}
        <div style={styles.imageSection}>
          <img
            src="https://tse1.mm.bing.net/th/id/OIP.8K1AFNwiAkB4fQwXimcuRwHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="Farm Rental Equipment"
            style={styles.image}
          />
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  page: {
    backgroundColor: "#2196f3", // Blue background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  card: {
    display: "flex",
    width: "700px",
    height: "400px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  formSection: {
    flex: 1,
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  imageSection: { flex: 1, overflow: "hidden" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  heading: { fontSize: "24px", fontWeight: "bold", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column" },
  label: { fontSize: "14px", marginBottom: "5px" },
  input: {
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },
  select: {
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  roleDisplay: {
    padding: "10px",
    marginBottom: "15px",
    border: "2px solid #4CAF50",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#f0f8f0",
    fontWeight: "bold",
    color: "#2e7d32",
  },
  errorText: {
    color: "#f44336",
    fontSize: "12px",
    marginBottom: "15px",
  },
  backLink: {
    color: "#03a9f4",
    cursor: "pointer",
    textDecoration: "underline",
  },
  forgotPassword: { fontSize: "12px", color: "#555", marginBottom: "20px", textDecoration: "none" },
  submitButton: {
    padding: "12px",
    backgroundColor: "#03a9f4",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};