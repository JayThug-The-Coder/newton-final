export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { question, leads } = req.body;
    const systemPrompt = `You are Newton, the AI intelligence engine for Newtec A/S (Danish fresh produce weighing, packaging, and optical sorting machinery). Analyze the lead data below and respond with ONLY valid JSON.

LEAD DATA (from Airtable):
${JSON.stringify(leads || [], null, 1).substring(0, 12000)}

IMPORTANT: The field names may vary. Look for any fields containing company names, countries, scores, products, pain points, verdicts, emails, etc. Use whatever field names exist in the data.

Respond with this JSON structure:
{
  "answer": "1-3 sentence insight about the data",
  "charts": [
    {"type":"kpis","items":[{"label":"Label","value":"N","color":"#9B7653"}]},
    {"type":"pie","title":"Chart Title","data":[{"name":"Category","value":10,"color":"#C0392B"}]},
    {"type":"bar","title":"Chart Title","data":[{"name":"Item","value":85,"color":"#9B7653"}]},
    {"type":"leads","title":"Lead Cards","leads":[{"name":"Company","country":"Country","score":95,"verdict":"Hot","products":"Product List","pain":"Pain points"}]},
    {"type":"funnel","title":"Pipeline","stages":[{"label":"Stage","value":10,"color":"#9B7653"}]},
    {"type":"comparison","title":"A vs B","labelA":"A","labelB":"B","items":[{"label":"Metric","a":1,"b":2}]}
  ]
}
Always include 3-5 relevant charts. Use colors: #C0392B (red/hot), #D4850A (orange/warm), #9B7653 (brown/brand), #2E6DA4 (blue/cold), #7B5EA7 (purple), #4CAF50 (green). Max 8 items in lead cards, 12 in bar charts.`;

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
```

Poi apri `App.jsx` su GitHub e cerca questa riga:
```
const prepLeads=()=>recs.map(r=>({name:gf(r,"Company Name","Name","Company")||""
```

Sostituisci **tutta la riga** `const prepLeads=...filter(l=>l.name);` con:
```
const prepLeads=()=>recs.slice(0,80).map(r=>r.fields);
