"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [commentText, setCommentText] = useState("");

  const { data: team, isLoading, refetch } = api.team.getById.useQuery({ id: params.id });
  const { data: profiles } = api.profile.getMine.useQuery(
    undefined,
    { enabled: !!session?.user },
  );

  const createApplication = api.application.create.useMutation({
    onSuccess: () => {
      setShowApplyForm(false);
      setApplicationMessage("");
      setSelectedProfileId("");
      void refetch();
    },
  });

  const createComment = api.comment.create.useMutation({
    onSuccess: () => {
      setCommentText("");
      void refetch();
    },
  });

  const deleteTeam = api.team.delete.useMutation({
    onSuccess: () => {
      router.push("/teams");
    },
  });

  const handleApply = (slotId: string) => {
    if (!session?.user) return;
    setSelectedSlotId(slotId);
    setShowApplyForm(true);
  };

  const submitApplication = () => {
    if (!selectedSlotId || !selectedProfileId || !team) return;
    createApplication.mutate({
      teamId: team.id,
      slotId: selectedSlotId,
      profileId: selectedProfileId,
      message: applicationMessage || undefined,
    });
  };

  const submitComment = () => {
    if (!commentText.trim() || !team) return;
    createComment.mutate({
      teamId: team.id,
      content: commentText,
    });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-slate-400">Loading team...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Team Not Found</h1>
          <Link href="/teams" className="text-primary hover:underline">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const isLeader = session?.user?.id === team.leader.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isLeader || isAdmin;

  return (
    <div className="min-h-screen bg-surface-dark">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Back Button */}
        <Link
          href="/teams"
          className="mb-6 inline-flex items-center text-sm text-slate-400 hover:text-white transition"
        >
          &larr; Back to Teams
        </Link>

        {/* Header */}
        <div className="mb-6 rounded-lg bg-surface p-6 border border-border">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{team.title}</h1>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-3 py-1 text-sm font-medium border ${getStatusColor(team.status)}`}
                >
                  {team.status.replace("_", " ")}
                </span>
                {team.contentType && (
                  <span className="text-slate-400">{team.contentType.replace("_", " ")}</span>
                )}
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Link
                  href={`/teams/${team.id}/edit`}
                  className="rounded bg-surface-dark px-4 py-2 text-sm font-medium text-white border border-border hover:bg-surface transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this team?")) {
                      deleteTeam.mutate({ id: team.id });
                    }
                  }}
                  className="rounded bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Content Info */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Content</div>
              <div className="text-white">{team.content?.name ?? "Any"}</div>
            </div>
            {team.difficulty && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Difficulty</div>
                <div className="text-primary">{team.difficulty.name}</div>
              </div>
            )}
            {team.masterLevel && team.difficulty?.levelBased && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Master Level</div>
                <div className="text-white">{team.masterLevel}</div>
              </div>
            )}
            {team.scheduledAt && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Scheduled</div>
                <div className="text-white">
                  {new Date(team.scheduledAt).toLocaleDateString()}{" "}
                  {new Date(team.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {team.description && (
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">Description</div>
              <p className="text-slate-300 whitespace-pre-wrap">{team.description}</p>
            </div>
          )}

          {/* Leader Info */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <div className="text-xs text-slate-500">Led by</div>
            {team.leader.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={team.leader.image} alt="" className="h-8 w-8 rounded-full" />
            )}
            <div className="text-white">{team.leader.name}</div>
            {team.leader.role === "ADMIN" && (
              <span className="rounded bg-support/10 px-2 py-0.5 text-xs text-support border border-support/20">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Role Slots */}
        <div className="mb-6 rounded-lg bg-surface p-6 border border-border">
          <h2 className="text-xl font-semibold text-white mb-4">Role Slots</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {team.slots.map((slot) => (
              <div
                key={slot.id}
                className={`rounded-lg p-4 border ${slot.isFilled ? "bg-surface-dark border-border" : "bg-surface border-primary/30"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-sm font-medium border ${getRoleColor(slot.role)}`}
                    >
                      {slot.role}
                    </span>
                    {slot.isFilled ? (
                      <span className="text-xs text-slate-500">Filled</span>
                    ) : (
                      <span className="text-xs text-green-400">Open</span>
                    )}
                  </div>
                </div>

                {slot.isFilled && slot.filledBy ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {slot.filledBy.user?.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={slot.filledBy.user.image}
                          alt=""
                          className="h-6 w-6 rounded-full"
                        />
                      )}
                      <span className="text-white text-sm">
                        {slot.filledBy.displayName}
                      </span>
                    </div>
                    {slot.filledBy.primaryClass && (
                      <div className="text-xs text-slate-400">
                        {slot.filledBy.primaryClass.name}
                        {slot.filledBy.primarySpec && ` - ${slot.filledBy.primarySpec.name}`}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {slot.preferredClass && (
                      <div className="text-xs text-slate-400">
                        Preferred: {slot.preferredClass.name}
                        {slot.preferredSpec && ` (${slot.preferredSpec.name})`}
                      </div>
                    )}
                    {(slot.minAbilityScore ?? slot.minDreamLevel) ? (
                      <div className="text-xs text-slate-500">
                        {slot.minAbilityScore && `Ability: ${slot.minAbilityScore}+`}
                        {slot.minAbilityScore && slot.minDreamLevel && " - "}
                        {slot.minDreamLevel && `Dream: ${slot.minDreamLevel}+`}
                      </div>
                    ) : null}
                    {!isLeader && session?.user && team.status === "OPEN" && (
                      <button
                        onClick={() => handleApply(slot.id)}
                        className="mt-2 rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                )}

                {/* Pending Applications (for leader) */}
                {isLeader && slot.applications.length > 0 && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-border">
                    <div className="text-xs text-slate-500">Pending Applications</div>
                    {slot.applications.map((app) => (
                      <div
                        key={app.id}
                        className="rounded bg-surface-dark p-2 border border-border"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {app.profile.user?.image && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={app.profile.user.image}
                              alt=""
                              className="h-5 w-5 rounded-full"
                            />
                          )}
                          <span className="text-sm text-white">
                            {app.profile.displayName}
                          </span>
                        </div>
                        {app.profile.primaryClass && (
                          <div className="text-xs text-slate-400">
                            {app.profile.primaryClass.name}
                            {app.profile.primarySpec && ` - ${app.profile.primarySpec.name}`}
                          </div>
                        )}
                        {app.message && (
                          <div className="text-xs text-slate-500 mt-1 italic">
                            &ldquo;{app.message}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="rounded-lg bg-surface p-6 border border-border">
          <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>

          {session?.user && (
            <div className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full rounded bg-surface-dark px-3 py-2 text-sm text-white placeholder:text-slate-500 border border-border focus:border-primary focus:outline-none resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim() || createComment.isPending}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Comment
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {team.comments.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No comments yet</div>
            ) : (
              team.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded bg-surface-dark p-4 border border-border"
                >
                  <div className="flex items-start gap-3">
                    {comment.user.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={comment.user.image}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{comment.content}</p>
                    </div>
                    {(comment.userId === session?.user?.id || isAdmin) && (
                      <button
                        onClick={() => {
                          // TODO: Implement delete
                        }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md rounded-lg bg-surface p-6 border border-border">
            <h3 className="text-xl font-semibold text-white mb-4">Apply to Team</h3>

            {!session?.user ? (
              <div className="text-center text-slate-400 py-4">
                Please sign in to apply
              </div>
            ) : !profiles || profiles.length === 0 ? (
              <div className="text-center">
                <p className="text-slate-400 mb-4">You need a profile to apply</p>
                <Link
                  href="/profile"
                  className="inline-block rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition"
                >
                  Create Profile
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Select Profile
                  </label>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="w-full rounded bg-surface-dark px-3 py-2 text-sm text-white border border-border focus:border-primary focus:outline-none"
                  >
                    <option value="">Choose a profile...</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.displayName}
                        {profile.primaryClass && ` (${profile.primaryClass.name})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    placeholder="Tell the leader about yourself..."
                    rows={3}
                    className="w-full rounded bg-surface-dark px-3 py-2 text-sm text-white placeholder:text-slate-500 border border-border focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowApplyForm(false);
                      setApplicationMessage("");
                      setSelectedProfileId("");
                    }}
                    className="rounded bg-surface-dark px-4 py-2 text-sm font-medium text-white border border-border hover:bg-surface transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApplication}
                    disabled={!selectedProfileId || createApplication.isPending}
                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
