import React from "react";
import "./RentalStats.css";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

function RentalStats() {
  const { t } = useI18n();
  return (
    <div className="stats-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📊 {t("dashboard.menu.rentalStats")}</h2>
        <LanguageSwitcher inline />
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>10</h3>
          <p>Total Bookings</p>
        </div>
        <div className="stat-card">
          <h3>6</h3>
          <p>Active Rentals</p>
        </div>
        <div className="stat-card">
          <h3>₹12,500</h3>
          <p>Total Earnings</p>
        </div>
        <div className="stat-card">
          <h3>4.8⭐</h3>
          <p>Average Rating</p>
        </div>
      </div>
    </div>
  );
}

export default RentalStats;