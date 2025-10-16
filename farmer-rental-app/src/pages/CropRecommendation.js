import React, { useState } from "react";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function CropRecommendation() {
  const { t } = useI18n();
  const [form, setForm] = useState({ n: "", p: "", k: "", ph: "", rainfall: "", temp: "", humidity: "", region: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        n: Number(form.n), p: Number(form.p), k: Number(form.k), ph: Number(form.ph),
        rainfall: Number(form.rainfall), temp: Number(form.temp), humidity: Number(form.humidity),
        region: form.region || null
      };
      const res = await api.post("/ml/crop-recommendation", payload);
      setResult(res.data);
    } catch (err) {
      alert(t("ml.cropRec.failed"));
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🌱 {t("ml.cropRec.title")}</h2>
        <LanguageSwitcher inline />
      </div>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <input name="n" placeholder={t("ml.cropRec.fields.n")} value={form.n} onChange={onChange} required />
        <input name="p" placeholder={t("ml.cropRec.fields.p")} value={form.p} onChange={onChange} required />
        <input name="k" placeholder={t("ml.cropRec.fields.k")} value={form.k} onChange={onChange} required />
        <input name="ph" placeholder={t("ml.cropRec.fields.ph")} value={form.ph} onChange={onChange} required />
        <input name="rainfall" placeholder={t("ml.cropRec.fields.rainfall")} value={form.rainfall} onChange={onChange} required />
        <input name="temp" placeholder={t("ml.cropRec.fields.temp")} value={form.temp} onChange={onChange} required />
        <input name="humidity" placeholder={t("ml.cropRec.fields.humidity")} value={form.humidity} onChange={onChange} required />
        <input name="region" placeholder={t("ml.cropRec.fields.region")} value={form.region} onChange={onChange} />
        <button type="submit" disabled={loading}>{loading ? t("ml.cropRec.predicting") : t("ml.cropRec.getRecommendation")}</button>
      </form>
      {result && (
        <div style={{ marginTop: 16 }}>
          <strong>{t("ml.cropRec.recommended")}</strong> {result.recommendations?.join(", ")}
        </div>
      )}
    </div>
  );
}