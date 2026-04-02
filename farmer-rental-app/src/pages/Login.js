import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ phone: "", password: "", selectedRole: "" });
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#d32f2f");
  const navigate = useNavigate();

  // Get pre-selected role from RoleSelection page
  useEffect(() => {
    const preSelectedRole = localStorage.getItem("selectedRole");
    if (preSelectedRole) {
      setFormData(prev => ({ ...prev, selectedRole: normalizeRole(preSelectedRole) }));
      // Clear the temporary storage
      localStorage.removeItem("selectedRole");
    }
  }, []);

  const normalizeRole = (roleValue) => {
    if (!roleValue) return "";
    const upper = roleValue.trim().toUpperCase();
    if (upper === "FARMER" || upper === "OWNER" || upper === "ACCEPTER") {
      return "OWNER";
    }
    if (upper === "RENTER" || upper === "BOOKER") {
      return "RENTER";
    }
    if (upper === "ADMIN") {
      return "ADMIN";
    }
    return upper;
  };

  const describeRole = (roleKey) => {
    switch (roleKey) {
      case "ADMIN":
        return "Administrator";
      case "OWNER":
        return "Equipment Owner (Accepter)";
      case "RENTER":
        return "Equipment Renter (Booker)";
      default:
        return roleKey || "Unknown";
    }
  };

  const normalizedSelectedRoleValueMemo = normalizeRole(formData.selectedRole);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedSelectedRoleValue = normalizedSelectedRoleValueMemo;

    if (!normalizedSelectedRoleValue) {
      setMessageColor("#d32f2f");
      setMessage("❌ Please select your role to continue");
      return;
    }

    if (!formData.phone.trim() || !formData.password.trim()) {
      setMessageColor("#d32f2f");
      setMessage("❌ Phone number and password are required");
      return;
    }

    try {
      // Clear previous session data before starting login flow
      localStorage.removeItem("farmerId");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("isAdmin");

      const payload = { 
        phone: formData.phone.trim(), 
        password: formData.password.trim() 
      };

      const res = await api.post(`/auth/login`, payload);
      const data = res.data || {};
      const normalizedResponseRole = normalizeRole(data.role);

      // Verify login success
      if ((data.farmerId || data.userId) && normalizedResponseRole) {
        const userActualRole = normalizedResponseRole;
        const normalizedSelectedRole = normalizeRole(formData.selectedRole);
        
        if (userActualRole !== normalizedSelectedRole) {
          setMessageColor("#d32f2f");
          const expectedRoleDescription = describeRole(normalizedSelectedRole);
          const actualRoleDescription = describeRole(userActualRole);
          setMessage(`❌ Access denied. You are registered as ${actualRoleDescription}, not ${expectedRoleDescription}`);
          return;
        }

        if (data.farmerId) {
          localStorage.setItem("farmerId", data.farmerId);
        }
        if (data.userId) {
          localStorage.setItem("userId", data.userId);
        }
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("isAdmin", (data.isAdmin || false).toString());
        localStorage.setItem("loginTimestamp", Date.now().toString());

        setMessageColor("#2e7d32");
        setMessage(`✅ ${t("auth.success")}`);

        if (data.role === "ADMIN") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
        return;
      }

      // Unexpected response
      const fallbackMessage = data.message || t("auth.invalid");
      setMessageColor("#d32f2f");
      setMessage(`❌ ${fallbackMessage}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials";
      setMessageColor("#d32f2f");
      setMessage(`❌ Login failed: ${msg}`);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.formSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={styles.heading}>{t("auth.loginTitle")}</h2>
            <LanguageSwitcher inline />
          </div>
          {message && <p style={{ color: messageColor, textAlign: "center" }}>{message}</p>}
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

            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
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

            <button type="submit" style={styles.submitButton}>
              Login
            </button>
          </form>
        </div>

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
    height: "440px",
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
  otpInfo: {
    fontSize: "13px",
    marginBottom: "15px",
    color: "#424242",
  },
  otpHint: {
    fontSize: "12px",
    color: "#424242",
    marginTop: "-10px",
    marginBottom: "10px",
  },
  otpActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    gap: "10px",
  },
  secondaryButton: {
    flex: "0 0 auto",
    padding: "10px 16px",
    backgroundColor: "#eceff1",
    color: "#0d47a1",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#03a9f4",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
    fontSize: "12px",
  },
};