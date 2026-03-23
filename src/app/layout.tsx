import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsAI Scout — Workflow Intelligence Platform",
  description: "20 minutes to your automation roadmap. AI-powered workflow assessment for enterprise operations.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "OpsAI Scout — Workflow Intelligence Platform",
    description: "20 minutes to your automation roadmap.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
