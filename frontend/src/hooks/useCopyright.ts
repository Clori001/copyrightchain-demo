import { Interface } from "ethers";
import abi from "../contract/abi.json";
import { isContractConfigured } from "../contract/address";
import { getReadContract, getWriteContract } from "./useContract";
import { useWallet } from "./useWallet";
import type {
  CopyrightRecord,
  RegistrationEvent,
  RegistrationInput,
  RegistrationResult,
  TransactionStage
} from "../types/copyright";
import { getSavedTransactionHash } from "../utils/localPreview";

type ProgressCallback = (stage: TransactionStage, transactionHash?: string) => void;

interface RawCopyrightRecord {
  id: bigint;
  creator: string;
  title: string;
  category: string;
  description: string;
  fileHash: string;
  externalURL: string;
  timestamp: bigint;
  approved: boolean;
  approvedAt: bigint;
}

function normalizeRecord(raw: RawCopyrightRecord): CopyrightRecord {
  return {
    id: Number(raw.id),
    creator: raw.creator,
    title: raw.title,
    category: raw.category,
    description: raw.description,
    fileHash: raw.fileHash,
    externalURL: raw.externalURL,
    timestamp: Number(raw.timestamp),
    approved: raw.approved,
    approvedAt: Number(raw.approvedAt)
  };
}

function getUserFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("CopyrightDoesNotExist")) {
    return "Certificate does not exist.";
  }

  if (message.includes("NotReviewer")) {
    return "Only the configured reviewer wallet can approve this application.";
  }

  if (message.includes("CopyrightAlreadyApproved")) {
    return "This application has already been approved.";
  }

  if (message.includes("user rejected")) {
    return "Wallet request was rejected.";
  }

  if (message.includes("Contract address is not configured")) {
    return "Contract address is not configured. Deploy the contract first.";
  }

  return message || "Blockchain request failed.";
}

export function useCopyright() {
  const wallet = useWallet();

  async function getTotalWorks() {
    if (!isContractConfigured) {
      return 0;
    }

    const contract = getReadContract();
    return Number(await contract.getTotalWorks());
  }

  async function getCopyright(id: number) {
    if (!isContractConfigured) {
      throw new Error("Contract address is not configured. Deploy the contract first.");
    }

    try {
      const contract = getReadContract();
      const record = (await contract.getCopyright(id)) as RawCopyrightRecord;
      return normalizeRecord(record);
    } catch (error) {
      throw new Error(getUserFriendlyError(error));
    }
  }

  async function getMyCopyrights() {
    if (!wallet.isConnected) {
      throw new Error("Please connect wallet.");
    }

    const contract = await getWriteContract(wallet.getBrowserProvider());
    const ids = (await contract.getMyCopyrights()) as bigint[];
    return ids.map((id) => Number(id));
  }

  async function registerCopyright(input: RegistrationInput, onProgress?: ProgressCallback): Promise<RegistrationResult> {
    if (!wallet.isConnected) {
      throw new Error("Please connect wallet first.");
    }

    try {
      const contract = await getWriteContract(wallet.getBrowserProvider());

      onProgress?.("wallet");
      const transaction = await contract.registerCopyright(
        input.title,
        input.category,
        input.description,
        input.fileHash,
        input.externalURL
      );

      onProgress?.("submitted", transaction.hash);
      const receipt = await transaction.wait();
      const iface = new Interface(abi);
      let certificateId = 0;

      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog({
            topics: [...log.topics],
            data: log.data
          });

          if (parsed?.name === "CopyrightSubmitted") {
            certificateId = Number(parsed.args.id);
            break;
          }
        } catch {
          // Ignore logs from other contracts in the same transaction.
        }
      }

      if (!certificateId) {
        certificateId = Number(await contract.getTotalWorks());
      }

      onProgress?.("confirmed", transaction.hash);

      return {
        certificateId,
        transactionHash: transaction.hash
      };
    } catch (error) {
      onProgress?.("failed");
      throw new Error(getUserFriendlyError(error));
    }
  }

  async function approveCopyright(id: number, onProgress?: ProgressCallback) {
    if (!wallet.isConnected) {
      throw new Error("Please connect wallet first.");
    }

    try {
      const contract = await getWriteContract(wallet.getBrowserProvider());

      onProgress?.("wallet");
      const transaction = await contract.approveCopyright(id);
      onProgress?.("submitted", transaction.hash);
      await transaction.wait();
      onProgress?.("confirmed", transaction.hash);

      return transaction.hash as string;
    } catch (error) {
      onProgress?.("failed");
      throw new Error(getUserFriendlyError(error));
    }
  }

  async function getPendingCopyrights() {
    if (!isContractConfigured) {
      return [];
    }

    const contract = getReadContract();
    const ids = (await contract.getPendingCopyrights()) as bigint[];
    return ids.map((id) => Number(id));
  }

  async function getTransactionHashForId(id: number) {
    const savedHash = getSavedTransactionHash(id);

    if (savedHash) {
      return savedHash;
    }

    if (!isContractConfigured) {
      return "";
    }

    try {
      const contract = getReadContract();
      const filter = contract.filters.CopyrightSubmitted(BigInt(id));
      const events = await contract.queryFilter(filter, 0, "latest");
      const event = events[0];

      return event?.transactionHash || "";
    } catch {
      return "";
    }
  }

  async function getRecentRegistrations(limit = 8): Promise<RegistrationEvent[]> {
    if (!isContractConfigured) {
      return [];
    }

    try {
      const contract = getReadContract();
      const events = await contract.queryFilter(contract.filters.CopyrightSubmitted(), 0, "latest");

      return events
        .map((event) => {
          if (!("args" in event) || !event.args) {
            return null;
          }

          return {
            id: Number(event.args.id),
            creator: String(event.args.creator),
            title: String(event.args.title),
            timestamp: Number(event.args.timestamp),
            transactionHash: event.transactionHash
          };
        })
        .filter((event): event is RegistrationEvent => Boolean(event))
        .sort((a, b) => b.id - a.id)
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  return {
    getTotalWorks,
    getCopyright,
    getMyCopyrights,
    registerCopyright,
    approveCopyright,
    getPendingCopyrights,
    getTransactionHashForId,
    getRecentRegistrations
  };
}
