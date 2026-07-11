import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type QuickLogKind = "symptom" | "water" | "meal" | "sleep";

export type QuickLog = {
  id: string;
  user_id: string;
  kind: QuickLogKind;
  value: string | null;
  created_at: string;
};

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export const todaysLogsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["quick_logs", "today", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<QuickLog[]> => {
      const { data, error } = await supabase
        .from("quick_logs")
        .select("*")
        .gte("created_at", startOfToday())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QuickLog[];
    },
  });

export function useAddQuickLog(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { kind: QuickLogKind; value?: string }) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("quick_logs")
        .insert({ user_id: userId, kind: input.kind, value: input.value ?? null });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quick_logs", "today", userId ?? "anon"] });
    },
  });
}
