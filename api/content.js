export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { topic, language, author, profiles, channels, leads } = req.body;
    const selProfiles = profiles || ["company","sales","rnd","ceo"];
    const selChannels = channels || ["linkedin","instagram","youtube"];

    // 1. Fetch products from Airtable
    const PAT = process.env.VITE_AIRTABLE_PAT;
    const BASE = process.env.VITE_AIRTABLE_BASE || "appDQHnrGIRM7hr59";
    const PROD_TABLE = "tblNZoL7IU23Syd3o";
    let productCtx = "";
    try {
      const pr = await fetch(`https://api.airtable.com/v0/${BASE}/${PROD_TABLE}?pageSize=100`, {
        headers: { Authorization: `Bearer ${PAT}` }
      });
      if (pr.ok) {
        const pd = await pr.json();
        const prods = (pd.records || []).map(r => {
          const f = r.fields || {};
          const model = f["Model"] || f["Full Product Name"] || "";
          const cat = f["Category"] || "";
          const desc = (f["Description"] || "").substring(0, 200);
          const target = (f["Target Products"] || "").substring(0, 120);
          const capacity = (f["Capacity"] || "").substring(0, 100);
          const range = (f["Portion/Weight Range"] || "").substring(0, 80);
          if (!model) return null;
          return `${model} (${cat}): ${desc} | For: ${target} | Capacity: ${capacity} | Range: ${range}`;
        }).filter(Boolean);
        if (prods.length > 0) {
          productCtx = "\n\nNEWTEC PRODUCT CATALOG (" + prods.length + " products from internal database):\n" + prods.join("\n");
        }
      }
    } catch (e) { console.error("Product fetch error:", e); }

    // 2. Build lead context
    const leadCtx = leads?.length > 0 ? `\nLead data: ${leads.length} leads, countries: ${[...new Set(leads.map(l => l.country))].join(", ")}, pain points: ${[...new Set(leads.flatMap(l => (l.pain || "").split(",").map(p => p.trim())).filter(Boolean))].slice(0, 6).join(", ")}` : "";

    // 3. Author context
    const authorProfiles = {
      all: "Generate content for ALL profiles: Company Page (corporate), Sales Director (stories/ROI), R&D Director (technical depth), CEO (vision/leadership).",
      ceo: "Write ONLY as CEO. Tone: visionary, strategic, industry-shaping. Talk about the future of fresh produce, automation trends, sustainability, company milestones. Never salesy — always thought leadership. First person.",
      sales: "Write ONLY as Head of Sales. Tone: practical, ROI-driven, customer stories. Talk about real packhouse problems: labor costs, giveaway reduction, throughput. Use specific numbers and payback periods. Conversational, like talking to a colleague at a trade fair.",
      rnd: "Write ONLY as Head of R&D. Tone: technical, precise, passionate about engineering. Talk about how Newtec machines work: AI vision, sensor tech, mechanical design. Explain the WHY behind product decisions. Can include technical specs.",
      marketing: "Write ONLY as Marketing. Tone: brand-building, engaging, community-focused. Talk about events, partnerships, team culture, dealer spotlights. Visual-first thinking — always suggest image/video concepts.",
      dev: "Write ONLY as Head of Development. Tone: innovation-focused, problem-solving. Talk about software architecture, machine learning in sorting, new product features, development methodology.",
      service: "Write ONLY as Service Manager. Tone: helpful, reliability-focused. Talk about uptime, maintenance best practices, remote diagnostics, customer support stories, spare parts availability."
    };
    const authorCtx = authorProfiles[author || "all"] || authorProfiles.all;

    // 4. System prompt with everything
    const sys = `You are Newton Content Lab for Newtec A/S — a Danish company founded in 1976 in Odense, Denmark. ~87 employees, ~$15M revenue, 20,000+ machines installed in 40+ countries.

WHAT NEWTEC DOES:
Designs and manufactures weighing, sorting, and packaging machinery for fresh produce (fruits, vegetables, potatoes, onions, citrus, berries, etc). NOT frozen food, NOT meat, NOT dairy — FRESH PRODUCE is the core.

${productCtx}

KEY ROI DATA:
- €3,400/month saved for a mid-sized packhouse (30t/day)
- 8 tonnes of product saved per month from giveaway reduction
- 6-12 month typical payback period (proven since 1976)
- 30-60% labor reduction with automation
- <0.2% product giveaway with Newtec multihead weighers vs industry 1.5-3%

COMPETITORS (for positioning, not attacking):
- TOMRA: €1.35B, 5,300 employees, 78,000 LinkedIn followers. Sorting/recycling giant. Newtec differentiator: specialized fresh produce focus.
- GREEFA: ~€60M, ~150 employees, 9,200 LinkedIn followers. Dutch, fruit grading. Newtec differentiator: weighing+sorting+packaging vs grading only.
- Ishida: Japanese, broad food weighing. Newtec differentiator: fresh produce specialization.
- Marel: Icelandic, meat/poultry/fish. Different market.

CONTENT PRINCIPLES:
- Every customer installation is a story (20,000 machines = 20,000 untold stories)
- Show the machine running, interview the operator, capture the story
- ROI over features — packhouse managers care about payback, not specs
- 5 content sources: Customer visits, Product demos, Dealer collaborations, Team & culture, Trade fairs

TRADE FAIRS: Fruit Logistica (Berlin, Feb), Macfrut (Italy, May), Interpom (Belgium), Potato Europe, Fruit Attraction (Madrid).

IMPORTANT: You have access to web search. USE IT to find real, current information about:
- Trade fairs, events, industry news mentioned in the topic
- Competitor announcements or industry trends
- Specific companies, partners, or markets referenced
- Any recent news that would make the content more relevant and timely
Always search when the topic references a specific event, company, trend, or recent happening. Use real data and real facts — never make up statistics or events.

CRITICAL RULES — NEVER BREAK THESE:
1. NEVER invent statistics by combining real numbers. You can say "8 tonnes saved monthly per mid-sized packhouse" (proven) and "20,000+ machines installed worldwide" (proven) but NEVER multiply them to create "160,000 tonnes monthly" — that calculation is not verified.
2. NEVER present fictional stories as real events. Do NOT write "Yesterday I visited a customer in Spain" or "Last week, Maria told me..." — these are fabricated anecdotes. Instead use: "Imagine a packhouse manager seeing..." or "A typical customer experience might look like..." or "What if your operators could..." — hypothetical framing is fine, fake stories are not.
3. ONLY use these verified Newtec numbers: €3,400/month savings (mid-sized packhouse, 30t/day), <0.2% giveaway (vs industry 1.5-3%), 8 tonnes saved monthly (per mid-sized installation), 6-12 month payback period, 30-60% labor reduction, 20,000+ machines installed, 40+ countries, founded 1976, ~87 employees. Any other numbers must come from web search results or the product catalog.
4. When referencing competitor data (TOMRA revenue, employee count, etc.), ALWAYS verify via web search — do not rely on the context numbers alone, they may be outdated.
5. For the Sales Director profile: write in a conversational, practical tone but use REAL scenarios and questions, not fake customer stories. Example: "How much product walks out of your packhouse unpaid every month? For a 30t/day operation, the answer is roughly 8 tonnes." — this is factual and compelling without being fake.

${authorCtx}
${leadCtx}

Language: ${language || "English"}
${language && language !== "English" ? `Write natively in ${language} — not translated English. Use local expressions and natural phrasing.` : ""}

Respond ONLY with valid JSON. No markdown, no backticks, no preamble.

ONLY generate content for these profiles: ${selProfiles.join(", ")}
ONLY generate content for these channels: ${selChannels.join(", ")}
Do NOT generate content for profiles or channels not listed above. Leave them out of the JSON entirely.

JSON format:
{"topic_summary":"brief"${selChannels.includes("linkedin")?`,"linkedin":{${selProfiles.map(p=>`"${p}":{"primary":"post text","localized":"translated or null"}`).join(",")}}`:""}${selChannels.includes("instagram")?`,"instagram":{"caption":"with emojis and 15 hashtags","visual_direction":"specific visual concept"}`:""}${selChannels.includes("youtube")?`,"youtube":{"short_script":"30sec HOOK/SHOW/PROOF/CTA","long_outline":"2-3min with timestamps"}`:""},"suggested_hashtags":["list"],"target_audience":"primary audience"}

${selProfiles.length <= 2 ? "Since generating for few profiles, make each post LONGER and more detailed (400-500 words for LinkedIn)." : ""}`;

    // 5. Call Claude with web search enabled
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: sys,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: `Generate content for: ${topic}` }]
      }),
    });

    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    const data = await response.json();

    // 6. Extract text from response (may have multiple content blocks due to web search)
    const textParts = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("");

    const text = textParts || "{}";
    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      // Try to find JSON in the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { parsed = { error: "Parse failed" }; }
      } else {
        parsed = { error: "Parse failed" };
      }
    }
    return res.status(200).json(parsed);
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
