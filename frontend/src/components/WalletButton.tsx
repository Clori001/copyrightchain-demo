import { CheckCircle2, ChevronDown, Wallet } from "lucide-react";
import { useState } from "react";
import { CHAIN_ID, NETWORK_NAME } from "../contract/address";
import { useTranslation } from "../i18n";
import { useWallet } from "../hooks/useWallet";
import { formatAddress } from "../utils/formatAddress";

export function WalletButton() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const [open, setOpen] = useState(false);

  if (!wallet.isConnected) {
    return (
      <button type="button" className="btn-primary px-4 py-2 text-xs" onClick={() => void wallet.connectWallet()}>
        <Wallet className="h-4 w-4" aria-hidden="true" />
        {t("connectWallet")}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="btn-primary px-4 py-2 text-xs"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {formatAddress(wallet.account)}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-soft">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Wallet Address</p>
          <p className="break-all font-mono text-ink-900">{wallet.account}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{t("network")}</p>
              <p className="mt-1 font-semibold text-ink-900">{NETWORK_NAME}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Chain ID</p>
              <p className="mt-1 font-semibold text-ink-900">{wallet.chainId ?? "Unknown"}</p>
            </div>
          </div>
          {!wallet.isCorrectNetwork ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <p className="font-semibold">{t("wrongNetwork")}</p>
              <p className="mt-1 text-xs">
                Expected {NETWORK_NAME} ({CHAIN_ID}).
              </p>
              <button type="button" className="mt-3 btn-secondary px-3 py-1.5 text-xs" onClick={() => void wallet.switchNetwork()}>
                {t("switchNetwork")}
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              Connected ✓
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

