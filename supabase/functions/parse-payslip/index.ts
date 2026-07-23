// parse-payslip — reads an uploaded UK payslip PDF and returns structured fields.
// The client sends the PDF as base64; we extract its text and ask the LLM to
// pull out the figures. Text-based (digital) payslips work best; a scanned image
// PDF may have no extractable text (the client falls back to manual entry).
//
// Required secret: OPENAI_API_KEY

import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";

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
  if (req.method !== "POST") return json({ error: "method" }, 405);

  try {
    if (!OPENAI_API_KEY) return json({ error: "no_key", message: "AI isn't switched on yet." });

    const { pdf } = await req.json();
    if (!pdf || typeof pdf !== "string") return json({ error: "no_file", message: "No PDF received." });

    // base64 -> bytes
    const bytes = Uint8Array.from(atob(pdf), (c) => c.charCodeAt(0));

    let text = "";
    try {
      const doc = await getDocumentProxy(bytes);
      const res = await extractText(doc, { mergePages: true });
      text = (Array.isArray(res.text) ? res.text.join("\n") : res.text || "").trim();
    } catch (_e) {
      text = "";
    }

    if (!text || text.length < 20) {
      return json({ error: "no_text", message: "Couldn't read text from that PDF — it may be a scan or photo. Enter the figures manually." });
    }

    const prompt = [
      "Extract fields from this UK payslip text. Return JSON only with these keys, using null if a value isn't present:",
      "grossPay (number), netPay (number), hoursPaid (number|null), taxCode (string|null), incomeTax (number|null), nationalInsurance (number|null), pension (number|null), studentLoan (number|null), employer (string|null), payPeriod (string|null).",
      "Numbers must be plain (no currency symbols or commas). If several 'gross' figures appear, use the gross for THIS period (not year-to-date).",
      "",
      "PAYSLIP TEXT:",
      text.slice(0, 6000),
    ].join("\n");

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You extract structured data from payslips and reply with JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return json({ error: "llm_error", detail, message: "Couldn't read the payslip just now — try again." });
    }

    const data = await r.json();
    let fields = {};
    try { fields = JSON.parse(data?.choices?.[0]?.message?.content || "{}"); } catch (_e) { fields = {}; }
    return json({ fields });
  } catch (_e) {
    return json({ error: "server_error", message: "Something went wrong reading the payslip." });
  }
});
