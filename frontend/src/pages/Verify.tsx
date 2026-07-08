import { CheckCircle2, CircleAlert, Loader2, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCopyright } from "../hooks/useCopyright";
import { useTranslation } from "../i18n";
import type { CopyrightRecord } from "../types/copyright";
import { formatCertificateId, formatDate, parseCertificateId } from "../utils/certificate";
import { formatAddress, formatHash } from "../utils/formatAddress";

export function Verify() {
  const { id } = useParams();
  const { t } = useTranslation();
  const copyright = useCopyright();
  const [input, setInput] = useState(id || "CC-000001");
  const [record, setRecord] = useState<CopyrightRecord | null>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verifyCertificate(event?: FormEvent<HTMLFormElement>, certificateValue = input) {
    event?.preventDefault();
    const numericId = parseCertificateId(certificateValue);

    setRecord(null);
    setTransactionHash("");
    setError("");

    if (!numericId) {
      setError(t("noRecordFoundBody"));
      return;
    }

    setLoading(true);

    try {
      const [copyrightRecord, hash] = await Promise.all([
        copyright.getCopyright(numericId),
        copyright.getTransactionHashForId(numericId)
      ]);
      setRecord(copyrightRecord);
      setTransactionHash(hash);
    } catch {
      setError(t("noRecordFoundBody"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      setInput(id);
      void verifyCertificate(undefined, id);
    }
  }, [id]);

  return (
    <div className="page-shell">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink-900">{t("verify")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("verifyDescription")}</p>
      </div>

      <form className="panel flex flex-col gap-4 p-5 md:flex-row md:items-end" onSubmit={(event) => void verifyCertificate(event)}>
        <label className="flex-1">
          <span className="label">{t("certificateId")}</span>
          <input className="input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="CC-000001" />
        </label>
        <button type="submit" className="btn-primary min-w-32" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Verify
        </button>
      </form>

      <div className="mt-5">
        {loading ? (
          <div className="panel flex min-h-40 items-center justify-center gap-3 p-8 text-sm font-semibold text-brand-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking blockchain record...
          </div>
        ) : record ? (
          <section className="panel p-6">
            <div className="mb-5 flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                  record.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {record.approved ? <CheckCircle2 className="h-8 w-8" /> : <CircleAlert className="h-8 w-8" />}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${record.approved ? "text-emerald-700" : "text-amber-700"}`}>
                  {record.approved ? t("verified") : t("pendingReview")}
                </h2>
                <p className="text-sm text-ink-500">
                  {record.approved
                    ? "This certificate is valid, approved, and exists on the blockchain."
                    : "This application exists on chain but is waiting for reviewer approval."}
                </p>
              </div>
            </div>
            <dl className="grid gap-4 text-sm md:grid-cols-2">
              <VerifyRow label={t("certificateId")} value={formatCertificateId(record.id)} />
              <VerifyRow label={t("workTitle")} value={record.title} />
              <VerifyRow label="Creator Wallet" value={formatAddress(record.creator)} />
              <VerifyRow label={t("timestamp")} value={formatDate(record.timestamp)} />
              <VerifyRow label="Review Status" value={record.approved ? t("approved") : t("pendingReview")} />
              <VerifyRow label={t("fileHash")} value={formatHash(record.fileHash)} />
              <VerifyRow label={t("transactionHash")} value={transactionHash ? formatHash(transactionHash) : "Pending explorer lookup"} />
            </dl>
            <div className="mt-6 rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm text-ink-500">
              You can view this record on the blockchain explorer.
              <Link className="ml-3 font-semibold text-brand-600" to="/explorer">
                {t("viewExplorer")}
              </Link>
            </div>
          </section>
        ) : error ? (
          <div className="panel flex items-start gap-3 p-6 text-amber-800">
            <CircleAlert className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <h2 className="font-bold">{t("noRecordFound")}</h2>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function VerifyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="break-words font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
