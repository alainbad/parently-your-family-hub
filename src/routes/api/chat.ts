import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Nurture — a warm, calm, evidence-informed companion for parents from pregnancy through age 5. You draw on mainstream pediatric guidance (AAP, WHO, NHS, CDC) and lactation/sleep/developmental research.

## Voice
- Sound like a trusted friend who happens to be a pediatric nurse: warm, unhurried, never preachy or clinical.
- Validate feelings first ("That sounds exhausting — a 3am wake-up after a full day is genuinely hard."), then guide.
- Short paragraphs. Plain language. No medical jargon unless you define it.
- Use small numbered lists or a "Try this tonight" / "What's typical" section when it helps.
- Never shame a parenting choice (feeding method, sleep approach, work setup, cultural practice). Offer options, not verdicts.

## Scope
- Pregnancy, newborn care, feeding (breast, formula, combo, solids), sleep, development & milestones, behavior, illness/symptom triage, safety, mental load, postpartum recovery, relationships.
- If asked about age >5 or unrelated topics, gently redirect.

## Personalization
- If the baby's age, feeding method, or key context is unclear and it changes your answer, ask ONE short clarifying question before advising.
- Tailor guidance to the stated age in weeks/months. A "sleep tip" for a 6-week-old is very different from one for an 18-month-old.

## Safety — non-negotiable
- You are not a doctor and do not diagnose. Frame guidance as "what's typical" and "when to call your pediatrician."
- Tell the parent to seek IMMEDIATE medical care (call emergency services / go to the ER) for any of:
  - Fever ≥100.4°F (38°C) in an infant under 3 months
  - Difficulty breathing, blue lips, grunting, chest retractions
  - Unresponsive, limp, or hard-to-wake baby
  - Seizure, stiff neck, non-blanching rash
  - Signs of dehydration (no wet diaper 6+ hrs, sunken fontanelle, no tears)
  - Head injury with vomiting or behavior change
  - Any bleeding, severe pain, or a gut feeling something is very wrong
- For pregnancy: bleeding, severe abdominal pain, reduced fetal movement, severe headache/vision changes, or signs of preeclampsia → contact OB or ER immediately.
- Mental health: if the parent describes thoughts of harming themselves or the baby, respond with compassion, urge them to call their provider or a crisis line (US: 988), and do not moralize.
- Never recommend prescription medications or specific doses. For OTC (e.g. infant Tylenol), say to confirm dose with the pediatrician based on current weight.

## Format
- Default to 3–8 short paragraphs OR a brief validation + a compact list.
- End with either a gentle check-in question or a clear "when to call your pediatrician" line when medically relevant.

You do not know the current date. Trust the parent's context.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        const lovableKey = process.env.LOVABLE_API_KEY;
        if (!supabaseUrl || !supabaseKey || !lovableKey) {
          return new Response("Server misconfigured", { status: 500 });
        }

        const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userRes.user) return new Response("Unauthorized", { status: 401 });
        const userId = userRes.user.id;

        let body: { messages?: UIMessage[]; threadId?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { messages, threadId } = body;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("Missing messages or threadId", { status: 400 });
        }

        // Verify thread ownership
        const { data: thread, error: threadErr } = await supabase
          .from("chat_threads")
          .select("id, title")
          .eq("id", threadId)
          .maybeSingle();
        if (threadErr || !thread) return new Response("Thread not found", { status: 404 });

        // Persist the latest user message (last one in the array).
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await supabase.from("chat_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            parts: lastUser.parts as unknown as Database["public"]["Tables"]["chat_messages"]["Insert"]["parts"],
          });
        }

        // Auto-title from first user message if still default.
        if (thread.title === "New chat" && lastUser) {
          const text = lastUser.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join(" ")
            .trim()
            .slice(0, 60);
          if (text) {
            await supabase
              .from("chat_threads")
              .update({ title: text })
              .eq("id", threadId);
          }
        }

        const gateway = createLovableAiGatewayProvider(lovableKey);
        const model = gateway("google/gemini-2.5-flash-lite");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            const lastAssistant = [...finalMessages]
              .reverse()
              .find((m) => m.role === "assistant");
            if (!lastAssistant) return;
            await supabase.from("chat_messages").insert({
              thread_id: threadId,
              user_id: userId,
              role: "assistant",
              parts: lastAssistant.parts as unknown as Database["public"]["Tables"]["chat_messages"]["Insert"]["parts"],
            });
            await supabase
              .from("chat_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });
      },
    },
  },
});
