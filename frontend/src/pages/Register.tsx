import { CheckCircle2, CloudUpload, Info, Loader2, Wallet } from "lucide-react";
import { ChangeEvent, DragEvent, FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashDisplay } from "../components/HashDisplay";
import { TransactionModal } from "../components/TransactionModal";
import { WorkPreview } from "../components/WorkPreview";
import { CONTRACT_ADDRESS, NETWORK_NAME, isContractConfigured } from "../contract/address";
import { useCopyright } from "../hooks/useCopyright";
import { useWallet } from "../hooks/useWallet";
import { useTranslation } from "../i18n";
import type { TransactionStage } from "../types/copyright";
import { formatCertificateId } from "../utils/certificate";
import { formatAddress, formatHash } from "../utils/formatAddress";
import { formatFileSize, generateFileHash } from "../utils/hashFile";
import {
  fileToPreview,
  saveLocalRecord,
  savePreview,
  saveTransactionHash,
  saveWebsiteApplication
} from "../utils/localPreview";
import { isSupabaseConfigured, saveSupabaseApplication } from "../utils/supabaseApplications";

const categories = ["Photography", "Image", "Music", "Writing", "Code", "Design", "Other"];
type SubmissionMode = "wallet" | "website";

export function Register() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const copyright = useCopyright();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | undefined>();
  const [fileHash, setFileHash] = useState("");
  const [hashing, setHashing] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [externalURL, setExternalURL] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [stage, setStage] = useState<TransactionStage>("idle");
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState<number | null>(null);
  const [websiteSuccessId, setWebsiteSuccessId] = useState("");
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>("website");
  const [submittingWebsiteApplication, setSubmittingWebsiteApplication] = useState(false);

  const hasRequiredFields = Boolean(file && fileHash && title.trim() && category);
  const canRegister = Boolean(
    hasRequiredFields &&
      (submissionMode === "website" || (isContractConfigured && wallet.isConnected && wallet.isCorrectNetwork))
  );

  const filePreview = useMemo(
    () =>
      file
        ? {
            id: 0,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            dataUrl: previewDataUrl
          }
        : null,
    [file, previewDataUrl]
  );

  async function handleSelectedFile(selectedFile: File) {
    setFile(selectedFile);
    setFileHash("");
    setHashing(true);
    setError("");
    setSuccessId(null);
    setWebsiteSuccessId("");
    setTransactionHash("");
    setStage("idle");

    try {
      const [hash, preview] = await Promise.all([
        generateFileHash(selectedFile),
        fileToPreview(selectedFile).catch(() => undefined)
      ]);
      setFileHash(hash);
      setPreviewDataUrl(preview);
    } catch (hashError) {
      setError(hashError instanceof Error ? hashError.message : "Unable to generate file hash.");
    } finally {
      setHashing(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      void handleSelectedFile(selectedFile);
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0];

    if (selectedFile) {
      void handleSelectedFile(selectedFile);
    }
  }

  async function openTransactionModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setWebsiteSuccessId("");

    if (submissionMode === "website") {
      await submitWebsiteApplication();
      return;
    }

    if (!wallet.isConnected) {
      const connectedAccount = await wallet.connectWallet();

      if (!connectedAccount) {
        return;
      }
    }

    setModalOpen(true);
  }

  async function submitWebsiteApplication() {
    if (!file || !fileHash) {
      return;
    }

    setSubmittingWebsiteApplication(true);
    const application = {
      title,
      category,
      description,
      externalURL,
      fileHash,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      previewDataUrl,
      certificateId: undefined,
      transactionHash: undefined
    };

    try {
      if (isSupabaseConfigured) {
        const savedApplication = await saveSupabaseApplication(application);
        saveWebsiteApplication(savedApplication);
        setWebsiteSuccessId(savedApplication.localId);
      } else {
        const localId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}`;
        saveWebsiteApplication({
          ...application,
          localId,
          createdAt: new Date().toISOString(),
          status: "pending",
          storage: "local"
        });
        setWebsiteSuccessId(localId);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit application.");
    } finally {
      setSubmittingWebsiteApplication(false);
    }
  }

  async function confirmRegistration() {
    if (!file || !fileHash) {
      return;
    }

    try {
      const result = await copyright.registerCopyright(
        {
          title,
          category,
          description,
          fileHash,
          externalURL
        },
        (nextStage, hash) => {
          setStage(nextStage);
          if (hash) {
            setTransactionHash(hash);
          }
        }
      );

      saveTransactionHash(result.certificateId, result.transactionHash);
      savePreview({
        id: result.certificateId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dataUrl: previewDataUrl
      });

      const record = await copyright.getCopyright(result.certificateId);
      saveLocalRecord({ ...record, transactionHash: result.transactionHash });
      setSuccessId(result.certificateId);
      setModalOpen(false);
      navigate(`/certificate/${formatCertificateId(result.certificateId)}`);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Transaction failed.");
    }
  }

  return (
    <div className="page-shell">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink-900">Register New Copyright</h1>
        <p className="mt-2 text-sm text-ink-500">{t("createProof")}</p>
      </div>

      <section className="panel mb-5 grid gap-3 p-4 md:grid-cols-2">
        <button
          type="button"
          className={`rounded-lg border p-4 text-left transition ${
            submissionMode === "website" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
          onClick={() => setSubmissionMode("website")}
        >
          <p className="font-bold text-ink-900">{t("websiteWallet")}</p>
          <p className="mt-1 text-sm leading-6 text-ink-500">
            {t("websiteWalletNote")}
          </p>
        </button>
        <button
          type="button"
          className={`rounded-lg border p-4 text-left transition ${
            submissionMode === "wallet" ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
          onClick={() => setSubmissionMode("wallet")}
        >
          <p className="font-bold text-ink-900">{t("bindWallet")}</p>
          <p className="mt-1 text-sm leading-6 text-ink-500">
            {t("bindWalletNote")}
          </p>
        </button>
      </section>

      <StepIndicator activeStep={fileHash ? (title && description ? 3 : 2) : 1} />

      <form className="mt-6 grid gap-4" onSubmit={(event) => void openTransactionModal(event)}>
        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">Step 1 · {t("uploadFile")}</h2>
          <label
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-brand-200 bg-white px-6 py-10 text-center transition hover:bg-brand-50"
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
          >
            <CloudUpload className="h-12 w-12 text-brand-600" aria-hidden="true" />
            <span className="mt-3 text-sm font-semibold text-ink-900">{t("dropFile")}</span>
            <span className="mt-2 text-sm text-ink-500">or</span>
            <span className="mt-3 rounded-md border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600">
              {t("chooseFile")}
            </span>
            <input className="sr-only" type="file" onChange={onFileChange} />
          </label>
          <p className="mt-3 text-center text-xs text-ink-500">{t("supportedFormats")}</p>

          {file ? (
            <div className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
              <WorkPreview category={category} preview={filePreview} alt={file.name} size="sm" />
              <div>
                <p className="font-semibold text-ink-900">{file.name}</p>
                <p className="mt-1 text-sm text-ink-500">
                  {formatFileSize(file.size)} · {file.type || "Unknown type"}
                </p>
                <p className="mt-2 text-xs text-ink-500">
                  {hashing ? "Generating fingerprint..." : `${t("fileHash")}: ${formatHash(fileHash)}`}
                </p>
              </div>
              {hashing ? (
                <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
              )}
            </div>
          ) : null}

          {fileHash ? (
            <div className="mt-5">
              <HashDisplay hash={fileHash} copyable={Boolean(successId || websiteSuccessId)} />
            </div>
          ) : null}
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">Step 2 · {t("workInformation")}</h2>
          <div className="mb-4 flex gap-3 rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-ink-600">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <p className="font-bold text-ink-900">{t("publicRegistrationNoticeTitle")}</p>
              <p className="mt-1">{t("publicRegistrationNoticeBody")}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">{t("workTitle")} *</span>
              <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="My First Artwork" />
            </label>
            <label>
              <span className="label">{t("category")} *</span>
              <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="" disabled>
                  {t("selectCategory")}
                </option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="label">{t("description")} *</span>
            <textarea className="input min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe your work..." />
          </label>
          <label className="mt-4 block">
            <span className="label">{t("externalLink")}</span>
            <input className="input" value={externalURL} onChange={(event) => setExternalURL(event.target.value)} placeholder="https://..." />
          </label>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">Step 3 · {t("blockchainRegistration")}</h2>
          <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
            <h3 className="font-bold text-ink-900">{t("registrationPreview")}</h3>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <PreviewRow label={t("workTitle")} value={title || "Untitled"} />
              <PreviewRow label={t("category")} value={category || t("selectCategory")} />
              <PreviewRow label={t("fileHash")} value={fileHash ? formatHash(fileHash) : "Upload a file first"} />
              <PreviewRow label={t("network")} value={NETWORK_NAME} />
              <PreviewRow label={t("smartContract")} value={CONTRACT_ADDRESS ? formatAddress(CONTRACT_ADDRESS) : t("notDeployed")} />
              <PreviewRow label="Submission Mode" value={submissionMode === "wallet" ? t("bindWallet") : t("websiteWallet")} />
              <PreviewRow
                label="Wallet"
                value={
                  submissionMode === "website"
                    ? "Website wallet review queue"
                    : wallet.account
                      ? formatAddress(wallet.account)
                      : t("walletNotConnected")
                }
              />
            </div>
          </div>

          {submissionMode === "wallet" && !isContractConfigured ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {t("contractNotConfiguredRegister")}
            </p>
          ) : null}

          {submissionMode === "wallet" && !wallet.isConnected ? (
            <div className="mt-4 rounded-lg border border-brand-100 bg-white p-4 text-sm text-ink-600">
              <p className="font-semibold text-ink-900">{t("connectWalletToRegister")}</p>
              <p className="mt-1 text-xs leading-5 text-ink-500">{t("visitorWalletConnectHint")}</p>
              <button type="button" className="mt-3 btn-primary px-4 py-2 text-xs" onClick={() => void wallet.connectWallet()}>
                <Wallet className="h-4 w-4" aria-hidden="true" />
                {t("connectWallet")}
              </button>
              {wallet.error ? <p className="mt-3 text-xs text-red-600">{wallet.error}</p> : null}
            </div>
          ) : null}

          {submissionMode === "wallet" && wallet.isConnected && !wallet.isCorrectNetwork ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-semibold">{t("wrongNetwork")}</p>
              <button type="button" className="mt-3 btn-secondary px-3 py-1.5 text-xs" onClick={() => void wallet.switchNetwork()}>
                {t("switchNetwork")}
              </button>
            </div>
          ) : null}

          {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {successId ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              {t("applicationSubmitted")} ✓ · {t("certificateId")}: {formatCertificateId(successId)} · {t("pendingReview")}
            </p>
          ) : null}
          {websiteSuccessId ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
              {t("applicationSubmitted")} ✓ · {isSupabaseConfigured ? "Supabase ID" : "Local ID"}: {websiteSuccessId.slice(0, 8)} · {t("pendingReview")}
            </p>
          ) : null}

          <button type="submit" className="mt-5 btn-primary w-full" disabled={!canRegister || hashing || submittingWebsiteApplication}>
            {submittingWebsiteApplication ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submissionMode === "wallet" ? t("registerOnChain") : t("submitApplication")}
          </button>
          <p className="mt-2 text-center text-xs text-ink-500">
            {submissionMode === "wallet"
              ? "You will be asked to confirm the transaction in your wallet. The result will remain pending until reviewer approval."
              : isSupabaseConfigured
                ? "No wallet confirmation is needed now. The application will wait in the public Supabase review queue."
                : "No wallet confirmation is needed now. The application will wait in the local reviewer queue."}
          </p>
        </section>
      </form>

      <TransactionModal
        open={modalOpen}
        stage={stage}
        transactionHash={transactionHash}
        error={error}
        onCancel={() => {
          setModalOpen(false);
          setStage("idle");
        }}
        onConfirm={() => void confirmRegistration()}
      />
    </div>
  );
}

function StepIndicator({ activeStep }: { activeStep: number }) {
  const { t } = useTranslation();
  const steps = [t("uploadFile"), t("workInformation"), t("blockchainRegistration")];

  return (
    <div className="panel flex flex-col gap-4 p-4 md:flex-row md:items-center">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = stepNumber <= activeStep;

        return (
          <div className="flex flex-1 items-center gap-3" key={step}>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                active ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-500"
              }`}
            >
              {stepNumber}
            </span>
            <span className={`text-sm font-semibold ${active ? "text-ink-900" : "text-ink-500"}`}>{step}</span>
            {index < steps.length - 1 ? <span className="hidden h-px flex-1 bg-slate-200 md:block" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-ink-500">{label}</p>
      <p className="mt-1 break-words font-medium text-ink-900">{value}</p>
    </div>
  );
}
