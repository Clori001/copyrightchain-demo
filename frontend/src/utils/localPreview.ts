import type { CopyrightRecord, WebsiteApplication } from "../types/copyright";

export interface StoredPreview {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl?: string;
}

const previewKey = (id: number) => `copyrightchain:preview:${id}`;
const txKey = (id: number) => `copyrightchain:tx:${id}`;
const approvalTxKey = (id: number) => `copyrightchain:approval-tx:${id}`;
const recordKey = (id: number) => `copyrightchain:record:${id}`;
const websiteApplicationsKey = "copyrightchain:website-applications";

export function savePreview(preview: StoredPreview) {
  localStorage.setItem(previewKey(preview.id), JSON.stringify(preview));
}

export function getPreview(id: number) {
  const raw = localStorage.getItem(previewKey(id));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredPreview;
  } catch {
    return null;
  }
}

export function saveTransactionHash(id: number, hash: string) {
  localStorage.setItem(txKey(id), hash);
}

export function getSavedTransactionHash(id: number) {
  return localStorage.getItem(txKey(id)) || "";
}

export function saveApprovalTransactionHash(id: number, hash: string) {
  localStorage.setItem(approvalTxKey(id), hash);
}

export function getSavedApprovalTransactionHash(id: number) {
  return localStorage.getItem(approvalTxKey(id)) || "";
}

export function saveLocalRecord(record: CopyrightRecord) {
  localStorage.setItem(recordKey(record.id), JSON.stringify(record));
}

export function getLocalRecord(id: number) {
  const raw = localStorage.getItem(recordKey(id));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CopyrightRecord;
  } catch {
    return null;
  }
}

export function getWebsiteApplications() {
  const raw = localStorage.getItem(websiteApplicationsKey);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as WebsiteApplication[];
  } catch {
    return [];
  }
}

export function saveWebsiteApplication(application: WebsiteApplication) {
  const applications = getWebsiteApplications();
  localStorage.setItem(websiteApplicationsKey, JSON.stringify([application, ...applications]));
}

export function updateWebsiteApplication(localId: string, update: Partial<WebsiteApplication>) {
  const applications = getWebsiteApplications();
  const updatedApplications = applications.map((application) =>
    application.localId === localId ? { ...application, ...update } : application
  );
  localStorage.setItem(websiteApplicationsKey, JSON.stringify(updatedApplications));
  return updatedApplications.find((application) => application.localId === localId) || null;
}

export async function fileToPreview(file: File) {
  if (!file.type.startsWith("image/")) {
    return undefined;
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read preview"));
    reader.readAsDataURL(file);
  });
}
