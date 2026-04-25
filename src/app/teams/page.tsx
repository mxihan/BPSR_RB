"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";

type Team = RouterOutputs["team"]["list"]["items"][number];

type ContentType = "DUNGEON" | "RAID" | "WORLD_BOSS" | "RUSH_BATTLE" | "TRAINING_RUINS" | "STIMEN_VAULT" | "OTHER";

export default function TeamsPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    contentType: undefined as string | undefined,
    difficultyId: undefined as string | undefined,
    roleNeeded: undefined as "Tank" | "DPS" | "Healer" | "Support" | undefined,
    search: "",
  });

  const [cursor, setCursor] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "soonest">("newest");

  const { data: classes } = api.dictionary.listClasses.useQuery();
  const { data: content } = api.dictionary.listContent.useQuery(
    filters.contentType ? { contentType: filters.contentType as ContentType } : undefined,
  );
  const { data: difficulties } = api.dictionary.listDifficulties.useQuery(
    filters.contentType ? { contentType: filters.contentType as ContentType } : undefined,
  );

  const {
    data: teamsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = api.team.list.useInfiniteQuery(
    {
      contentType: filters.contentType as ContentType,
      difficultyId: filters.difficultyId,
      roleNeeded: filters.roleNeeded,
      search: filters.search || undefined,
      sortBy,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const teams = teamsData?.pages.flatMap((page) => page.items) ?? [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setCursor(undefined);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Tank":
        return "text-tank bg-tank/10 border-tank/20";
      case "DPS":
        return "text-dps bg-dps/10 border-dps/20";
      case "Healer":
        return "text-healer bg-healer/10 border-healer/20";
      case "Support":
        return "text-support bg-support/10 border-support/20";
      default:
        return "text-slate-300 bg-slate-800 border-slate-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "COMPLETED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Browse Teams</h1>
            <p className="mt-2 text-slate-400">
              Find your perfect group for any content
            </p>
          </div>
          {session?.user && (
            <Link
              href="/teams/new"
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary-hover"
            >
              Create Team
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-surface p-4 border border-border">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Content Type */}
            <select
              value={filters.contentType ?? ""}
              onChange={(e) => handleFilterChange("contentType", e.target.value)}
              className="rounded bg-surface-dark px-3 py-2 text-sm text-white border border-border focus:border-primary focus:outline-none"
            >
              <option value="">All Content Types</option>
              <option value="DUNGEON">Dungeon</option>
              <option value="RAID">Raid</option>
              <option value="WORLD_BOSS">World Boss</option>
              <option value="RUSH_BATTLE">Rush Battle</option>
              <option value="TRAINING_RUINS">Training Ruins</option>
              <option value="STIMEN_VAULT">Stimen Vault</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Content */}
            <select
              value={filters.difficultyId ?? ""}
              onChange={(e) => handleFilterChange("difficultyId", e.target.value)}
              className="rounded bg-surface-dark px-3 py-2 text-sm text-white border border-border focus:border-primary focus:outline-none"
              disabled={!difficulties || difficulties.length === 0}
            >
              <option value="">All Difficulties</option>
              {difficulties?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Role Needed */}
            <select
              value={filters.roleNeeded ?? ""}
              onChange={(e) => handleFilterChange("roleNeeded", e.target.value)}
              className="rounded bg-surface-dark px-3 py-2 text-sm text-white border border-border focus:border-primary focus:outline-none"
            >
              <option value="">Any Role</option>
              <option value="Tank">Tank</option>
              <option value="DPS">DPS</option>
              <option value="Healer">Healer</option>
              <option value="Support">Support</option>
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder="Search teams..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="rounded bg-surface-dark px-3 py-2 text-sm text-white placeholder:text-slate-500 border border-border focus:border-primary focus:outline-none"
            />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "soonest")}
              className="rounded bg-surface-dark px-3 py-2 text-sm text-white border border-border focus:border-primary focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="soonest">Soonest Schedule</option>
            </select>
          </div>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading teams...</div>
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-lg bg-surface p-12 text-center border border-border">
            <p className="text-slate-400">No teams found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  className="rounded-lg bg-surface px-6 py-2.5 font-medium text-white border border-border transition hover:bg-surface-dark"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Tank":
        return "text-tank bg-tank/10 border-tank/20";
      case "DPS":
        return "text-dps bg-dps/10 border-dps/20";
      case "Healer":
        return "text-healer bg-healer/10 border-healer/20";
      case "Support":
        return "text-support bg-support/10 border-support/20";
      default:
        return "text-slate-300 bg-slate-800 border-slate-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "COMPLETED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const openSlots = team.slots.filter((s) => !s.isFilled);
  const filledSlots = team.slots.filter((s) => s.isFilled);

  return (
    <Link href={`/teams/${team.id}`}>
      <div className="rounded-lg bg-surface p-5 border border-border transition hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <h3 className="flex-1 text-lg font-semibold text-white line-clamp-1">
            {team.title}
          </h3>
          <span
            className={`ml-2 rounded px-2 py-0.5 text-xs font-medium border ${getStatusColor(team.status)}`}
          >
            {team.status.replace("_", " ")}
          </span>
        </div>

        {/* Content Info */}
        <div className="mb-3 space-y-1 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <span>{team.content?.name}</span>
            {team.difficulty && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-primary">{team.difficulty.name}</span>
              </>
            )}
          </div>
          {team.masterLevel && team.difficulty?.levelBased && (
            <div className="text-slate-400">Master Level {team.masterLevel}</div>
          )}
        </div>

        {/* Role Slots */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {team.slots.slice(0, 8).map((slot) => (
            <span
              key={slot.id}
              className={`rounded px-2 py-0.5 text-xs font-medium border ${slot.isFilled ? "opacity-50" : ""} ${getRoleColor(slot.role)}`}
            >
              {slot.role}
              {slot.isFilled ? " ✓" : ""}
            </span>
          ))}
          {team.slots.length > 8 && (
            <span className="rounded px-2 py-0.5 text-xs text-slate-500">
              +{team.slots.length - 8}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            {team.scheduledAt && (
              <>
                <span>
                  {new Date(team.scheduledAt).toLocaleDateString()}{" "}
                  {new Date(team.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>by {team.leader.name}</span>
            {team.leader.image && (
              <img
                src={team.leader.image}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            )}
          </div>
        </div>

        {/* Slot count */}
        <div className="mt-3 text-xs text-slate-500">
          {openSlots.length > 0 ? (
            <span className="text-green-400">
              {openSlots.length} open slot{openSlots.length > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-slate-400">Full</span>
          )}
          {" • "}
          <span>
            {filledSlots.length}/{team.slots.length} filled
          </span>
        </div>
      </div>
    </Link>
  );
}
