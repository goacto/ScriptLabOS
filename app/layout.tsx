import type { Metadata } from "next";
import "./globals.css";
import { ScriptLabProvider } from "@/lib/ScriptLabProvider";

export const metadata: Metadata = {
  title: "ScriptLab by GOACTO",
  description:
    "You are the developer of your own life. Visualize and edit your daily scripts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scanlines">
        <ScriptLabProvider>{children}</ScriptLabProvider>
      </body>
    </html>
  );
}
