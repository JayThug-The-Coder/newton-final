export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { topic, language, leads } = req.body;
    const leadCtx = leads?.length > 0 ? `\nLead data: ${leads.length} leads, countries: ${[...new Set(leads.map(l=>l.country))].join(", ")}, pain points: ${[...new Set(leads.flatMap(l=>(l.pain||"").split(",").map(p=>p.trim())).filter(Boolean))].slice(0,6).join(", ")}` : "";
    const sys = `You are Newton Content Lab for Newtec A/S (Danish weighing/sorting/packaging machinery, 25K+ installations, 50+ countries).\nGenerate social media content. Respond ONLY with valid JSON.${leadCtx}\n\nProducts: XB-Series weighers, Celox optical sorters, PEB41 packers, 2008PCM, Buteo Oculus QC, HSCF, 4000 Series.\nCompetitors: TOMRA (78K LinkedIn), Ishida, Marel, GREEFA.\n\nPROFILES: Company Page (corporate), Sales Director Anders Nielsen (stories/ROI), R&D Director (technical), CEO (vision/leadership).\nLanguage: ${language || "English"}\n\nJSON format:\n{"topic_summary":"brief","linkedin":{"company":{"primary":"150-300 word post","localized":"translated or null"},"sales":{"primary":"story-based post","localized":"translated or null"},"rnd":{"primary":"technical post"},"ceo":{"primary":"thought leadership post"}},"instagram":{"caption":"with emojis and 15 hashtags","visual_direction":"visual concept"},"youtube":{"short_script":"30sec HOOK/SHOW/PROOF/CTA","long_outline":"2-3min with timestamps"},"suggested_hashtags":["list"],"target_audience":"primary audience"}`;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.CLAUDE_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: sys, messages: [{ role: "user", content: `Generate content for: ${topic}` }] }),
    });
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    let parsed;
    try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { parsed = { error: "Parse failed" }; }
    return res.status(200).json(parsed);
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
