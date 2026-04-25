"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function NewProfilePage() {
  const router = useRouter();
  const utils = api.useUtils();

  const [formData, setFormData] = useState({
    displayName: "",
    serverId: "",
    adventurerLevel: "",
    primaryClassId: "",
    primarySpecId: "",
    secondaryClassId: "",
    secondarySpecId: "",
    abilityScore: "",
    dreamLevel: "",
    illusionStrength: "",
    adventurerRank: "",
    about: "",
    timezone: "",
    isVisible: true,
    isMain: false,
  });

  const { data: servers } = api.dictionary.listServers.useQuery();
  const { data: classes } = api.dictionary.listClasses.useQuery();

  const selectedClass = classes?.find((c) => c.id === formData.primaryClassId);
  const selectedSecondaryClass = classes?.find(
    (c) => c.id === formData.secondaryClassId,
  );

  const createProfile = api.profile.create.useMutation({
    onSuccess: () => {
      void utils.profile.getMine.invalidate();
      router.push("/profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile.mutate({
      displayName: formData.displayName,
      serverId: formData.serverId || undefined,
      adventurerLevel: formData.adventurerLevel
        ? Number.parseInt(formData.adventurerLevel)
        : undefined,
      primaryClassId: formData.primaryClassId || undefined,
      primarySpecId: formData.primarySpecId || undefined,
      secondaryClassId: formData.secondaryClassId || undefined,
      secondarySpecId: formData.secondarySpecId || undefined,
      abilityScore: formData.abilityScore
        ? Number.parseInt(formData.abilityScore)
        : undefined,
      dreamLevel: formData.dreamLevel
        ? Number.parseInt(formData.dreamLevel)
        : undefined,
      illusionStrength: formData.illusionStrength
        ? Number.parseInt(formData.illusionStrength)
        : undefined,
      adventurerRank: formData.adventurerRank
        ? Number.parseInt(formData.adventurerRank)
        : undefined,
      about: formData.about || undefined,
      timezone: formData.timezone || undefined,
      isVisible: formData.isVisible,
      isMain: formData.isMain,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? value
            : value,
    }));

    // Reset spec when class changes
    if (name === "primaryClassId") {
      setFormData((prev) => ({ ...prev, primarySpecId: "" }));
    }
    if (name === "secondaryClassId") {
      setFormData((prev) => ({ ...prev, secondarySpecId: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Create New Profile</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg bg-surface p-6"
        >
          {/* Display Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Display Name *
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Server */}
          <div>
            <label className="mb-1 block text-sm font-medium">Server</label>
            <select
              name="serverId"
              value={formData.serverId}
              onChange={handleChange}
              className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
            >
              <option value="">Select server</option>
              {servers?.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Class & Spec */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Primary Class
              </label>
              <select
                name="primaryClassId"
                value={formData.primaryClassId}
                onChange={handleChange}
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
              >
                <option value="">Select class</option>
                {classes?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Primary Spec
              </label>
              <select
                name="primarySpecId"
                value={formData.primarySpecId}
                onChange={handleChange}
                disabled={!selectedClass}
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50"
              >
                <option value="">Select spec</option>
                {selectedClass?.specs.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Class & Spec */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Secondary Class
              </label>
              <select
                name="secondaryClassId"
                value={formData.secondaryClassId}
                onChange={handleChange}
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
              >
                <option value="">Select class</option>
                {classes?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Secondary Spec
              </label>
              <select
                name="secondarySpecId"
                value={formData.secondarySpecId}
                onChange={handleChange}
                disabled={!selectedSecondaryClass}
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50"
              >
                <option value="">Select spec</option>
                {selectedSecondaryClass?.specs.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Level & Stats */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Adventurer Level
              </label>
              <input
                type="number"
                name="adventurerLevel"
                value={formData.adventurerLevel}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Ability Score
              </label>
              <input
                type="number"
                name="abilityScore"
                value={formData.abilityScore}
                onChange={handleChange}
                min="0"
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Dream Level</label>
              <input
                type="number"
                name="dreamLevel"
                value={formData.dreamLevel}
                onChange={handleChange}
                min="0"
                max="90"
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Illusion Strength
              </label>
              <input
                type="number"
                name="illusionStrength"
                value={formData.illusionStrength}
                onChange={handleChange}
                min="0"
                className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Adventurer Rank */}
          <div>
            <label className="mb-1 block text-sm font-medium">Adventurer Rank</label>
            <input
              type="number"
              name="adventurerRank"
              value={formData.adventurerRank}
              onChange={handleChange}
              min="0"
              className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* About */}
          <div>
            <label className="mb-1 block text-sm font-medium">About</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="mb-1 block text-sm font-medium">Timezone</label>
            <input
              type="text"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              placeholder="e.g., UTC-5, EST, PST"
              className="w-full rounded border border-border bg-surface-dark px-3 py-2 text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isMain"
                checked={formData.isMain}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-surface-dark text-primary focus:ring-primary"
              />
              <span className="text-sm">Set as main profile</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border bg-surface-dark text-primary focus:ring-primary"
              />
              <span className="text-sm">Visible in player browser</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createProfile.isPending}
              className="rounded bg-primary px-6 py-2 font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
            >
              {createProfile.isPending ? "Creating..." : "Create Profile"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded border border-border px-6 py-2 font-semibold transition hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
