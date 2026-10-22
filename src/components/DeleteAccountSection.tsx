import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { deleteMyAccount } from "@/lib/account-deletion";
import { supabase } from "@/integrations/supabase/client";
import { clearLocalStageAnswers } from "@/lib/baby-stage";
import { getErrorMessage } from "@/lib/errors";

export function DeleteAccountSection({
  onDeleted,
}: {
  onDeleted: (appleDisconnectRequired: boolean) => void;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  async function handleDelete() {
    if (submitting.current || confirmation !== "DELETE") return;
    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      const result = await deleteMyAccount({ data: { confirmation: "DELETE" } });
      // Clear cached child data before auth changes unmount the profile.
      await qc.cancelQueries();
      qc.clear();
      clearLocalStageAnswers();
      try {
        localStorage.removeItem("nurture_dev_unlock");
      } catch {
        /* Storage may be disabled. */
      }
      // Keep the confirmation visible even when the auth provider removes the user.
      setDeleted(true);
      onDeleted(result.appleDisconnectRequired);
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    } catch (e) {
      setError(getErrorMessage(e, "Deletion could not finish. Please retry."));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-destructive/25 bg-surface p-5 shadow-soft">
      <h3 className="font-display text-[15px] font-semibold text-ink">Account</h3>
      <p className="mt-2 text-[13px] text-ink-soft">
        Permanently remove your account and the personal data you added to Parently.
      </p>
      <button
        type="button"
        onClick={() => {
          setConfirmation("");
          setError(null);
          setOpen(true);
        }}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-destructive text-[13px] font-semibold text-destructive"
      >
        <Trash2 className="h-4 w-4" /> Delete Account
      </button>
      <AlertDialog
        open={open}
        onOpenChange={(value) => {
          if (!pending && !deleted) setOpen(value);
        }}
      >
        <AlertDialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl">
          <AlertDialogTitle>
            {deleted ? "Account deleted" : "Permanently delete your account?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {deleted
              ? "Your Parently account and associated personal data have been deleted. You are signed out."
              : "This cannot be undone. Your profile, baby photos, logs, reminders, growth records, milestones and AI conversations will be deleted."}
          </AlertDialogDescription>
          {deleted ? (
            <Link
              to="/home"
              className="rounded-full bg-primary px-5 py-3 text-center font-semibold text-primary-foreground"
            >
              Back to home
            </Link>
          ) : (
            <>
              <p className="text-sm text-ink-soft">
                Your records will no longer be available to family members. If you own a family
                group, the group and its invitations will be removed. Other members keep their
                accounts and records they created.
              </p>
              <p className="text-sm text-ink-soft">
                Deleting your account does not cancel an App Store or Google Play subscription. You
                can cancel it separately; cancellation is not required to delete your account.
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-primary">
                <a
                  href="https://apps.apple.com/account/subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apple subscriptions
                </a>
                <a
                  href="https://play.google.com/store/account/subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Play subscriptions
                </a>
              </div>
              <label className="text-sm font-semibold">
                Type DELETE to confirm
                <input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  disabled={pending}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="mt-2 w-full rounded-xl border border-border bg-surface-alt px-3 py-3 text-ink"
                />
              </label>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>Keep account</AlertDialogCancel>
                <button
                  type="button"
                  disabled={pending || confirmation !== "DELETE"}
                  onClick={handleDelete}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {pending ? "Deleting…" : "Permanently delete account"}
                </button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
