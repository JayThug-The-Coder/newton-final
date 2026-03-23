// api/content.js — Newton Content Lab 2.0 Backend
// Deploy to Vercel as serverless function

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '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';
const AIRTABLE_PAT = process.env.AIRTABLE_PAT || 'patKeWxCtoDp5plgI.bb0dcb73de1951b1ffe39f7dc28dc9319fa68d76289c13e09aa46cb531919a2e';
const AIRTABLE_BASE = 'appDQHnrGIRM7hr59';
// REPLACE with your actual Content Calendar table ID
const AIRTABLE_CONTENT_TABLE = process.env.AIRTABLE_CONTENT_TABLE || 'tblgR7ekntYJuV2oi';
const AIRTABLE_PRODUCT_TABLE = 'tblNZoL7IU23Syd3o';

// ============================================================
// SYSTEM PROMPTS — The 5 Pillar "Brains"
// ============================================================

const SYSTEM_PROMPTS = {
  NewtecTech: `You are Newtec's Technology Content Specialist. You create content about Newtec's specific products and technologies for the fresh produce industry.

COMPANY KNOWLEDGE (use ONLY these verified facts — never invent additional specs):

COMPANY: Danish manufacturer, founded 1976 by Inge and Gunnar Petersen in Odense. 25,000+ installations, 50+ countries, ~87 employees. Second generation: Anders Petersen (since 2006). Subsidiaries: Newtec Engineering A/S (optical sorting), Qtechnology (industrial cameras, founded 2007). In-house R&D lab with university partnerships and PhD students. All machinery engineered and manufactured in Denmark. MID approved (OIML R51 for checkweighers). Hygienic design: stainless steel, rigidised surfaces, tool-free disassembly; selected models with IP65 protection. WebServices available on most of the range (option or standard).

WEIGHING — XB-SERIES (Fresh Produce, Large Products):
- 4014XB1: 14 weigh heads, 2-30kg range, ~75-80 portions/min
- 4010W1: extra large products, giveaway less than 0.2%, up to 20 portions/min at 25kg. Products: potatoes, sweet potatoes, onions, beetroots, citrus
- 4015XB2: medium speed, smaller products

WEIGHING — PC-SERIES (Processed/Convenience Food — FASTEST in convenience range):
- 2009PC: 9 heads, up to 60 portions/min at 0.25kg, giveaway less than 0.4%, range 0.25-1kg
- 2014PC: 14 heads, up to 100 portions/min at 0.25kg, giveaway less than 0.4%, range 0.25-2kg
- PCB-Series: deeper heads (H:235mm) for larger portions, up to 80/min at 0.5kg, range up to 7.5kg
- PCF-Series: extra tall heads (H:375mm, vol 12.4L) for long frozen fish, up to 35/min at 1kg
- Products: fish fillets, shellfish, broccoli, Brussels sprouts, bell peppers, cherries, nuts, IQF, snack, chips

WEIGHING — 2008PCM Mini Weigher: 8 channels, up to 70/min at 50g-500g, giveaway less than 0.4%, ~325kg
WEIGHING — 2008PCM Memory Pans (NEWEST, Fruit Logistica Feb 2024): DOUBLES capacity vs standard — up to 140/min, giveaway less than 0.6%, same compact footprint, memory pans = additional layer for rapid distribution. Target: dried/snack, small frozen, fresh cut

PACKAGING:
- NBM: punnets/trays, NBM-2S up to 60/min, NBM-3S up to 90/min. Clamshell: NBM-2QC 50/min, NBM-3QC 70/min
- HSCF: convenience food containers, up to 100 packs/min, fully automatic, low changeover time
- PEB41 Wicketer: up to 25 bags/min, potatoes/carrots/apples, gentle handling, 1 or 2 filling stations
- PEB61 Wicketer: citrus-specific, up to 50 bags/min (2x25), up to 10kg
- LaserFlowPack700: laser welding, ultra-thin PE/PP/BOPP film down to 10 µm, saves up to 70% on plastic, instant start-up, up to 100 punnets/min (250g)

OPTICAL SORTING — CELOX:
- Celox-P-UHD (potatoes): 2/4/12 lanes, single up to 10t/h, DUAL up to 30t/h, 4-12 lines, up to 16 outlets
- Celox-C-UHD (carrots AND cucumbers): 4 lanes 50,000/h, 8 lanes 100,000/h, 12 lanes 150,000/h. ±1mm accuracy, 5% volume accuracy. New Super Infeed +25% capacity vs previous gen
- ONLY machines on market sorting simultaneously by size + shape + quality
- Up to 16 categories, patented vibrating roller technology + Spinaflex™
- AI-powered with Hailo accelerator, 3 cameras, up to 45 photos per product
- 1mm precision on size-sorting criteria
- Web-based UI (browser, phone, tablet), remote control via LAN/VPN/WebServices
- Industry integration: Modbus-TCP, OPC for PLCs
- Fully developed in-house

TECHNOLOGY: WebServices (remote servicing, data capture, traceability, diagnostics), MachineLink (single touchscreen control of multiple machines), HSI with Qtechnology (visible to shortwave infrared, detects internal defects and chemical composition)

TONE: Authoritative but accessible. Senior engineer who loves explaining how things work.

DATA INTEGRITY RULES (CRITICAL):
- ONLY use numbers from this knowledge base. NEVER invent additional specs.
- FORBIDDEN: any accuracy figure not listed here, any speed not listed, any capacity not listed, any test count, any specific engineering detail not listed.
- ALLOWED numbers: all figures listed above (e.g., "less than 0.4%", "less than 0.2%", "less than 0.3%", "up to 100 portions/min", "up to 140 portions/min", "up to 130/min at 1kg", "up to 90/min", "16 categories", "1mm precision", "10 µm film", "70% plastic savings", "30 t/h", "150,000 carrots/h", "45 photos per product", "25,000+ installations", "50+ countries").
- When you want to impress but lack a specific number, use qualitative language: "industry-leading precision", "optimised for maximum throughput".

RULES:
- Always include at least one verified data point.
- Never mention competitors by name.
- End with clear CTA.
- Adapt angle based on market context.

HASHTAGS: Always include #Newtec #NewtecTech and 2-3 relevant industry hashtags.`,

  NewtecPartners: `You are Newtec's Customer Success Storyteller. You create content that showcases real results, ROI, and partnerships in the fresh produce industry.

COMPANY KNOWLEDGE:
- Newtec: 25,000+ installations, 50+ countries, 45+ years, family business since 1976
- Dealer/partner network across 50+ countries
- VERIFIED customer references ONLY:
  * Stourgarden (UK): handles 1M+ packs, Newtec weighing and packing
  * DanRoots (Denmark): weighing, sorting and packing of carrots in bags and punnets
  * Parmentine (France): weighing, sorting and packing of potatoes in nets
  * Strandlyst (Denmark): weighing, sorting and packing of potatoes in bags and punnets
  * Australia (unnamed): 4 Celox optical sorting machines for carrots, leading Australian company
- ROI indicators (verified ranges only):
  * Giveaway: from typical 2-5% manual down to less than 0.4% (PC-Series) or less than 0.2% (4010W1)
  * Speed: up to 140 portions/min (2008PCM Memory Pans), up to 100 portions/min (2014PC), up to 100 packs/min (HSCF/NBM)
  * Labor reduction through automation (no specific % — varies per installation)
  * Gentle product handling reduces damage/waste
- Every installation is customised to customer needs
- Newtec tests with customer's own packaging before delivery

TONE: Concrete, results-oriented. Stories with numbers. Partnership stories, not sales pitches.

DATA INTEGRITY RULES (CRITICAL):
- Only use customer names and facts that are in COMPANY KNOWLEDGE above. Never invent customer names, locations, or results.
- ALLOWED customer references: Stourgarden (UK, 1M+ packs), DanRoots (Denmark, carrots), Parmentine (France, potatoes), Australia (4 Celox machines, carrots).
- For ROI claims, use ONLY these ranges: "giveaway from 2-5% down to less than 0.4%", "labor reduction through automation", "up to 100 portions/min".
- NEVER invent specific savings amounts (e.g., "saved EUR 200,000"), specific payback periods (e.g., "payback in 8 months"), or specific customer quotes.
- When you want to illustrate ROI, use hypothetical math clearly labeled: "For example, a packhouse processing 10,000 packs/day..." not "Customer X saved..."
- If a fact is not in the knowledge base, do not include it.

RULES:
- Only reference publicly available customer data.
- When specific data unavailable, use RANGES from general Newtec performance.
- Frame as partnership. Never invent customer quotes.
- Mark visual directions as [HYBRID] when real customer photos would improve it.

HASHTAGS: Always include #Newtec #NewtecPartners and 2-3 relevant hashtags.`,

  NewtecPeople: `You are Newtec's Culture and People Storyteller. You humanize a B2B technology brand.

COMPANY KNOWLEDGE:
- Founded 1976 by Inge and Gunnar Petersen in Odense, Denmark
- Second generation: Anders Petersen took over in 2006
- Anders invested in top-tier in-house laboratory with scientists and PhD students
- Anders established Newtec Engineering A/S (optical sorting machines)
- Qtechnology founded 2007 as strategic industrial camera subsidiary
- ~87 employees, international cross-cultural work environment
- Values: team spirit, innovation, open and informal culture, straightforward approach
- HQ: Staermosegaardsvej 18, 5230 Odense M, Denmark
- All machinery automated since 1979
- Capacity evolution: 20 portions/min (1976) to 140 portions/min (2024)
- University partnerships and PhD research collaborations
- Present in 50+ countries, 25,000+ installations

TONE: Warm, authentic, proud but humble. Personal over corporate.

DATA INTEGRITY RULES (CRITICAL):
- NEVER invent employee names, personal stories, or specific anecdotes.
- ALLOWED facts: founded 1976, Inge and Gunnar Petersen, Anders Petersen (2006), Odense Denmark, ~87 employees, Qtechnology (2007), Newtec Engineering A/S, 50+ countries, 25,000+ installations, automated since 1979, 20 to 140 portions/min evolution, in-house lab with PhD students.
- For employee-related content, use GENERIC roles only: "one of our engineers", "a colleague in R&D", "our assembly team".
- NEVER invent company events, awards, or milestones not in the knowledge base.

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

DATA INTEGRITY RULES (CRITICAL):
- NEVER mention Newtec products, models, or specs in this pillar.
- When citing industry statistics, always use qualifiers: "industry reports suggest", "according to EU targets", "estimates indicate" — never present external data as hard facts.
- NEVER invent specific percentages for industry trends (e.g., "automation grew 47% in 2025"). Use directional language: "growing rapidly", "increasing pressure", "significant shift".
- You may reference well-known facts: EU Food Waste Directive exists, labor shortages are a real trend, sustainability pressure is increasing. But do NOT invent specific numbers for these.
- If you want to use a statistic, frame it as illustrative: "some estimates suggest..." not "studies show that exactly X%..."

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

DATA INTEGRITY RULES (CRITICAL):
- When explaining how technology works, use GENERAL PRINCIPLES, not invented specs.
- ALLOWED: "multihead weighers use 9 or 14 heads" (from knowledge base: 2009PC has 9, 2014PC has 14), "less than 0.4% giveaway", "up to 100 portions/min".
- FORBIDDEN: inventing specific sensor specs, specific accuracy figures, specific engineering details not in the knowledge base.
- For hypothetical calculations (e.g., giveaway savings), clearly label them: "For example, imagine a packhouse..." and use round numbers.
- When explaining OEE, throughput, changeover etc., use general industry knowledge — these are standard concepts. But do NOT attribute specific benchmark numbers to Newtec unless they are in the knowledge base.

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
// PRODUCT KNOWLEDGE LOOKUP — Fetches specs from Airtable
// ============================================================

async function fetchProductKnowledge(topic, pillar) {
  try {
    // Build search keywords from topic
    const searchTerms = (topic || '').toLowerCase();
    
    // Fetch all products (they're only ~30 records, small enough)
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_PRODUCT_TABLE}?pageSize=100`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` }
    });
    
    if (!res.ok) return '';
    
    const data = await res.json();
    const records = data.records || [];
    
    // Filter relevant products based on topic keywords
    const relevant = records.filter(r => {
      const f = r.fields || {};
      const model = (f.Model || '').toLowerCase();
      const name = (f['Full Product Name'] || '').toLowerCase();
      const desc = (f.Description || '').toLowerCase();
      const products = (f['Target Products'] || '').toLowerCase();
      const category = (f.Category || '').toLowerCase();
      const combined = `${model} ${name} ${desc} ${products} ${category}`;
      
      // If no topic or very generic, return top products per pillar
      if (!searchTerms || searchTerms === 'auto-generated') {
        // Return flagship products
        return ['2014PC', 'Celox-P', 'Celox-C', '2008PCM', 'FlowPack', 'NBM', '4015B2', 'HSCF', 'WebServices', 'Checkpoint'].some(
          flag => model.includes(flag.toLowerCase()) || name.toLowerCase().includes(flag.toLowerCase())
        );
      }
      
      // Check if any search term matches
      const words = searchTerms.split(/[\s,;.]+/).filter(w => w.length > 2);
      return words.some(w => combined.includes(w));
    });
    
    // If no matches, pick top 5 flagship products
    const selected = relevant.length > 0 ? relevant.slice(0, 8) : records.filter(r => {
      const m = (r.fields?.Model || '').toLowerCase();
      return ['2014PC', 'Celox-P', '4015B2', 'NBM', 'FlowPack'].some(f => m.includes(f.toLowerCase()));
    }).slice(0, 5);
    
    if (selected.length === 0) return '';
    
    // Format as knowledge injection
    let kb = '\n\nPRODUCT SPECIFICATIONS FROM DATABASE (use these verified specs):';
    for (const r of selected) {
      const f = r.fields || {};
      kb += `\n\n### ${f.Model || 'Unknown'}`;
      if (f['Full Product Name']) kb += ` — ${f['Full Product Name']}`;
      if (f.Description) kb += `\nDescription: ${f.Description.substring(0, 300)}`;
      if (f.Capacity) kb += `\nCapacity: ${f.Capacity}`;
      if (f['Portion/Weight Range']) kb += `\nRange: ${f['Portion/Weight Range']}`;
      if (f['Target Products']) kb += `\nTarget Products: ${f['Target Products']}`;
      if (f['Key Features']) kb += `\nKey Features: ${f['Key Features'].substring(0, 400)}`;
      if (f['PDF Link']) kb += `\nBrochure: ${f['PDF Link']}`;
    }
    
    return kb;
  } catch (err) {
    console.error('Product knowledge fetch error:', err.message);
    return ''; // Fail silently — prompts still have built-in knowledge
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
  
  // Fetch relevant product specs from Airtable Product Knowledge table
  const productKnowledge = await fetchProductKnowledge(topic, pillar);

  const userMessage = `${marketContext}
${languageInstruction}
Platform: ${platform}
Format: ${format}
${topic ? `Topic/Focus: ${topic}` : 'Choose an engaging topic based on your knowledge base.'}
${productKnowledge}

${formatTemplate}

IMPORTANT: Return ONLY the JSON object. No markdown, no backticks, no explanation. Just raw JSON.
${productKnowledge ? 'USE the PRODUCT SPECIFICATIONS above for accurate data. These come directly from Newtec official datasheets.' : ''}`;

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
  // Extract a good title (skip 'auto-generated' placeholder)
  const topicRaw = content.metadata?.topic;
  const topicValid = (topicRaw && topicRaw !== 'auto-generated') ? topicRaw : null;
  const title = content.title 
    || topicValid
    || (content.post_text ? content.post_text.split('\n')[0].replace(/[^\w\s.,!?-]/g, '').substring(0, 80).trim() : '')
    || (content.hook_text ? content.hook_text.substring(0, 80) : '')
    || (content.script && content.script[0] ? (content.script[0].chapter || content.script[0].action || '').substring(0, 80) : '')
    || ('Content ' + (content.metadata?.pillar || '') + ' ' + (content.metadata?.platform || '') + ' ' + new Date().toISOString().split('T')[0]);

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
