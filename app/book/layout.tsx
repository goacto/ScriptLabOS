import type { Metadata } from "next";

const TITLE = "Chapter modules · ScriptLabOS";
const DESCRIPTION =
  "One short exercise per chapter. Free, always. Your answers stay on this device.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/book" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/book",
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
