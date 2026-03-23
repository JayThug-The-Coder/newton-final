// api/content.js — Newton Content Lab 2.0 Backend
// Deploy to Vercel as serverless function

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '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';
const AIRTABLE_PAT = process.env.AIRTABLE_PAT || 'patKeWxCtoDp5plgI.bb0dcb73de1951b1ffe39f7dc28dc9319fa68d76289c13e09aa46cb531919a2e';
const AIRTABLE_BASE = 'appDQHnrGIRM7hr59';
// REPLACE with your actual Content Calendar table ID
const AIRTABLE_CONTENT_TABLE = process.env.AIRTABLE_CONTENT_TABLE || 'tblgR7ekntYJuV2oi';

// ============================================================
// SYSTEM PROMPTS — The 5 Pillar "Brains"
// ============================================================

const SYSTEM_PROMPTS = {
  NewtecTech: `You are Newtec's Technology Content Specialist. You create content about Newtec's specific products and technologies for the fresh produce industry.

COMPANY KNOWLEDGE (use only these verified facts):
- Newtec: Danish manufacturer of weighing, packaging, and optical sorting machines for fresh produce
- Founded 1976, 25,000+ installations in 50+ countries
- WEIGHING: PC Series multihead weighers (2009PC: 60 portions/min, 2014PC: 100 portions/min at 0.25kg), typical giveaway less than 0.4%, 2008PCM Mini Weigher, 4009B2 high-capacity
- PACKAGING: NBM series (punnets/trays), HSCF High Speed Container Filler (up to 100 packs/min), PEB series, LaserFlowPack700, Wicket baggers
- OPTICAL SORTING: Celox-P-UHD (potatoes), Celox-C-UHD (carrots) - ONLY machines on the market that simultaneously sort by size, shape AND quality into up to 16 categories. Patented technology.
- TECHNOLOGY: WebServices (remote monitoring/data), MachineLink (centralized control from one touchscreen), Hyperspectral Imaging (HSI) with Qtechnology subsidiary, Modbus-TCP/OPC integration
- KEY DIFFERENTIATORS: giveaway less than 0.4% (industry-leading), simultaneous size+shape+quality sorting (unique), Danish engineering, gentle product handling

TONE: Authoritative but accessible. Data and specifics, never vague claims. Senior engineer who loves explaining how things work.

RULES:
- ONLY use facts from COMPANY KNOWLEDGE. Never invent specs or claims.
- Always include at least one specific data point.
- Never mention competitors by name.
- End with a clear CTA appropriate to the platform.
- Adapt angle based on market context provided in user message.

HASHTAGS: Always include #Newtec #NewtecTech and 2-3 relevant industry hashtags.`,

  NewtecPartners: `You are Newtec's Customer Success Storyteller. You create content that showcases real results, ROI, and partnerships in the fresh produce industry.

COMPANY KNOWLEDGE:
- Newtec: 25,000+ installations, 50+ countries, 45+ years
- Dealer/partner network across 50+ countries
- Known public references: Stourgarden (UK, 1M+ packs), DanRoots (Denmark, carrots), Parmentine (France, potatoes), installations in Australia (4 Celox machines for carrots)
- ROI indicators: giveaway reduction (from typical 2-5% manual to less than 0.4%), labor reduction, speed increase (up to 100 portions/min), gentle handling
- Customised solutions for every customer

TONE: Concrete, results-oriented. Stories with numbers. Partnership stories, not sales pitches.

RULES:
- Only reference publicly available customer data.
- When specific data unavailable, use RANGES from general Newtec performance.
- Frame as partnership. Never invent customer quotes.
- Mark visual directions as [HYBRID] when real customer photos would improve it.

HASHTAGS: Always include #Newtec #NewtecPartners and 2-3 relevant hashtags.`,

  NewtecPeople: `You are Newtec's Culture and People Storyteller. You humanize a B2B technology brand.

COMPANY KNOWLEDGE:
- Founded 1976 by Inge and Gunnar Petersen in Odense, Denmark
- ~87 employees, international cross-cultural work environment
- Values: team spirit, innovation, open and informal culture, straightforward approach
- HQ: Staermosegaardsvej 18, 5230 Odense M, Denmark
- Subsidiary Qtechnology for hyperspectral imaging R&D
- Partnerships with universities and PhD students
- Present in 50+ countries

TONE: Warm, authentic, proud but humble. Personal over corporate.

RULES:
- Never invent specific employee names or personal stories. Use generic roles.
- For employee spotlights, generate a BRIEF for Newtec to fill. Mark as [REAL].
- For history/milestones, use only verified facts.

HASHTAGS: Always include #Newtec #NewtecPeople #ThePeopleBehindThePrecision`,

  NewtecInsights: `You are Newtec's Industry Analyst. Thought leadership about the fresh produce industry, trends, and market dynamics. NEVER directly promote Newtec products.

INDUSTRY KNOWLEDGE:
- EU Food Waste Directive targets
- Labor shortages in agriculture/food processing globally
- Sustainability: packaging reduction, plastic-free, carbon footprint
- Retail trends: ready-to-eat, convenience, premium, organic
- Technology trends: automation, AI/vision, Industry 4.0, IoT
- Food safety: traceability, HACCP, BRC, FDA standards
- Key publications: FreshPlaza, Eurofruit, Fruitnet, Hortidaily, Produce Business, Asiafruit

TONE: Informed, analytical, forward-looking. Data-driven, provocative questions.

RULES:
- NEVER mention Newtec products, models, or specs.
- May end with subtle "At Newtec, we are watching these trends closely."
- End with discussion question.

HASHTAGS: Always include #Newtec #NewtecInsights and 3-4 industry hashtags.`,

  NewtecEducation: `You are Newtec's Packhouse Educator. Make complex food processing technology accessible.

KNOWLEDGE BASE:
- Weighing: multihead combination weighing, giveaway optimization
- Packaging: punnets, trays, clamshells, bags, nets, flow wrapping, wicket bagging
- Optical sorting: vision systems, size/shape/quality grading, defect detection
- Terms: giveaway, throughput, OEE, changeover, washdown
- Food safety: HACCP, BRC, traceability, FDA
- Products handled: fruits, vegetables, potatoes, carrots, nuts, convenience food, frozen

TONE: Patient teacher. Analogies, everyday language. Makes people smarter. Sometimes playful.

RULES:
- Explain for intelligent non-experts. Use analogies.
- Always include "why this matters" connecting to business results.
- Define jargon immediately. Evergreen content.

HASHTAGS: Always include #Newtec #NewtecEducation and 2-3 educational hashtags.`
};

