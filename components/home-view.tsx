"use client";

import Navbar from "@/components/navbar";
import type { ChampionSummary, PlayerAnalysisResult, Recommendation, RoleAnalysis } from "@/lib/riot/analyzePlayer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

type SearchState = {
  region: string;
  gameName: string;
  tagLine: string;
};

type HomeViewProps = {
  error: string | null;
  initialSearch: SearchState;
  regionOptions: string[];
  result: PlayerAnalysisResult | null;
};

const recommendationStyles: Record<Recommendation["type"], string> = {
  "Main Pick": "border-amber-300/25 bg-amber-300/15 text-amber-100",
  "Safe Backup": "border-sky-300/20 bg-sky-300/10 text-sky-100",
  Situational: "border-slate-200/15 bg-slate-200/10 text-slate-100",
};

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatMastery(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return `${value}`;
}

function getChampionIconUrl(version: string, assetId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${assetId}.png`;
}

function getChampionSplashUrl(assetId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${assetId}_0.jpg`;
}

function getProfileIconUrl(version: string, iconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
}

function getRankEmblemUrl(tier: string): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${tier.toLowerCase()}.png`;
}

function formatRankLabel(tier: string, rank: string): string {
  return `${tier} ${rank}`;
}

function RankEmblem({ tier }: { tier: string }) {
  return (
    <div className="relative size-7 shrink-0">
      <Image
        alt={`${tier} rank emblem`}
        className="object-contain"
        fill
        sizes="28px"
        src={getRankEmblemUrl(tier)}
      />
    </div>
  );
}

function Spinner() {
  return <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

function LoadingBanner() {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-md border-l-2 border-[#d6aa4c] bg-[#171a1f] px-4 py-3 text-sm text-slate-100 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
      <Spinner />
      <div>
        <p className="font-medium">Fetching profile, mastery, ranked stats, and recent matches.</p>
        <p className="text-slate-400">This stays visible while the next result is loading.</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md bg-[#171a1f] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${accent ? "text-[#4ee1d2]" : "text-white"}`}>{value}</p>
    </div>
  );
}

