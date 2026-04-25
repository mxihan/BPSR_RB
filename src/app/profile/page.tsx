"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

export default function ProfileListPage() {
  const { data: session } = useSession();
  const { data: profiles, isLoading } = api.profile.getMine.useQuery();

  if (!session) {
    return (
      <div className="min-h-screen bg-surface-dark p-4">
        <div className="mx-auto max-w-4xl rounded-lg bg-surface p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">My Profiles</h1>
          <p className="mb-6 text-slate-300">
            Please sign in to manage your player profiles.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-block rounded bg-primary px-6 py-2 font-semibold text-white transition hover:bg-indigo-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dark p-4">
        <div className="mx-auto max-w-4xl rounded-lg bg-surface p-8">
          <div className="text-center text-slate-300">Loading profiles...</div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-surface-dark p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profiles</h1>
          <Link
            href="/profile/new"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Add Profile
          </Link>
        </div>

        {!profiles || profiles.length === 0 ? (
          <div className="rounded-lg bg-surface p-8 text-center">
            <p className="mb-4 text-slate-300">
              You haven&apos;t created any profiles yet.
            </p>
            <Link
              href="/profile/new"
              className="inline-block rounded bg-primary px-6 py-2 font-semibold text-white transition hover:bg-indigo-600"
            >
              Create Your First Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{profile.displayName}</h3>
                      {profile.isMain && (
                        <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          Main
                        </span>
                      )}
                      {!profile.isVisible && (
                        <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                      {profile.primaryClass && (
                        <div>
                          <span className={getRoleColor(profile.primaryClass.role)}>
                            {profile.primaryClass.name}
                          </span>
                          {profile.primarySpec && (
                            <span> / {profile.primarySpec.name}</span>
                          )}
                        </div>
                      )}
                      <div>Level {profile.adventurerLevel}</div>
                      <div>Ability: {profile.abilityScore}</div>
                      {profile.server && <div>{profile.server.name}</div>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/profile/${profile.id}/edit`}
                      className="rounded border border-border px-3 py-1.5 text-sm transition hover:bg-slate-700"
                    >
                      Edit
                    </Link>
                    <DeleteButton profileId={profile.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteButton({ profileId }: { profileId: string }) {
  const utils = api.useUtils();
  const deleteProfile = api.profile.delete.useMutation({
    onSuccess: () => {
      void utils.profile.getMine.invalidate();
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfile.mutate({ id: profileId });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteProfile.isPending}
      className="rounded border border-red-900 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-900/20 disabled:opacity-50"
    >
      {deleteProfile.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
