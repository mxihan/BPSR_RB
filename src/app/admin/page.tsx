"use client";

import { api } from "~/trpc/react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = api.admin.getStats.useQuery();

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, color: "border-blue-500" },
    { label: "Total Teams", value: stats?.totalTeams ?? 0, color: "border-purple-500" },
    { label: "Open Teams", value: stats?.openTeams ?? 0, color: "border-green-500" },
    { label: "Total Profiles", value: stats?.totalProfiles ?? 0, color: "border-yellow-500" },
    { label: "Total Applications", value: stats?.totalApplications ?? 0, color: "border-pink-500" },
    { label: "Pending Applications", value: stats?.pendingApplications ?? 0, color: "border-orange-500" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border-l-4 ${stat.color} border border-border bg-surface p-6`}
          >
            <p className="text-sm font-medium text-slate-300">{stat.label}</p>
            <p className="mt-2 text-4xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
