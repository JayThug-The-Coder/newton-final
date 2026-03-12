export default async function handler(req, res) {
  const TABLE = "tblgR7ekntYJuV2oi";
  const BASE = process.env.VITE_AIRTABLE_BASE || "appDQHnrGIRM7hr59";
  const PAT = process.env.VITE_AIRTABLE_PAT;
  if (!PAT) return res.status(500).json({ error: "Airtable PAT not configured" });

  if (req.method === "GET") {
    try {
      let all = [], offset = null;
      do {
        const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?pageSize=100&sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=asc${offset ? `&offset=${offset}` : ""}`;
        const r = await fetch(url, { headers: { Authorization: `Bearer ${PAT}` } });
        if (!r.ok) return res.status(r.status).json({ error: await r.text() });
        const data = await r.json();
        all = [...all, ...(data.records || [])];
        offset = data.offset || null;
      } while (offset);
      return res.status(200).json({ records: all });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (req.method === "POST") {
    try {
      const { week, day, date, platform, profile, topic, postText, visualDirection, language, status, targetAudience, hashtags } = req.body;
      const fields = {};
      if (topic) fields["Topic"] = topic;
      if (week) fields["Week"] = parseInt(week);
      if (day) fields["Day"] = day;
      if (date) fields["Date"] = date;
      if (platform) fields["Platform"] = platform;
      if (profile) fields["Profile"] = profile;
      if (postText) fields["Post Text"] = postText;
      if (visualDirection) fields["Visual Direction"] = visualDirection;
      if (language) fields["Language"] = language;
      if (status) fields["Status"] = status || "Draft";
      if (targetAudience) fields["Target Audience"] = targetAudience;
      if (hashtags) fields["Hashtags"] = hashtags;
      const r = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
        body: JSON.stringify({ records: [{ fields }] })
      });
      if (!r.ok) return res.status(r.status).json({ error: await r.text() });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
