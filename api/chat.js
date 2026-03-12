export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { question, leads } = req.body;
    const t = (s, max=150) => s && s.length > max ? s.substring(0, max) + "..." : s;
    const leadSummary = (leads || []).slice(0, 80).map(l => ({
      name: l.name, country: l.country, city: l.city, score: l.score, verdict: l.verdict,
      products: t(l.products, 200), pain: t(l.pain, 200), handled: t(l.handled, 150),
      employees: l.employees, revenue: l.revenue, sector: l.sector, subIndustry: l.subIndustry,
      competitor: t(l.competitor, 100), growth: l.growth, expansion: t(l.expansion, 120),
      fit: t(l.fit, 150), age: l.age, lang: l.lang, timing: t(l.timing, 120),
      invest: t(l.invest, 100), equip: t(l.equip, 100), certs: t(l.certs, 80),
      source: l.source, priority: l.priority, emailWorthy: l.emailWorthy, processed: l.processed,
      desc: t(l.desc, 200), linkedin: l.linkedin, phone: l.phone,
    }));
    const systemPrompt = `You are Newton, the AI engine for Newtec A/S (Danish fresh produce weighing/sorting/packaging machinery, 20,000+ machines in 40+ countries).

Analyze the lead database and respond with ONLY valid JSON. No markdown.

AVAILABLE FIELDS PER LEAD:
- name, country, city: company identity and location
- score (0-100), verdict (Hot/High/Warm/Cold/Not Relevant)
- desc: company description
- handled: what products the company handles (berries, potatoes, citrus, etc.)
- products: Newtec products recommended
- pain: pain points identified by AI
- employees, revenue, age: company size and maturity
- sector, subIndustry: industry classification
- competitor: competitor equipment (TOMRA, GREEFA, Ishida)
- equip: current equipment signals
- growth: growth score
- expansion: expansion plans
- fit: Newtec fit analysis
- lang: contact language
- timing: timing opportunity
- invest: investment readiness
- certs: certifications (ISO, organic, GlobalGAP)
- source, priority, emailWorthy, processed

DATA: ${JSON.stringify(leadSummary)}

RESPONSE FORMAT:
{
  "answer": "3-5 sentence detailed analysis with specific company names, scores, and actionable recommendations.",
  "charts": [
    {"type":"kpis","items":[{"label":"X","value":"N","color":"#hex"}]},
    {"type":"pie","title":"Title","data":[{"name":"X","value":10,"color":"#hex"}]},
    {"type":"bar","title":"Title","data":[{"name":"X","value":85,"color":"#hex"}]},
    {"type":"leads","title":"Title","leads":[{"name":"Full Name","country":"Country","city":"City","score":95,"verdict":"Hot","products":"COMPLETE product recommendations","pain":"COMPLETE pain points","handled":"products they handle","employees":"count","revenue":"amount","sector":"industry","fit":"Newtec fit analysis","competitor":"competitor equipment","expansion":"expansion plans","timing":"timing opportunity","invest":"investment readiness","certs":"certifications","growth":"growth score","age":"company age","lang":"language","equip":"equipment signals"}]},
    {"type":"funnel","title":"Title","stages":[{"label":"X","value":10,"color":"#hex"}]},
    {"type":"comparison","title":"Company A vs B","labelA":"A","labelB":"B","items":[{"label":"Metric","a":"value","b":"value"}]}
  ]
}

CRITICAL RULES:
- Always 3-6 charts with visual variety
- Lead cards: include ALL available fields. NEVER abbreviate products, pain, fit, or expansion. Up to 12 leads.
- For COMPARISONS: use "comparison" chart with 6-10 metrics (employees, revenue, score, handled, certs, age, growth, equipment, expansion, timing) PLUS lead cards for both companies with full data
- Use "handled" for produce type analysis
- Use "competitor" + "equip" for replacement opportunities
- Use "fit" to explain WHY a company matches Newtec
- Use "invest" + "expansion" + "timing" for opportunity prioritization
- Be specific: name companies, cite exact scores, reference actual data
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
