import Link from "next/link";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-indigo-400">BPSR</span> Recruitment Board
          </h1>
          <p className="text-xl text-slate-300">
            Blue Protocol: Star Resonance — Find your team
          </p>

          <div className="flex flex-col items-center gap-4">
            {session?.user ? (
              <>
                <p className="text-lg text-slate-300">
                  Welcome, {session.user.name}
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/teams"
                    className="rounded-full bg-indigo-600 px-8 py-3 font-semibold no-underline transition hover:bg-indigo-700"
                  >
                    Browse Teams
                  </Link>
                  <Link
                    href="/profile"
                    className="rounded-full bg-white/10 px-8 py-3 font-semibold no-underline transition hover:bg-white/20"
                  >
                    My Profile
                  </Link>
                </div>
              </>
            ) : (
              <Link
                href="/api/auth/signin"
                className="rounded-full bg-indigo-600 px-10 py-3 font-semibold no-underline transition hover:bg-indigo-700"
              >
                Sign in with Discord
              </Link>
            )}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
