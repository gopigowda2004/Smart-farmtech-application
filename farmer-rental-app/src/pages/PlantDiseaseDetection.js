import React, { useState } from "react";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function PlantDiseaseDetection() {
  const { t } = useI18n();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
    setResult(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/ml/plant-disease-detection", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (e) {
      alert(t("ml.plant.failed"));
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🩺 {t("ml.plant.title")}</h2>
        <LanguageSwitcher inline />
      </div>
      <input type="file" accept="image/*" onChange={handleFile} />
      {preview && (
        <div style={{ marginTop: 12 }}>
          <img src={preview} alt="preview" style={{ maxWidth: 300, borderRadius: 8 }} />
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <button disabled={!file || loading} onClick={analyze}>{loading ? t("ml.plant.analyzing") : t("ml.plant.analyze")}</button>
      </div>
      {result && (
        <div style={{ marginTop: 16 }}>
          <pre style={{ background: "#f9fafb", padding: 12, borderRadius: 8 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}