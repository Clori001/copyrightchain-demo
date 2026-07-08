import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import abi from "../contract/abi.json";
import { CONTRACT_ADDRESS, RPC_URL, isContractConfigured } from "../contract/address";

export function getReadProvider() {
  if (RPC_URL) {
    return new JsonRpcProvider(RPC_URL);
  }

  if (window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }

  throw new Error("No RPC URL or browser wallet provider is available.");
}

export function getReadContract() {
  if (!isContractConfigured) {
    throw new Error("Contract address is not configured. Deploy the contract first.");
  }

  return new Contract(CONTRACT_ADDRESS, abi, getReadProvider());
}

export async function getWriteContract(provider: BrowserProvider) {
  if (!isContractConfigured) {
    throw new Error("Contract address is not configured. Deploy the contract first.");
  }

  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, abi, signer);
}

