import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth";
import { threadMessagesQuery, type StoredMessage } from "@/lib/chat-threads";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/nurture/$threadId")({
  component: ThreadChat,
});

function ThreadChat() {
  const { threadId } = Route.useParams();
  const { user, session, loading } = useAuth();

  const stored = useQuery({
    ...threadMessagesQuery(threadId),
    enabled: !!user,
  });

  const initialMessages = useMemo<UIMessage[]>(() => {
    return (stored.data ?? []).map((m: StoredMessage) => ({
      id: m.id,
      role: m.role,
      parts: m.parts as UIMessage["parts"],
    }));
  }, [stored.data]);

  if (loading || stored.isLoading) return <ChatShell threadId={threadId} loading />;
  if (!user)
    return (
      <ChatShell threadId={threadId}>
        <p className="p-6 text-sm text-ink-soft">
          Please <Link to="/auth" className="font-semibold text-primary">sign in</Link>.
        </p>
      </ChatShell>
    );

  return (
    <ChatShell threadId={threadId}>
      <ChatWindow
        key={threadId}
        threadId={threadId}
        token={session?.access_token ?? ""}
        initialMessages={initialMessages}
      />
    </ChatShell>
  );
}

function ChatShell({
  threadId: _threadId,
  loading,
  children,
}: {
  threadId: string;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background">
      <header className="safe-top sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Link
          to="/nurture"
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft className="h-4 w-4 text-ink-soft" />
        </Link>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Nurture AI
          </p>
          <h1 className="truncate font-display text-base font-semibold text-ink">
            Ask anything
          </h1>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        {loading ? <div className="p-6"><Shimmer>Loading conversation…</Shimmer></div> : children}
      </div>
    </div>
  );
}

function ChatWindow({
  threadId,
  token,
  initialMessages,
}: {
  threadId: string;
  token: string;
  initialMessages: UIMessage[];
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        headers: { Authorization: `Bearer ${token}` },
      }),
    [threadId, token],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

  const handleSubmit = (msg: PromptInputMessage) => {
    const text = msg.text?.trim();
    if (!text) return;
    sendMessage({ text });
  };

  return (
    <div className="flex h-full flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-md space-y-4 px-4 py-6 pb-6">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-center text-sm text-ink-soft">
              What's on your mind? Ask about sleep, feeding, symptoms, milestones — anything.
            </div>
          ) : null}
          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={isUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isUser
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-soft"
                      : "prose prose-sm max-w-[92%] text-ink prose-p:my-2 prose-ol:my-2 prose-ul:my-2 prose-li:my-0"
                  }
                >
                  {isUser ? text : <ReactMarkdown>{text}</ReactMarkdown>}
                </div>
              </div>
            );
          })}
          {status === "submitted" ? (
            <div className="flex justify-start">
              <Shimmer>Nurture is thinking…</Shimmer>
            </div>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="safe-bottom border-t border-border bg-background/95 px-3 py-3 backdrop-blur">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            ref={textareaRef}
            placeholder="Ask Nurture…"
            autoFocus
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={busy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