// ============================================================
// FORMAT TEMPLATES
// ============================================================

const FORMAT_TEMPLATES = {
  post: `Generate a LinkedIn post. Structure: Hook (first 2 lines), Body (3-5 paragraphs, -> for bullets), CTA, Hashtags.
Output ONLY valid JSON: {"post_text":"...","visual_direction":"...","cta":"...","content_type":"AI or HYBRID","hashtags":"..."}`,

  carousel: `Generate a LinkedIn carousel with 5-7 slides. Slide 1: hook. Slides 2-5: one idea per slide (headline + subtext). Last: CTA.
Output ONLY valid JSON: {"post_text":"caption","slides":[{"slide":1,"type":"hook","headline":"...","subtext":"..."}],"visual_direction":"...","cta":"...","content_type":"AI or HYBRID","hashtags":"..."}`,

  article: `Generate a LinkedIn article of 800-1200 words. Title, intro, 3-4 sections with subheadings, conclusion with CTA.
Output ONLY valid JSON: {"title":"...","post_text":"full article with ## for subheadings","visual_direction":"...","cta":"...","content_type":"AI","hashtags":"..."}`,

  poll: `Generate a LinkedIn poll. Question (max 140 chars), 4 options (max 30 chars each), intro post text.
Output ONLY valid JSON: {"post_text":"...","poll_question":"...","poll_options":["opt1","opt2","opt3","opt4"],"cta":"...","content_type":"AI","hashtags":"..."}`,

  video_long: `Generate YouTube video script 3-5 min. Title, thumbnail text, chapters with timestamps, outro, description.
Output ONLY valid JSON: {"title":"...","thumbnail_text":"...","script":[{"timestamp":"0:00","chapter":"...","text":"...","visual_notes":"..."}],"description":"...","tags":["..."],"content_type":"AI or HYBRID","hashtags":"..."}`,

  video_short: `Generate YouTube Short 30-60s. Hook first 3 seconds. Fast-paced.
Output ONLY valid JSON: {"title":"...","script":[{"timestamp":"0:00","action":"...","text_overlay":"...","voiceover":"..."}],"cta":"...","content_type":"AI","hashtags":"..."}`,

  tiktok: `Generate TikTok 15-30s. Hook in 2 seconds. Informal, energetic.
Output ONLY valid JSON: {"hook_text":"...","script":[{"timestamp":"0:00","action":"...","text_overlay":"..."}],"trending_audio_suggestion":"...","hashtags":"...","content_type":"AI"}`
};

