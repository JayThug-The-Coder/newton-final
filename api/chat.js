export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { question, leads } = req.body;
    const t = (s, max=150) => s && s.length > max ? s.substring(0, max) + "..." : s;
    const leadSummary = (leads || []).slice(0, 80).map(l => ({
      name: l.name, country: l.country, city: l.city, score: l.score, verdict: l.verdict,
      products: t(l.products, 200), pain: t(l.pain, 200), handled: t(l.handled, 150),
      employees: l.employees, revenue: l.revenue, sector: l.sector,
      competitor: t(l.competitor, 100), growth: l.growth, expansion: t(l.expansion, 120),
      fit: t(l.fit, 150), age: l.age, lang: l.lang, timing: t(l.timing, 120),
    }));
    const systemPrompt = `You are Newton, the AI engine for Newtec A/S (Danish fresh produce weighing/sorting/packaging machinery, 20,000+ machines in 40+ countries).

Analyze the lead database and respond with ONLY valid JSON. No markdown.

AVAILABLE FIELDS PER LEAD:
- name: company name
- country, city: location
- score: AI qualification score 0-100
- verdict: Hot/High/Warm/Cold/Not Relevant
- handled: what products the company actually handles (berries, potatoes, citrus, etc.)
- products: Newtec products recommended for this lead
- pain: pain points identified
- employees, revenue, age: company size and maturity
- sector: industry
- competitor: competitor equipment detected (TOMRA, GREEFA, Ishida, etc.)
- growth: growth score
- expansion: expansion plans
- fit: Newtec fit analysis
- lang: contact language
- timing: timing opportunity

DATA: ${JSON.stringify(leadSummary)}

RESPONSE FORMAT:
{
  "answer": "2-4 sentence detailed insight with specific company names and numbers. Be analytical and actionable.",
  "charts": [
    {"type":"kpis","items":[{"label":"X","value":"N","color":"#hex"}]},
    {"type":"pie","title":"Title","data":[{"name":"X","value":10,"color":"#hex"}]},
    {"type":"bar","title":"Title","data":[{"name":"X","value":85,"color":"#hex"}]},
    {"type":"leads","title":"Title","leads":[{"name":"Full Name","country":"Country","score":95,"verdict":"Hot","products":"COMPLETE product text","pain":"COMPLETE pain text","employees":"count","revenue":"amount","sector":"industry"}]},
    {"type":"funnel","title":"Title","stages":[{"label":"X","value":10,"color":"#hex"}]},
    {"type":"comparison","title":"A vs B","labelA":"A","labelB":"B","items":[{"label":"Metric","a":1,"b":2}]}
  ]
}

RULES:
- Always 3-5 charts with visual variety
- Lead cards: include ALL fields, NEVER abbreviate products or pain. Up to 12 leads.
- Use the "handled" field to answer questions about what companies produce (berries, potatoes, etc.)
- Use "competitor" field to identify replacement opportunities (e.g. "leads using TOMRA equipment")
- Use "expansion" and "timing" for opportunity prioritization
- Use "city" for geographic deep-dives within countries
- Colors: #C0392B red, #D4850A orange, #9B7653 brown, #2E6DA4 blue, #7B5EA7 purple, #4CAF50 green, #8C8C8C grey`;

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
