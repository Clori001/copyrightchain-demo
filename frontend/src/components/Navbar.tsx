import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.svg";
import { useTranslation } from "../i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WalletButton } from "./WalletButton";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-2 py-5 text-sm font-semibold transition ${
    isActive ? "border-brand-600 text-brand-600" : "border-transparent text-ink-700 hover:text-brand-600"
  }`;

export function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
      <NavLink className={linkClass} to="/" onClick={() => setOpen(false)}>
        {t("home")}
      </NavLink>
      <NavLink className={linkClass} to="/register" onClick={() => setOpen(false)}>
        {t("register")}
      </NavLink>
      <NavLink className={linkClass} to="/my-works" onClick={() => setOpen(false)}>
        {t("myWorks")}
      </NavLink>
      <NavLink className={linkClass} to="/verify" onClick={() => setOpen(false)}>
        {t("verify")}
      </NavLink>
      <NavLink className={linkClass} to="/explorer" onClick={() => setOpen(false)}>
        {t("explorer")}
      </NavLink>
      <NavLink className={linkClass} to="/admin/review" onClick={() => setOpen(false)}>
        {t("admin")}
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="CopyrightChain logo" className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-900">CopyrightChain</p>
            <p className="hidden truncate text-xs text-ink-500 sm:block">On-chain Digital Copyright Registration</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-3 lg:flex">{navLinks}</nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <WalletButton />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-ink-700 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 lg:hidden">
          <nav className="flex flex-col">{navLinks}</nav>
          <div className="mt-4 flex flex-col gap-4">
            <LanguageSwitcher />
            <WalletButton />
          </div>
        </div>
      ) : null}
    </header>
  );
}
