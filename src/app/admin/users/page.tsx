"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [bannedFilter, setBannedFilter] = useState<string>("ALL");

  const { data: usersData, isLoading } = api.admin.listUsers.useQuery({
    ...(search && { search }),
    ...(roleFilter !== "ALL" && { role: roleFilter as "USER" | "LEADER" | "ADMIN" }),
    ...(bannedFilter !== "ALL" && { banned: bannedFilter === "banned" }),
  });

  const changeRoleMutation = api.admin.changeUserRole.useMutation();
  const toggleBanMutation = api.admin.toggleBan.useMutation();
  const utils = api.useUtils();

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await changeRoleMutation.mutateAsync({
        userId,
        role: newRole as "USER" | "LEADER" | "ADMIN",
      });
      await utils.admin.listUsers.invalidate();
    } catch (error) {
      console.error("Failed to change role:", error);
      alert("Failed to change role. Please try again.");
    }
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    if (!currentBanned && !confirm("Are you sure you want to ban this user?")) return;

    try {
      await toggleBanMutation.mutateAsync({
        userId,
        banned: !currentBanned,
        banReason: !currentBanned ? "Banned by admin" : undefined,
      });
      await utils.admin.listUsers.invalidate();
    } catch (error) {
      console.error("Failed to toggle ban:", error);
      alert("Failed to update ban status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold text-white">Users</h1>
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Users</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-border bg-surface p-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border border-border bg-surface-dark px-4 py-2 text-white placeholder:text-slate-300 focus:border-primary focus:outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded border border-border bg-surface-dark px-4 py-2 text-white focus:border-primary focus:outline-none"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="LEADER">Leader</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={bannedFilter}
          onChange={(e) => setBannedFilter(e.target.value)}
          className="rounded border border-border bg-surface-dark px-4 py-2 text-white focus:border-primary focus:outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="not_banned">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-4 text-primary">Name</th>
              <th className="p-4 text-primary">Email</th>
              <th className="p-4 text-primary">Role</th>
              <th className="p-4 text-primary">Status</th>
              <th className="p-4 text-primary">Profiles</th>
              <th className="p-4 text-primary">Teams Led</th>
              <th className="p-4 text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersData?.items?.map((user) => (
              <tr key={user.id} className="border-b border-border">
                <td className="p-4 text-white">{user.name}</td>
                <td className="p-4 text-slate-300">{user.email}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => void handleChangeRole(user.id, e.target.value)}
                    className="rounded border border-border bg-surface-dark px-3 py-1 text-sm text-white focus:border-primary focus:outline-none"
                  >
                    <option value="USER">User</option>
                    <option value="LEADER">Leader</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      user.banned
                        ? "bg-red-900/50 text-red-300 border border-red-700"
                        : "bg-green-900/50 text-green-300 border border-green-700"
                    }`}
                  >
                    {user.banned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="p-4 text-slate-300">{user._count.profiles}</td>
                <td className="p-4 text-slate-300">{user._count.ledTeams}</td>
                <td className="p-4">
                  <button
                    onClick={() => void handleToggleBan(user.id, user.banned)}
                    className={`rounded px-3 py-1 text-sm font-medium transition ${
                      user.banned
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
            {!usersData?.items || usersData.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-300">
                  No users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