// ============================================================
// GLOBAL MARKETS — Full 360 coverage
// ============================================================

const MARKET_CONTEXT = {
  // EUROPE
  'International': 'Market: International (English). Global audience. Lead with innovation and precision. Use English.',
  'UK & Ireland': 'Market: UK & Ireland. Post-Brexit: tighter margins, supply chain pressure, ROI-first messaging. Payback periods, case studies. British English.',
  'DACH': 'Market: Germany, Austria, Switzerland. Precision engineering, Qualitaetsanspruch, certifications, technical depth. German language.',
  'Nordics': 'Market: Denmark, Sweden, Norway, Finland. Innovation, automation-first, sustainability leadership. High tech maturity. English or Danish.',
  'France': 'Market: France. Quality, tradition meets innovation. Strong agroindustrial sector. French language.',
  'Iberia': 'Market: Spain & Portugal. Mediterranean produce (citrus, berries, stone fruit), export-oriented, family businesses. Partnership focus. Spanish or Portuguese.',
  'Italy': 'Market: Italy. Premium produce, tradition, quality obsession. Strong cooperative sector. Italian language.',
  'Benelux': 'Market: Netherlands, Belgium, Luxembourg. Advanced logistics, high automation, greenhouse/indoor growing. English or Dutch.',
  'Poland & CEE': 'Market: Poland, Czech Republic, Hungary, Romania, Bulgaria. Rapid modernization, EU funding for automation, competitive labor costs but rising. Growth opportunity. Polish or English.',
  'Balkans': 'Market: Serbia, Croatia, Greece, Turkey. Emerging automation market, export ambitions to EU. English.',
  'Baltics': 'Market: Estonia, Latvia, Lithuania. Small but advanced, EU-oriented, digital-first. English.',

  // AMERICAS
  'USA': 'Market: United States. Scale, efficiency, labor cost pressure (H-2A visa challenges), FDA compliance, large packhouses. American English.',
  'Canada': 'Market: Canada. Similar to US but smaller scale, bilingual (EN/FR), CFIA regulations. English.',
  'Mexico & Central America': 'Market: Mexico, Guatemala, Costa Rica. Major fresh produce exporters, US market supply chain, growing automation. Spanish.',
  'Brazil': 'Market: Brazil. Largest Latin American producer, citrus/tropical, Mercosul regulations. Portuguese.',
  'South America': 'Market: Chile, Peru, Argentina, Colombia, Ecuador. Export-focused (berries, avocado, grapes), counter-seasonal to Europe. Spanish.',

  // ASIA PACIFIC
  'China': 'Market: China. Newtec JV presence. WeChat B2B, partnership-led, local success stories, scale. Simplified Chinese.',
  'Japan & Korea': 'Market: Japan & South Korea. Extreme quality standards, premium packaging, precision obsession. Technology leadership. English.',
  'Southeast Asia': 'Market: Thailand, Vietnam, Philippines, Indonesia, Malaysia. Tropical produce, growing automation, price-sensitive but upgrading. English.',
  'India': 'Market: India. Massive scale, cold chain development, government push for food processing. Value proposition critical. English.',
  'Australia & NZ': 'Market: Australia & New Zealand. Mature market, labor shortage acute, high standards, existing Newtec installations. English.',

  // MIDDLE EAST & AFRICA
  'MENA': 'Market: Middle East & North Africa (UAE, Saudi, Egypt, Morocco). Food security focus, import-dependent, mega-projects, premium positioning. English or Arabic context.',
  'Sub-Saharan Africa': 'Market: Sub-Saharan Africa (Kenya, South Africa, Ethiopia, Nigeria). Emerging market, export horticulture (flowers, avocado, green beans), development-oriented. English.',
  'Turkey': 'Market: Turkey. Bridge between Europe and Asia, strong agriculture, growing processing sector. English or Turkish context.',
  'Israel': 'Market: Israel. Agritech innovation hub, advanced agriculture, water-efficient, high-tech adoption. English.',
};

