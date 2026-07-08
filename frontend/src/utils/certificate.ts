export function formatCertificateId(id: number | bigint | string) {
  const numberId = Number(id);

  if (!Number.isFinite(numberId) || numberId <= 0) {
    return "CC-000000";
  }

  return `CC-${numberId.toString().padStart(6, "0")}`;
}

export function parseCertificateId(value: string) {
  const normalized = value.trim().toUpperCase().replace(/^CC-?/, "");
  const id = Number.parseInt(normalized, 10);

  return Number.isFinite(id) && id > 0 ? id : null;
}

export function formatDate(timestamp: number) {
  if (!timestamp) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(timestamp * 1000));
}

export function getCertificateUrl(certificateId: string) {
  return `${window.location.origin}/verify/${certificateId}`;
}

