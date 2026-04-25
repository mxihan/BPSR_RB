"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function PlayersBrowserPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);

  const { data, isLoading, fetchNextPage, hasNextPage } =
    api.profile.list.useInfiniteQuery(
      { search, classId: classFilter },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: searchTrigger >= 0,
      },
    );

  const profiles = data?.pages.flatMap((page) => page.items) ?? [];
  const allClasses = api.dictionary.listClasses.useQuery();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Tank":
        return "text-blue-400";
      case "DPS":
        return "text-red-400";
      case "Healer":
        return "text-emerald-400";
      case "Support":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  const handleSearch = () => {
    setSearchTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-surface-dark p-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">Player Browser</h1>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-surface p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="min-w-[150px]">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
              >
                <option value="">All Classes</option>
                {allClasses.data?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="rounded bg-primary px-6 py-2 font-semibold text-white transition hover:bg-indigo-600"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center text-slate-300">Loading players...</div>
        ) : profiles.length === 0 ? (
          <div className="rounded-lg bg-surface p-8 text-center text-slate-300">
            No players found. Try adjusting your filters.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <a
                  key={profile.id}
                  href={`/players/${profile.id}`}
                  className="block rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
                >
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold">
                      {profile.displayName}
                    </h3>
                    {profile.server && (
                      <p className="text-sm text-slate-400">
                        {profile.server.name}
                      </p>
                    )}
                  </div>

                  {profile.primaryClass && (
                    <div className="mb-2">
                      <span
                        className={getRoleColor(profile.primaryClass.role)}
                      >
                        {profile.primaryClass.name}
                      </span>
                      {profile.primarySpec && (
                        <span className="text-slate-300">
                          {" "}
                          / {profile.primarySpec.name}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                    <div>Level {profile.adventurerLevel}</div>
                    <div>Ability: {profile.abilityScore}</div>
                  </div>
                </a>
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => void fetchNextPage()}
                  className="rounded border border-border px-6 py-2 font-semibold transition hover:bg-slate-700"
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
