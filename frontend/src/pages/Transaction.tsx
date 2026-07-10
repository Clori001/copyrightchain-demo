import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK_NAME } from "../contract/address";
import { getReadProvider } from "../hooks/useContract";
import { useTranslation } from "../i18n";
import { formatAddress, formatHash } from "../utils/formatAddress";

interface TransactionInfo {
  blockNumber: number | null;
  status: number | null;
}

export function Transaction() {
  const { hash = "" } = useParams();
  const { t } = useTranslation();
  const [info, setInfo] = useState<TransactionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTransaction() {
      setLoading(true);
      setError("");

      try {
        const provider = getReadProvider();
        const receipt = await provider.getTransactionReceipt(hash);

        if (active) {
          setInfo({
            blockNumber: receipt?.blockNumber ?? null,
            status: receipt?.status ?? null
          });
        }
      } catch (transactionError) {
        if (active) {
          setError(transactionError instanceof Error ? transactionError.message : "Unable to load transaction.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadTransaction();

    return () => {
      active = false;
    };
  }, [hash]);

  return (
    <div className="page-shell">
      <Link className="mb-5 inline-block text-sm font-semibold text-brand-600" to="/explorer">
        Back to All Works
      </Link>
      <section className="panel mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <CheckCircle2 className="h-8 w-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Transaction Confirmed</h1>
            <p className="mt-1 text-sm text-ink-500">Function: registerCopyright()</p>
          </div>
        </div>

        {error ? (
          <div className="mb-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <CircleAlert className="h-5 w-5 shrink-0" />
            Could not fetch live receipt. Showing local transaction details.
          </div>
        ) : null}

        <dl className="grid gap-4 text-sm">
          <Detail label={t("transactionHash")} value={hash || "Not available"} mono />
          <Detail label="Function" value="registerCopyright()" />
          <Detail label="Contract" value={`${CONTRACT_NAME} (${CONTRACT_ADDRESS ? formatAddress(CONTRACT_ADDRESS) : "Not deployed"})`} />
          <Detail label="Block" value={loading ? "Loading..." : info?.blockNumber ? String(info.blockNumber) : "Not available"} />
          <Detail label={t("network")} value={NETWORK_NAME} />
          <Detail label="Status" value={loading ? "Checking..." : info?.status === 0 ? "Failed" : "Confirmed ✓"} />
        </dl>

        <p className="mt-6 text-xs text-ink-500">
          Short hash: <span className="font-mono font-semibold text-ink-900">{formatHash(hash)}</span>
        </p>
      </section>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[170px_1fr]">
      <dt className="font-semibold text-ink-500">{label}</dt>
      <dd className={`break-all font-semibold text-ink-900 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
