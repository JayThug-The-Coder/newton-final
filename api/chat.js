export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { question, leads } = req.body;
    
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({ error: "CLAUDE_API_KEY not configured" });
    }

    const short = (leads || []).slice(0, 50).map(l => {
      const o = {};
      for (const [k, v] of Object.entries(l || {})) {
        if (v && String(v).length < 200) o[k] = v;
      }
      return o;
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: `You are Newton, AI engine for Newtec A/S (Danish fresh produce machinery: weighers, optical sorters, packers). Analyze leads and respond ONLY with valid JSON. No markdown.\n\nLEADS:\n${JSON.stringify(short)}\n\nRespond: {"answer":"insight","charts":[{"type":"kpis","items":[{"label":"X","value":"N","color":"#9B7653"}]},{"type":"pie","title":"T","data":[{"name":"X","value":1,"color":"#C0392B"}]},{"type":"bar","title":"T","data":[{"name":"X","value":1,"color":"#9B7653"}]},{"type":"leads","title":"T","leads":[{"name":"Co","country":"X","score":90,"verdict":"Hot","products":"X","pain":"X"}]},{"type":"funnel","title":"T","stages":[{"label":"X","value":1,"color":"#9B7653"}]},{"type":"comparison","title":"A vs B","labelA":"A","labelB":"B","items":[{"label":"X","a":1,"b":2}]}]} Use 3-5 charts. Colors: #C0392B red #D4850A orange #9B7653 brown #2E6DA4 blue #7B5EA7 purple #4CAF50 green.`,
        messages: [{ role: "user", content: question }]
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Claude API error " + response.status });
    }

    const text = data.content?.[0]?.text || "{}";
    let parsed;
    try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { parsed = { answer: text.substring(0, 500), charts: [] }; }
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
