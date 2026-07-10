import { ArrowRight, Database, FileCheck2, Fingerprint, Globe2, ShieldCheck, UploadCloud, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroIllustration from "../assets/hero-illustration.svg";
import { NetworkBadge } from "../components/NetworkBadge";
import { CONTRACT_ADDRESS, NETWORK_NAME, isContractConfigured } from "../contract/address";
import { useCopyright } from "../hooks/useCopyright";
import { useTranslation } from "../i18n";
import type { CopyrightRecord } from "../types/copyright";
import { formatAddress } from "../utils/formatAddress";
import { listHiddenCertificateIds } from "../utils/hiddenCertificates";
import { isSupabaseConfigured } from "../utils/supabaseApplications";

export function Home() {
  const { t } = useTranslation();
  const copyright = useCopyright();
  const [totalWorks, setTotalWorks] = useState(0);
  const [records, setRecords] = useState<CopyrightRecord[]>([]);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      const [count, recentEvents, hiddenIds] = await Promise.all([
        copyright.getTotalWorks().catch(() => 0),
        copyright.getRecentRegistrations(20).catch(() => []),
        listHiddenCertificateIds().catch(() => [])
      ]);
      const hiddenIdSet = new Set(hiddenIds);

      let loadedRecords = await Promise.all(
        recentEvents.map(async (event) => {
          try {
            return await copyright.getCopyright(event.id);
          } catch {
            return null;
          }
        })
      );

      if (!loadedRecords.some(Boolean) && count > 0) {
        const ids = Array.from({ length: Math.min(count, 100) }, (_, index) => count - index);
        loadedRecords = await Promise.all(
          ids.map(async (id) => {
            try {
              return await copyright.getCopyright(id);
            } catch {
              return null;
            }
          })
        );
      }

      if (active) {
        const visibleRecords = loadedRecords
          .filter((record): record is CopyrightRecord => Boolean(record))
          .filter((record) => !hiddenIdSet.has(record.id));

        setTotalWorks(Math.max(0, count - hiddenIdSet.size));
        setRecords(visibleRecords);
      }
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  const creators = new Set(records.map((record) => record.creator.toLowerCase())).size;
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const weeklyWorks = records.filter((record) => record.timestamp >= oneWeekAgo).length;

  return (
    <div className="page-shell">
      <section className="grid min-h-[430px] items-center gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <NetworkBadge />
          <h1 className="mt-8 max-w-xl text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
            {t("protectTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-ink-500">{t("protectDescription")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="btn-primary" to="/register">
              {t("register")}
            </Link>
            <Link className="btn-secondary" to="/verify">
              {t("verify")}
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <img src={heroIllustration} alt="Creator registering a copyright certificate" className="w-full max-w-2xl" />
        </div>
      </section>

      <section className="max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-bold">⚠ {t("demoVersion")}</h2>
            <p className="mt-1 text-sm leading-6">{t("demoNoticeShort")}</p>
            <p className="mt-1 text-xs leading-5">This system does not provide legal copyright protection.</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-ink-900">{t("projectIntroTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">{t("projectIntroSubtitle")}</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={FileCheck2}
            title={t("projectIntroWorkTitle")}
            body={t("projectIntroWorkBody")}
          />
          <InfoCard
            icon={Globe2}
            title={t("projectIntroBlockchainTitle")}
            body={t("projectIntroBlockchainBody")}
            meta={NETWORK_NAME}
          />
          <InfoCard
            icon={ShieldCheck}
            title={t("projectIntroContractTitle")}
            body={t("projectIntroContractBody")}
            meta={CONTRACT_ADDRESS ? formatAddress(CONTRACT_ADDRESS) : t("notDeployed")}
          />
          <InfoCard
            icon={Database}
            title={t("projectIntroDatabaseTitle")}
            body={t("projectIntroDatabaseBody")}
            meta={isSupabaseConfigured ? t("supabaseEnabled") : t("browserFallback")}
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-ink-900">{t("blockchainOverview")}</h2>
          {!isContractConfigured ? <span className="text-sm font-medium text-amber-700">{t("notDeployed")}</span> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FileCheck2} label={t("registeredWorks")} value={String(totalWorks)} helper={`+${weeklyWorks} ${t("thisWeek")}`} />
          <StatCard icon={UsersRound} label={t("creators")} value={String(creators)} helper={t("uniqueWallets")} />
          <StatCard icon={Globe2} label={t("network")} value={NETWORK_NAME} helper={isContractConfigured ? t("active") : t("notDeployed")} />
          <StatCard icon={ShieldCheck} label={t("contractStatus")} value={isContractConfigured ? "Operational" : "Setup Needed"} helper={isContractConfigured ? "All systems normal" : "Deploy contract first"} />
        </div>
      </section>

      <section className="mt-8 border-t border-slate-200 pt-6">
        <h2 className="text-xl font-bold text-ink-900">{t("howItWorks")}</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <HowStep icon={UploadCloud} step="Step 1" title={t("uploadWork")} description={t("uploadDescription")} />
          <HowStep icon={Fingerprint} step="Step 2" title={t("generateFingerprint")} description={t("fingerprintDescription")} />
          <HowStep icon={FileCheck2} step="Step 3" title={t("registerOnChain")} description={t("registerOnChainDescription")} />
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
  meta
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  meta?: string;
}) {
  return (
    <article className="panel p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-md border border-brand-100 bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-bold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-500">{body}</p>
      {meta ? <p className="mt-3 break-all text-xs font-semibold text-brand-700">{meta}</p> : null}
    </article>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper
}: {
  icon: typeof FileCheck2;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-brand-100 bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-semibold text-ink-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-ink-900">{value}</p>
        <p className="mt-1 text-xs font-medium text-emerald-600">{helper}</p>
      </div>
    </div>
  );
}

function HowStep({
  icon: Icon,
  step,
  title,
  description
}: {
  icon: typeof UploadCloud;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-bold text-brand-600">{step}</p>
        <h3 className="mt-1 font-bold text-ink-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink-500">{description}</p>
      </div>
      <ArrowRight className="ml-auto hidden h-5 w-5 shrink-0 text-slate-300 lg:block" aria-hidden="true" />
    </div>
  );
}
