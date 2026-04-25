"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

type ContentType = "DUNGEON" | "RAID" | "WORLD_BOSS" | "RUSH_BATTLE" | "TRAINING_RUINS" | "STIMEN_VAULT" | "OTHER";

type RoleSlot = {
  role: "Tank" | "DPS" | "Healer" | "Support";
  preferredClassId: string | null;
  preferredSpecId: string | null;
  minAbilityScore: number | null;
  minDreamLevel: number | null;
  minIllusionStrength: number | null;
};

export default function CreateTeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    contentType: "" as ContentType | "",
    contentId: "",
    season: "ANY" as "SEASON_1" | "SEASON_2" | "ANY",
    difficultyId: "",
    masterLevel: "",
    description: "",
    scheduledAt: "",
    scheduledTime: "",
  });

  const [slots, setSlots] = useState<RoleSlot[]>([
    { role: "Tank" as const, preferredClassId: null, preferredSpecId: null, minAbilityScore: null, minDreamLevel: null, minIllusionStrength: null },
    { role: "DPS" as const, preferredClassId: null, preferredSpecId: null, minAbilityScore: null, minDreamLevel: null, minIllusionStrength: null },
    { role: "DPS" as const, preferredClassId: null, preferredSpecId: null, minAbilityScore: null, minDreamLevel: null, minIllusionStrength: null },
    { role: "Healer" as const, preferredClassId: null, preferredSpecId: null, minAbilityScore: null, minDreamLevel: null, minIllusionStrength: null },
  ]);

  const { data: classes } = api.dictionary.listClasses.useQuery();
  const { data: content } = api.dictionary.listContent.useQuery(
    formData.contentType ? { contentType: formData.contentType } : undefined,
  );
  const { data: difficulties } = api.dictionary.listDifficulties.useQuery(
    formData.contentType ? { contentType: formData.contentType } : undefined,
  );

  const createTeam = api.team.create.useMutation({
    onSuccess: (data) => {
      router.push(`/teams/${data.id}`);
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sign In Required</h1>
          <p className="text-slate-400 mb-6">You must be signed in to create a team.</p>
          <Link
            href="/api/auth/signin"
            className="inline-block rounded bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-hover transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlotChange = (index: number, field: keyof RoleSlot, value: string | number | null) => {
    const newSlots = [...slots];
    const slot = { ...newSlots[index], [field]: value };
    newSlots[index] = slot as RoleSlot;
    setSlots(newSlots);
  };

  const addSlot = () => {
    setSlots([
      ...slots,
      { role: "DPS" as const, preferredClassId: null, preferredSpecId: null, minAbilityScore: null, minDreamLevel: null, minIllusionStrength: null },
    ]);
  };

  const removeSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scheduledAt = formData.scheduledAt && formData.scheduledTime
      ? new Date(`${formData.scheduledAt}T${formData.scheduledTime}`)
      : null;

    createTeam.mutate({
      title: formData.title,
      contentType: formData.contentType as ContentType,
      contentId: formData.contentId || null,
      season: formData.season,
      difficultyId: formData.difficultyId || null,
      masterLevel: formData.masterLevel ? parseInt(formData.masterLevel) : null,
      description: formData.description || null,
      scheduledAt,
      slots: slots.map((slot) => ({
        ...slot,
        minAbilityScore: slot.minAbilityScore ?? undefined,
        minDreamLevel: slot.minDreamLevel ?? undefined,
        minIllusionStrength: slot.minIllusionStrength ?? undefined,
      })),
    });
  };

  const selectedDifficulty = difficulties?.find((d) => d.id === formData.difficultyId);

  return (
    <div className="min-h-screen bg-surface-dark">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create Team</h1>
          <p className="mt-2 text-slate-400">Set up a new team recruitment post</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-lg bg-surface p-6 border border-border">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Team Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  placeholder="e.g., Chaos Raid Looking for 2 more"
                  className="w-full rounded bg-surface-dark px-3 py-2 text-white placeholder:text-slate-500 border border-border focus:border-primary focus:outline-none"
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Content Type *
                </label>
                <select
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded bg-surface-dark px-3 py-2 text-white border border-border focus:border-primary focus:outline-none"
                >
                  <option value="">Select content type...</option>
                  <option value="DUNGEON">Dungeon</option>
                  <option value="RAID">Raid</option>
                  <option value="WORLD_BOSS">World Boss</option>
                  <option value="RUSH_BATTLE">Rush Battle</option>
                  <option value="TRAINING_RUINS">Training Ruins</option>
                  <option value="STIMEN_VAULT">Stimen Vault</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Content */}
              {formData.contentType && content && content.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Specific Content
                  </label>
                  <select
                    name="contentId"
                    value={formData.contentId}
                    onChange={handleInputChange}
                    className="w-full rounded bg-surface-dark px-3 py-2 text-white border border-border focus:border-primary focus:outline-none"
                  >
                    <option value="">Any content of this type</option>
                    {content.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Season */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Season
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  className="w-full rounded bg-surface-dark px-3 py-2 text-white border border-border focus:border-primary focus:outline-none"
                >
                  <option value="ANY">Any Season</option>
                  <option value="SEASON_1">Season 1</option>
                  <option value="SEASON_2">Season 2</option>
                </select>
              </div>

              {/* Difficulty */}
              {formData.contentType && difficulties && difficulties.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficultyId"
                    value={formData.difficultyId}
                    onChange={handleInputChange}
                    className="w-full rounded bg-surface-dark px-3 py-2 text-white border border-border focus:border-primary focus:outline-none"
                  >
                    <option value="">Select difficulty...</option>
                    {difficulties.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Master Level */}
              {selectedDifficulty?.levelBased && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Master Level
                  </label>
                  <input
                    type="number"
                    name="masterLevel"
                    value={formData.masterLevel}
                    onChange={handleInputChange}
                    min={selectedDifficulty.minLevel ?? 1}
                    max={selectedDifficulty.maxLevel ?? 999}
                    placeholder={selectedDifficulty.minLevel ? `Min: ${selectedDifficulty.minLevel}` : undefined}
                    className="w-full rounded bg-surface-dark px-3 py-2 text-white placeholder:text-slate-500 border border-border focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Schedule */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded bg-surface-dark px-3 py-2 text-white border border-border focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Schedule Time
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    className="w-full rounded bg-surface-dark px-3 py-2 text-white border border-border focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={2000}
                  rows={5}
                  placeholder="Describe your team, requirements, and any other details..."
                  className="w-full rounded bg-surface-dark px-3 py-2 text-white placeholder:text-slate-500 border border-border focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Role Slots */}
          <div className="rounded-lg bg-surface p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Role Slots</h2>
              <button
                type="button"
                onClick={addSlot}
                className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition"
              >
                + Add Slot
              </button>
            </div>

            <div className="space-y-4">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="rounded bg-surface-dark p-4 border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">Slot {index + 1}</h3>
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(index)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {/* Role */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Role *
                      </label>
                      <select
                        value={slot.role}
                        onChange={(e) => handleSlotChange(index, "role", e.target.value)}
                        className="w-full rounded bg-surface px-2 py-1.5 text-sm text-white border border-border focus:border-primary focus:outline-none"
                      >
                        <option value="Tank">Tank</option>
                        <option value="DPS">DPS</option>
                        <option value="Healer">Healer</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>

                    {/* Preferred Class */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Preferred Class (optional)
                      </label>
                      <select
                        value={slot.preferredClassId ?? ""}
                        onChange={(e) => handleSlotChange(index, "preferredClassId", e.target.value || null)}
                        className="w-full rounded bg-surface px-2 py-1.5 text-sm text-white border border-border focus:border-primary focus:outline-none"
                      >
                        <option value="">Any class</option>
                        {classes?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred Spec */}
                    {slot.preferredClassId && (
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Preferred Spec (optional)
                        </label>
                        <select
                          value={slot.preferredSpecId ?? ""}
                          onChange={(e) => handleSlotChange(index, "preferredSpecId", e.target.value || null)}
                          className="w-full rounded bg-surface px-2 py-1.5 text-sm text-white border border-border focus:border-primary focus:outline-none"
                        >
                          <option value="">Any spec</option>
                          {classes
                            ?.find((c) => c.id === slot.preferredClassId)
                            ?.specs.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Min Ability Score */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Min Ability Score (optional)
                      </label>
                      <input
                        type="number"
                        value={slot.minAbilityScore ?? ""}
                        onChange={(e) => handleSlotChange(index, "minAbilityScore", e.target.value ? parseInt(e.target.value) : null)}
                        min={0}
                        max={9999}
                        placeholder="No minimum"
                        className="w-full rounded bg-surface px-2 py-1.5 text-sm text-white placeholder:text-slate-500 border border-border focus:border-primary focus:outline-none"
                      />
                    </div>

                    {/* Min Dream Level */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Min Dream Level (optional)
                      </label>
                      <input
                        type="number"
                        value={slot.minDreamLevel ?? ""}
                        onChange={(e) => handleSlotChange(index, "minDreamLevel", e.target.value ? parseInt(e.target.value) : null)}
                        min={0}
                        max={999}
                        placeholder="No minimum"
                        className="w-full rounded bg-surface px-2 py-1.5 text-sm text-white placeholder:text-slate-500 border border-border focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded bg-surface-dark px-6 py-2.5 font-medium text-white border border-border hover:bg-surface transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTeam.isPending}
              className="rounded bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTeam.isPending ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
