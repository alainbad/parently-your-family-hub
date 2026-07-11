import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquarePlus, Sparkles, Trash2 } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { threadsQuery, createThread, deleteThread } from "@/lib/chat-threads";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/nurture/")({
  component: NurtureThreads,
});

function NurtureThreads() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const threads = useQuery({ ...threadsQuery(), enabled: !!user });

  const create = useMutation({
    mutationFn: () => createThread(),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["chat-threads"] });
      navigate({ to: "/nurture/$threadId", params: { threadId: t.id } });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteThread({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-threads"] }),
  });

  if (!loading && !user) {
    return (
      <AppShell>
        <ScreenHeader title="Ask Nurture AI" />
        <div className="px-6 text-sm text-ink-soft">
          <Link to="/auth" className="font-semibold text-primary">
            Sign in
          </Link>{" "}
          to start chatting.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Premium"
        title="Nurture AI"
        subtitle="Your parenting conversations"
        right={
          <Link
            to="/home"
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface"
          >
            <ArrowLeft className="h-4 w-4 text-ink-soft" />
          </Link>
        }
      />

      <div className="px-6">
        <button
          type="button"
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-float active:scale-[0.98] disabled:opacity-70"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {create.isPending ? "Starting…" : "Start a new chat"}
        </button>

        <div className="mt-6 space-y-2">
          {threads.data?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-3 text-sm font-semibold text-ink">No chats yet</p>
              <p className="mt-1 text-xs text-ink-soft">
                Ask about sleep, feeding, milestones, symptoms, or anything on your mind.
              </p>
            </div>
          ) : null}

          {threads.data?.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-3"
            >
              <Link
                to="/nurture/$threadId"
                params={{ threadId: t.id }}
                className="min-w-0 flex-1"
              >
                <p className="truncate text-sm font-semibold text-ink">{t.title}</p>
                <p className="mt-0.5 text-[11px] text-ink-soft">
                  {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
                </p>
              </Link>
              <button
                type="button"
                aria-label="Delete chat"
                onClick={() => {
                  if (confirm("Delete this chat?")) remove.mutate(t.id);
                }}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-background"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
