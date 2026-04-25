"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

export default function AdminTeamsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">("ALL");

  const { data: teamsData, isLoading } = api.admin.listTeams.useQuery({
    ...(search && { search }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
  });

  const deleteTeamMutation = api.admin.deleteTeam.useMutation();
  const utils = api.useUtils();

  const handleDelete = async (teamId: string, teamTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${teamTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTeamMutation.mutateAsync({ id: teamId });
      await utils.admin.listTeams.invalidate();
    } catch (error) {
      console.error("Failed to delete team:", error);
      alert("Failed to delete team. Please try again.");
    }
  };

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

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold text-white">Teams</h1>
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Teams</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-border bg-surface p-4">
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border border-border bg-surface-dark px-4 py-2 text-white placeholder:text-slate-300 focus:border-text-primary focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded border border-border bg-surface-dark px-4 py-2 text-white focus:border-text-primary focus:outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Teams Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-4 text-primary">Title</th>
              <th className="p-4 text-primary">Leader</th>
              <th className="p-4 text-primary">Content</th>
              <th className="p-4 text-primary">Status</th>
              <th className="p-4 text-primary">Members</th>
              <th className="p-4 text-primary">Applications</th>
              <th className="p-4 text-primary">Created</th>
              <th className="p-4 text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamsData?.items?.map((team) => (
              <tr key={team.id} className="border-b border-border">
                <td className="p-4">
                  <Link
                    href={`/teams/${team.id}`}
                    className="font-semibold text-primary transition hover:underline"
                  >
                    {team.title}
                  </Link>
                </td>
                <td className="p-4 text-slate-300">
                  {team.leader.name}
                  <div className="text-xs">{team.leader.email}</div>
                </td>
                <td className="p-4 text-slate-300">
                  {team.content?.name ?? team.contentType}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
                      team.status,
                    )}`}
                  >
                    {team.status}
                  </span>
                </td>
                <td className="p-4 text-slate-300">{team._count.members}</td>
                <td className="p-4 text-slate-300">{team._count.applications}</td>
                <td className="p-4 text-slate-300">
                  {new Date(team.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => void handleDelete(team.id, team.title)}
                    className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!teamsData?.items || teamsData.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-slate-300">
                  No teams found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
