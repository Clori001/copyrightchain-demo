export interface CopyrightRecord {
  id: number;
  creator: string;
  title: string;
  category: string;
  description: string;
  fileHash: string;
  externalURL: string;
  timestamp: number;
  approved: boolean;
  approvedAt: number;
  transactionHash?: string;
}

export interface RegistrationInput {
  title: string;
  category: string;
  description: string;
  fileHash: string;
  externalURL: string;
}

export interface RegistrationResult {
  certificateId: number;
  transactionHash: string;
}

export interface RegistrationEvent {
  id: number;
  creator: string;
  title: string;
  timestamp: number;
  transactionHash: string;
}

export type WebsiteApplicationStatus = "pending" | "approved";

export interface WebsiteApplication {
  localId: string;
  title: string;
  category: string;
  description: string;
  externalURL: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewDataUrl?: string;
  createdAt: string;
  status: WebsiteApplicationStatus;
  certificateId?: number;
  transactionHash?: string;
  storage?: "local" | "supabase";
}

export type TransactionStage =
  | "idle"
  | "wallet"
  | "submitted"
  | "confirmed"
  | "failed";
