import type { Metadata } from "next";
import { getModule, isAvailable } from "@/lib/bookModules";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const m = getModule(id);
  if (!m || !isAvailable(m)) {
    const title = "Coming soon · ScriptLabOS";
    return {
      title: { absolute: title },
      alternates: { canonical: "/book" },
      openGraph: { title, url: "/book" },
      twitter: { title },
    };
  }
  const title = `Chapter ${m.chapter} · ScriptLabOS`;
  return {
    title: { absolute: title },
    description: m.intro,
    alternates: { canonical: `/book/${m.id}` },
    openGraph: {
      title,
      description: m.intro,
      url: `/book/${m.id}`,
    },
    twitter: {
      title,
      description: m.intro,
    },
  };
}

export default function BookChapterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
