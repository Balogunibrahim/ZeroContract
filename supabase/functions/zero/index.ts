// Zero — the ZeroContract AI money assistant.
// Answers a user's question using their own shift/pay data (passed as context),
// via an LLM. The API key stays server-side as a Supabase secret.
//
// Required secret:  OPENAI_API_KEY   (an OpenAI API key, e.g. sk-...)
// Optional secret:  ZERO_MODEL       (defaults to gpt-4o-mini)

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const MODEL = Deno.env.get("ZERO_MODEL") || "gpt-4o-mini";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ reply: "Send a POST request." }, 405);

  try {
    if (!OPENAI_API_KEY) {
      return json({ error: "no_key", reply: "Zero's AI isn't switched on yet. Add an OPENAI_API_KEY secret to the function to enable it." });
    }

    const { message, history = [], context = {} } = await req.json();
    if (!message || typeof message !== "string") return json({ reply: "Ask me something and I'll help." });

    const system = [
      "You are Zero, a warm, plain-speaking money assistant inside ZeroContract, a UK app for shift and zero-hours workers.",
      "You help people understand what they actually earn, their take-home after tax, when they get paid, which job pays best after travel, and how to handle their money.",
      "Answer using ONLY the data in CONTEXT below. If the answer isn't in the context, say you don't have that yet and suggest what to log — never invent numbers, dates, or employers.",
      "Style: friendly and concise (usually 1–3 short sentences), plain English, amounts in pounds (£). You can use simple lists when it helps.",
      "You give estimates and guidance, not regulated financial or tax advice; if asked for definitive tax/legal/financial advice, add a short reminder to check with HMRC or a professional.",
      "If asked to draft a message (e.g. chasing an employer for unpaid pay), write it in a polite, professional tone the user can copy.",
      "The user's data:",
      "CONTEXT (JSON): " + JSON.stringify(context),
    ].join("\n");

    const chat = [
      { role: "system", content: system },
      ...(Array.isArray(history) ? history.slice(-8) : []),
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: chat, temperature: 0.3, max_tokens: 500 }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: "llm_error", detail, reply: "I couldn't reach my brain just then — give it another go in a moment." });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "I'm not sure how to answer that one.";
    return json({ reply });
  } catch (_e) {
    return json({ error: "server_error", reply: "Something went wrong on my end. Try again." });
  }
});
