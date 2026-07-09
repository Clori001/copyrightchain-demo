import { Clock3, Copy, ShieldCheck } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { ReactNode } from "react";
import logo from "../assets/logo.svg";
import { CONTRACT_ADDRESS, NETWORK_NAME } from "../contract/address";
import { useTranslation } from "../i18n";
import type { CopyrightRecord } from "../types/copyright";
import { formatCertificateId, formatDate, getCertificateUrl } from "../utils/certificate";
import { formatAddress, formatHash } from "../utils/formatAddress";
import { VerificationBadge } from "./VerificationBadge";

interface CertificateCardProps {
  record: CopyrightRecord;
  transactionHash?: string;
  onCopyLink?: () => void;
  onVerify?: () => void;
}

export function CertificateCard({ record, transactionHash, onCopyLink, onVerify }: CertificateCardProps) {
  const { t } = useTranslation();
  const certificateId = formatCertificateId(record.id);
  const certificateUrl = getCertificateUrl(certificateId);

  async function copyAddress() {
    await navigator.clipboard.writeText(record.creator);
  }

  async function copyHash() {
    await navigator.clipboard.writeText(record.fileHash);
  }

  return (
    <section className="certificate-paper rounded-xl border-4 border-double border-[#2b4774] p-5 shadow-soft sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CopyrightChain logo" className="h-9 w-9" />
            <span className="font-bold text-ink-900">CopyrightChain</span>
          </div>
          {record.approved ? <VerificationBadge compact /> : <PendingBadge />}
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-ink-900 sm:text-4xl">{t("digitalCertificate")}</h1>
          <p
            className={`mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] ${
              record.approved ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            {record.approved ? t("verifiedOnChain") : t("pendingReview")}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <InfoSection title={t("copyrightInformation")}>
            <InfoRow label={t("certificateId")} value={certificateId} />
            <InfoRow label={t("workTitle")} value={record.title} />
            <InfoRow label={t("creator")} value={formatAddress(record.creator)}>
              <button type="button" className="text-brand-600" onClick={() => void copyAddress()}>
                <Copy className="h-4 w-4" aria-label="Copy address" />
              </button>
            </InfoRow>
            <InfoRow label={t("category")} value={record.category} />
            <InfoRow label={t("registeredDate")} value={formatDate(record.timestamp)} />
            <InfoRow label="Review Status" value={record.approved ? t("approved") : t("pendingReview")} />
            {record.approvedAt ? <InfoRow label="Approved At" value={formatDate(record.approvedAt)} /> : null}
          </InfoSection>

          <InfoSection title={t("blockchainProof")}>
            <InfoRow label={t("network")} value={NETWORK_NAME} />
            <InfoRow label={t("smartContract")} value={CONTRACT_ADDRESS ? formatAddress(CONTRACT_ADDRESS) : "Not deployed"} />
            <InfoRow label={t("transactionHash")} value={transactionHash ? formatHash(transactionHash) : "Pending explorer lookup"} />
            <InfoRow label={t("fileHash")} value={formatHash(record.fileHash)}>
              <button type="button" className="text-brand-600" onClick={() => void copyHash()}>
                <Copy className="h-4 w-4" aria-label="Copy file hash" />
              </button>
            </InfoRow>
          </InfoSection>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          <div className="rounded-lg border border-slate-200 bg-white/80 p-4">
            <p className="text-sm leading-6 text-ink-500">
              {record.approved
                ? "This certificate proves that the above digital work has been reviewed, approved, and registered on the blockchain."
                : "This application has been submitted on chain and is waiting for reviewer approval before it becomes a verified certificate."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={onVerify}>
                {t("verifyOnChain")}
              </button>
              <button type="button" className="btn-secondary" onClick={onCopyLink}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                {t("copyCertificateLink")}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="mb-3 text-xs font-bold text-ink-700">{t("scanToVerify")}</p>
            <QRCodeCanvas value={certificateUrl} size={150} level="M" includeMargin />
          </div>
        </div>
      </div>
    </section>
  );
}

function PendingBadge() {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
      <Clock3 className="h-4 w-4" aria-hidden="true" />
      {t("pendingReview")}
    </span>
  );
}

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/82 p-4">
      <h2 className="mb-3 text-sm font-bold text-ink-900">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  children
}: {
  label: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="flex min-w-0 items-center gap-2 font-medium text-ink-900">
        <span className="min-w-0 break-words">{value}</span>
        {children}
      </span>
    </div>
  );
}
