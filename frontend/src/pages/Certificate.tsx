import { ArrowLeft, CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CertificateCard } from "../components/CertificateCard";
import { useCopyright } from "../hooks/useCopyright";
import { useTranslation } from "../i18n";
import type { CopyrightRecord } from "../types/copyright";
import { formatCertificateId, getCertificateUrl, parseCertificateId } from "../utils/certificate";

export function Certificate() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const copyright = useCopyright();
  const [record, setRecord] = useState<CopyrightRecord | null>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadCertificate() {
    const numericId = parseCertificateId(id);

    if (!numericId) {
      setError(t("noBlockchainRecord"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [copyrightRecord, hash] = await Promise.all([
        copyright.getCopyright(numericId),
        copyright.getTransactionHashForId(numericId)
      ]);
      setRecord(copyrightRecord);
      setTransactionHash(hash);
    } catch (certificateError) {
      setError(certificateError instanceof Error ? certificateError.message : t("noBlockchainRecord"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCertificate();
  }, [id]);

  async function copyLink() {
    if (!record) {
      return;
    }

    await navigator.clipboard.writeText(getCertificateUrl(formatCertificateId(record.id)));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (loading) {
    return (
      <div className="page-shell flex min-h-[520px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-brand-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading certificate...
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="page-shell">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600" to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="panel mx-auto max-w-xl p-8 text-center">
          <CircleAlert className="mx-auto h-14 w-14 text-amber-500" />
          <h1 className="mt-4 text-2xl font-bold text-ink-900">{t("certificateNotFound")}</h1>
          <p className="mt-2 text-sm text-ink-500">{error || t("noBlockchainRecord")}</p>
          <button type="button" className="mt-6 btn-primary" onClick={() => navigate("/verify")}>
            {t("verify")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600" to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        {copied ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Link copied</span> : null}
      </div>
      <CertificateCard
        record={record}
        transactionHash={transactionHash}
        onCopyLink={() => void copyLink()}
        onVerify={() => void loadCertificate()}
      />
    </div>
  );
}

