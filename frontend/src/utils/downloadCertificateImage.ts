import { CONTRACT_ADDRESS, NETWORK_NAME } from "../contract/address";
import type { CopyrightRecord } from "../types/copyright";
import { formatCertificateId, formatDate } from "./certificate";

interface DownloadCertificateImageInput {
  record: CopyrightRecord;
  certificateTransactionHash?: string;
  labels: {
    title: string;
    verified: string;
    certificateId: string;
    workTitle: string;
    creator: string;
    category: string;
    registeredDate: string;
    approvedAt: string;
    network: string;
    smartContract: string;
    certificateTransactionHash: string;
    fileSha256Hash: string;
  };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return [value];
  }

  const lines: string[] = [];

  for (let index = 0; index < value.length; index += maxLength) {
    lines.push(value.slice(index, index + maxLength));
  }

  return lines;
}

function textLine(label: string, value: string, x: number, y: number, maxLength = 38) {
  const lines = splitText(value, maxLength);
  const valueLines = lines
    .map((line, index) => `<text x="${x + 240}" y="${y + index * 30}" class="value">${escapeXml(line)}</text>`)
    .join("");

  return `
    <text x="${x}" y="${y}" class="label">${escapeXml(label)}</text>
    ${valueLines}
  `;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadCertificateImage({
  record,
  certificateTransactionHash,
  labels
}: DownloadCertificateImageInput) {
  const certificateId = formatCertificateId(record.id);
  const width = 1600;
  const height = 1120;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <style>
          .title { font: 700 56px Georgia, "Times New Roman", serif; fill: #071733; }
          .brand { font: 700 28px Arial, sans-serif; fill: #071733; }
          .badge { font: 700 22px Arial, sans-serif; fill: #047857; }
          .section { font: 700 26px Arial, sans-serif; fill: #071733; }
          .label { font: 500 21px Arial, sans-serif; fill: #66789c; }
          .value { font: 700 21px Arial, sans-serif; fill: #071733; }
          .mono { font-family: "SFMono-Regular", Consolas, monospace; }
          .small { font: 500 18px Arial, sans-serif; fill: #66789c; }
        </style>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#edf3fb" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="1600" height="1120" fill="#f8fbff"/>
      <rect x="55" y="55" width="1490" height="1010" rx="24" fill="#ffffff" stroke="#2b4774" stroke-width="6"/>
      <rect x="75" y="75" width="1450" height="970" rx="18" fill="url(#grid)" opacity="0.7" stroke="#d8e5f6" stroke-width="2"/>

      <rect x="125" y="120" width="58" height="58" rx="14" fill="#eaf2ff"/>
      <text x="143" y="159" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#155eef">C</text>
      <text x="205" y="157" class="brand">CopyrightChain</text>
      <rect x="1230" y="120" width="225" height="50" rx="25" fill="#ecfdf5" stroke="#86efac"/>
      <text x="1272" y="153" class="badge">${escapeXml(labels.verified)}</text>

      <text x="800" y="265" text-anchor="middle" class="title">${escapeXml(labels.title)}</text>
      <text x="800" y="315" text-anchor="middle" class="badge">${escapeXml(labels.verified)}</text>

      <rect x="125" y="390" width="645" height="390" rx="18" fill="#ffffff" stroke="#dbe6f5"/>
      <text x="165" y="445" class="section">${escapeXml(labels.certificateId)}</text>
      ${textLine(labels.certificateId, certificateId, 165, 500)}
      ${textLine(labels.workTitle, record.title, 165, 555)}
      ${textLine(labels.creator, record.creator, 165, 610, 34)}
      ${textLine(labels.category, record.category, 165, 690)}
      ${textLine(labels.registeredDate, formatDate(record.timestamp), 165, 745)}

      <rect x="830" y="390" width="645" height="470" rx="18" fill="#ffffff" stroke="#dbe6f5"/>
      <text x="870" y="445" class="section">${escapeXml(labels.smartContract)}</text>
      ${textLine(labels.network, NETWORK_NAME, 870, 500)}
      ${textLine(labels.smartContract, CONTRACT_ADDRESS || "Not deployed", 870, 555, 35)}
      ${textLine(labels.certificateTransactionHash, certificateTransactionHash || "Not found from RPC", 870, 635, 35)}
      ${textLine(labels.fileSha256Hash, record.fileHash, 870, 735, 35)}

      <rect x="125" y="845" width="645" height="115" rx="18" fill="#f8fbff" stroke="#dbe6f5"/>
      ${textLine(labels.approvedAt, record.approvedAt ? formatDate(record.approvedAt) : "-", 165, 912)}

      <text x="800" y="1010" text-anchor="middle" class="small">
        ${escapeXml("The file itself is not stored on chain. The SHA-256 hash is the public digital fingerprint.")}
      </text>
    </svg>
  `;

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Canvas is not available."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Unable to export image."));
          }
        }, "image/png");
      };
      image.onerror = () => reject(new Error("Unable to render certificate image."));
      image.src = svgUrl;
    });

    downloadBlob(pngBlob, `${certificateId}-CopyrightChain-certificate.png`);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
