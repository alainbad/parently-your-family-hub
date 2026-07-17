import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, Camera, Check, Copy, Loader2, LogOut, User, Users } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { profileQuery, useSaveProfile, type Profile } from "@/lib/profile";
import { STAGES, type Stage } from "@/lib/baby-stage";
import {
  acceptHouseholdInvite,
  createHouseholdInvite,
  householdQuery,
  leaveHousehold,
} from "@/lib/household";

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
      baby_name: babyName.trim() || (null as unknown as string),
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

        <StageSection userId={user.id} profile={profile} />

        <FamilySharingSection />

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

function StageSection({
  userId,
  profile,
}: {
  userId: string;
  profile: Profile | null | undefined;
}) {
  const [stage, setStage] = useState<Stage>(profile?.stage ?? "pregnancy");
  const [dueDate, setDueDate] = useState(profile?.due_date ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? "");
  const save = useSaveProfile(userId);

  useEffect(() => {
    if (profile?.stage) setStage(profile.stage);
    setDueDate(profile?.due_date ?? "");
    setBirthDate(profile?.birth_date ?? "");
  }, [profile?.stage, profile?.due_date, profile?.birth_date]);

  const dirty =
    stage !== (profile?.stage ?? "pregnancy") ||
    dueDate !== (profile?.due_date ?? "") ||
    birthDate !== (profile?.birth_date ?? "");

  const handleSave = () => {
    save.mutate({
      stage,
      due_date: stage === "pregnancy" ? dueDate || null : null,
      birth_date: stage !== "pregnancy" ? birthDate || null : null,
    });
  };

  return (
    <section className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-soft">
      <h3 className="font-display text-[15px] font-semibold text-ink">Your stage</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStage(s.id)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              stage === s.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-alt text-ink-soft"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <label className="mt-3 flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {stage === "pregnancy" ? "Expected due date" : "Baby's birth date"}
        </span>
        <input
          type="date"
          value={stage === "pregnancy" ? dueDate : birthDate}
          onChange={(e) =>
            stage === "pregnancy" ? setDueDate(e.target.value) : setBirthDate(e.target.value)
          }
          className="h-11 rounded-xl border border-border bg-surface-alt px-3 text-[14px] text-ink focus:border-primary focus:outline-none"
        />
      </label>
      <button
        type="button"
        onClick={handleSave}
        disabled={save.isPending || !dirty}
        className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
      >
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save
      </button>
    </section>
  );
}

function FamilySharingSection() {
  const qc = useQueryClient();
  const household = useQuery(householdQuery());
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const invite = useMutation({
    mutationFn: () => createHouseholdInvite(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household"] }),
    onError: (e) => setError(e instanceof Error ? e.message : "Could not create an invite"),
  });

  const join = useMutation({
    mutationFn: (code: string) => acceptHouseholdInvite({ data: { code } }),
    onSuccess: () => {
      setJoinCode("");
      qc.invalidateQueries({ queryKey: ["household"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not join with that code"),
  });

  const leave = useMutation({
    mutationFn: () => leaveHousehold(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household"] }),
    onError: (e) => setError(e instanceof Error ? e.message : "Could not leave"),
  });

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <section className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-display text-[15px] font-semibold text-ink">Family</h3>
      </div>

      {household.isLoading ? (
        <div className="mt-3 flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-ink-soft" />
        </div>
      ) : household.data?.household ? (
        <div className="mt-3 space-y-3">
          <p className="text-[13px] text-ink-soft">
            {household.data.members.length}{" "}
            {household.data.members.length === 1 ? "person" : "people"} sharing logs, reminders, and
            growth data —{" "}
            {household.data.role === "owner" ? "you're the owner." : "you're a member."}
          </p>

          {household.data.role === "owner" ? (
            household.data.pendingInviteCode ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt px-4 py-3">
                <span className="font-mono text-[16px] font-semibold tracking-[0.2em] text-ink">
                  {household.data.pendingInviteCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyCode(household.data!.pendingInviteCode!)}
                  className="flex items-center gap-1 text-[12px] font-semibold text-primary"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => invite.mutate()}
                disabled={invite.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-[12px] font-semibold text-ink-soft disabled:opacity-60"
              >
                {invite.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Get invite code
              </button>
            )
          ) : null}

          <button
            type="button"
            onClick={() => leave.mutate()}
            disabled={leave.isPending}
            className="text-[12px] font-semibold text-destructive disabled:opacity-60"
          >
            {leave.isPending ? "Leaving…" : "Leave family group"}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-[13px] text-ink-soft">
            Invite your partner to see and log the same appointments, reminders, and growth entries.
          </p>
          <button
            type="button"
            onClick={() => invite.mutate()}
            disabled={invite.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[12px] font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
          >
            {invite.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Invite your partner
          </button>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Have a code? Enter it"
              className="h-10 flex-1 rounded-full border border-border bg-surface-alt px-4 text-[13px] uppercase text-ink placeholder:text-ink-soft placeholder:normal-case focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => joinCode.trim() && join.mutate(joinCode.trim())}
              disabled={join.isPending || !joinCode.trim()}
              className="inline-flex h-10 items-center rounded-full border border-border px-4 text-[12px] font-semibold text-ink-soft disabled:opacity-60"
            >
              {join.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Join"}
            </button>
          </div>
        </div>
      )}

      {error ? <p className="mt-3 text-[12px] text-destructive">{error}</p> : null}
    </section>
  );
}
