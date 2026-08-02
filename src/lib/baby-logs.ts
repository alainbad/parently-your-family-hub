import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BabyLogKind = "feeding" | "sleep" | "diaper" | "pumping" | "medicine" | "temperature";

export type BabyLog = {
  id: string;
  user_id: string;
  kind: BabyLogKind;
  value: string | null;
  created_at: string;
};

export const BABY_LOG_LABELS: Record<BabyLogKind, string> = {
  feeding: "Feeding logged",
  sleep: "Baby slept",
  diaper: "Diaper changed",
  pumping: "Pumping session",
  medicine: "Medicine given",
  temperature: "Temperature checked",
};

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export const todaysBabyLogsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["baby_logs", "today", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<BabyLog[]> => {
      const { data, error } = await supabase
        .from("baby_logs")
        .select("*")
        .gte("created_at", startOfToday())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BabyLog[];
    },
  });

export function useAddBabyLog(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { kind: BabyLogKind; value?: string }) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("baby_logs")
        .insert({ user_id: userId, kind: input.kind, value: input.value ?? null });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["baby_logs", "today", userId ?? "anon"] });
    },
  });
}

export function useUpdateBabyLog(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; created_at: string }) => {
      const { error } = await supabase
        .from("baby_logs")
        .update({ created_at: input.created_at })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["baby_logs", "today", userId ?? "anon"] });
    },
  });
}

export function useDeleteBabyLog(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("baby_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["baby_logs", "today", userId ?? "anon"] });
    },
  });
}
