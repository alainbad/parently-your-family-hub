import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, Camera, Loader2, LogOut, User } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { profileQuery, useSaveProfile } from "@/lib/profile";

export const Route = createFileRoute("/profile")({
  component: ProfileScreen,
});

function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [babyName, setBabyName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { data: profile, isLoading } = useQuery(profileQuery(user?.id));
  const save = useSaveProfile(user?.id);

  useEffect(() => {
    if (profile?.baby_name) setBabyName(profile.baby_name);
  }, [profile?.baby_name]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!user) {
    return (
      <AppShell>
        <ScreenHeader eyebrow="Profile" title="Sign in required" />
        <div className="px-6">
          <Link
            to="/auth"
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-soft"
          >
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  const displayPhoto = previewUrl || profile?.baby_photo_url || null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const handleSave = async () => {
    await save.mutateAsync({
      baby_name: babyName.trim() || null as unknown as string,
      photo: pendingFile,
    });
    setPendingFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Your baby"
        title="Profile"
        subtitle={user.email ?? undefined}
        right={
          <Link
            to="/home"
            aria-label="Back"
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-ink-soft shadow-soft"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        }
      />

      <div className="px-6 space-y-6">
        <section className="flex flex-col items-center rounded-[1.5rem] border border-border bg-surface p-6 shadow-soft">
          <button
            onClick={() => fileRef.current?.click()}
            className="group relative h-36 w-36 overflow-hidden rounded-full border-4 border-primary/20 bg-surface-alt shadow-lift"
            aria-label="Change baby photo"
          >
            {isLoading ? (
              <span className="grid h-full w-full place-items-center">
                <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
              </span>
            ) : displayPhoto ? (
              <img src={displayPhoto} alt="Baby" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center text-ink-soft">
                <User className="h-12 w-12" />
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 py-2 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-3.5 w-3.5" />
              Change
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-[12px] font-semibold text-ink-soft"
          >
            <Camera className="h-3.5 w-3.5" />
            {displayPhoto ? "Change photo" : "Add baby photo"}
          </button>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-soft">
          <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Baby's name
          </label>
          <input
            type="text"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="Add a name"
            className="mt-2 w-full rounded-xl border border-border bg-surface-alt px-4 py-3 text-[15px] text-ink outline-none focus:border-primary"
          />
        </section>

        <button
          onClick={handleSave}
          disabled={save.isPending || (!pendingFile && babyName === (profile?.baby_name ?? ""))}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[14px] font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save changes
        </button>

        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/home" });
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface text-[13px] font-semibold text-ink-soft"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </AppShell>
  );
}
