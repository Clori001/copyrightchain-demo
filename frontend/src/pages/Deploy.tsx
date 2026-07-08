import { ContractFactory } from "ethers";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import abi from "../contract/abi.json";
import {
  CHAIN_ID,
  CONTRACT_NAME,
  NETWORK_NAME,
  REVIEWER_ADDRESS,
  getDeploymentHistory,
  isReviewerAddress,
  saveLocalDeployment
} from "../contract/address";
import { COPYRIGHT_REGISTRY_BYTECODE } from "../contract/contractArtifact";
import { useWallet } from "../hooks/useWallet";
import { useTranslation } from "../i18n";
import { formatAddress, formatHash } from "../utils/formatAddress";

type DeployStage = "idle" | "wallet" | "deploying" | "confirmed" | "failed";

export function Deploy() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const [stage, setStage] = useState<DeployStage>("idle");
  const [error, setError] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [history, setHistory] = useState(() => getDeploymentHistory());

  const isReviewer = useMemo(() => isReviewerAddress(wallet.account), [wallet.account]);
  const busy = stage === "wallet" || stage === "deploying";

  async function deployContract() {
    setError("");

    try {
      let activeAccount = wallet.account;

      if (!wallet.isConnected) {
        const account = await wallet.connectWallet();

        if (!account) {
          return;
        }

        activeAccount = account;
      }

      if (!isReviewerAddress(activeAccount)) {
        throw new Error(`Please connect the reviewer MetaMask wallet: ${REVIEWER_ADDRESS}`);
      }

      if (!wallet.isCorrectNetwork) {
        await wallet.switchNetwork();
      }

      setStage("wallet");
      const provider = wallet.getBrowserProvider();
      const signer = await provider.getSigner();
      const factory = new ContractFactory(abi, COPYRIGHT_REGISTRY_BYTECODE, signer);
      const contract = await factory.deploy(REVIEWER_ADDRESS);
      const deploymentTx = contract.deploymentTransaction();

      setTransactionHash(deploymentTx?.hash || "");
      setStage("deploying");
      await contract.waitForDeployment();

      const deployedAddress = await contract.getAddress();
      const network = await provider.getNetwork();

      const deploymentInfo = {
        contractName: CONTRACT_NAME,
        network: NETWORK_NAME,
        contractAddress: deployedAddress,
        deploymentTransaction: deploymentTx?.hash || "",
        chainId: network.chainId.toString(),
        reviewerAddress: REVIEWER_ADDRESS,
        deployerAddress: activeAccount,
        deployedAt: new Date().toISOString()
      };

      saveLocalDeployment(deploymentInfo);
      setContractAddress(deployedAddress);
      setHistory(getDeploymentHistory());
      setStage("confirmed");
    } catch (deployError) {
      setStage("failed");
      setError(deployError instanceof Error ? deployError.message : "Deployment failed.");
    }
  }

  return (
    <div className="page-shell">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink-900">{t("deploy")} CopyrightRegistry</h1>
        <p className="mt-2 text-sm text-ink-500">Admin only. This page is hidden from the public website.</p>
      </div>

      {!wallet.isConnected ? (
        <AdminLock
          title={t("connectReviewerWallet")}
          description={`Reviewer wallet: ${formatAddress(REVIEWER_ADDRESS)}`}
          actionLabel={t("connectWallet")}
          onAction={() => void wallet.connectWallet()}
        />
      ) : !isReviewer ? (
        <AdminLock
          title={t("wrongReviewerWallet")}
          description={`Current: ${formatAddress(wallet.account)}. Expected: ${formatAddress(REVIEWER_ADDRESS)}.`}
        />
      ) : null}

      {wallet.isConnected && isReviewer ? (
      <section className="panel grid gap-5 p-5 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <h2 className="text-lg font-bold text-ink-900">{t("deploymentChecklist")}</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <InfoLine label={t("reviewerWallet")} value={formatAddress(REVIEWER_ADDRESS)} />
            <InfoLine label={t("connectedWallet")} value={wallet.account ? formatAddress(wallet.account) : t("walletNotConnected")} />
            <InfoLine label={t("network")} value={`${NETWORK_NAME} (${CHAIN_ID})`} />
            <InfoLine label="Contract" value={CONTRACT_NAME} />
          </dl>

          {wallet.isConnected && !isReviewer ? (
            <div className="mt-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              {t("wrongReviewerWallet")}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
              {error}
            </div>
          ) : null}

          <button type="button" className="mt-6 btn-primary" onClick={() => void deployContract()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("deployWithMetaMask")}
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="font-bold text-ink-900">{t("deploymentStatus")}</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <StatusLine active={stage === "wallet"} done={stage === "deploying" || stage === "confirmed"} label={t("confirmDeployment")} />
            <StatusLine active={stage === "deploying"} done={stage === "confirmed"} label={t("waitBlockchain")} />
            <StatusLine active={false} done={stage === "confirmed"} label={t("saveContractLocal")} />
          </div>
          {contractAddress ? (
            <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <p className="font-bold">{t("deployed")} ✓</p>
              <p className="mt-2 font-mono">{contractAddress}</p>
              <p className="mt-2 text-xs">{t("refreshAfterDeploy")}</p>
            </div>
          ) : null}
          {transactionHash ? <p className="mt-4 text-xs text-ink-500">Tx: {formatHash(transactionHash)}</p> : null}
        </div>
      </section>
      ) : null}

      {wallet.isConnected && isReviewer && history.length ? (
        <section className="panel mt-5 p-5">
          <h2 className="mb-4 text-lg font-bold text-ink-900">{t("deploymentHistory")}</h2>
          <div className="grid gap-3">
            {history.map((item) => (
              <div key={`${item.contractAddress}-${item.deployedAt}`} className="rounded-md border border-slate-200 p-3 text-sm">
                <p className="font-mono font-semibold text-ink-900">{item.contractAddress}</p>
                <p className="mt-1 text-ink-500">
                  {item.network} · {new Date(item.deployedAt).toLocaleString()} · Tx {formatHash(item.deploymentTransaction)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function AdminLock({
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
      <h2 className="text-xl font-bold text-ink-900">{title}</h2>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="mt-5 btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="break-words font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

function StatusLine({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${done ? "text-emerald-700" : active ? "text-brand-700" : "text-ink-500"}`}>
      {active ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 rounded-full border border-slate-300" />}
      {label}
    </div>
  );
}
