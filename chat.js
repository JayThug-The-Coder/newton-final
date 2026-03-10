export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { question, leads } = req.body;
    const leadSummary = (leads || []).slice(0, 80).map(l => ({
      name: l.name, country: l.country, score: l.score, verdict: l.verdict,
      products: l.products, pain: l.pain, employees: l.employees, revenue: l.revenue, sector: l.sector,
    }));
    const systemPrompt = `You are Newton, the AI intelligence engine for Newtec A/S (Danish fresh produce machinery). Analyze lead data and respond with ONLY valid JSON.

Data: ${JSON.stringify(leadSummary)}

Respond with:
{
  "answer": "1-2 sentence insight",
  "charts": [
    {"type":"kpis","items":[{"label":"X","value":"N","color":"#9B7653"}]},
    {"type":"pie","title":"Title","data":[{"name":"X","value":10,"color":"#C0392B"}]},
    {"type":"bar","title":"Title","data":[{"name":"X","value":85,"color":"#9B7653"}]},
    {"type":"leads","title":"Title","leads":[{"name":"X","country":"Y","score":95,"verdict":"Hot","products":"Z","pain":"W"}]},
    {"type":"funnel","title":"Title","stages":[{"label":"X","value":10,"color":"#9B7653"}]},
    {"type":"comparison","title":"A vs B","labelA":"A","labelB":"B","items":[{"label":"X","a":1,"b":2}]}
  ]
}
Always include 2-5 charts. Colors: #C0392B red, #D4850A orange, #9B7653 brown, #2E6DA4 blue, #7B5EA7 purple, #4CAF50 green. Max 8 leads in cards, 12 in bars.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.CLAUDE_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: systemPrompt, messages: [{ role: "user", content: question }] }),
    });
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    let parsed;
    try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { parsed = { answer: text, charts: [] }; }
    return res.status(200).json(parsed);
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
