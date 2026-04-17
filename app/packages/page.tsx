"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import PackagesView from "@/components/PackagesView";
import { useScriptLab } from "@/lib/ScriptLabProvider";

export default function PackagesPage() {
  const { state, hydrated } = useScriptLab();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !state.profile) router.replace("/onboard");
  }, [hydrated, state.profile, router]);

  if (!hydrated || !state.profile) return null;
  return (
    <>
      <NavBar />
      <PackagesView />
    </>
  );
}
