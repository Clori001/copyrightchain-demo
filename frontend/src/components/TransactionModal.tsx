import { CircleAlert, Loader2, X } from "lucide-react";
import { NETWORK_NAME } from "../contract/address";
import { useTranslation } from "../i18n";
import type { TransactionStage } from "../types/copyright";
import { formatHash } from "../utils/formatAddress";

interface TransactionModalProps {
  open: boolean;
  stage: TransactionStage;
  transactionHash?: string;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TransactionModal({
  open,
  stage,
  transactionHash,
  error,
  onCancel,
  onConfirm
}: TransactionModalProps) {
  const { t } = useTranslation();

  if (!open) {
    return null;
  }

  const busy = stage === "wallet" || stage === "submitted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/45 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink-900">{t("confirmTransaction")}</h2>
            <p className="mt-2 text-sm text-ink-500">{t("confirmTransactionBody")}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">{t("network")}</span>
            <span className="font-semibold text-ink-900">{NETWORK_NAME}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Estimated Gas</span>
            <span className="font-semibold text-ink-900">0 testnet ETH</span>
          </div>
          {transactionHash ? (
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">{t("transactionHash")}</span>
              <span className="font-mono font-semibold text-ink-900">{formatHash(transactionHash, 8, 8)}</span>
            </div>
          ) : null}
        </div>

        {stage === "wallet" ? (
          <StatusLine text={t("walletApproval")} />
        ) : stage === "submitted" ? (
          <StatusLine text={t("txSubmitted")} />
        ) : null}

        {error ? (
          <div className="mt-4 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <CircleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
            {t("cancel")}
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusLine({ text }: { text: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-md border border-brand-100 bg-brand-50 p-3 text-sm font-semibold text-brand-700">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {text}
    </div>
  );
}

