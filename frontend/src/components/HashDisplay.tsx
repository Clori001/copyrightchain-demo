import { Copy, Fingerprint } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../i18n";
import { formatHash } from "../utils/formatAddress";

interface HashDisplayProps {
  hash: string;
  copyable?: boolean;
}

export function HashDisplay({ hash, copyable = true }: HashDisplayProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function copyHash() {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
        <Fingerprint className="h-5 w-5 text-brand-600" aria-hidden="true" />
        {t("generateFingerprint")}
      </div>
      <div className="flex flex-col gap-3 rounded-md border border-brand-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <code className="break-all text-sm font-semibold text-ink-900">{formatHash(hash, 18, 18)}</code>
        {copyable ? (
          <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => void copyHash()}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? t("copied") : t("copy")}
          </button>
        ) : (
          <span className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-ink-500">
            {t("copyAvailableAfterSubmit")}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-ink-500">{t("hashExplanation")}</p>
    </div>
  );
}
