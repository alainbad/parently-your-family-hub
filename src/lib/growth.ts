import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type GrowthMeasurement = {
  id: string;
  user_id: string;
  measured_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  head_circumference_cm: number | null;
  created_at: string;
};

export const growthMeasurementsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["growth", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<GrowthMeasurement[]> => {
      const { data, error } = await supabase
        .from("growth_measurements")
        .select("*")
        .order("measured_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as GrowthMeasurement[];
    },
  });

export function useAddMeasurement(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      measured_at: string;
      weight_kg: number | null;
      height_cm: number | null;
      head_circumference_cm: number | null;
    }) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("growth_measurements").insert({
        user_id: userId,
        measured_at: input.measured_at,
        weight_kg: input.weight_kg,
        height_cm: input.height_cm,
        head_circumference_cm: input.head_circumference_cm,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["growth", userId ?? "anon"] });
    },
  });
}
