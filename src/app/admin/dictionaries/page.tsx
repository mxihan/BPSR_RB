"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

type TabType = "classes" | "content" | "difficulties" | "servers";

export default function AdminDictionariesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("classes");

  const { data: classes } = api.dictionary.listClasses.useQuery();
  const { data: content } = api.dictionary.listContent.useQuery();
  const { data: difficulties } = api.dictionary.listDifficulties.useQuery();
  const { data: servers } = api.dictionary.listServers.useQuery();

  const createClassMutation = api.dictionary.adminCreateClass.useMutation();
  const updateClassMutation = api.dictionary.adminUpdateClass.useMutation();
  const deleteClassMutation = api.dictionary.adminDeleteClass.useMutation();
  const utils = api.useUtils();

  const tabs: { key: TabType; label: string }[] = [
    { key: "classes", label: "Classes" },
    { key: "content", label: "Content" },
    { key: "difficulties", label: "Difficulties" },
    { key: "servers", label: "Servers" },
  ];

  const handleDelete = async (type: TabType, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      if (type === "classes") {
        await deleteClassMutation.mutateAsync({ id });
      }
      // Add other types as needed
      await utils.dictionary.listClasses.invalidate();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Dictionaries</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-surface hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-semibold text-white">Classes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-4 text-primary">Name</th>
                    <th className="p-4 text-primary">Role</th>
                    <th className="p-4 text-primary">Main Stat</th>
                    <th className="p-4 text-primary">Specs Count</th>
                    <th className="p-4 text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes?.map((cls) => (
                    <tr key={cls.id} className="border-b border-border">
                      <td className="p-4 text-white">{cls.name}</td>
                      <td className="p-4 text-slate-300">{cls.role}</td>
                      <td className="p-4 text-slate-300">{cls.mainStat}</td>
                      <td className="p-4 text-slate-300">{cls.specs?.length || 0}</td>
                      <td className="p-4">
                        <button
                          onClick={() => void handleDelete("classes", cls.id)}
                          className="text-red-400 transition hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!classes || classes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-300">
                        No classes found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border p-4">
              <button className="rounded bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/90">
                Add New Class
              </button>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-semibold text-white">Content</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-4 text-primary">Type</th>
                    <th className="p-4 text-primary">Name</th>
                    <th className="p-4 text-primary">Season</th>
                    <th className="p-4 text-primary">Party Size</th>
                    <th className="p-4 text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content?.map((cnt) => (
                    <tr key={cnt.id} className="border-b border-border">
                      <td className="p-4 text-white">{cnt.contentType}</td>
                      <td className="p-4 text-white">{cnt.name}</td>
                      <td className="p-4 text-slate-300">{cnt.season}</td>
                      <td className="p-4 text-slate-300">{cnt.partySize}</td>
                      <td className="p-4">
                        <button className="mr-2 text-blue-400 transition hover:text-blue-300">
                          Edit
                        </button>
                        <button className="text-red-400 transition hover:text-red-300">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!content || content.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-300">
                        No content found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Difficulties Tab */}
        {activeTab === "difficulties" && (
          <div className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-semibold text-white">Difficulties</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-4 text-primary">Content Type</th>
                    <th className="p-4 text-primary">Name</th>
                    <th className="p-4 text-primary">Level Based</th>
                    <th className="p-4 text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {difficulties?.map((diff) => (
                    <tr key={diff.id} className="border-b border-border">
                      <td className="p-4 text-white">{diff.contentType}</td>
                      <td className="p-4 text-white">{diff.name}</td>
                      <td className="p-4 text-slate-300">{diff.levelBased ? "Yes" : "No"}</td>
                      <td className="p-4">
                        <button className="mr-2 text-blue-400 transition hover:text-blue-300">
                          Edit
                        </button>
                        <button className="text-red-400 transition hover:text-red-300">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!difficulties || difficulties.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-300">
                        No difficulties found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Servers Tab */}
        {activeTab === "servers" && (
          <div className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border p-4">
              <h2 className="text-xl font-semibold text-white">Servers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-4 text-primary">Name</th>
                    <th className="p-4 text-primary">Region</th>
                    <th className="p-4 text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servers?.map((server) => (
                    <tr key={server.id} className="border-b border-border">
                      <td className="p-4 text-white">{server.name}</td>
                      <td className="p-4 text-slate-300">{server.region}</td>
                      <td className="p-4">
                        <button className="mr-2 text-blue-400 transition hover:text-blue-300">
                          Edit
                        </button>
                        <button className="text-red-400 transition hover:text-red-300">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!servers || servers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-300">
                        No servers found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
