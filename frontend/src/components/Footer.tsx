import { CONTRACT_ADDRESS, NETWORK_NAME } from "../contract/address";
import { useTranslation } from "../i18n";
import { formatAddress } from "../utils/formatAddress";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="page-shell grid gap-4 py-6 text-sm text-ink-500 md:grid-cols-4">
        <div>
          <p className="font-bold text-ink-900">CopyrightChain Demo</p>
          <p className="mt-1">{t("educationalOnly")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Contract</p>
          <p className="mt-1 font-mono text-ink-700">{CONTRACT_ADDRESS ? formatAddress(CONTRACT_ADDRESS) : "Not deployed"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">{t("network")}</p>
          <p className="mt-1 text-ink-700">{NETWORK_NAME}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Version</p>
          <p className="mt-1 text-ink-700">v0.1 Prototype</p>
        </div>
      </div>
    </footer>
  );
}

