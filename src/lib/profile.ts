import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Stage } from "@/lib/baby-stage";

export type Profile = {
  id: string;
  baby_name: string | null;
  baby_photo_url: string | null;
  stage: Stage | null;
  due_date: string | null;
  birth_date: string | null;
};

export const profileQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["profile", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, baby_name, baby_photo_url, stage, due_date, birth_date")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      let signedUrl: string | null = null;
      if (data.baby_photo_url) {
        const { data: signed } = await supabase.storage
          .from("baby-photos")
          .createSignedUrl(data.baby_photo_url, 60 * 60);
        signedUrl = signed?.signedUrl ?? null;
      }
      return { ...data, baby_photo_url: signedUrl, stage: data.stage as Stage | null };
    },
  });

export function useSaveProfile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      baby_name?: string;
      photo?: File | null;
      stage?: Stage;
      due_date?: string | null;
      birth_date?: string | null;
    }) => {
      if (!userId) throw new Error("Not signed in");
      let storagePath: string | undefined;
      if (input.photo) {
        const ext = input.photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/baby-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("baby-photos")
          .upload(path, input.photo, { upsert: true, contentType: input.photo.type });
        if (upErr) throw upErr;
        storagePath = path;
      }
      const payload: {
        id: string;
        updated_at: string;
        baby_name?: string | null;
        baby_photo_url?: string;
        stage?: Stage;
        due_date?: string | null;
        birth_date?: string | null;
      } = { id: userId, updated_at: new Date().toISOString() };
      if (input.baby_name !== undefined) payload.baby_name = input.baby_name;
      if (storagePath) payload.baby_photo_url = storagePath;
      if (input.stage !== undefined) payload.stage = input.stage;
      if (input.due_date !== undefined) payload.due_date = input.due_date;
      if (input.birth_date !== undefined) payload.birth_date = input.birth_date;
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", userId ?? "anon"] });
    },
  });
}
