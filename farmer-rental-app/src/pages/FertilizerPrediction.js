import React, { useState } from "react";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function FertilizerPrediction() {
  const { t } = useI18n();
  const [form, setForm] = useState({ crop: "", n: "", p: "", k: "", soil_type: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { crop: form.crop, n: Number(form.n), p: Number(form.p), k: Number(form.k), soil_type: form.soil_type || null };
      const res = await api.post("/ml/fertilizer-prediction", payload);
      setResult(res.data);
    } catch (err) {
      alert(t("ml.fertilizer.failed"));
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🧪 {t("ml.fertilizer.title")}</h2>
        <LanguageSwitcher inline />
      </div>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <input name="crop" placeholder={t("ml.fertilizer.fields.crop")} value={form.crop} onChange={onChange} required />
        <input name="n" placeholder={t("ml.fertilizer.fields.n")} value={form.n} onChange={onChange} required />
        <input name="p" placeholder={t("ml.fertilizer.fields.p")} value={form.p} onChange={onChange} required />
        <input name="k" placeholder={t("ml.fertilizer.fields.k")} value={form.k} onChange={onChange} required />
        <input name="soil_type" placeholder={t("ml.fertilizer.fields.soil_type")} value={form.soil_type} onChange={onChange} />
        <button type="submit" disabled={loading}>{loading ? t("ml.fertilizer.predicting") : t("ml.fertilizer.predict")}</button>
      </form>
      {result && (
        <div style={{ marginTop: 16 }}>
          <div><strong>{t("ml.fertilizer.recommendedAdjustments")}</strong></div>
          <pre style={{ background: "#f9fafb", padding: 12, borderRadius: 8 }}>{JSON.stringify(result.recommended_adjustments, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}