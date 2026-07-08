import { FormEvent, ReactNode, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useTranslation } from "../i18n";

const ADMIN_SESSION_KEY = "copyrightchain:admin-unlocked";
const DEFAULT_ADMIN_PASSWORD_HASH = "f0a3a193b68de49a345a79f22f9d09fb2f5c914a0282d6d87fd93c46644739a8";
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_PASSWORD_HASH;

function hasAdminSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function AdminGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(hasAdminSession);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function hashPassword(value: string) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setChecking(true);

    try {
      if ((await hashPassword(password)) === ADMIN_PASSWORD_HASH) {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        setUnlocked(true);
        setPassword("");
        return;
      }

      setError(t("wrongAdminPassword"));
    } catch {
      setError(t("adminPasswordCheckFailed"));
    } finally {
      setChecking(false);
    }
  }

  if (unlocked) {
    return children;
  }

  return (
    <div className="page-shell">
      <section className="panel mx-auto max-w-md p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">{t("adminPasswordTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">{t("adminPasswordDescription")}</p>

        <form className="mt-5 grid gap-3" onSubmit={unlock}>
          <label>
            <span className="label">{t("adminPassword")}</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button type="submit" className="btn-primary justify-center py-3" disabled={checking}>
            {checking ? t("checking") : t("unlockAdmin")}
          </button>
        </form>
      </section>
    </div>
  );
}
