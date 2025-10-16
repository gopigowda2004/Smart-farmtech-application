import React, { useState } from "react";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function SoilAnalysis() {
  const { t } = useI18n();
  const [form, setForm] = useState({ n: "", p: "", k: "", ph: "", ec: "", organic_matter: "", soil_type: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        n: Number(form.n), p: Number(form.p), k: Number(form.k), ph: Number(form.ph),
        ec: form.ec ? Number(form.ec) : null,
        organic_matter: form.organic_matter ? Number(form.organic_matter) : null,
        soil_type: form.soil_type || null,
      };
      const res = await api.post("/ml/soil-analysis", payload);
      setResult(res.data);
    } catch (err) {
      alert(t("ml.soil.failed"));
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🧪 {t("ml.soil.title")}</h2>
        <LanguageSwitcher inline />
      </div>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <input name="n" placeholder={t("ml.soil.fields.n")} value={form.n} onChange={onChange} required />
        <input name="p" placeholder={t("ml.soil.fields.p")} value={form.p} onChange={onChange} required />
        <input name="k" placeholder={t("ml.soil.fields.k")} value={form.k} onChange={onChange} required />
        <input name="ph" placeholder={t("ml.soil.fields.ph")} value={form.ph} onChange={onChange} required />
        <input name="ec" placeholder={t("ml.soil.fields.ec")} value={form.ec} onChange={onChange} />
        <input name="organic_matter" placeholder={t("ml.soil.fields.organic_matter")} value={form.organic_matter} onChange={onChange} />
        <input name="soil_type" placeholder={t("ml.soil.fields.soil_type")} value={form.soil_type} onChange={onChange} />
        <button type="submit" disabled={loading}>{loading ? t("ml.soil.analyzing") : t("ml.soil.analyze")}</button>
      </form>
      {result && (
        <div style={{ marginTop: 16 }}>
          <div><strong>{t("ml.soil.insights")}</strong></div>
          <pre style={{ background: "#f9fafb", padding: 12, borderRadius: 8 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}