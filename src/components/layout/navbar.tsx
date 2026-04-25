"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-border bg-surface-dark">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-white">
            <span className="text-primary">BPSR</span> Board
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/teams"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Teams
            </Link>
            <Link
              href="/players"
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Players
            </Link>
            {session?.user && (
              <>
                <Link
                  href="/my-teams"
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  My Teams
                </Link>
                <Link
                  href="/my-applications"
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  Applications
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded bg-support/20 px-3 py-1.5 text-xs font-medium text-support"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
              >
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-7 w-7 rounded-full"
                  />
                )}
                <span className="hidden sm:inline">{session.user.name}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="rounded bg-[#5865F2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4752C4]"
            >
              Sign in with Discord
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {session?.user && (
        <div className="flex border-t border-border px-4 py-2 md:hidden">
          <div className="flex gap-4 overflow-x-auto">
            <Link href="/teams" className="text-xs text-slate-300">Teams</Link>
            <Link href="/players" className="text-xs text-slate-300">Players</Link>
            <Link href="/my-teams" className="text-xs text-slate-300">My Teams</Link>
            <Link href="/profile" className="text-xs text-slate-300">Profile</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
