"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import BuildStatusHUD from "@/components/BuildStatusHUD";
import { useScriptLab } from "@/lib/ScriptLabProvider";

export default function DashboardPage() {
  const { state, hydrated } = useScriptLab();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !state.profile) router.replace("/onboard");
  }, [hydrated, state.profile, router]);

  if (!hydrated || !state.profile) return null;
  return (
    <>
      <NavBar />
      <BuildStatusHUD />
    </>
  );
}
