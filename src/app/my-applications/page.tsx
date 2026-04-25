"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function MyApplicationsPage() {
  const { data: session } = useSession();
  const { data: applications, isLoading } = api.application.listByUser.useQuery();
  const withdrawMutation = api.application.withdraw.useMutation();
  const utils = api.useUtils();

  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="min-h-screen bg-surface-dark p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-slate-300">Please sign in to view your applications.</p>
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
      case "PENDING":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
      case "APPROVED":
        return "bg-green-900/50 text-green-300 border-green-700";
      case "REJECTED":
        return "bg-red-900/50 text-red-300 border-red-700";
      case "WITHDRAWN":
        return "bg-gray-700/50 text-gray-300 border-gray-600";
      default:
        return "bg-gray-700/50 text-gray-300 border-gray-600";
    }
  };

  const handleWithdraw = async (id: string) => {
    setWithdrawingId(id);
    try {
      await withdrawMutation.mutateAsync({ id });
      await utils.application.listByUser.invalidate();
    } catch (error) {
      console.error("Failed to withdraw application:", error);
      alert("Failed to withdraw application. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-white">My Applications</h1>

        {!applications || applications.length === 0 ? (
          <p className="text-slate-300">No applications yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-4 text-primary">Team</th>
                  <th className="p-4 text-primary">Role</th>
                  <th className="p-4 text-primary">Status</th>
                  <th className="p-4 text-primary">Applied Date</th>
                  <th className="p-4 text-primary">Leader Note</th>
                  <th className="p-4 text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-border">
                    <td className="p-4">
                      <Link
                        href={`/teams/${app.team.id}`}
                        className="font-semibold text-primary transition hover:underline"
                      >
                        {app.team.title}
                      </Link>
                      <div className="mt-1 text-sm text-slate-300">
                        {app.team.content?.name} {app.team.difficulty && `• ${app.team.difficulty.name}`}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{app.slot.role}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
                          app.status,
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="max-w-xs p-4 text-sm text-slate-300">
                      {app.reviewNote ?? "-"}
                    </td>
                    <td className="p-4">
                      {app.status === "PENDING" && (
                        <button
                          onClick={() => void handleWithdraw(app.id)}
                          disabled={withdrawingId === app.id}
                          className="rounded border border-border px-3 py-1 text-sm text-slate-300 transition hover:border-primary hover:text-primary disabled:opacity-50"
                        >
                          {withdrawingId === app.id ? "Withdrawing..." : "Withdraw"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
