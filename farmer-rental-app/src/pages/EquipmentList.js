import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import AIChatbot from "../components/AIChatbot";
import { useNavigate } from "react-router-dom";

export default function EquipmentsList() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const farmerId = localStorage.getItem("farmerId");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    console.log("🔄 EquipmentList - farmerId:", farmerId, "userId:", userId);
    
    // Check authentication
    if (!farmerId && !userId) {
      console.log("❌ No authentication found, redirecting to home");
      navigate("/");
      return;
    }
    
    // Fetch equipment based on farmerId availability
    const fetchEquipments = async () => {
      try {
        let response;
        if (farmerId) {
          console.log("✅ Fetching equipment for farmerId:", farmerId);
          response = await api.get(`/equipments/others/${farmerId}`);
        } else {
          console.log("⚠️ No farmerId, fetching all equipment");
          response = await api.get("/equipments");
        }
        setEquipments(response.data);
        console.log("✅ Equipment fetched:", response.data.length, "items");
      } catch (err) {
        console.error("❌ Error fetching equipments:", err);
        // Fallback to all equipment
        try {
          const fallbackResponse = await api.get("/equipments");
          setEquipments(fallbackResponse.data);
        } catch (fallbackErr) {
          console.error("❌ Fallback fetch also failed:", fallbackErr);
        }
      }
    };
    
    fetchEquipments();
  }, [farmerId, userId, navigate]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{t("equipmentList.title")}</h2>
        <LanguageSwitcher inline />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        {equipments.map((eq) => (
          <div key={eq.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            <img src={eq.image} alt={eq.name} width="100" />
            <h3>{eq.name}</h3>
            <p>{eq.description}</p>
            <p>{t("common.priceDay").replace("{price}", eq.pricePerHour || (eq.price ? (eq.price / 24).toFixed(2) : 0))}</p>
            <p><strong>{t("common.owner")}:</strong> {eq.owner?.name}</p>
            <p><strong>{t("common.contact")}:</strong> {eq.owner?.phone}</p>
            <button onClick={() => {
              // Use farmerId if available, otherwise fall back to userId
              const farmerId = localStorage.getItem("farmerId");
              const userId = localStorage.getItem("userId");
              const renterId = farmerId || userId;
              
              if (!renterId) {
                alert("Authentication error. Please log in again.");
                return;
              }
              
              const startDate = prompt("Start time (YYYY-MM-DDTHH:mm)", "2025-09-13T10:00");
              const hoursStr = prompt("How many hours?", "4");
              const hours = hoursStr ? parseInt(hoursStr, 10) : NaN;
              if (!startDate || !Number.isFinite(hours) || hours <= 0) return;
              // Backend expects date-only startDate/endDate; compute endDate from hours
              const start = new Date(startDate);
              if (isNaN(start.getTime())) return;
              const startDateOnly = start.toISOString().slice(0, 10);
              
              console.log("🔄 Creating booking with renterId:", renterId, "(farmerId:", farmerId, "userId:", userId, ")");
              
              api.post(`/bookings/create`, null, {
                params: { equipmentId: eq.id, renterId, startDate: startDateOnly, hours },
              })
                .then(() => {
                  console.log("✅ Booking created, navigating to checkout");
                  const hourlyPrice = eq.pricePerHour || (eq.price ? (eq.price / 24).toFixed(2) : 0);
                  navigate(`/checkout?equipmentId=${eq.id}&start=${startDateOnly}&hours=${hours}&price=${hourlyPrice}`);
                })
                .catch((err) => {
                  console.error("❌ Failed to create booking:", err?.response?.data || err.message);
                  alert("Failed to proceed to checkout");
                });
            }}>{t("equipmentList.book")}</button>
          </div>
        ))}
      </div>
      
      {/* AI Chatbot Assistant */}
      <AIChatbot />
    </div>
  );
}