import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "~/trpc/react";
import { Navbar } from "~/components/layout/navbar";

export const metadata: Metadata = {
  title: "BPSR Recruitment Board",
  description:
    "Blue Protocol: Star Resonance — Find your team for dungeons, raids, and more",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-surface-dark text-white">
        <SessionProvider>
          <TRPCReactProvider>
            <Navbar />
            <main>{children}</main>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
