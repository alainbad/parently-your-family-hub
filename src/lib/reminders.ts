import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ReminderKind = "appointment" | "vaccine" | "medicine" | "other";

export type Reminder = {
  id: string;
  user_id: string;
  kind: ReminderKind;
  title: string;
  due_at: string;
  completed_at: string | null;
  created_at: string;
};

export const upcomingRemindersQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["reminders", "upcoming", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Reminder[]> => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .is("completed_at", null)
        .order("due_at", { ascending: true })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as Reminder[];
    },
  });

export function useAddReminder(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; kind: ReminderKind; due_at: string }) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("reminders").insert({
        user_id: userId,
        title: input.title,
        kind: input.kind,
        due_at: input.due_at,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "upcoming", userId ?? "anon"] });
    },
  });
}

export function useCompleteReminder(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reminders")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "upcoming", userId ?? "anon"] });
    },
  });
}
