import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { profileQuery, useSaveProfile } from "@/lib/profile";
import { clearLocalStageAnswers, readLocalStageAnswers } from "@/lib/baby-stage";

/**
 * Onboarding happens before sign-in, so the stage/date answers are only in
 * localStorage until now. Once someone authenticates, push them into their
 * profile row (once) so the data syncs across devices like everything else.
 */
export function OnboardingSync() {
  const { user, loading } = useAuth();
  const profile = useQuery(profileQuery(user?.id));
  const save = useSaveProfile(user?.id);

  useEffect(() => {
    if (loading || !user || profile.isLoading || save.isPending) return;
    if (profile.data?.stage) return; // already has stage data, nothing to sync

    const local = readLocalStageAnswers();
    if (!local) return;

    save.mutate(
      {
        stage: local.stage,
        due_date: local.dueDate ?? null,
        birth_date: local.birthDate ?? null,
      },
      { onSuccess: () => clearLocalStageAnswers() },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profile.data, profile.isLoading]);

  return null;
}
