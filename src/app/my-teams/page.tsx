"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

type TeamCardItem = {
  id: string;
  title: string;
  status: string;
  contentType: string;
  content: { name: string } | null;
  difficulty: { name: string } | null;
  scheduledAt: Date | null;
  slots: { isFilled: boolean }[];
  _count?: { applications: number };
};

export default function MyTeamsPage() {
  const { data: session } = useSession();
  const { data: teamsData, isLoading } = api.team.listMyTeams.useQuery();

  if (!session) {
    return (
      <div className="min-h-screen bg-surface-dark p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-slate-300">Please sign in to view your teams.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dark p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-900/50 text-green-300 border-green-700";
      case "IN_PROGRESS":
        return "bg-blue-900/50 text-blue-300 border-blue-700";
      case "COMPLETED":
        return "bg-gray-700/50 text-gray-300 border-gray-600";
      case "CANCELLED":
        return "bg-red-900/50 text-red-300 border-red-700";
      default:
        return "bg-gray-700/50 text-gray-300 border-gray-600";
    }
  };

  const TeamCard = ({ team }: { team: TeamCardItem }) => (
    <Link
      href={`/teams/${team.id}`}
      className="block rounded-lg border border-border bg-surface p-6 transition hover:border-primary"
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-xl font-semibold text-white">{team.title}</h3>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
            team.status,
          )}`}
        >
          {team.status}
        </span>
      </div>

      <div className="mb-3 space-y-1 text-sm text-slate-300">
        <p>
          <span className="font-medium text-primary">Content:</span>{" "}
          {team.content?.name ?? team.contentType}
        </p>
        {team.difficulty && (
          <p>
            <span className="font-medium text-primary">Difficulty:</span>{" "}
            {team.difficulty.name}
          </p>
        )}
        {team.scheduledAt && (
          <p>
            <span className="font-medium text-primary">Scheduled:</span>{" "}
            {new Date(team.scheduledAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-300">
        <span>
          Members: {team.slots.filter((s) => s.isFilled).length}/
          {team.slots.length}
        </span>
        {(team._count?.applications ?? 0) > 0 && (
          <span>{team._count?.applications} pending applications</span>
        )}
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-surface-dark p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Teams</h1>
          <Link
            href="/teams/new"
            className="rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-primary-hover"
          >
            Create New Team
          </Link>
        </div>

        {/* Teams I Lead */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Teams I Lead
          </h2>
          {teamsData?.led && teamsData.led.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamsData.led.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <p className="text-slate-300">No teams led yet.</p>
          )}
        </section>

        {/* Teams I Joined */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Teams I Joined
          </h2>
          {teamsData?.joined && teamsData.joined.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamsData.joined.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <p className="text-slate-300">No teams joined yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
