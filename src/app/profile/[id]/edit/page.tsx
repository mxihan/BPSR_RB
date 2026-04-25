"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: profile, isLoading } = api.profile.getById.useQuery({
    id: params.id,
  });

  const { data: servers } = api.dictionary.listServers.useQuery();
  const { data: classes } = api.dictionary.listClasses.useQuery();

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

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName ?? "",
        serverId: profile.serverId ?? "",
        adventurerLevel: profile.adventurerLevel?.toString() ?? "",
        primaryClassId: profile.primaryClassId ?? "",
        primarySpecId: profile.primarySpecId ?? "",
        secondaryClassId: profile.secondaryClassId ?? "",
        secondarySpecId: profile.secondarySpecId ?? "",
        abilityScore: profile.abilityScore?.toString() ?? "",
        dreamLevel: profile.dreamLevel?.toString() ?? "",
        illusionStrength: profile.illusionStrength?.toString() ?? "",
        adventurerRank: profile.adventurerRank?.toString() ?? "",
        about: profile.about ?? "",
        timezone: profile.timezone ?? "",
        isVisible: profile.isVisible ?? true,
        isMain: profile.isMain ?? false,
      });
    }
  }, [profile]);

  const selectedClass = classes?.find((c) => c.id === formData.primaryClassId);
  const selectedSecondaryClass = classes?.find(
    (c) => c.id === formData.secondaryClassId,
  );

  const updateProfile = api.profile.update.useMutation({
    onSuccess: () => {
      void utils.profile.getMine.invalidate();
      router.push("/profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      id: params.id,
      displayName: formData.displayName,
      serverId: formData.serverId || null,
      adventurerLevel: formData.adventurerLevel
        ? Number.parseInt(formData.adventurerLevel)
        : null,
      primaryClassId: formData.primaryClassId || null,
      primarySpecId: formData.primarySpecId || null,
      secondaryClassId: formData.secondaryClassId || null,
      secondarySpecId: formData.secondarySpecId || null,
      abilityScore: formData.abilityScore
        ? Number.parseInt(formData.abilityScore)
        : null,
      dreamLevel: formData.dreamLevel
        ? Number.parseInt(formData.dreamLevel)
        : null,
      illusionStrength: formData.illusionStrength
        ? Number.parseInt(formData.illusionStrength)
        : null,
      adventurerRank: formData.adventurerRank
        ? Number.parseInt(formData.adventurerRank)
        : null,
      about: formData.about || null,
      timezone: formData.timezone || null,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dark p-4">
        <div className="mx-auto max-w-2xl rounded-lg bg-surface p-8">
          <div className="text-center text-slate-300">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface-dark p-4">
        <div className="mx-auto max-w-2xl rounded-lg bg-surface p-8">
          <p className="text-center text-slate-300">Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Edit Profile</h1>

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
              disabled={updateProfile.isPending}
              className="rounded bg-primary px-6 py-2 font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
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
