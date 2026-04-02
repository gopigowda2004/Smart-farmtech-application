import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

function AdminRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [formData, setFormData] = useState({
    name: "Admin",
    email: "admin@farmtech.com",
    phone: "8888899999",
    password: "123@Gopi",
    fullName: "System Administrator",
    address: "FarmTech HQ, Bangalore",
    district: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    role: "ADMIN",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await api.post(
        "/auth/register",
        formData
      );
      setResponse({
        type: "success",
        data: res.data,
      });
    } catch (error) {
      setResponse({
        type: "error",
        message:
          error.response?.data?.message || error.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.backBtn}
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </button>

      <div style={styles.formContainer}>
        <h1 style={styles.title}>🌾 FarmTech Admin Registration</h1>
        <p style={styles.subtitle}>Create Administrator Account</p>

        <div style={styles.infoBox}>
          <strong>Note:</strong> Register a new admin account for FarmTech system administration.
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name (Display)</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Creating admin account...</p>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </form>

        {response && (
          <div
            style={{
              ...styles.response,
              backgroundColor:
                response.type === "success" ? "#d4edda" : "#f8d7da",
              borderColor:
                response.type === "success" ? "#c3e6cb" : "#f5c6cb",
              color: response.type === "success" ? "#155724" : "#721c24",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>
              {response.type === "success"
                ? "✅ Admin Account Created Successfully!"
                : "❌ Registration Failed"}
            </h3>
            {response.type === "success" ? (
              <div>
                <p>
                  <strong>User ID:</strong> {response.data.userId}
                </p>
                <p>
                  <strong>Farmer ID:</strong> {response.data.farmerId || "N/A"}
                </p>
                <p>
                  <strong>Role:</strong> {response.data.role}
                </p>
                <p style={{ marginTop: "15px", fontSize: "14px", color: "#155724" }}>
                  ✅ <strong>Registration Complete!</strong><br />
                  You can now login with:<br />
                  <strong>Phone:</strong> 8888899999<br />
                  <strong>An OTP will be sent to your email</strong>
                </p>
                <button
                  onClick={() => {
                    localStorage.setItem("selectedRole", "ADMIN");
                    navigate("/login");
                  }}
                  style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    width: "100%"
                  }}
                >
                  Go to Login →
                </button>
              </div>
            ) : (
              <p>{response.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Open Sans, Roboto, Arial, sans-serif",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "2px solid white",
    padding: "10px 20px",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s",
  },
  formContainer: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: "450px",
    width: "100%",
    padding: "40px",
  },
  title: {
    color: "#333",
    marginBottom: "10px",
    fontSize: "28px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "30px",
    fontSize: "14px",
  },
  infoBox: {
    background: "#e7f3ff",
    borderLeft: "4px solid #667eea",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#004085",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    color: "#333",
    fontWeight: "600",
    marginBottom: "8px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "all 0.3s",
    boxSizing: "border-box",
  },
  submitBtn: {
    padding: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s",
    marginTop: "10px",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    margin: "20px 0",
    color: "#667eea",
  },
  spinner: {
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    animation: "spin 1s linear infinite",
  },
  response: {
    marginTop: "30px",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid",
  },
};

export default AdminRegister;
