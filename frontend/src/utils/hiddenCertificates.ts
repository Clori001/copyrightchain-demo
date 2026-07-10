import { getHiddenCertificateIds, hideCertificateLocally } from "./localPreview";
import {
  hideSupabaseCertificate,
  isSupabaseConfigured,
  listSupabaseApplications,
  listSupabaseHiddenCertificateIds,
  updateSupabaseApplicationsByCertificateId
} from "./supabaseApplications";

export async function listHiddenCertificateIds() {
  const ids = new Set(getHiddenCertificateIds());

  if (!isSupabaseConfigured) {
    return Array.from(ids);
  }

  try {
    const hiddenIds = await listSupabaseHiddenCertificateIds();
    hiddenIds.forEach((id) => ids.add(id));
  } catch {
    // Older Supabase setups may not have the hidden_certificates table yet.
  }

  try {
    const applications = await listSupabaseApplications();
    applications.forEach((application) => {
      if (application.certificateId && (application.status === "hidden" || application.status === "rejected")) {
        ids.add(application.certificateId);
      }
    });
  } catch {
    // Keep the local fallback useful even if Supabase is temporarily unavailable.
  }

  return Array.from(ids);
}

export async function isCertificateHidden(certificateId: number) {
  const ids = await listHiddenCertificateIds();
  return ids.includes(certificateId);
}

export async function hideCertificateFromSite(certificateId: number, reviewerWallet?: string) {
  hideCertificateLocally(certificateId);

  if (!isSupabaseConfigured) {
    return;
  }

  await Promise.allSettled([
    hideSupabaseCertificate(certificateId, reviewerWallet),
    updateSupabaseApplicationsByCertificateId(certificateId, {
      status: "hidden",
      reviewerWallet
    })
  ]);
}
