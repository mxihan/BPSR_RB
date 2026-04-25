import { api } from "~/trpc/server";
import Link from "next/link";

export default async function PlayerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await api.profile.getById({ id: params.id });

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface-dark p-4">
        <div className="mx-auto max-w-2xl rounded-lg bg-surface p-8">
          <p className="text-center text-slate-300">Profile not found.</p>
          <div className="mt-4 text-center">
            <Link
              href="/players"
              className="text-primary hover:underline"
            >
              Back to Player Browser
            </Link>
          </div>
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
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <Link
            href="/players"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Player Browser
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">{profile.displayName}</h1>
            {profile.server && (
              <p className="text-slate-300">{profile.server.name}</p>
            )}
          </div>

          {/* Main Info */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {/* Primary Class */}
            {profile.primaryClass && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-slate-400">
                  Primary Class
                </h3>
                <div>
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
              </div>
            )}

            {/* Secondary Class */}
            {profile.secondaryClass && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-slate-400">
                  Secondary Class
                </h3>
                <div>
                  <span
                    className={getRoleColor(profile.secondaryClass.role)}
                  >
                    {profile.secondaryClass.name}
                  </span>
                  {profile.secondarySpec && (
                    <span className="text-slate-300">
                      {" "}
                      / {profile.secondarySpec.name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Adventurer Level */}
            {profile.adventurerLevel && (
              <div>
                <h3 className="mb-1 text-sm font-medium text-slate-400">
                  Adventurer Level
                </h3>
                <p className="text-lg">{profile.adventurerLevel}</p>
              </div>
            )}

            {/* Ability Score */}
            {profile.abilityScore !== null &&
              profile.abilityScore !== undefined && (
                <div>
                  <h3 className="mb-1 text-sm font-medium text-slate-400">
                    Ability Score
                  </h3>
                  <p className="text-lg">{profile.abilityScore}</p>
                </div>
              )}
          </div>

          {/* Stats */}
          <div className="mb-6 border-t border-border pt-6">
            <h2 className="mb-4 text-xl font-semibold">Stats</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.dreamLevel !== null &&
                profile.dreamLevel !== undefined && (
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-400">
                      Dream Level
                    </h3>
                    <p>{profile.dreamLevel}</p>
                  </div>
                )}

              {profile.illusionStrength !== null &&
                profile.illusionStrength !== undefined && (
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-400">
                      Illusion Strength
                    </h3>
                    <p>{profile.illusionStrength}</p>
                  </div>
                )}

              {profile.adventurerRank !== null &&
                profile.adventurerRank !== undefined && (
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-slate-400">
                      Adventurer Rank
                    </h3>
                    <p>{profile.adventurerRank}</p>
                  </div>
                )}

              {profile.timezone && (
                <div>
                  <h3 className="mb-1 text-sm font-medium text-slate-400">
                    Timezone
                  </h3>
                  <p>{profile.timezone}</p>
                </div>
              )}
            </div>
          </div>

          {/* About */}
          {profile.about && (
            <div className="border-t border-border pt-6">
              <h2 className="mb-3 text-xl font-semibold">About</h2>
              <p className="whitespace-pre-wrap text-slate-300">
                {profile.about}
              </p>
            </div>
          )}

          {/* User Info */}
          {profile.user && (
            <div className="mt-6 border-t border-border pt-6 text-sm text-slate-400">
              <p>
                Profile owner:{" "}
                <span className="font-medium text-white">
                  {profile.user.name}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
