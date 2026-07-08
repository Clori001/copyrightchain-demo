import type { WebsiteApplication } from "../types/copyright";

interface SupabaseApplicationRow {
  id: string;
  title: string;
  category: string;
  description: string;
  external_url: string;
  file_hash: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: "pending" | "approved";
  certificate_id: number | null;
  transaction_hash: string | null;
  reviewer_wallet: string | null;
  created_at: string;
  approved_at: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "") || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const TABLE = "copyright_applications";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function headers(prefer?: string) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {})
  };
}

function endpoint(query = "") {
  return `${SUPABASE_URL}/rest/v1/${TABLE}${query}`;
}

function toApplication(row: SupabaseApplicationRow): WebsiteApplication {
  return {
    localId: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    externalURL: row.external_url,
    fileHash: row.file_hash,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    createdAt: row.created_at,
    status: row.status,
    certificateId: row.certificate_id ?? undefined,
    transactionHash: row.transaction_hash ?? undefined,
    storage: "supabase"
  };
}

function toRow(application: Omit<WebsiteApplication, "localId" | "createdAt" | "status" | "storage">) {
  return {
    title: application.title,
    category: application.category,
    description: application.description,
    external_url: application.externalURL,
    file_hash: application.fileHash,
    file_name: application.fileName,
    file_type: application.fileType,
    file_size: application.fileSize,
    status: "pending"
  };
}

async function request<T>(url: string, init: RequestInit) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function listSupabaseApplications() {
  const rows = await request<SupabaseApplicationRow[]>(
    endpoint("?select=*&order=created_at.desc"),
    {
      method: "GET",
      headers: headers()
    }
  );

  return rows.map(toApplication);
}

export async function saveSupabaseApplication(
  application: Omit<WebsiteApplication, "localId" | "createdAt" | "status" | "storage">
) {
  const rows = await request<SupabaseApplicationRow[]>(
    endpoint(),
    {
      method: "POST",
      headers: headers("return=representation"),
      body: JSON.stringify(toRow(application))
    }
  );

  return toApplication(rows[0]);
}

export async function updateSupabaseApplication(
  id: string,
  update: {
    status?: "pending" | "approved";
    certificateId?: number;
    transactionHash?: string;
    reviewerWallet?: string;
  }
) {
  const rows = await request<SupabaseApplicationRow[]>(
    endpoint(`?id=eq.${encodeURIComponent(id)}`),
    {
      method: "PATCH",
      headers: headers("return=representation"),
      body: JSON.stringify({
        status: update.status,
        certificate_id: update.certificateId,
        transaction_hash: update.transactionHash,
        reviewer_wallet: update.reviewerWallet,
        approved_at: update.status === "approved" ? new Date().toISOString() : undefined
      })
    }
  );

  return rows[0] ? toApplication(rows[0]) : null;
}

