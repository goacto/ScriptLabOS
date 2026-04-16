"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingWizard from "@/components/OnboardingWizard";
import { useScriptLab } from "@/lib/ScriptLabProvider";

export default function OnboardPage() {
  const { state, hydrated } = useScriptLab();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && state.profile) router.replace("/dashboard");
  }, [hydrated, state.profile, router]);

  if (!hydrated) return null;
  return <OnboardingWizard />;
}
