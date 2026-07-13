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
const hiddenCertificatesKey = "copyrightchain:hidden-certificates";
const previewKeyPrefix = "copyrightchain:preview:";
// Base64 inflates files by roughly 33%, while localStorage is commonly limited
// to only 5-10 MB for the whole origin. Keep previews deliberately small so a
// successful chain transaction can never be reported as failed by a cache write.
const MAX_LOCAL_PREVIEW_LENGTH = 750_000;

function isQuotaExceeded(error: unknown) {
  const storageError = error as { name?: string; code?: number } | null;

  return (
    storageError?.name === "QuotaExceededError" ||
    storageError?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    storageError?.code === 22 ||
    storageError?.code === 1014
  );
}

function trySetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (!isQuotaExceeded(error)) {
      throw error;
    }

    return false;
  }
}

function releaseStoredPreviewImages(exceptId: number) {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);

    if (!key?.startsWith(previewKeyPrefix) || key === previewKey(exceptId)) {
      continue;
    }

    const raw = localStorage.getItem(key);

    if (!raw) {
      continue;
    }

    try {
      const preview = JSON.parse(raw) as StoredPreview;

      if (preview.dataUrl) {
        localStorage.setItem(key, JSON.stringify({ ...preview, dataUrl: undefined }));
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
}

export function savePreview(preview: StoredPreview) {
  const cacheablePreview =
    preview.dataUrl && preview.dataUrl.length <= MAX_LOCAL_PREVIEW_LENGTH
      ? preview
      : { ...preview, dataUrl: undefined };
  const key = previewKey(preview.id);

  if (trySetItem(key, JSON.stringify(cacheablePreview))) {
    return Boolean(cacheablePreview.dataUrl);
  }

  // Existing image previews are optional. Drop only their Base64 payloads and
  // retry before falling back to metadata-only storage for the current work.
  releaseStoredPreviewImages(preview.id);

  if (trySetItem(key, JSON.stringify(cacheablePreview))) {
    return Boolean(cacheablePreview.dataUrl);
  }

  trySetItem(key, JSON.stringify({ ...preview, dataUrl: undefined }));
  return false;
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
  return trySetItem(txKey(id), hash);
}

export function getSavedTransactionHash(id: number) {
  return localStorage.getItem(txKey(id)) || "";
}

export function saveApprovalTransactionHash(id: number, hash: string) {
  return trySetItem(approvalTxKey(id), hash);
}

export function getSavedApprovalTransactionHash(id: number) {
  return localStorage.getItem(approvalTxKey(id)) || "";
}

export function saveLocalRecord(record: CopyrightRecord) {
  return trySetItem(recordKey(record.id), JSON.stringify(record));
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

export function getHiddenCertificateIds() {
  const raw = localStorage.getItem(hiddenCertificatesKey);

  if (!raw) {
    return [];
  }

  try {
    const ids = JSON.parse(raw) as number[];
    return ids.filter((id) => Number.isFinite(id));
  } catch {
    return [];
  }
}

export function hideCertificateLocally(id: number) {
  const ids = new Set(getHiddenCertificateIds());
  ids.add(id);
  localStorage.setItem(hiddenCertificatesKey, JSON.stringify(Array.from(ids)));
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
