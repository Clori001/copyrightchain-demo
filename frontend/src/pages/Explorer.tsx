import { CircleAlert, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CONTRACT_ADDRESS, CONTRACT_NAME, EXPLORER_URL, NETWORK_NAME, isContractConfigured } from "../contract/address";
import { useCopyright } from "../hooks/useCopyright";
import { useTranslation } from "../i18n";
import type { CopyrightRecord } from "../types/copyright";
import { formatCertificateId, formatDate } from "../utils/certificate";
import { formatAddress, formatHash } from "../utils/formatAddress";

const PUBLIC_CERTIFICATE_LIMIT = 50;

interface ExplorerRecord extends CopyrightRecord {
  transactionHash: string;
}

export function Explorer() {
  const { t } = useTranslation();
  const copyright = useCopyright();
  const [totalWorks, setTotalWorks] = useState(0);
  const [records, setRecords] = useState<ExplorerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadExplorer() {
      setLoading(true);
      const count = await copyright.getTotalWorks().catch(() => 0);
      const ids = Array.from({ length: Math.min(count, PUBLIC_CERTIFICATE_LIMIT) }, (_, index) => count - index);
      const detailedRecords = await Promise.all(
        ids.map(async (id) => {
          try {
            const record = await copyright.getCopyright(id);

            if (!record.approved) {
              return null;
            }

            const transactionHash = await copyright.getTransactionHashForId(id).catch(() => "");
            return { ...record, transactionHash };
          } catch {
            return null;
          }
        })
      );

      if (active) {
        setTotalWorks(count);
        setRecords(detailedRecords.filter((record): record is ExplorerRecord => Boolean(record)).sort((a, b) => b.id - a.id));
        setLoading(false);
      }
    }

    void loadExplorer();

    return () => {
      active = false;
    };
  }, []);

  const latestRegistration = records[0] ? formatDate(records[0].timestamp) : t("noPublicCertificatesYet");

  async function copyAddress() {
    if (CONTRACT_ADDRESS) {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    }
  }

  return (
    <div className="page-shell">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink-900">{t("discoverTitle")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("explorerDescription")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">{t("contractInformation")}</h2>
          <div className="grid gap-4 text-sm">
            <InfoLine label={t("contractName")} value={CONTRACT_NAME} />
            <InfoLine label={t("network")} value={NETWORK_NAME} />
            <div className="grid grid-cols-[150px_1fr] gap-3">
              <span className="text-ink-500">{t("contractAddress")}</span>
              <span className="flex min-w-0 items-center gap-2 font-semibold text-ink-900">
                <span className="min-w-0 break-all font-mono">
                  {CONTRACT_ADDRESS || "Not deployed"}
                </span>
                {CONTRACT_ADDRESS ? (
                  <button type="button" className="text-brand-600" onClick={() => void copyAddress()}>
                    <Copy className="h-4 w-4" aria-label="Copy contract address" />
                  </button>
                ) : null}
              </span>
            </div>
            <InfoLine label="Status" value={isContractConfigured ? "Active ✓" : "Not deployed"} />
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">Statistics</h2>
          <div className="grid gap-3">
            <Stat label={t("totalWorks")} value={String(totalWorks)} />
            <Stat label={t("latestRegistration")} value={latestRegistration} />
            <Stat label="Current Network" value={NETWORK_NAME} />
          </div>
        </section>
      </div>

      <section className="panel mt-5 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-ink-900">{t("publicCertificates")}</h2>
          {loading ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading
            </span>
          ) : null}
        </div>

        {!isContractConfigured ? (
          <div className="flex items-center gap-3 p-5 text-sm text-amber-700">
            <CircleAlert className="h-5 w-5" />
            Contract address is not configured. Deploy the contract first to load on-chain records.
          </div>
        ) : records.length ? (
          <>
          <div className="divide-y divide-slate-100 md:hidden">
            {records.map((record) => (
              <article key={record.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link className="font-mono text-sm font-bold text-brand-600" to={`/certificate/${formatCertificateId(record.id)}`}>
                      {formatCertificateId(record.id)}
                    </Link>
                    <h3 className="mt-2 truncate text-lg font-bold text-ink-900">{record.title}</h3>
                    <p className="mt-1 text-sm text-ink-500">{record.category}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                    {t("approved")}
                  </span>
                </div>
                <dl className="mt-4 grid gap-2 text-sm">
                  <InfoLine label={t("creator")} value={formatAddress(record.creator)} />
                  <InfoLine label={t("registeredDate")} value={formatDate(record.timestamp)} />
                  <InfoLine label={t("transaction")} value={record.transactionHash ? formatHash(record.transactionHash, 8, 6) : "Unavailable"} />
                </dl>
                <Link className="mt-4 inline-flex btn-secondary px-3 py-1.5 text-xs" to={`/certificate/${formatCertificateId(record.id)}`}>
                  {t("viewCertificate")}
                </Link>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-ink-500">
                <tr>
                  <th className="px-5 py-3">{t("certificateId")}</th>
                  <th className="px-5 py-3">{t("workTitle")}</th>
                  <th className="px-5 py-3">{t("category")}</th>
                  <th className="px-5 py-3">{t("creator")}</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">{t("timestamp")}</th>
                  <th className="px-5 py-3">{t("transaction")}</th>
                  <th className="px-5 py-3">{t("certificate")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-5 py-4">
                      <Link className="font-mono font-semibold text-brand-600" to={`/certificate/${formatCertificateId(record.id)}`}>
                        {formatCertificateId(record.id)}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-ink-900">{record.title}</td>
                    <td className="px-5 py-4 text-ink-500">{record.category}</td>
                    <td className="px-5 py-4 font-mono text-ink-500">{formatAddress(record.creator)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-bold ${
                          record.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {record.approved ? t("approved") : t("pendingReview")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-500">{formatDate(record.timestamp)}</td>
                    <td className="px-5 py-4">
                      {record.transactionHash && EXPLORER_URL ? (
                        <a
                          className="inline-flex items-center gap-1 font-mono font-semibold text-brand-600"
                          href={`${EXPLORER_URL.replace(/\/$/, "")}/tx/${record.transactionHash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatHash(record.transactionHash, 8, 6)}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : record.transactionHash ? (
                        <Link className="font-mono font-semibold text-brand-600" to={`/transaction/${record.transactionHash}`}>
                          {formatHash(record.transactionHash, 8, 6)}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-ink-400">Unavailable</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link className="btn-secondary px-3 py-1.5 text-xs" to={`/certificate/${formatCertificateId(record.id)}`}>
                        {t("viewCertificate")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <div className="p-8 text-center text-sm text-ink-500">{t("noPublicCertificatesYet")}</div>
        )}
      </section>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3">
      <span className="text-ink-500">{label}</span>
      <span className="break-words font-semibold text-ink-900">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className="mt-2 font-bold text-ink-900">{value}</p>
    </div>
  );
}
