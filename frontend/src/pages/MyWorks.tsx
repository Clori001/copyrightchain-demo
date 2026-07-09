import { CircleAlert, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import emptyPortfolio from "../assets/empty-portfolio.svg";
import { WorkPreview } from "../components/WorkPreview";
import { isContractConfigured } from "../contract/address";
import { useCopyright } from "../hooks/useCopyright";
import { useWallet } from "../hooks/useWallet";
import { useTranslation } from "../i18n";
import type { CopyrightRecord, WebsiteApplication, WebsiteApplicationStatus } from "../types/copyright";
import { formatCertificateId, formatDate } from "../utils/certificate";
import { getPreview, getWebsiteApplications } from "../utils/localPreview";

const filters = ["All Works", "Photography", "Image", "Music", "Writing", "Code", "Design", "Other"];

export function MyWorks() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const copyright = useCopyright();
  const [records, setRecords] = useState<CopyrightRecord[]>([]);
  const [filter, setFilter] = useState("All Works");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [websiteApplications, setWebsiteApplications] = useState<WebsiteApplication[]>([]);

  const filteredRecords = useMemo(() => {
    if (filter === "All Works") {
      return records;
    }

    return records.filter((record) => record.category === filter);
  }, [filter, records]);

  async function loadRecords() {
    setWebsiteApplications(getWebsiteApplications());

    if (!wallet.isConnected || !isContractConfigured) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ids = await copyright.getMyCopyrights();
      const loadedRecords = await Promise.all(ids.map((id) => copyright.getCopyright(id)));
      setRecords(loadedRecords.sort((a, b) => b.id - a.id));
    } catch (recordsError) {
      setError(recordsError instanceof Error ? recordsError.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, [wallet.account]);

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">{t("myRecords")}</h1>
          <p className="mt-2 text-sm text-ink-500">{t("myRecordsSubtitle")}</p>
        </div>
        <button type="button" className="btn-secondary px-4 py-2 text-xs" onClick={() => void loadRecords()} disabled={!wallet.isConnected || loading}>
          <RefreshCcw className="h-4 w-4" />
          {t("refresh")}
        </button>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {filters.map((item) => (
          <button
            type="button"
            key={item}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${
              filter === item ? "border-brand-600 text-brand-600" : "border-transparent text-ink-500"
            }`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {websiteApplications.length ? (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-ink-900">{t("websiteWallet")} · {t("browserApplications")}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {websiteApplications.map((application) => (
              <article key={application.localId} className="panel grid gap-4 p-4 sm:grid-cols-[130px_1fr]">
                <WorkPreview
                  category={application.category}
                  preview={{
                    id: 0,
                    fileName: application.fileName,
                    fileType: application.fileType,
                    fileSize: application.fileSize,
                    dataUrl: application.previewDataUrl
                  }}
                  alt={application.title}
                  size="sm"
                />
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-ink-900">{application.title}</h3>
                  <p className="mt-1 text-sm text-ink-500">{application.category}</p>
                  <p className="mt-2 text-xs text-ink-500">Local ID: {application.localId.slice(0, 8)}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <ApplicationStatusBadge status={application.status} />
                    {application.certificateId ? (
                      <Link className="btn-secondary px-3 py-1.5 text-xs" to={`/certificate/${formatCertificateId(application.certificateId)}`}>
                        {t("viewCertificate")}
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-ink-500">
                        {application.status === "rejected" ? t("rejected") : t("waitingReviewer")}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mb-3">
        <h2 className="text-lg font-bold text-ink-900">{t("onchainWalletRecords")}</h2>
        <p className="mt-1 text-xs leading-5 text-ink-500">{t("onchainWalletRecordsHint")}</p>
      </div>

      {!isContractConfigured ? (
        <Notice text="Contract address is not configured. Deploy the contract first to read wallet records." />
      ) : !wallet.isConnected ? (
        <Notice text="Wallet Not Connected. Connect your wallet to read your blockchain records." />
      ) : loading ? (
        <div className="panel flex min-h-48 items-center justify-center gap-3 p-8 text-sm font-semibold text-brand-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("loadingRecords")}
        </div>
      ) : error ? (
        <Notice text={error} danger />
      ) : filteredRecords.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecords.map((record) => (
            <article key={record.id} className="panel grid gap-4 p-4 sm:grid-cols-[130px_1fr]">
              <WorkPreview category={record.category} preview={getPreview(record.id)} alt={record.title} size="sm" />
              <div className="min-w-0">
                <h2 className="truncate font-bold text-ink-900">{record.title}</h2>
                <p className="mt-1 text-sm text-ink-500">{record.category}</p>
                <dl className="mt-3 grid gap-1 text-xs text-ink-500">
                  <div className="flex justify-between gap-3">
                    <dt>{t("certificateId")}</dt>
                    <dd className="font-semibold text-ink-900">{formatCertificateId(record.id)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t("registeredDate")}</dt>
                    <dd className="font-semibold text-ink-900">{formatDate(record.timestamp).slice(0, 10)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <ChainStatusBadge approved={record.approved} />
                  <Link className="btn-secondary px-3 py-1.5 text-xs" to={`/certificate/${formatCertificateId(record.id)}`}>
                    {t("viewCertificate")}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
          <img src={emptyPortfolio} alt="Empty portfolio" className="h-36 w-auto" />
          <h2 className="mt-4 text-lg font-bold text-ink-900">{t("noRecords")}</h2>
          <p className="mt-1 text-sm text-ink-500">{t("startFirst")}</p>
          <Link className="mt-5 btn-primary" to="/register">
            {t("register")}
          </Link>
        </div>
      )}
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: WebsiteApplicationStatus }) {
  const { t } = useTranslation();

  const className =
    status === "approved"
      ? "bg-emerald-50 text-emerald-700"
      : status === "rejected"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  const label = status === "approved" ? t("approved") : status === "rejected" ? t("rejected") : t("pendingReview");

  return <span className={`rounded-md px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
}

function ChainStatusBadge({ approved }: { approved: boolean }) {
  const { t } = useTranslation();

  return (
    <span
      className={`rounded-md px-3 py-1 text-xs font-bold ${
        approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {approved ? t("approved") : t("pendingReview")}
    </span>
  );
}

function Notice({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div className={`panel flex items-center gap-3 p-5 text-sm ${danger ? "text-red-700" : "text-amber-700"}`}>
      <CircleAlert className="h-5 w-5 shrink-0" />
      {text}
    </div>
  );
}
