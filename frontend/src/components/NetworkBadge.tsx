import { CheckCircle2, CircleAlert } from "lucide-react";
import { NETWORK_NAME, isContractConfigured } from "../contract/address";
import { useTranslation } from "../i18n";

export function NetworkBadge() {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
        isContractConfigured
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {isContractConfigured ? (
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      ) : (
        <CircleAlert className="h-4 w-4" aria-hidden="true" />
      )}
      {NETWORK_NAME} · {isContractConfigured ? t("active") : t("notDeployed")}
    </span>
  );
}

