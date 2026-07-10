import { CircleAlert, Loader2, RefreshCcw, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WorkPreview } from "../components/WorkPreview";
import { isContractConfigured, isReviewerAddress, REVIEWER_ADDRESS } from "../contract/address";
import { useCopyright } from "../hooks/useCopyright";
import { useWallet } from "../hooks/useWallet";
import { useTranslation } from "../i18n";
import type { CopyrightRecord, TransactionStage, WebsiteApplication } from "../types/copyright";
import { formatCertificateId, formatDate } from "../utils/certificate";
import { formatAddress, formatHash } from "../utils/formatAddress";
import { hideCertificateFromSite, listHiddenCertificateIds } from "../utils/hiddenCertificates";
import {
  getPreview,
  getWebsiteApplications,
  saveLocalRecord,
  saveApprovalTransactionHash,
  savePreview,
  saveTransactionHash,
  updateWebsiteApplication
} from "../utils/localPreview";
import {
  isSupabaseConfigured,
  listSupabaseApplications,
  updateSupabaseApplication
} from "../utils/supabaseApplications";

export function Review() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const copyright = useCopyright();
  const [pendingRecords, setPendingRecords] = useState<CopyrightRecord[]>([]);
  const [allRecords, setAllRecords] = useState<CopyrightRecord[]>([]);
  const [hiddenCertificateIds, setHiddenCertificateIds] = useState<number[]>([]);
  const [websiteApplications, setWebsiteApplications] = useState<WebsiteApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [stage, setStage] = useState<TransactionStage>("idle");
  const [error, setError] = useState("");

  const isReviewer = isReviewerAddress(wallet.account);

  async function loadReviewQueue() {
    if (!wallet.isConnected || !isReviewerAddress(wallet.account)) {
      setPendingRecords([]);
      setAllRecords([]);
      setWebsiteApplications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSupabaseConfigured) {
        setWebsiteApplications(await listSupabaseApplications());
      } else {
        setWebsiteApplications(getWebsiteApplications());
      }
    } catch (applicationsError) {
      setError(applicationsError instanceof Error ? applicationsError.message : "Unable to load website applications.");
    }

    try {
      const hiddenIds = await listHiddenCertificateIds();
      setHiddenCertificateIds(hiddenIds);

      if (isContractConfigured) {
        const totalWorks = await copyright.getTotalWorks();
        const ids = Array.from({ length: Math.min(totalWorks, 100) }, (_, index) => totalWorks - index);
        const records = await Promise.all(
          ids.map(async (id) => {
            try {
              return await copyright.getCopyright(id);
            } catch {
              return null;
            }
          })
        );
        const loadedRecords = records.filter((record): record is CopyrightRecord => Boolean(record)).sort((a, b) => b.id - a.id);
        setAllRecords(loadedRecords);
        setPendingRecords(
          loadedRecords.filter((record) => !record.approved && !hiddenIds.includes(record.id))
        );
      }
    } catch (queueError) {
      setError(queueError instanceof Error ? queueError.message : "Unable to load review queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReviewQueue();
  }, [wallet.account]);

  async function approveOnChain(record: CopyrightRecord) {
    setError("");
    setProcessingId(`chain-${record.id}`);

    try {
      const hash = await copyright.approveCopyright(record.id, (nextStage) => setStage(nextStage));
      saveApprovalTransactionHash(record.id, hash);
      const updatedRecord = await copyright.getCopyright(record.id);
      saveLocalRecord(updatedRecord);
      await loadReviewQueue();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Approval failed.");
    } finally {
      setProcessingId("");
      setStage("idle");
    }
  }

  async function approveWebsiteApplication(application: WebsiteApplication) {
    setError("");
    setProcessingId(`website-${application.localId}`);

    try {
      const result = await copyright.registerCopyright(
        {
          title: application.title,
          category: application.category,
          description: application.description,
          externalURL: application.externalURL,
          fileHash: application.fileHash
        },
        (nextStage) => setStage(nextStage)
      );

      const approvalHash = await copyright.approveCopyright(result.certificateId, (nextStage) => setStage(nextStage));

      saveTransactionHash(result.certificateId, result.transactionHash);
      saveApprovalTransactionHash(result.certificateId, approvalHash);
      savePreview({
        id: result.certificateId,
        fileName: application.fileName,
        fileType: application.fileType,
        fileSize: application.fileSize,
        dataUrl: application.previewDataUrl
      });

      const record = await copyright.getCopyright(result.certificateId);
      saveLocalRecord({ ...record, transactionHash: result.transactionHash });
      if (application.storage === "supabase") {
        await updateSupabaseApplication(application.localId, {
          status: "approved",
          certificateId: result.certificateId,
          transactionHash: result.transactionHash,
          reviewerWallet: wallet.account
        });
      } else {
        updateWebsiteApplication(application.localId, {
          status: "approved",
          certificateId: result.certificateId,
          transactionHash: result.transactionHash
        });
      }

      await loadReviewQueue();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Approval failed.");
    } finally {
      setProcessingId("");
      setStage("idle");
    }
  }

  async function rejectWebsiteApplication(application: WebsiteApplication) {
    if (!window.confirm(t("confirmReject"))) {
      return;
    }

    setError("");
    setProcessingId(`reject-${application.localId}`);

    try {
      if (application.storage === "supabase") {
        await updateSupabaseApplication(application.localId, {
          status: "rejected",
          reviewerWallet: wallet.account
        });
      } else {
        updateWebsiteApplication(application.localId, {
          status: "rejected"
        });
      }

      await loadReviewQueue();
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : "Reject failed.");
    } finally {
      setProcessingId("");
      setStage("idle");
    }
  }

  async function hideCertificate(record: CopyrightRecord) {
    if (!window.confirm(t("confirmHideCertificate"))) {
      return;
    }

    setError("");
    setProcessingId(`hide-${record.id}`);

    try {
      await hideCertificateFromSite(record.id, wallet.account);
      await loadReviewQueue();
    } catch (hideError) {
      setError(hideError instanceof Error ? hideError.message : "Unable to hide certificate.");
    } finally {
      setProcessingId("");
      setStage("idle");
    }
  }

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">{t("reviewCenter")}</h1>
          <p className="mt-2 text-sm text-ink-500">
            {t("reviewerOnly")} {formatAddress(REVIEWER_ADDRESS)}
          </p>
        </div>
        <button type="button" className="btn-secondary px-4 py-2 text-xs" onClick={() => void loadReviewQueue()} disabled={loading}>
          <RefreshCcw className="h-4 w-4" />
          {t("refresh")}
        </button>
      </div>

      {!wallet.isConnected ? (
        <LockedReview
          title={t("connectReviewerWallet")}
          description={`Reviewer wallet: ${formatAddress(REVIEWER_ADDRESS)}`}
          actionLabel={t("connectWallet")}
          onAction={() => void wallet.connectWallet()}
        />
      ) : !isReviewer ? (
        <LockedReview
          title={t("wrongReviewerWallet")}
          description={`Current: ${formatAddress(wallet.account)}. Expected: ${formatAddress(REVIEWER_ADDRESS)}.`}
        />
      ) : null}

      {isReviewer && !isContractConfigured ? (
        <div className="mb-5">
          <Notice text={t("contractNotDeployedReview")} />
          <Link className="mt-3 inline-flex btn-primary" to="/admin/deploy">
            {t("deploy")}
          </Link>
        </div>
      ) : null}

      {isReviewer && error ? <Notice text={error} danger /> : null}
      {isReviewer && processingId ? (
        <div className="mb-5 rounded-md border border-brand-100 bg-brand-50 p-3 text-sm font-semibold text-brand-700">
          {stage === "wallet" ? t("walletApproval") : stage === "submitted" ? t("txSubmitted") : "Processing..."}
        </div>
      ) : null}

      {isReviewer ? (
        <>
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-bold text-ink-900">{t("onchainPendingApplications")}</h2>
            {loading ? (
              <div className="panel flex min-h-32 items-center justify-center gap-3 p-5 text-sm font-semibold text-brand-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading review queue...
              </div>
            ) : pendingRecords.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {pendingRecords.map((record) => (
                  <article key={record.id} className="panel grid gap-4 p-4 sm:grid-cols-[130px_1fr]">
                    <WorkPreview category={record.category} preview={getPreview(record.id)} alt={record.title} size="sm" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-ink-900">{record.title}</h3>
                      <p className="mt-1 text-sm text-ink-500">
                        {formatCertificateId(record.id)} · {record.category} · {formatDate(record.timestamp)}
                      </p>
                      <p className="mt-2 break-all text-xs text-ink-500">Hash: {formatHash(record.fileHash)}</p>
                      <p className="mt-1 text-xs text-ink-500">Creator: {formatAddress(record.creator)}</p>
                      <button
                        type="button"
                        className="mt-4 btn-primary px-4 py-2 text-xs"
                        disabled={processingId === `chain-${record.id}`}
                        onClick={() => void approveOnChain(record)}
                      >
                        {processingId === `chain-${record.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        {t("approve")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel p-5 text-sm text-ink-500">{t("noOnchainPending")}</div>
            )}
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-lg font-bold text-ink-900">
              {t("websiteWallet")} · {isSupabaseConfigured ? "Supabase Applications" : t("localApplications")}
            </h2>
            {websiteApplications.filter((application) => application.status === "pending").length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {websiteApplications
                  .filter((application) => application.status === "pending")
                  .map((application) => (
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
                        <h3 className="font-bold text-ink-900">{application.title}</h3>
                        <p className="mt-1 text-sm text-ink-500">
                          Local ID {application.localId.slice(0, 8)} · {application.category}
                        </p>
                        <p className="mt-2 break-all text-xs text-ink-500">Hash: {formatHash(application.fileHash)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn-primary px-4 py-2 text-xs"
                            disabled={!isContractConfigured || Boolean(processingId)}
                            onClick={() => void approveWebsiteApplication(application)}
                          >
                            {processingId === `website-${application.localId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                            {t("approveAndRegister")}
                          </button>
                          <button
                            type="button"
                            className="btn-danger px-4 py-2 text-xs"
                            disabled={Boolean(processingId)}
                            onClick={() => void rejectWebsiteApplication(application)}
                          >
                            {processingId === `reject-${application.localId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            {t("reject")}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="panel p-5 text-sm text-ink-500">{t("noLocalPending")}</div>
            )}
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-lg font-bold text-ink-900">{t("allWorksManagement")}</h2>
              <p className="mt-1 text-xs leading-5 text-ink-500">{t("allWorksManagementHint")}</p>
            </div>
            {allRecords.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {allRecords.map((record) => {
                  const hidden = hiddenCertificateIds.includes(record.id);

                  return (
                    <article key={record.id} className="panel grid gap-4 p-4 sm:grid-cols-[130px_1fr]">
                      <WorkPreview category={record.category} preview={getPreview(record.id)} alt={record.title} size="sm" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-ink-900">{record.title}</h3>
                            <p className="mt-1 text-sm text-ink-500">
                              {formatCertificateId(record.id)} · {record.category} · {formatDate(record.timestamp)}
                            </p>
                          </div>
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-bold ${
                              hidden
                                ? "bg-red-50 text-red-700"
                                : record.approved
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {hidden ? t("hiddenFromSite") : record.approved ? t("approved") : t("pendingReview")}
                          </span>
                        </div>
                        <p className="mt-2 break-all text-xs text-ink-500">Hash: {formatHash(record.fileHash)}</p>
                        <p className="mt-1 text-xs text-ink-500">Creator: {formatAddress(record.creator)}</p>
                        <button
                          type="button"
                          className="mt-4 btn-danger px-4 py-2 text-xs"
                          disabled={hidden || Boolean(processingId)}
                          onClick={() => void hideCertificate(record)}
                        >
                          {processingId === `hide-${record.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          {hidden ? t("hiddenFromSite") : t("hideFromSite")}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="panel p-5 text-sm text-ink-500">{t("noManagedWorks")}</div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function Notice({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div className={`mb-5 flex items-start gap-3 rounded-md border p-3 text-sm ${danger ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      {text}
    </div>
  );
}

function LockedReview({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="panel mx-auto max-w-xl p-8 text-center">
      <ShieldCheck className="mx-auto h-12 w-12 text-brand-600" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-bold text-ink-900">{title}</h2>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="mt-5 btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
