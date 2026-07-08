import { Code2, FileAudio, FileText, ImageIcon, Palette } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StoredPreview } from "../utils/localPreview";

const categoryIcons: Record<string, LucideIcon> = {
  Image: ImageIcon,
  Photography: ImageIcon,
  Music: FileAudio,
  Writing: FileText,
  Code: Code2,
  Design: Palette,
  Other: FileText
};

interface WorkPreviewProps {
  category?: string;
  preview?: StoredPreview | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
}

export function WorkPreview({ category = "Other", preview, alt = "Work preview", size = "md" }: WorkPreviewProps) {
  const Icon = categoryIcons[category] || FileText;
  const sizeClass = size === "lg" ? "h-64" : size === "sm" ? "h-24" : "h-36";

  if (preview?.dataUrl) {
    return (
      <img
        src={preview.dataUrl}
        alt={alt}
        className={`${sizeClass} w-full rounded-md border border-slate-200 object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClass} flex w-full items-center justify-center rounded-md border border-slate-200 bg-brand-50`}>
      <Icon className="h-12 w-12 text-brand-600" aria-hidden="true" />
    </div>
  );
}

