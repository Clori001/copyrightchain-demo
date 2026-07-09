import deploymentInfo from "./deployment-info.json";

const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const envChainId = import.meta.env.VITE_CHAIN_ID;
const envNetwork = import.meta.env.VITE_NETWORK;
const envRpcUrl = import.meta.env.VITE_RPC_URL;
const envExplorerUrl = import.meta.env.VITE_EXPLORER_URL;
const envReviewerAddress = import.meta.env.VITE_REVIEWER_ADDRESS;

export interface LocalDeploymentInfo {
  contractName: string;
  network: string;
  contractAddress: string;
  deploymentTransaction: string;
  chainId: string;
  reviewerAddress: string;
  deployerAddress: string;
  deployedAt: string;
  rpcUrl?: string;
  explorerUrl?: string;
}

export const LOCAL_DEPLOYMENT_KEY = "copyrightchain:deployment";
export const LOCAL_DEPLOYMENT_HISTORY_KEY = "copyrightchain:deployment-history";

export function getLocalDeployment(): LocalDeploymentInfo | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(LOCAL_DEPLOYMENT_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LocalDeploymentInfo;
  } catch {
    return null;
  }
}

export function getDeploymentHistory(): LocalDeploymentInfo[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(LOCAL_DEPLOYMENT_HISTORY_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as LocalDeploymentInfo[];
  } catch {
    return [];
  }
}

export function saveLocalDeployment(info: LocalDeploymentInfo) {
  const history = getDeploymentHistory();
  localStorage.setItem(LOCAL_DEPLOYMENT_KEY, JSON.stringify(info));
  localStorage.setItem(LOCAL_DEPLOYMENT_HISTORY_KEY, JSON.stringify([info, ...history].slice(0, 10)));
}

const localDeployment = getLocalDeployment();

export const REVIEWER_ADDRESS =
  envReviewerAddress || localDeployment?.reviewerAddress || deploymentInfo.reviewerAddress || "0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d";
export const CONTRACT_ADDRESS = envAddress || localDeployment?.contractAddress || deploymentInfo.contractAddress || "";
export const CONTRACT_NAME = deploymentInfo.contractName || "CopyrightRegistry";
export const NETWORK_NAME = envNetwork || localDeployment?.network || deploymentInfo.network || "Monad Testnet";
export const CHAIN_ID = Number(envChainId || localDeployment?.chainId || deploymentInfo.chainId || 10143);
export const RPC_URL = envRpcUrl || localDeployment?.rpcUrl || deploymentInfo.rpcUrl || "https://testnet-rpc.monad.xyz";
export const EXPLORER_URL = envExplorerUrl || localDeployment?.explorerUrl || deploymentInfo.explorerUrl || "";

export const isContractConfigured = Boolean(CONTRACT_ADDRESS);

export function toHexChainId(chainId: number) {
  return `0x${chainId.toString(16)}`;
}

export function isReviewerAddress(address?: string) {
  return Boolean(address && REVIEWER_ADDRESS && address.toLowerCase() === REVIEWER_ADDRESS.toLowerCase());
}
