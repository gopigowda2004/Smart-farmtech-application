import React, { useState } from "react";
import api from "../api/axiosInstance";
import { useI18n } from "../i18n/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function CropYieldEstimation() {
  const { t } = useI18n();
  const [form, setForm] = useState({ crop: "", area_acres: "", region: "", sowing_date: "", rainfall: "", temp: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        crop: form.crop,
        area_acres: Number(form.area_acres),
        region: form.region || null,
        sowing_date: form.sowing_date || null,
        rainfall: form.rainfall ? Number(form.rainfall) : null,
        temp: form.temp ? Number(form.temp) : null,
      };
      const res = await api.post("/ml/crop-yield-estimation", payload);
      setResult(res.data);
    } catch (err) {
      alert(t("ml.yield.failed"));
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📈 {t("ml.yield.title")}</h2>
        <LanguageSwitcher inline />
      </div>
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <input name="crop" placeholder={t("ml.yield.fields.crop")} value={form.crop} onChange={onChange} required />
        <input name="area_acres" placeholder={t("ml.yield.fields.area_acres")} value={form.area_acres} onChange={onChange} required />
        <input name="region" placeholder={t("ml.yield.fields.region")} value={form.region} onChange={onChange} />
        <input name="sowing_date" placeholder={t("ml.yield.fields.sowing_date")} value={form.sowing_date} onChange={onChange} />
        <input name="rainfall" placeholder={t("ml.yield.fields.rainfall")} value={form.rainfall} onChange={onChange} />
        <input name="temp" placeholder={t("ml.yield.fields.temp")} value={form.temp} onChange={onChange} />
        <button type="submit" disabled={loading}>{loading ? t("ml.yield.estimating") : t("ml.yield.estimate")}</button>
      </form>
      {result && (
        <div style={{ marginTop: 16 }}>
          <div><strong>{t("ml.yield.estimatedYield")}</strong></div>
          <pre style={{ background: "#f9fafb", padding: 12, borderRadius: 8 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}