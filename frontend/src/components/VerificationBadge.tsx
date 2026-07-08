import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "../i18n";

export function VerificationBadge({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 font-bold text-emerald-700 ${
        compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
      }`}
    >
      <CheckCircle2 className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
      {t("verifiedOnChain")}
    </span>
  );
}