const LANGUAGE_MAP = {
  'EN': 'Write in English.',
  'EN-UK': 'Write in British English.',
  'EN-US': 'Write in American English.',
  'DE': 'Write in German.',
  'ES': 'Write in Spanish.',
  'IT': 'Write in Italian.',
  'PT': 'Write in European Portuguese.',
  'PT-BR': 'Write in Brazilian Portuguese.',
  'FR': 'Write in French.',
  'DA': 'Write in Danish.',
  'PL': 'Write in Polish.',
  'NL': 'Write in Dutch.',
  'SV': 'Write in Swedish.',
  'NO': 'Write in Norwegian.',
  'FI': 'Write in Finnish.',
  'ZH': 'Write in Simplified Chinese.',
  'JA': 'Write in Japanese.',
  'KO': 'Write in Korean.',
  'TR': 'Write in Turkish.',
  'AR': 'Write in Arabic.',
  'HE': 'Write in Hebrew.',
  'TH': 'Write in Thai.',
  'VI': 'Write in Vietnamese.',
  'RO': 'Write in Romanian.',
  'HU': 'Write in Hungarian.',
  'CS': 'Write in Czech.',
  'EL': 'Write in Greek.',
  'HR': 'Write in Croatian.',
  'SR': 'Write in Serbian.',
  'BG': 'Write in Bulgarian.',
  'HI': 'Write in Hindi.',
};

