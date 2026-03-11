export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { url, record_id } = req.body;
    if (!url || !record_id) return res.status(400).json({ error: "Missing url or record_id" });

    // Only allow Make.com webhook URLs
    if (!url.startsWith("https://hook.eu1.make.com/") && !url.startsWith("https://hook.make.com/")) {
      return res.status(403).json({ error: "Invalid webhook URL" });
    }

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record_id }),
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(r.status).json({ ok: r.ok, status: r.status, data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
