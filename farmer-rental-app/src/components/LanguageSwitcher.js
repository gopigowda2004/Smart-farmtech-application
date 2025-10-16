import React from "react";
import { useI18n } from "../i18n/i18n";

const LanguageSwitcher = ({ inline = false }) => {
  const { lang, setLang } = useI18n();

  const commonStyle = {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "6px 10px",
    background: "#fff",
    cursor: "pointer",
  };

  if (inline) {
    return (
      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setLang("en")}
          style={{ ...commonStyle, fontWeight: lang === "en" ? 700 : 500 }}
        >
          English
        </button>
        <button
          onClick={() => setLang("kn")}
          style={{ ...commonStyle, fontWeight: lang === "kn" ? 700 : 500 }}
        >
          ಕನ್ನಡ
        </button>
      </span>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => setLang("en")}
        style={{ ...commonStyle, fontWeight: lang === "en" ? 700 : 500 }}
      >
        English
      </button>
      <button
        onClick={() => setLang("kn")}
        style={{ ...commonStyle, fontWeight: lang === "kn" ? 700 : 500 }}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
};

export default LanguageSwitcher;