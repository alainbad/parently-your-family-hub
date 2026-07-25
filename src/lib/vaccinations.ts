import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Reminder } from "@/lib/reminders";

export type VaccineScheduleItem = {
  id: string;
  label: string;
  ageLabel: string;
};

// A common childhood schedule (loosely CDC-aligned) — a general guide, not
// medical advice; parents should follow their own pediatrician's schedule.
export const VACCINE_SCHEDULE: VaccineScheduleItem[] = [
  { id: "hepb-1", label: "Hepatitis B (1st dose)", ageLabel: "Birth" },
  { id: "hepb-2", label: "Hepatitis B (2nd dose)", ageLabel: "1–2 months" },
  { id: "dtap-1", label: "DTaP (1st dose)", ageLabel: "2 months" },
  { id: "polio-1", label: "Polio / IPV (1st dose)", ageLabel: "2 months" },
  { id: "hib-1", label: "Hib (1st dose)", ageLabel: "2 months" },
  { id: "pcv-1", label: "Pneumococcal / PCV (1st dose)", ageLabel: "2 months" },
  { id: "rv-1", label: "Rotavirus (1st dose)", ageLabel: "2 months" },
  { id: "dtap-2", label: "DTaP (2nd dose)", ageLabel: "4 months" },
  { id: "polio-2", label: "Polio / IPV (2nd dose)", ageLabel: "4 months" },
  { id: "hib-2", label: "Hib (2nd dose)", ageLabel: "4 months" },
  { id: "pcv-2", label: "Pneumococcal / PCV (2nd dose)", ageLabel: "4 months" },
  { id: "rv-2", label: "Rotavirus (2nd dose)", ageLabel: "4 months" },
  { id: "dtap-3", label: "DTaP (3rd dose)", ageLabel: "6 months" },
  { id: "hib-3", label: "Hib (3rd dose)", ageLabel: "6 months" },
  { id: "pcv-3", label: "Pneumococcal / PCV (3rd dose)", ageLabel: "6 months" },
  { id: "rv-3", label: "Rotavirus (3rd dose)", ageLabel: "6 months" },
  { id: "hepb-3", label: "Hepatitis B (3rd dose)", ageLabel: "6–18 months" },
  { id: "flu", label: "Influenza (yearly)", ageLabel: "6 months+" },
  { id: "mmr-1", label: "MMR (1st dose)", ageLabel: "12–15 months" },
  { id: "varicella-1", label: "Varicella (1st dose)", ageLabel: "12–15 months" },
  { id: "hepa-1", label: "Hepatitis A (1st dose)", ageLabel: "12–23 months" },
  { id: "pcv-4", label: "Pneumococcal / PCV (4th dose)", ageLabel: "12–15 months" },
  { id: "hib-4", label: "Hib (4th dose)", ageLabel: "12–15 months" },
  { id: "dtap-4", label: "DTaP (4th dose)", ageLabel: "15–18 months" },
  { id: "hepa-2", label: "Hepatitis A (2nd dose)", ageLabel: "18–23 months" },
  { id: "dtap-5", label: "DTaP (5th dose)", ageLabel: "4–6 years" },
  { id: "polio-4", label: "Polio / IPV (4th dose)", ageLabel: "4–6 years" },
  { id: "mmr-2", label: "MMR (2nd dose)", ageLabel: "4–6 years" },
  { id: "varicella-2", label: "Varicella (2nd dose)", ageLabel: "4–6 years" },
];

// Reuses the reminders table (kind = "vaccine") rather than a dedicated
// table — a given dose is a reminder whose due_at/completed_at both hold
// the date it was administered.
export const vaccineRecordsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["reminders", "vaccines", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Reminder[]> => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("kind", "vaccine")
        .order("due_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Reminder[];
    },
  });

export function useLogVaccine(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { label: string; givenAt: string }) => {
      if (!userId) throw new Error("Not signed in");
      const isoDate = new Date(input.givenAt).toISOString();
      const { error } = await supabase.from("reminders").insert({
        user_id: userId,
        kind: "vaccine",
        title: input.label,
        due_at: isoDate,
        completed_at: isoDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "vaccines", userId ?? "anon"] });
      qc.invalidateQueries({ queryKey: ["reminders", "upcoming", userId ?? "anon"] });
    },
  });
}

// Books the appointment as an upcoming reminder (shows in the Reminders
// list until it's marked given) rather than recording it as already done.
export function useScheduleVaccine(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { label: string; scheduledFor: string }) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("reminders").insert({
        user_id: userId,
        kind: "vaccine",
        title: input.label,
        due_at: new Date(input.scheduledFor).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "vaccines", userId ?? "anon"] });
      qc.invalidateQueries({ queryKey: ["reminders", "upcoming", userId ?? "anon"] });
    },
  });
}

// Marks an already-scheduled dose as given, on the date it actually happened.
export function useMarkVaccineGiven(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; givenAt: string }) => {
      const isoDate = new Date(input.givenAt).toISOString();
      const { error } = await supabase
        .from("reminders")
        .update({ due_at: isoDate, completed_at: isoDate })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "vaccines", userId ?? "anon"] });
      qc.invalidateQueries({ queryKey: ["reminders", "upcoming", userId ?? "anon"] });
    },
  });
}

export function useDeleteVaccineRecord(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", "vaccines", userId ?? "anon"] });
      qc.invalidateQueries({ queryKey: ["reminders", "upcoming", userId ?? "anon"] });
    },
  });
}