function RecommendationCard({ recommendation, version }: { recommendation: Recommendation; version: string }) {
  return (
    <article className="group relative min-h-92 overflow-hidden rounded-md bg-[#121519] shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
      <Image
        alt={`${recommendation.champion} splash art`}
        className="object-cover object-top opacity-75 transition duration-500 group-hover:scale-105"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        src={getChampionSplashUrl(recommendation.stats.assetId)}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,20,0.15)_0%,rgba(4,10,20,0.62)_42%,rgba(4,10,20,0.94)_100%)]" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${recommendationStyles[recommendation.type]}`}>
            {recommendation.type}
          </span>
          <span className="rounded-md bg-black/30 px-2.5 py-1 text-sm font-semibold text-white">
            {formatPercent(recommendation.stats.winRate)} WR
          </span>
        </div>

        <div>
          <div className="flex items-center gap-3">
            
            <div>
              <h3 className="text-3xl font-semibold tracking-tight text-white">{recommendation.champion}</h3>
              <p className="text-sm text-slate-300">{recommendation.reason}</p>
            </div>
          </div>

          {recommendation.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {recommendation.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-white/8 px-2 py-1 text-xs font-medium text-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-sm text-slate-200">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Win Rate</dt>
              <dd className="mt-1 text-2xl font-semibold text-[#ff7b72]">{formatPercent(recommendation.stats.winRate)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Recent Games</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{recommendation.stats.plays}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Mastery</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{formatMastery(recommendation.stats.mastery)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}

function RecentChampionCard({ champion, version }: { champion: ChampionSummary; version: string }) {
  return (
    <article className="flex items-center gap-3 rounded-md bg-[#171a1f] p-3">
      <div className="relative size-14 overflow-hidden rounded-md">
        <Image
          alt={`${champion.champion} icon`}
          className="object-cover"
          fill
          sizes="56px"
          src={getChampionIconUrl(version, champion.assetId)}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="truncate text-base font-semibold text-white">{champion.champion}</h4>
            <p className="text-sm text-slate-500">{champion.plays} recent games</p>
          </div>
          <span className="rounded-md bg-[#1b2430] px-2 py-1 text-xs font-semibold text-[#8ec7ff]">
            {formatPercent(champion.winRate)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
          <span>{champion.wins} wins</span>
          <span>{champion.losses} losses</span>
          <span>{formatMastery(champion.mastery)} mastery</span>
        </div>
      </div>
    </article>
  );
}

function RoleSection({
  roleAnalysis,
  title,
  version,
  supportingLabel,
}: {
  roleAnalysis: RoleAnalysis;
  title: string;
  version: string;
  supportingLabel?: string;
}) {
  const hasGames = roleAnalysis.count > 0;

  return (
    <section className="rounded-md bg-[#101317] p-6 shadow-[0_16px_32px_rgba(0,0,0,0.18)] md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{roleAnalysis.role}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {hasGames
              ? `${roleAnalysis.count} recent solo queue games in this role, ${formatPercent(roleAnalysis.share)} of the current sample.`
              : "No recent solo queue games in this role."}
          </p>
        </div>
        {supportingLabel ? <p className="text-sm text-slate-300">{supportingLabel}</p> : null}
      </div>

      <div className="mt-6 border-t border-white/6 pt-5">
        {hasGames ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Recent champions in {roleAnalysis.role}</h3>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              {roleAnalysis.recommendations.map((recommendation) => (
                <RecommendationCard key={`${roleAnalysis.role}-${recommendation.type}`} recommendation={recommendation} version={version} />
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {roleAnalysis.recentChamps.slice(0, 4).map((champion) => (
                <RecentChampionCard key={`${roleAnalysis.role}-${champion.assetId}`} champion={champion} version={version} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-md bg-[#171a1f] px-5 py-8 text-center">
            <p className="text-lg font-semibold text-white">No recent ranked games in {roleAnalysis.role}</p>
            <p className="mt-2 text-sm text-slate-500">
              If you queue this role again, this section will fill with champion recommendations and recent picks.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryHeader({ result }: { result: PlayerAnalysisResult }) {
  const primaryRole = result.analysis.roles.find((roleAnalysis) => roleAnalysis.role === result.analysis.mainRole) ?? null;
  const rankedLabel = result.player.ranked
    ? formatRankLabel(result.player.ranked.tier, result.player.ranked.rank)
    : null;

  return (
    <section className="rounded-md bg-[#101317] p-6 shadow-[0_16px_32px_rgba(0,0,0,0.18)] md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative size-24 overflow-hidden rounded-full ring-2 ring-[#d6aa4c] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <Image
              alt={`${result.player.gameName} profile icon`}
              className="object-cover"
              fill
              sizes="96px"
              src={getProfileIconUrl(result.ddragonVersion, result.player.profileIconId)}
            />
          </div>

          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {result.player.gameName} <span className="text-slate-400">#{result.player.tagLine}</span>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-md bg-[#171a1f] px-3 py-1.5">Level {result.player.summonerLevel}</span>
              <span>Analyzed {result.analysis.totalMatches} recent solo queue matches</span>
              {result.player.ranked ? (
                <span className="inline-flex items-center gap-2 rounded-md bg-[#171a1f] px-3 py-1.5">
                  <RankEmblem tier={result.player.ranked.tier} />
                  <span>
                    {rankedLabel} · {result.player.ranked.leaguePoints} LP
                  </span>
                </span>
              ) : (
                <span>Unranked in solo queue</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
          <MetricCard accent label="Main Role" value={result.analysis.mainRole ?? "Mixed"} />
          <MetricCard label="Role Share" value={formatPercent(result.analysis.mainRoleShare)} />
          <MetricCard label="Sample" value={`${result.analysis.totalMatches} games`} />
          <MetricCard label="Secondary" value={result.analysis.secondaryRole ?? "None"} />
        </div>
      </div>

      {primaryRole ? (
        <div className="mt-6 flex flex-col gap-4 border-t border-white/6 pt-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Current read</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {primaryRole.role} is the clearest role signal in this sample.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Recommendations favor consistency first, then coverage if your first choice is banned or the comp needs something else.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.analysis.insights.map((insight) => (
              <span key={insight} className="rounded-md bg-[#171a1f] px-3 py-1.5 text-sm text-[#b7d7ff]">
                {insight}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function EmptyHero() {
  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
      <div className="rounded-md bg-[#101317] p-8 shadow-[0_16px_32px_rgba(0,0,0,0.18)] md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">ChampPool</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Build a tighter champion pool from what you already play best.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
          Search a Riot ID to pull recent ranked games, champion mastery, and role tendencies, then turn that data into a cleaner three-pick pool.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        <article className="rounded-md bg-[#101317] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Main Pick</p>
          <p className="mt-3 text-lg font-semibold text-white">Your most played and most dependable champion.</p>
          <p className="mt-2 text-sm text-slate-500">This slot prioritizes actual recent usage, not generic tier-list strength.</p>
        </article>
        <article className="rounded-md bg-[#101317] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Safe Backup</p>
          <p className="mt-3 text-lg font-semibold text-white">A steadier option when the first pick is unavailable.</p>
          <p className="mt-2 text-sm text-slate-500">Win rate, durability, and utility push this one up.</p>
        </article>
        <article className="rounded-md bg-[#101317] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Situational</p>
          <p className="mt-3 text-lg font-semibold text-white">A practiced pocket pick with a different profile.</p>
          <p className="mt-2 text-sm text-slate-500">Useful when draft demands another damage type or lane pattern.</p>
        </article>
      </div>
    </section>
  );
}

export default function HomeView({ error, initialSearch, regionOptions, result }: HomeViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState<SearchState>(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  function setField(field: keyof SearchState, value: string) {
    setSearch((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSearch = {
      region: search.region.trim().toUpperCase() || "EUW",
      gameName: search.gameName.trim(),
      tagLine: search.tagLine.trim().replace(/^#/, ""),
    };

    const params = new URLSearchParams();
    if (nextSearch.region) {
      params.set("region", nextSearch.region);
    }
    if (nextSearch.gameName) {
      params.set("gameName", nextSearch.gameName);
    }
    if (nextSearch.tagLine) {
      params.set("tagLine", nextSearch.tagLine);
    }

    const nextUrl = params.toString() ? `/?${params.toString()}` : "/";

    startTransition(() => {
      router.push(nextUrl, { scroll: false });
    });
  }

  const primaryRole = result?.analysis.roles.find((roleAnalysis) => roleAnalysis.role === result.analysis.mainRole) ?? null;

  return (
    <main className="min-h-screen pb-16 text-slate-100">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-112 bg-[radial-gradient(circle_at_top,rgba(68,78,92,0.24),transparent_48%)]" />
      <Navbar onChange={setField} onSubmit={handleSubmit} pending={isPending} regionOptions={regionOptions} values={search} />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">

        {isPending ? <LoadingBanner /> : null}

        {error ? (
          <section className="mt-8 rounded-md border-l-2 border-[#b44c4c] bg-[#221215] p-5 text-sm text-[#ffc7c7] shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
            {error}
          </section>
        ) : null}

        {result ? (
          <div className="mt-10 space-y-8">
            <SummaryHeader result={result} />
            {result.analysis.roles.map((roleAnalysis) => {
              const title =
                roleAnalysis.role === result.analysis.mainRole
                  ? "Primary Pool"
                  : roleAnalysis.role === result.analysis.secondaryRole
                    ? "Secondary Pool"
                    : roleAnalysis.count > 0
                      ? "Role Pool"
                      : "No Recent Games";

              const supportingLabel =
                roleAnalysis.count > 0
                  ? `${roleAnalysis.count} of ${result.analysis.totalMatches} recent solo queue games were in ${roleAnalysis.role}.`
                  : `No ${roleAnalysis.role} games were found in the ${result.analysis.totalMatches} recent solo queue matches analyzed.`;

              return (
                <RoleSection
                  key={roleAnalysis.role}
                  roleAnalysis={roleAnalysis}
                  supportingLabel={supportingLabel}
                  title={title}
                  version={result.ddragonVersion}
                />
              );
            })}
          </div>
        ) : (
          <EmptyHero />
        )}
      </div>
    </main>
  );
}