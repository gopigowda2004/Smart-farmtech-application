import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import translations from "./translations";

// Language codes: 'en' or 'kn'
const DEFAULT_LANG = (localStorage.getItem("lang") || navigator.language?.startsWith("kn") ? "kn" : "en").toString() === "kn" ? "kn" : "en";

const I18nContext = createContext({
  lang: "en",
  setLang: (lang) => {},
  t: (path) => path,
});

function get(obj, path) {
  // Safe getter: t("rent.title")
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => setLangState(newLang === "kn" ? "kn" : "en");

  const t = useMemo(() => {
    return (path) => {
      const valKn = get(translations.kn, path);
      const valEn = get(translations.en, path);
      const source = lang === "kn" ? valKn ?? valEn : valEn ?? valKn;
      return source ?? path;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);