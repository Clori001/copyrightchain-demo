import { Globe2 } from "lucide-react";
import { useTranslation } from "../i18n";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="inline-flex items-center gap-2 text-sm text-ink-700">
      <Globe2 className="h-4 w-4" aria-hidden="true" />
      <button
        type="button"
        className={`font-medium ${language === "en" ? "text-brand-600" : "text-ink-500"}`}
        onClick={() => setLanguage("en")}
      >
        English
      </button>
      <span className="text-slate-300">|</span>
      <button
        type="button"
        className={`font-medium ${language === "zh" ? "text-brand-600" : "text-ink-500"}`}
        onClick={() => setLanguage("zh")}
      >
        中文
      </button>
    </div>
  );
}

