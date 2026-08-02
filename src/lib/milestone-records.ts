import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MilestoneRecord = {
  id: string;
  user_id: string;
  milestone_key: string;
  achieved_at: string;
  created_at: string;
};

export const milestoneRecordsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["milestone-records", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<MilestoneRecord[]> => {
      const { data, error } = await supabase.from("milestone_records").select("*");
      if (error) throw error;
      return (data ?? []) as MilestoneRecord[];
    },
  });

// Upsert on (user_id, milestone_key) — marking an already-achieved milestone
// again just updates the date, matching the table's unique constraint.
export function useMarkMilestoneAchieved(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { milestoneKey: string; achievedAt: string }) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("milestone_records").upsert(
        {
          user_id: userId,
          milestone_key: input.milestoneKey,
          achieved_at: input.achievedAt,
        },
        { onConflict: "user_id,milestone_key" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestone-records", userId ?? "anon"] });
    },
  });
}

export function useUnmarkMilestone(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (milestoneKey: string) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("milestone_records")
        .delete()
        .eq("user_id", userId)
        .eq("milestone_key", milestoneKey);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestone-records", userId ?? "anon"] });
    },
  });
}
