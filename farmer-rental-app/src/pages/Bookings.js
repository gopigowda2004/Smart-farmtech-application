import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Bookings() {
  const { t } = useI18n();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationText, setLocationText] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();
  const [loginTimestamp, setLoginTimestamp] = useState(localStorage.getItem("loginTimestamp"));

  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [hours, setHours] = useState("");

  // Reverse-geocode coordinates to a readable address
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch address");
      const data = await res.json();
      const parts = [data.locality || data.city, data.principalSubdivision, data.countryName].filter(Boolean);
      return parts.join(", ") || `${latitude}, ${longitude}`;
    } catch (e) {
      return `${latitude}, ${longitude}`; // fallback
    }
  };

  // Fallback to IP-based approximate address when GPS is unavailable/blocked
  const ipGeocode = async () => {
    try {
      const res = await fetch('https://api.bigdatacloud.net/data/ip-geolocation-client?localityLanguage=en');
      if (!res.ok) throw new Error('Failed ip geolocation');
      const data = await res.json();
      const parts = [data.city || data.locality, data.principalSubdivision, data.countryName].filter(Boolean);
      return parts.join(', ');
    } catch (e) {
      return '';
    }
  };

  const handleUseMyLocation = async () => {
    setGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        const ipAddr = await ipGeocode();
        if (ipAddr) {
          setLocationText(ipAddr);
        } else {
          alert('Geolocation not supported and IP lookup failed. Please type your address.');
        }
        return;
      }

      // Try browser GPS with timeout and high accuracy
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      );

      const { latitude, longitude } = pos.coords;
      const address = await reverseGeocode(latitude, longitude);
      setLocationText(address);
    } catch (err) {
      // Fallback to IP-based city/region
      const ipAddr = await ipGeocode();
      if (ipAddr) {
        alert('Could not get precise location. Using approximate city from IP.');
        setLocationText(ipAddr);
      } else {
        alert(`Failed to get location: ${err.message || err}`);
      }
    } finally {
      setGettingLocation(false);
    }
  };

  useEffect(() => {
    // Update loginTimestamp state if it changed in localStorage
    const currentTimestamp = localStorage.getItem("loginTimestamp");
    if (currentTimestamp !== loginTimestamp) {
      console.log("🔄 Login timestamp changed in Bookings, updating state");
      setLoginTimestamp(currentTimestamp);
    }
    
    // Read farmerId and userId fresh from localStorage
    const farmerId = localStorage.getItem("farmerId");
    const userId = localStorage.getItem("userId");
    
    // Only redirect if BOTH farmerId and userId are missing (truly not logged in)
    if (!farmerId && !userId) {
      console.log("❌ No farmerId or userId found in Bookings, redirecting to login");
      navigate("/");
      return;
    }
    
    // If we have userId but no farmerId, we might be a new user - continue anyway
    if (!farmerId && userId) {
      console.log("⚠️ New user system detected (userId but no farmerId), continuing...");
    }

    console.log("🔄 Fetching equipment for farmerId:", farmerId, "userId:", userId);
    
    // Clear equipment when user changes
    console.log("🧹 Clearing equipment for fresh fetch");
    setEquipments([]);
    setError("");

    // Fetch equipment available for rent (excluding user's own equipment)
    const fetchEquipmentForRenter = async () => {
      try {
        // First try the dedicated endpoint for other farmers' equipment (only if farmerId exists)
        if (farmerId) {
          const response = await api.get(`/equipments/others/${farmerId}`);
          const equipmentList = response.data || [];
          
          console.log("✅ Equipment fetched:", equipmentList.length, "items");
          
          if (equipmentList.length > 0) {
            setEquipments(equipmentList);
            setLoading(false);
            return;
          }
        } else {
          console.log("⚠️ No farmerId, skipping /equipments/others endpoint");
        }
      } catch (err) {
        console.error("❌ Error fetching other farmers' equipment:", err);
      }
      
      // Fallback: fetch all equipment and filter manually
      try {
        const response = await api.get(`/equipments`);
        const allEquipment = response.data || [];
        
        if (allEquipment.length === 0) {
          setError("No equipment available to rent right now. Please try again later.");
          setLoading(false);
          return;
        }
        
        // For renters, show all equipment since they typically don't own any
        // Only filter out if the user actually owns equipment (owner.id matches farmerId)
        if (farmerId) {
          const availableEquipment = allEquipment.filter(eq => {
            const ownerId = eq.owner?.id || eq.ownerId;
            return ownerId !== parseInt(farmerId, 10);
          });
          
          if (availableEquipment.length === 0) {
            // If filtering removed everything, show all equipment (user probably doesn't own any)
            setEquipments(allEquipment);
          } else {
            setEquipments(availableEquipment);
          }
        } else {
          // No farmerId, show all equipment
          console.log("⚠️ No farmerId for filtering, showing all equipment");
          setEquipments(allEquipment);
        }
        setLoading(false);
      } catch (fallbackErr) {
        console.error("❌ Fallback equipment fetch failed:", fallbackErr);
        setError("Failed to load equipment list. Please refresh.");
        setLoading(false);
      }
    };
    
    fetchEquipmentForRenter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginTimestamp, navigate]);

  const handleRequestRental = (e) => {
    e.preventDefault();

    if (!selectedEquipmentId || !startDate || !hours || !locationText) {
      alert("Please fill all fields.");
      return;
    }

    const chosenEquipment = equipments.find((eq) => String(eq.id) === String(selectedEquipmentId));
    if (!chosenEquipment) {
      alert("Selected equipment could not be found. Please choose again.");
      return;
    }

    const hoursNum = parseInt(hours, 10);
    if (!Number.isFinite(hoursNum) || hoursNum <= 0) {
      alert("Please enter a valid number of hours.");
      return;
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      alert("Please enter a valid start date.");
      return;
    }

    const startDateOnly = start.toISOString().slice(0, 10);

    // Forward the equipment id and optional pricing details to checkout
    // Use pricePerHour as primary, calculate from price if needed
    const hourlyPrice = chosenEquipment.pricePerHour ?? (chosenEquipment.price ? (chosenEquipment.price / 24).toFixed(2) : "");
    navigate(`/checkout?equipmentId=${chosenEquipment.id}&start=${startDateOnly}&hours=${hoursNum}&price=${hourlyPrice}&location=${encodeURIComponent(locationText)}`);
  };

  if (loading) return <div style={styles.page}>{t("common.loading")}</div>;
  if (error) return <div style={styles.page}>{error}</div>;
  if (!equipments.length) {
    return (
      <div style={styles.page}>
        <h2>{t("bookings.title") || "Request Equipment Rental"}</h2>
        <p>{t("bookings.noEquipmentMessage") || "No equipment is currently available for rent."}</p>
        <button style={styles.primaryBtn} onClick={() => navigate(-1)}>
          {t("common.back") || "Back"}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={styles.sidebarTitle}>{t("common.categories")}</h3>
          <LanguageSwitcher inline />
        </div>
        <ul style={styles.categoryList}>
          {t("bookings.categories").map((c, idx) => (
            <li key={idx}>{c}</li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <h2 style={styles.header}>{t("bookings.title") || "Request Equipment Rental"}</h2>

        <div style={styles.card}>
          <form onSubmit={handleRequestRental} style={styles.form}>
            <div style={styles.section}>
              <label style={styles.label}>{t("rent.selectEquipment")}</label>
              <select
                style={styles.select}
                value={selectedEquipmentId}
                onChange={(e) => setSelectedEquipmentId(e.target.value)}
                required
              >
                <option value="">{t("rent.choosePlaceholder")}</option>
                {equipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name || eq.nameEn || t(`equip.${eq.category || "equipment"}.name`, { defaultValue: eq.name || "Unnamed" })}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.section}>
              <label style={styles.label}>{t("checkout.location") || "Location"}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder={t("checkout.locationPlaceholder") || "Type your location or use current location"}
                  style={styles.input}
                  required
                />
                <button type="button" style={styles.secondaryBtn} onClick={handleUseMyLocation} disabled={gettingLocation}>
                  {gettingLocation ? "…" : (t("checkout.useMyLocation") || "Use my location")}
                </button>
              </div>
            </div>

            <div style={styles.section}>
              <label style={styles.label}>{t("checkout.startDate") || "Start Date"}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.section}>
              <label style={styles.label}>{t("checkout.hours") || "Hours"}</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g., 4"
                style={styles.input}
                min="1"
                required
              />
            </div>

            <button type="submit" style={styles.primaryBtn}>
              {t("bookings.requestRental") || "Request Rental"} 🚜
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: "flex", fontFamily: "Arial, sans-serif", background: "#f9fafb", padding: "20px" },
  sidebar: { width: "220px", background: "#fff", padding: "16px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", marginRight: "20px", height: "fit-content" },
  sidebarTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "10px", borderBottom: "2px solid #10b981", paddingBottom: "5px" },
  categoryList: { listStyle: "none", padding: 0, margin: 0, lineHeight: "2em", color: "#374151" },
  main: { flex: 1 },
  header: { marginBottom: "20px" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  section: {},
  label: { display: "block", marginBottom: "4px", fontWeight: "bold", color: "#374151" },
  select: { width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "16px" },
  input: { flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "16px" },
  secondaryBtn: { padding: "10px", background: "#374151", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  primaryBtn: { padding: "12px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  page: { padding: 20, fontFamily: "Arial, sans-serif", textAlign: "center" },
};