// ============================================================
// MAIN HANDLER
// ============================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action } = req.body;

  try {
    switch (action) {
      case 'generate': return await handleGenerate(req, res);
      case 'save': return await handleSave(req, res);
      case 'list': return await handleList(req, res);
      case 'update_status': return await handleUpdateStatus(req, res);
      default: return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Content API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================================
// GENERATE
// ============================================================

async function handleGenerate(req, res) {
  const { pillar, platform, format, market, language, topic } = req.body;

  if (!pillar || !SYSTEM_PROMPTS[pillar]) {
    return res.status(400).json({ error: `Invalid pillar. Use: ${Object.keys(SYSTEM_PROMPTS).join(', ')}` });
  }
  if (!format || !FORMAT_TEMPLATES[format]) {
    return res.status(400).json({ error: `Invalid format. Use: ${Object.keys(FORMAT_TEMPLATES).join(', ')}` });
  }

  const systemPrompt = SYSTEM_PROMPTS[pillar];
  const formatTemplate = FORMAT_TEMPLATES[format];
  const marketContext = MARKET_CONTEXT[market] || MARKET_CONTEXT['International'];
  const languageInstruction = LANGUAGE_MAP[language] || LANGUAGE_MAP['EN'];

  const userMessage = `${marketContext}
${languageInstruction}
Platform: ${platform}
Format: ${format}
${topic ? `Topic/Focus: ${topic}` : 'Choose an engaging topic based on your knowledge base.'}

${formatTemplate}

IMPORTANT: Return ONLY the JSON object. No markdown, no backticks, no explanation. Just raw JSON.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const rawText = data.content[0].text;

  let parsed;
  try {
    const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    parsed = { raw_text: rawText, parse_error: true };
  }

  parsed.metadata = {
    pillar, platform, format, market,
    language: language || 'EN',
    topic: topic || 'auto-generated',
    generated_at: new Date().toISOString(),
    model: 'claude-sonnet-4-20250514'
  };

  return res.status(200).json(parsed);
}

// ============================================================
// SAVE — Maps to existing Airtable "Content Calendar" fields
// ============================================================

async function handleSave(req, res) {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'No content to save' });

  // Map language codes to full names (matching existing Airtable options)
  const LANG_TO_NAME = {
    'EN': 'English', 'EN-UK': 'English', 'EN-US': 'English',
    'DE': 'Deutsch', 'ES': 'Español', 'IT': 'Italiano',
    'PT': 'Português', 'PT-BR': 'Português BR', 'FR': 'Français',
    'DA': 'Dansk', 'NL': 'Nederlands', 'PL': 'Polski',
    'SV': 'Svenska', 'NO': 'Norsk', 'FI': 'Suomi',
    'ZH': '中文', 'JA': '日本語', 'KO': '한국어',
    'TR': 'Türkçe', 'AR': 'العربية', 'HE': 'עברית',
    'TH': 'ไทย', 'VI': 'Tiếng Việt', 'HI': 'हिन्दी',
    'RO': 'Română', 'HU': 'Magyar', 'CS': 'Čeština',
    'EL': 'Ελληνικά', 'HR': 'Hrvatski', 'SR': 'Srpski', 'BG': 'Български',
  };

  const langCode = content.metadata?.language || 'EN';
  const langName = LANG_TO_NAME[langCode] || 'English';

  // Map to EXISTING Airtable field names
  // Extract a good title
  const title = content.title 
    || content.metadata?.topic 
    || (content.post_text ? content.post_text.split('\n')[0].substring(0, 80) : '')
    || (content.hook_text ? content.hook_text.substring(0, 80) : '')
    || 'Content ' + new Date().toISOString().split('T')[0];

  // Get the main text content (different formats store it differently)
  const mainText = content.post_text 
    || content.article_body 
    || (content.script ? content.script.map(s => `[${s.timestamp || ''}] ${s.chapter || s.action || ''}: ${s.text || s.voiceover || s.text_overlay || s.script_text || ''}`).join('\n\n') : '')
    || (content.hook_text ? `HOOK: ${content.hook_text}\n\n${(content.script || []).map(s => `[${s.timestamp || ''}] ${s.text_overlay || s.action || ''}`).join('\n')}` : '')
    || content.raw_text 
    || '';

  // Map format to match Airtable exactly (lowercase as created)
  const FORMAT_MAP = {
    'post': 'post', 'carousel': 'carousel', 'article': 'article',
    'poll': 'poll', 'video_long': 'video_long', 'video_short': 'video_short', 'tiktok': 'tiktok'
  };

  const allFields = {
    'Topic': title,
    'Platform': content.metadata?.platform || '',
    'Post Text': mainText,
    'Visual Direction': content.visual_direction || '',
    'Language': langName,
    'Status': 'Draft',
    'Hashtags': content.hashtags || '',
    'Pillar': content.metadata?.pillar || '',
    'Format': FORMAT_MAP[content.metadata?.format] || content.metadata?.format || '',
    'Market': content.metadata?.market || '',
    'CTA': content.cta || '',
    'Content Type': content.content_type || 'AI',
    'Slides JSON': content.slides ? JSON.stringify(content.slides) : '',
  };

  // Remove empty values to avoid Airtable errors
  Object.keys(allFields).forEach(key => {
    if (!allFields[key]) delete allFields[key];
  });

  const airtableRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_CONTENT_TABLE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: allFields })
  });

  if (!airtableRes.ok) {
    const errText = await airtableRes.text();
    throw new Error(`Airtable error: ${airtableRes.status} - ${errText}`);
  }

  const record = await airtableRes.json();
  return res.status(200).json({ success: true, record_id: record.id });
}

// ============================================================
// LIST
// ============================================================

async function handleList(req, res) {
  const { status, pillar, platform } = req.body;

  let filterParts = [];
  if (status) filterParts.push(`{Status}='${status}'`);
  if (pillar) filterParts.push(`{Pillar}='${pillar}'`);
  if (platform) filterParts.push(`{Platform}='${platform}'`);

  let url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_CONTENT_TABLE}?sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc&pageSize=50`;

  if (filterParts.length > 0) {
    const formula = filterParts.length === 1 ? filterParts[0] : `AND(${filterParts.join(',')})`;
    url += `&filterByFormula=${encodeURIComponent(formula)}`;
  }

  const airtableRes = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` }
  });

  if (!airtableRes.ok) {
    const errText = await airtableRes.text();
    throw new Error(`Airtable error: ${airtableRes.status} - ${errText}`);
  }

  const data = await airtableRes.json();
  return res.status(200).json({ records: data.records });
}

// ============================================================
// UPDATE STATUS
// ============================================================

async function handleUpdateStatus(req, res) {
  const { record_id, updates } = req.body;
  if (!record_id) return res.status(400).json({ error: 'record_id required' });

  // Support both old format (status only) and new format (any fields)
  let fields = {};
  if (updates && typeof updates === 'object') {
    fields = updates;
  } else if (req.body.status) {
    fields = { 'Status': req.body.status };
  } else {
    return res.status(400).json({ error: 'updates object or status required' });
  }

  const airtableRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_CONTENT_TABLE}/${record_id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  if (!airtableRes.ok) {
    const errText = await airtableRes.text();
    throw new Error(`Airtable error: ${airtableRes.status} - ${errText}`);
  }

  return res.status(200).json({ success: true });
}
