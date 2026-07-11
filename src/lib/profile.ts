import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  baby_name: string | null;
  baby_photo_url: string | null;
};

export const profileQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["profile", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, baby_name, baby_photo_url")
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
      return { ...data, baby_photo_url: signedUrl };
    },
  });

export function useSaveProfile(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { baby_name?: string; photo?: File | null }) => {
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
      const payload: Record<string, unknown> = { id: userId, updated_at: new Date().toISOString() };
      if (input.baby_name !== undefined) payload.baby_name = input.baby_name;
      if (storagePath) payload.baby_photo_url = storagePath;
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", userId ?? "anon"] });
    },
  });
}
