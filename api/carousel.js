export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { text, profile, topic, language } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: `You are a LinkedIn carousel slide designer for Newtec A/S — a Danish fresh produce machinery company.
Given a LinkedIn post text, transform it into a carousel of exactly 6-8 slides optimized for LinkedIn.

SLIDE TYPES (use a mix):
- "cover": Opening slide. Bold headline, subtitle. Hook the reader.
- "stat": One big number/statistic with context. Very visual impact.
- "content": Key insight or point with 2-3 short bullet lines (max 15 words each).
- "quote": A powerful statement or question. Thought-provoking.
- "cta": Final slide. Call to action. What should the reader do next?

RULES:
- First slide MUST be "cover" type
- Last slide MUST be "cta" type
- Include 1-2 "stat" slides with real numbers from the post
- Keep text SHORT. Carousel slides must be scannable in 2 seconds.
- headline: max 8 words
- subtitle: max 15 words
- body lines: max 15 words each, max 3 lines
- stat_value: the number (e.g. "€3,400", "8t", "<0.2%")
- stat_label: what the number means (max 8 words)
- Language: ${language || "English"}

Respond ONLY with valid JSON array. No markdown, no backticks.
[{"type":"cover","headline":"...","subtitle":"..."},{"type":"stat","stat_value":"...","stat_label":"...","context":"..."},{"type":"content","headline":"...","lines":["...","...","..."]},{"type":"quote","text":"...","attribution":"..."},{"type":"cta","headline":"...","subtitle":"...","action":"..."}]`,
        messages: [{ role: "user", content: `Profile: ${profile || "Company Page"}\nTopic: ${topic || ""}\n\nPost text:\n${text}` }]
      }),
    });

    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    const data = await response.json();
    const raw = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    let slides;
    try {
      slides = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) { try { slides = JSON.parse(m[0]); } catch { slides = null; } }
    }
    if (!slides || !Array.isArray(slides)) return res.status(500).json({ error: "Failed to parse slides" });
    return res.status(200).json({ slides });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
