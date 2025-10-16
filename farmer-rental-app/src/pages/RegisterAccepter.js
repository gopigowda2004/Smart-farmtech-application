import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RegisterAccepter = () => {
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
    experience: "",
    password: "",
    role: "OWNER" // Equipment Accepter = OWNER
  });

  const [equipmentData, setEquipmentData] = useState({
    tractorBrand: "",
    tractorModel: "",
    tractorYear: "",
    horsepower: "",
    equipmentOwned: "",
    availableEquipment: [],
    pricePerHour: "",
    pricePerDay: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const equipmentOptions = [
    "Tractor", "Power Weeder", "Brush Cutter", "Power Reaper", 
    "Rotary Tiller", "Cultivator", "Harrow", "Plough", "Seed Drill",
    "Sprayer", "Harvester", "Thresher"
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEquipmentChange = (e) =>
    setEquipmentData({ ...equipmentData, [e.target.name]: e.target.value });

  const handleEquipmentSelection = (equipment) => {
    const updatedEquipment = equipmentData.availableEquipment.includes(equipment)
      ? equipmentData.availableEquipment.filter(item => item !== equipment)
      : [...equipmentData.availableEquipment, equipment];
    
    setEquipmentData({ 
      ...equipmentData, 
      availableEquipment: updatedEquipment,
      equipmentOwned: updatedEquipment.join(", ")
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Combine form data with equipment data
      const registrationData = {
        ...formData,
        equipmentOwned: equipmentData.equipmentOwned,
        experience: equipmentData.experience || formData.experience
      };

      // Register the user
      const response = await axios.post("http://localhost:8090/api/auth/register", registrationData);
      
      // If registration successful and user has equipment, we could add equipment details
      // This would require a separate API endpoint for equipment details
      
      alert("✅ Registration successful! You can now login as an Equipment Accepter and start listing your equipment.");
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
          <h2 style={styles.heading}>Equipment Accepter Registration</h2>
          <LanguageSwitcher inline />
        </div>

        <div style={styles.infoBox}>
          <span style={styles.infoIcon}>🏭</span>
          <p>Register as an Equipment Accepter to rent out your farming equipment to other farmers</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div style={styles.sectionTitle}>Personal Information</div>
          
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
            type="text"
            name="experience"
            placeholder="Farming Experience (years)"
            value={formData.experience}
            onChange={handleChange}
            style={styles.input}
          />

          {/* Equipment Information */}
          <div style={styles.sectionTitle}>Equipment Information</div>

          <div style={styles.row}>
            <input
              type="text"
              name="tractorBrand"
              placeholder="Tractor Brand (e.g., Mahindra, John Deere)"
              value={equipmentData.tractorBrand}
              onChange={handleEquipmentChange}
              style={styles.input}
            />
            <input
              type="text"
              name="tractorModel"
              placeholder="Tractor Model"
              value={equipmentData.tractorModel}
              onChange={handleEquipmentChange}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <input
              type="number"
              name="tractorYear"
              placeholder="Manufacturing Year"
              value={equipmentData.tractorYear}
              onChange={handleEquipmentChange}
              style={styles.input}
            />
            <input
              type="number"
              name="horsepower"
              placeholder="Horsepower (HP)"
              value={equipmentData.horsepower}
              onChange={handleEquipmentChange}
              style={styles.input}
            />
          </div>

          <div style={styles.equipmentSection}>
            <label style={styles.label}>Available Equipment (Select all that apply):</label>
            <div style={styles.equipmentGrid}>
              {equipmentOptions.map((equipment) => (
                <div
                  key={equipment}
                  style={{
                    ...styles.equipmentOption,
                    ...(equipmentData.availableEquipment.includes(equipment) ? styles.selectedEquipment : {})
                  }}
                  onClick={() => handleEquipmentSelection(equipment)}
                >
                  {equipment}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.row}>
            <input
              type="number"
              name="pricePerHour"
              placeholder="Price per Hour (₹)"
              value={equipmentData.pricePerHour}
              onChange={handleEquipmentChange}
              style={styles.input}
            />
            <input
              type="number"
              name="pricePerDay"
              placeholder="Price per Day (₹)"
              value={equipmentData.pricePerDay}
              onChange={handleEquipmentChange}
              style={styles.input}
            />
          </div>

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
            {loading ? "Registering..." : "Register as Equipment Accepter"}
          </button>
        </form>

        <div style={styles.loginLink}>
          <p>Already have an account? <span style={styles.link} onClick={() => navigate("/login")}>Login here</span></p>
          <p>Want to rent equipment? <span style={styles.link} onClick={() => navigate("/register-booker")}>Register as Booker</span></p>
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
    maxWidth: "700px",
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
    background: "#fff3cd",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "25px",
    border: "1px solid #ffeaa7",
  },
  infoIcon: {
    fontSize: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "15px",
    marginTop: "20px",
    borderBottom: "2px solid #667eea",
    paddingBottom: "5px",
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
  equipmentSection: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  equipmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginBottom: "15px",
  },
  equipmentOption: {
    padding: "10px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#f8f9fa",
  },
  selectedEquipment: {
    backgroundColor: "#667eea",
    color: "white",
    borderColor: "#667eea",
  },
  submitButton: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#e67e22",
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

export default RegisterAccepter;