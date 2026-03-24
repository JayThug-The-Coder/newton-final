// ContentLab2.jsx — Newton Content Lab 2.0 Frontend Component
// Import this in App.jsx: import ContentLab2 from './ContentLab2'
// Use in the Content Lab tab: <ContentLab2 />
// This is a SELF-CONTAINED component — all hooks are inside, none added to parent

import { useState, useCallback, useRef } from 'react';

// ============================================================
// CONFIG
// ============================================================

const API_URL = '/api/content2';

const PILLARS = [
  { id: 'NewtecTech', label: '#NewtecTech', subtitle: 'Technology & Innovation', color: '#2563eb', icon: '⚙️' },
  { id: 'NewtecPartners', label: '#NewtecPartners', subtitle: 'Customer Success & ROI', color: '#059669', icon: '🤝' },
  { id: 'NewtecPeople', label: '#NewtecPeople', subtitle: 'People & Culture', color: '#ea580c', icon: '👥' },
  { id: 'NewtecInsights', label: '#NewtecInsights', subtitle: 'Industry Intelligence', color: '#7c3aed', icon: '📊' },
  { id: 'NewtecEducation', label: '#NewtecEducation', subtitle: 'Knowledge & How-To', color: '#0d9488', icon: '🎓' },
];

const PLATFORMS = [
  { id: 'LinkedIn', icon: '💼', formats: ['post', 'carousel', 'article', 'poll'] },
  { id: 'YouTube', icon: '📹', formats: ['video_long', 'video_short'] },
  { id: 'TikTok', icon: '🎵', formats: ['tiktok'] },
];

const FORMAT_LABELS = {
  post: 'Post',
  carousel: 'Carousel (5-7 slides)',
  article: 'Article (800-1200 words)',
  poll: 'Poll',
  video_long: 'Video Script (3-5 min)',
  video_short: 'Short / Reel (30-60s)',
  tiktok: 'TikTok Hook + Script',
};

const MARKET_REGIONS = [
  { region: 'Europe', markets: [
    { id: 'International', flag: '🌍', label: 'International', defaultLang: 'EN' },
    { id: 'UK & Ireland', flag: '🇬🇧', label: 'UK & Ireland', defaultLang: 'EN-UK' },
    { id: 'DACH', flag: '🇩🇪', label: 'DACH', defaultLang: 'DE' },
    { id: 'Nordics', flag: '🇩🇰', label: 'Nordics', defaultLang: 'EN' },
    { id: 'France', flag: '🇫🇷', label: 'France', defaultLang: 'FR' },
    { id: 'Iberia', flag: '🇪🇸', label: 'Spain & Portugal', defaultLang: 'ES' },
    { id: 'Italy', flag: '🇮🇹', label: 'Italy', defaultLang: 'IT' },
    { id: 'Benelux', flag: '🇳🇱', label: 'Benelux', defaultLang: 'NL' },
    { id: 'Poland & CEE', flag: '🇵🇱', label: 'Poland & CEE', defaultLang: 'PL' },
    { id: 'Balkans', flag: '🇬🇷', label: 'Balkans & Turkey', defaultLang: 'EN' },
    { id: 'Baltics', flag: '🇱🇹', label: 'Baltics', defaultLang: 'EN' },
  ]},
  { region: 'Americas', markets: [
    { id: 'USA', flag: '🇺🇸', label: 'United States', defaultLang: 'EN-US' },
    { id: 'Canada', flag: '🇨🇦', label: 'Canada', defaultLang: 'EN' },
    { id: 'Mexico & Central America', flag: '🇲🇽', label: 'Mexico & Central Am.', defaultLang: 'ES' },
    { id: 'Brazil', flag: '🇧🇷', label: 'Brazil', defaultLang: 'PT-BR' },
    { id: 'South America', flag: '🌎', label: 'South America', defaultLang: 'ES' },
  ]},
  { region: 'Asia Pacific', markets: [
    { id: 'China', flag: '🇨🇳', label: 'China', defaultLang: 'ZH' },
    { id: 'Japan & Korea', flag: '🇯🇵', label: 'Japan & Korea', defaultLang: 'EN' },
    { id: 'Southeast Asia', flag: '🌏', label: 'Southeast Asia', defaultLang: 'EN' },
    { id: 'India', flag: '🇮🇳', label: 'India', defaultLang: 'EN' },
    { id: 'Australia & NZ', flag: '🇦🇺', label: 'Australia & NZ', defaultLang: 'EN' },
  ]},
  { region: 'Middle East & Africa', markets: [
    { id: 'MENA', flag: '🇦🇪', label: 'Middle East & N. Africa', defaultLang: 'EN' },
    { id: 'Sub-Saharan Africa', flag: '🌍', label: 'Sub-Saharan Africa', defaultLang: 'EN' },
    { id: 'Turkey', flag: '🇹🇷', label: 'Turkey', defaultLang: 'TR' },
    { id: 'Israel', flag: '🇮🇱', label: 'Israel', defaultLang: 'EN' },
  ]},
];

// Flat list for lookups
const ALL_MARKETS = MARKET_REGIONS.flatMap(r => r.markets);

const ALL_LANGUAGES = [
  { id: 'EN', flag: '🇬🇧', label: 'English' },
  { id: 'EN-UK', flag: '🇬🇧', label: 'British English' },
  { id: 'EN-US', flag: '🇺🇸', label: 'American English' },
  { id: 'DE', flag: '🇩🇪', label: 'German' },
  { id: 'ES', flag: '🇪🇸', label: 'Spanish' },
  { id: 'IT', flag: '🇮🇹', label: 'Italian' },
  { id: 'PT', flag: '🇵🇹', label: 'Portuguese' },
  { id: 'PT-BR', flag: '🇧🇷', label: 'Brazilian Portuguese' },
  { id: 'FR', flag: '🇫🇷', label: 'French' },
  { id: 'DA', flag: '🇩🇰', label: 'Danish' },
  { id: 'NL', flag: '🇳🇱', label: 'Dutch' },
  { id: 'PL', flag: '🇵🇱', label: 'Polish' },
  { id: 'SV', flag: '🇸🇪', label: 'Swedish' },
  { id: 'NO', flag: '🇳🇴', label: 'Norwegian' },
  { id: 'FI', flag: '🇫🇮', label: 'Finnish' },
  { id: 'ZH', flag: '🇨🇳', label: 'Chinese' },
  { id: 'JA', flag: '🇯🇵', label: 'Japanese' },
  { id: 'KO', flag: '🇰🇷', label: 'Korean' },
  { id: 'TR', flag: '🇹🇷', label: 'Turkish' },
  { id: 'AR', flag: '🇸🇦', label: 'Arabic' },
  { id: 'HE', flag: '🇮🇱', label: 'Hebrew' },
  { id: 'TH', flag: '🇹🇭', label: 'Thai' },
  { id: 'VI', flag: '🇻🇳', label: 'Vietnamese' },
  { id: 'HI', flag: '🇮🇳', label: 'Hindi' },
  { id: 'RO', flag: '🇷🇴', label: 'Romanian' },
  { id: 'HU', flag: '🇭🇺', label: 'Hungarian' },
  { id: 'CS', flag: '🇨🇿', label: 'Czech' },
  { id: 'EL', flag: '🇬🇷', label: 'Greek' },
  { id: 'HR', flag: '🇭🇷', label: 'Croatian' },
  { id: 'SR', flag: '🇷🇸', label: 'Serbian' },
  { id: 'BG', flag: '🇧🇬', label: 'Bulgarian' },
];

const STATUS_COLORS = {
  Draft: '#94a3b8',
  Review: '#eab308',
  Approved: '#2563eb',
  Published: '#059669',
  Rejected: '#ef4444',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ContentLab2() {
  // State
  const [view, setView] = useState('create'); // 'create' | 'library' | 'calendar'
  const [pillar, setPillar] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [format, setFormat] = useState(null);
  const [market, setMarket] = useState('International');
  const [language, setLanguage] = useState('EN');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedContents, setSavedContents] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);
  const [libraryFilter, setLibraryFilter] = useState({ status: '', pillar: '', platform: '' });
  const [carouselSlide, setCarouselSlide] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [updateMsg, setUpdateMsg] = useState(null);
  const [scheduleId, setScheduleId] = useState(null);
  const [scheduleFields, setScheduleFields] = useState({ week: '', day: '', date: '' });
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageModel, setImageModel] = useState('flux-schnell');
  const [imageAR, setImageAR] = useState('16:9');
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoModel, setVideoModel] = useState('kling');
  const [mediaError, setMediaError] = useState(null);
  const resultRef = useRef(null);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handlePlatformChange = useCallback((p) => {
    setPlatform(p);
    setFormat(PLATFORMS.find(pl => pl.id === p)?.formats[0] || null);
  }, []);

  const handleMarketChange = useCallback((m) => {
    setMarket(m);
    const mkt = ALL_MARKETS.find(mk => mk.id === m);
    if (mkt?.defaultLang) {
      setLanguage(mkt.defaultLang);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!pillar || !platform || !format) {
      setError('Please select Pillar, Platform, and Format before generating.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setCarouselSlide(0);
    setSaveStatus(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          pillar, platform, format, market, language,
          topic: topic || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pillar, platform, format, market, language, topic]);

  const handleGenerateImage = useCallback(async () => {
    if (!result) return;
    setImageLoading(true);
    setMediaError(null);
    setImageUrl(null);
    try {
      const visualPrompt = result.visual_direction
        || result.thumbnail_text
        || result.title
        || 'Professional industrial machinery for fresh produce sorting and packaging, clean modern factory setting';
      
      const fullPrompt = `Professional B2B industrial photography style. ${visualPrompt}. Clean, modern, high-quality. No text overlays unless specifically needed. Newtec-style: Danish engineering, stainless steel machinery, fresh produce.`;
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_image', prompt: fullPrompt, model: imageModel, aspect_ratio: imageAR }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.image_url) setImageUrl(data.image_url);
      else throw new Error('No image URL returned');
    } catch (err) {
      setMediaError('Image: ' + err.message);
    } finally {
      setImageLoading(false);
    }
  }, [result, imageModel, imageAR]);

  const handleGenerateVideo = useCallback(async () => {
    if (!result) return;
    setVideoLoading(true);
    setMediaError(null);
    setVideoUrl(null);
    try {
      const visualPrompt = result.visual_direction
        || result.title
        || 'Industrial sorting machinery processing fresh produce in a modern packhouse';
      
      const fullPrompt = `Cinematic B2B industrial footage. ${visualPrompt}. Smooth camera movement, professional lighting, clean factory environment. 5 seconds.`;
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_video', prompt: fullPrompt, model: videoModel, duration: '5', aspect_ratio: imageAR }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.video_url) setVideoUrl(data.video_url);
      else if (data.status === 'processing') setMediaError('Video is generating... try again in 30 seconds.');
      else throw new Error('No video URL returned');
    } catch (err) {
      setMediaError('Video: ' + err.message);
    } finally {
      setVideoLoading(false);
    }
  }, [result, videoModel, imageAR]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    setSaveStatus('saving');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', content: result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setError(err.message);
    }
  }, [result]);

  const handleCopy = useCallback(() => {
    const text = result?.post_text || result?.article_body || result?.raw_text || '';
    navigator.clipboard.writeText(text);
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newton-content-${result.metadata?.pillar || 'export'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleLoadLibrary = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list', ...libraryFilter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSavedContents(data.records || []);
    } catch (err) {
      setError(err.message);
    }
  }, [libraryFilter]);

  const handleUpdateField = useCallback(async (recordId, fieldUpdates) => {
    setUpdateMsg('saving');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', record_id: recordId, updates: fieldUpdates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUpdateMsg('saved');
      setTimeout(() => setUpdateMsg(null), 1500);
      handleLoadLibrary();
    } catch (err) {
      setUpdateMsg('error');
      setError(err.message);
    }
  }, [handleLoadLibrary]);

  const startEdit = (record) => {
    setEditingId(record.id);
    setEditFields({
      topic: record.fields?.Topic || '',
      postText: record.fields?.['Post Text'] || '',
      status: record.fields?.Status || 'Draft',
      hashtags: record.fields?.Hashtags || '',
      visual: record.fields?.['Visual Direction'] || '',
    });
  };

  const saveEdit = async (recordId) => {
    await handleUpdateField(recordId, {
      'Topic': editFields.topic,
      'Post Text': editFields.postText,
      'Status': editFields.status,
      'Hashtags': editFields.hashtags,
      'Visual Direction': editFields.visual,
    });
    setEditingId(null);
  };

  const scheduleToCalendar = async (recordId) => {
    const updates = {};
    if (scheduleFields.week) updates['Week'] = parseInt(scheduleFields.week);
    if (scheduleFields.day) updates['Day'] = scheduleFields.day;
    if (scheduleFields.date) updates['Date'] = scheduleFields.date;
    updates['Status'] = 'Approved';
    await handleUpdateField(recordId, updates);
    setScheduleId(null);
    setScheduleFields({ week: '', day: '', date: '' });
  };

  // ============================================================
  // STYLES (inline to keep component self-contained)
  // ============================================================

  const S = {
    container: {
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: '#1e293b',
      maxWidth: '100%',
    },
    nav: {
      display: 'flex',
      gap: '2px',
      marginBottom: '24px',
      background: '#f1f5f9',
      borderRadius: '12px',
      padding: '4px',
    },
    navBtn: (active) => ({
      flex: 1,
      padding: '10px 16px',
      border: 'none',
      borderRadius: '10px',
      background: active ? '#1e293b' : 'transparent',
      color: active ? '#fff' : '#64748b',
      fontWeight: 600,
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    section: {
      marginBottom: '20px',
    },
    sectionLabel: {
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: '#64748b',
      marginBottom: '8px',
    },
    pillarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '8px',
    },
    pillarBtn: (p, selected) => ({
      padding: '12px 10px',
      border: selected ? `2px solid ${p.color}` : '2px solid #e2e8f0',
      borderRadius: '12px',
      background: selected ? `${p.color}10` : '#fff',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
    }),
    pillarIcon: { fontSize: '20px', marginBottom: '4px' },
    pillarLabel: (p) => ({ fontSize: '12px', fontWeight: 700, color: p.color }),
    pillarSub: { fontSize: '10px', color: '#94a3b8', marginTop: '2px' },
    chipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    chip: (active, color) => ({
      padding: '8px 16px',
      border: active ? `2px solid ${color || '#1e293b'}` : '2px solid #e2e8f0',
      borderRadius: '20px',
      background: active ? `${color || '#1e293b'}15` : '#fff',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: active ? 600 : 400,
      color: active ? (color || '#1e293b') : '#64748b',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }),
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    generateBtn: {
      width: '100%',
      padding: '14px',
      border: 'none',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: '#fff',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s',
      letterSpacing: '0.02em',
    },
    generateBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    resultBox: {
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      marginTop: '20px',
    },
    resultHeader: (color) => ({
      padding: '16px 20px',
      background: `${color}10`,
      borderBottom: `2px solid ${color}30`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }),
    resultBody: {
      padding: '20px',
    },
    resultText: {
      whiteSpace: 'pre-wrap',
      lineHeight: 1.7,
      fontSize: '14px',
    },
    actionRow: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px',
      flexWrap: 'wrap',
    },
    actionBtn: (variant) => ({
      padding: '8px 16px',
      border: variant === 'primary' ? 'none' : '2px solid #e2e8f0',
      borderRadius: '8px',
      background: variant === 'primary' ? '#1e293b' : '#fff',
      color: variant === 'primary' ? '#fff' : '#475569',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    slideNav: {
      display: 'flex',
      gap: '6px',
      justifyContent: 'center',
      padding: '12px',
      borderTop: '1px solid #e2e8f0',
    },
    slideDot: (active, color) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: active ? color : '#cbd5e1',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    slideCard: (color) => ({
      padding: '24px',
      background: `${color}08`,
      borderRadius: '12px',
      marginBottom: '8px',
    }),
    slideHeadline: {
      fontSize: '18px',
      fontWeight: 700,
      marginBottom: '8px',
      lineHeight: 1.3,
    },
    slideSubtext: {
      fontSize: '14px',
      lineHeight: 1.6,
      color: '#475569',
    },
    badge: (color) => ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 700,
      background: `${color}20`,
      color: color,
    }),
    errorBox: {
      padding: '12px 16px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      color: '#b91c1c',
      fontSize: '13px',
      marginBottom: '12px',
    },
    loadingOverlay: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      gap: '16px',
    },
    spinner: {
      width: '36px',
      height: '36px',
      border: '3px solid #e2e8f0',
      borderTopColor: '#1e293b',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    libraryCard: {
      padding: '16px',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    libraryTitle: {
      fontWeight: 600,
      fontSize: '14px',
      marginBottom: '6px',
    },
    libraryMeta: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#94a3b8',
    },
    visualDir: {
      padding: '12px 16px',
      background: '#f8fafc',
      border: '1px dashed #cbd5e1',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#64748b',
      marginTop: '12px',
    },
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const currentPillar = PILLARS.find(p => p.id === pillar);
  const currentPlatform = PLATFORMS.find(p => p.id === platform);
  const pillarColor = currentPillar?.color || '#1e293b';

  const renderCarousel = (slides) => {
    if (!slides || slides.length === 0) return null;
    const slide = slides[carouselSlide] || slides[0];
    return (
      <div>
        <div style={S.slideCard(pillarColor)}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
            SLIDE {slide.slide || carouselSlide + 1} / {slides.length}
            {slide.type && <span style={{ marginLeft: '8px', textTransform: 'uppercase' }}>{slide.type}</span>}
          </div>
          <div style={S.slideHeadline}>{slide.headline}</div>
          <div style={S.slideSubtext}>{slide.subtext}</div>
        </div>
        <div style={S.slideNav}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={S.slideDot(i === carouselSlide, pillarColor)}
              onClick={() => setCarouselSlide(i)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
          <button
            style={{ ...S.actionBtn('secondary'), opacity: carouselSlide === 0 ? 0.3 : 1 }}
            onClick={() => setCarouselSlide(Math.max(0, carouselSlide - 1))}
            disabled={carouselSlide === 0}
          >
            ← Previous
          </button>
          <button
            style={{ ...S.actionBtn('secondary'), opacity: carouselSlide === slides.length - 1 ? 0.3 : 1 }}
            onClick={() => setCarouselSlide(Math.min(slides.length - 1, carouselSlide + 1))}
            disabled={carouselSlide === slides.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  const renderVideoScript = (script) => {
    if (!script || script.length === 0) return null;
    return (
      <div>
        {script.map((section, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < script.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                padding: '4px 10px',
                background: `${pillarColor}15`,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: pillarColor,
                whiteSpace: 'nowrap',
              }}>
                {section.timestamp}
              </div>
              <div style={{ flex: 1 }}>
                {section.chapter && <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{section.chapter}</div>}
                {section.action && <div style={{ fontWeight: 600, fontSize: '13px', color: '#475569', marginBottom: '4px' }}>[{section.action}]</div>}
                <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                  {section.text || section.voiceover || section.text_overlay || section.script_text || ''}
                </div>
                {section.visual_notes && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                    🎬 {section.visual_notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div ref={resultRef} style={S.resultBox}>
        <div style={S.resultHeader(pillarColor)}>
          <div>
            <span style={S.badge(pillarColor)}>{result.metadata?.pillar}</span>
            <span style={{ marginLeft: '8px', fontSize: '13px', color: '#64748b' }}>
              {result.metadata?.platform} · {FORMAT_LABELS[result.metadata?.format] || result.metadata?.format}
              · {result.metadata?.market} ({result.metadata?.language})
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            {result.content_type === 'HYBRID' && '⚠️ HYBRID — needs real photos/data'}
            {result.content_type === 'REAL' && '📸 REAL — needs production'}
            {result.content_type === 'AI' && '✅ AI — ready to use'}
          </div>
        </div>

        <div style={S.resultBody}>
          {/* Title (for articles/videos) */}
          {result.title && (
            <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.3 }}>
              {result.title}
            </div>
          )}

          {/* Thumbnail suggestion (for videos) */}
          {result.thumbnail_text && (
            <div style={{ ...S.visualDir, marginBottom: '12px', marginTop: 0 }}>
              🖼️ Thumbnail: {result.thumbnail_text}
            </div>
          )}

          {/* Post text / Article body */}
          {(result.post_text || result.article_body) && (
            <div style={S.resultText}>
              {result.post_text || result.article_body}
            </div>
          )}

          {/* Poll */}
          {result.poll_question && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, marginBottom: '12px' }}>{result.poll_question}</div>
              {result.poll_options?.map((opt, i) => (
                <div key={i} style={{
                  padding: '10px 14px',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  fontSize: '13px',
                }}>
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* Carousel slides */}
          {result.slides && result.slides.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ ...S.sectionLabel, marginBottom: '12px' }}>CAROUSEL PREVIEW</div>
              {renderCarousel(result.slides)}
            </div>
          )}

          {/* Video script */}
          {result.script && result.script.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ ...S.sectionLabel, marginBottom: '12px' }}>SCRIPT TIMELINE</div>
              {renderVideoScript(result.script)}
            </div>
          )}

          {/* TikTok hook */}
          {result.hook_text && (
            <div style={{
              padding: '16px',
              background: `${pillarColor}08`,
              borderRadius: '12px',
              marginBottom: '12px',
              borderLeft: `4px solid ${pillarColor}`,
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: pillarColor, marginBottom: '4px' }}>HOOK (first 2 seconds)</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{result.hook_text}</div>
            </div>
          )}

          {/* Audio suggestion */}
          {result.trending_audio_suggestion && (
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
              🎵 Audio suggestion: {result.trending_audio_suggestion}
            </div>
          )}

          {/* Video description */}
          {result.description && (
            <div style={{ marginTop: '12px' }}>
              <div style={S.sectionLabel}>VIDEO DESCRIPTION</div>
              <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>{result.description}</div>
            </div>
          )}

          {/* Tags */}
          {result.tags && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {result.tags.map((tag, i) => (
                <span key={i} style={{ ...S.badge('#64748b'), fontSize: '10px' }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Visual direction */}
          {result.visual_direction && (
            <div style={S.visualDir}>
              🎨 <strong>Visual direction:</strong> {result.visual_direction}
            </div>
          )}

          {/* Hashtags */}
          {result.hashtags && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: pillarColor, fontWeight: 500 }}>
              {result.hashtags}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ ...S.actionRow, padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
          <button style={S.actionBtn('primary')} onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'saved' ? '✅ Saved!' : '💾 Save to Calendar'}
          </button>
          <button style={S.actionBtn('secondary')} onClick={handleCopy}>📋 Copy Text</button>
          <button style={S.actionBtn('secondary')} onClick={handleDownload}>⬇️ Download JSON</button>
          <button style={S.actionBtn('secondary')} onClick={handleGenerate}>🔄 Regenerate</button>
        </div>

        {/* === MEDIA GENERATION === */}
        <div style={{ padding: '16px 20px', borderTop: '2px solid #e2e8f0', background: '#fafbff' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>🎨 Generate Media</div>
          
          {/* Controls row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
            {/* Image model selector */}
            <select value={imageModel} onChange={e => setImageModel(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}>
              <option value="flux-schnell">Flux Schnell (fast)</option>
              <option value="flux-pro">Flux Pro (premium)</option>
              <option value="ideogram">Ideogram V3 (text in image)</option>
            </select>
            
            {/* Aspect ratio */}
            <select value={imageAR} onChange={e => setImageAR(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}>
              <option value="16:9">16:9 Landscape</option>
              <option value="1:1">1:1 Square</option>
              <option value="9:16">9:16 Vertical</option>
              <option value="4:5">4:5 Instagram</option>
            </select>

            {/* Generate Image button */}
            <button
              onClick={handleGenerateImage}
              disabled={imageLoading}
              style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                background: imageLoading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', border: 'none', cursor: imageLoading ? 'wait' : 'pointer',
              }}
            >
              {imageLoading ? '⏳ Generating...' : '🎨 Generate Image'}
            </button>

            {/* Video model selector */}
            <select value={videoModel} onChange={e => setVideoModel(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}>
              <option value="kling">Kling v2.1</option>
              <option value="seedance">Seedance 1.5 Pro (+audio)</option>
              <option value="seedance-fast">Seedance Fast (cheaper)</option>
              <option value="minimax">MiniMax</option>
            </select>

            {/* Generate Video button */}
            <button
              onClick={handleGenerateVideo}
              disabled={videoLoading}
              style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                background: videoLoading ? '#94a3b8' : 'linear-gradient(135deg, #059669, #10b981)',
                color: '#fff', border: 'none', cursor: videoLoading ? 'wait' : 'pointer',
              }}
            >
              {videoLoading ? '⏳ Generating (~60s)...' : '🎬 Generate Video'}
            </button>
          </div>

          {/* Error */}
          {mediaError && (
            <div style={{ fontSize: '12px', color: '#ef4444', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', marginBottom: '10px' }}>
              ⚠️ {mediaError}
            </div>
          )}

          {/* Image preview */}
          {imageUrl && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Generated Image ({imageModel})</div>
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={imageUrl} alt="Generated" style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" style={{ ...S.actionBtn('secondary'), textDecoration: 'none', textAlign: 'center', fontSize: '11px' }}>
                  ⬇️ Download
                </a>
                <button style={{ ...S.actionBtn('secondary'), fontSize: '11px' }} onClick={handleGenerateImage}>
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}

          {/* Video preview */}
          {videoUrl && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Generated Video ({videoModel})</div>
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <video src={videoUrl} controls autoPlay muted loop style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ ...S.actionBtn('secondary'), textDecoration: 'none', textAlign: 'center', fontSize: '11px' }}>
                  ⬇️ Download
                </a>
                <button style={{ ...S.actionBtn('secondary'), fontSize: '11px' }} onClick={handleGenerateVideo}>
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: CREATE VIEW
  // ============================================================

  const renderCreateView = () => (
    <div>
      {/* Pillar Selection */}
      <div style={S.section}>
        <div style={S.sectionLabel}>1. CONTENT PILLAR</div>
        <div style={S.pillarGrid}>
          {PILLARS.map(p => (
            <div
              key={p.id}
              style={S.pillarBtn(p, pillar === p.id)}
              onClick={() => setPillar(p.id)}
            >
              <div style={S.pillarIcon}>{p.icon}</div>
              <div style={S.pillarLabel(p)}>{p.label}</div>
              <div style={S.pillarSub}>{p.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Selection */}
      <div style={S.section}>
        <div style={S.sectionLabel}>2. PLATFORM</div>
        <div style={S.chipRow}>
          {PLATFORMS.map(p => (
            <div
              key={p.id}
              style={S.chip(platform === p.id)}
              onClick={() => handlePlatformChange(p.id)}
            >
              {p.icon} {p.id}
            </div>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      {platform && (
        <div style={S.section}>
          <div style={S.sectionLabel}>3. FORMAT</div>
          <div style={S.chipRow}>
            {currentPlatform?.formats.map(f => (
              <div
                key={f}
                style={S.chip(format === f, pillarColor)}
                onClick={() => setFormat(f)}
              >
                {FORMAT_LABELS[f]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Selection — Grouped by Region */}
      <div style={S.section}>
        <div style={S.sectionLabel}>4. TARGET MARKET</div>
        {MARKET_REGIONS.map(region => (
          <div key={region.region} style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
              {region.region}
            </div>
            <div style={{ ...S.chipRow, marginBottom: '4px' }}>
              {region.markets.map(m => (
                <div
                  key={m.id}
                  style={S.chip(market === m.id)}
                  onClick={() => handleMarketChange(m.id)}
                >
                  {m.flag} {m.label}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Language override — always visible */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ ...S.sectionLabel, fontSize: '10px' }}>LANGUAGE (auto-set by market, override if needed)</div>
          <div style={{ ...S.chipRow, maxHeight: '80px', overflowY: 'auto', flexWrap: 'wrap' }}>
            {ALL_LANGUAGES.map(l => (
              <div
                key={l.id}
                style={S.chip(language === l.id, pillarColor)}
                onClick={() => setLanguage(l.id)}
              >
                {l.flag} {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Input */}
      <div style={S.section}>
        <div style={S.sectionLabel}>5. TOPIC (optional — leave empty for AI suggestion)</div>
        <input
          style={S.input}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., optical sorting accuracy, giveaway reduction, company history, labor shortage..."
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
      </div>

      {/* Error */}
      {error && <div style={S.errorBox}>❌ {error}</div>}

      {/* Generate Button */}
      <button
        style={{
          ...S.generateBtn,
          ...(loading || !pillar || !format ? S.generateBtnDisabled : {}),
        }}
        onClick={handleGenerate}
        disabled={loading || !pillar || !format}
      >
        {loading ? '⏳ Generating content...' : '⚡ Generate Content'}
      </button>

      {/* Loading state */}
      {loading && (
        <div style={S.loadingOverlay}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={S.spinner} />
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Creating your {FORMAT_LABELS[format] || 'content'}...
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {pillar} · {platform} · {market}
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && renderResult()}
    </div>
  );

  // ============================================================
  // RENDER: LIBRARY VIEW
  // ============================================================

  const renderLibraryView = () => (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          style={{ ...S.input, width: 'auto', padding: '8px 12px', fontSize: '13px' }}
          value={libraryFilter.status}
          onChange={e => setLibraryFilter(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Status</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          style={{ ...S.input, width: 'auto', padding: '8px 12px', fontSize: '13px' }}
          value={libraryFilter.pillar}
          onChange={e => setLibraryFilter(prev => ({ ...prev, pillar: e.target.value }))}
        >
          <option value="">All Pillars</option>
          {PILLARS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select
          style={{ ...S.input, width: 'auto', padding: '8px 12px', fontSize: '13px' }}
          value={libraryFilter.platform}
          onChange={e => setLibraryFilter(prev => ({ ...prev, platform: e.target.value }))}
        >
          <option value="">All Platforms</option>
          {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
        </select>
        <button style={S.actionBtn('primary')} onClick={handleLoadLibrary}>
          🔍 Load
        </button>
        {updateMsg && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: updateMsg === 'saved' ? '#059669' : updateMsg === 'error' ? '#ef4444' : '#64748b', marginLeft: '8px' }}>
            {updateMsg === 'saving' ? '⏳ Saving...' : updateMsg === 'saved' ? '✅ Saved!' : '❌ Error'}
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>
          {savedContents.length} items
        </span>
      </div>

      {/* Content list */}
      {savedContents.length === 0 ? (
        <div style={S.emptyState}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>No content yet</div>
          <div style={{ fontSize: '13px' }}>Generate and save content to see it here</div>
        </div>
      ) : (
        savedContents.map(record => {
          const f = record.fields || {};
          const pil = PILLARS.find(p => p.id === f.Pillar);
          const isExpanded = expandedId === record.id;
          const isEditing = editingId === record.id;
          const statusColor = STATUS_COLORS[f.Status] || '#94a3b8';

          return (
            <div key={record.id} style={{
              ...S.libraryCard,
              border: isExpanded ? '2px solid #cbd5e1' : '1px solid #e2e8f0',
              background: isEditing ? '#fafbff' : '#fff',
            }}>
              {/* Header row — always visible */}
              <div
                onClick={() => { if (!isEditing) setExpandedId(isExpanded ? null : record.id); }}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={S.libraryTitle}>
                    {(f.Topic && f.Topic !== 'auto-generated') ? f.Topic : (f['Post Text'] ? f['Post Text'].split('\n')[0].substring(0, 60) : 'Untitled')}
                  </div>
                  <div style={S.libraryMeta}>
                    {pil && <span style={S.badge(pil.color)}>{pil.label}</span>}
                    {f.Platform && <span style={S.badge('#64748b')}>{f.Platform}</span>}
                    {f.Format && <span style={S.badge('#64748b')}>{f.Format}</span>}
                    {f.Market && <span style={S.badge('#64748b')}>{f.Market}</span>}
                    {f.Language && <span style={S.badge('#64748b')}>{f.Language}</span>}
                    {f.Week && <span style={S.badge('#059669')}>W{f.Week}</span>}
                    {f.Day && <span style={S.badge('#059669')}>{f.Day}</span>}
                  </div>
                  {record.createdTime && (
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                      Created: {new Date(record.createdTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {/* Quick status change */}
                  <select
                    value={f.Status || 'Draft'}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                      e.stopPropagation();
                      handleUpdateField(record.id, { 'Status': e.target.value });
                    }}
                    style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                      border: `1px solid ${statusColor}40`, background: `${statusColor}10`, color: statusColor,
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span style={{ fontSize: '14px', color: '#94a3b8', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
                </div>
              </div>

              {/* Preview text — always visible */}
              {!isExpanded && f['Post Text'] && (
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: 1.5 }}>
                  {f['Post Text'].substring(0, 150)}...
                </div>
              )}

              {/* Expanded view */}
              {isExpanded && !isEditing && (
                <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  {/* Full text */}
                  {f['Post Text'] && (
                    <div style={{ fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                      {f['Post Text']}
                    </div>
                  )}
                  {/* Visual direction */}
                  {f['Visual Direction'] && (
                    <div style={{ fontSize: '12px', color: '#64748b', padding: '8px 12px', background: '#fffbeb', border: '1px dashed #fbbf24', borderRadius: '6px', marginBottom: '10px' }}>
                      🎨 {f['Visual Direction']}
                    </div>
                  )}
                  {/* Hashtags */}
                  {f.Hashtags && (
                    <div style={{ fontSize: '12px', color: '#2563eb', marginBottom: '10px' }}>
                      {f.Hashtags}
                    </div>
                  )}
                  {/* CTA */}
                  {f.CTA && (
                    <div style={{ fontSize: '12px', color: '#059669', marginBottom: '10px' }}>
                      📌 CTA: {f.CTA}
                    </div>
                  )}
                  {/* Content Type badge */}
                  {f['Content Type'] && (
                    <div style={{ marginBottom: '10px' }}>
                      <span style={S.badge(f['Content Type'] === 'AI' ? '#059669' : f['Content Type'] === 'HYBRID' ? '#d97706' : '#ea580c')}>
                        {f['Content Type'] === 'AI' ? '✅ AI' : f['Content Type'] === 'HYBRID' ? '⚠️ HYBRID' : '📸 REAL'}
                      </span>
                    </div>
                  )}
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button style={S.actionBtn('primary')} onClick={() => startEdit(record)}>✏️ Edit</button>
                    <button style={{ ...S.actionBtn('secondary'), border: '2px solid #059669', color: '#059669' }} onClick={(e) => {
                      e.stopPropagation();
                      setScheduleId(scheduleId === record.id ? null : record.id);
                    }}>📅 Schedule</button>
                    <button style={S.actionBtn('secondary')} onClick={() => {
                      navigator.clipboard.writeText(f['Post Text'] || '');
                    }}>📋 Copy</button>
                    <button style={S.actionBtn('secondary')} onClick={() => {
                      const blob = new Blob([JSON.stringify(f, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${(f.Topic || 'content').replace(/[^a-z0-9]/gi, '_')}.json`;
                      a.click();
                    }}>⬇️ Export</button>
                  </div>
                  {/* Schedule to Calendar form */}
                  {scheduleId === record.id && (
                    <div style={{ marginTop: '10px', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>📅 Schedule to Calendar</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '3px' }}>Week</label>
                          <select value={scheduleFields.week} onChange={e => setScheduleFields(p => ({ ...p, week: e.target.value }))} style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}>
                            <option value="">-</option>
                            {Array.from({ length: 52 }, (_, i) => i + 1).map(w => <option key={w} value={w}>W{w}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '3px' }}>Day</label>
                          <select value={scheduleFields.day} onChange={e => setScheduleFields(p => ({ ...p, day: e.target.value }))} style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}>
                            <option value="">-</option>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '3px' }}>Date</label>
                          <input type="date" value={scheduleFields.date} onChange={e => setScheduleFields(p => ({ ...p, date: e.target.value }))} style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ ...S.actionBtn('primary'), background: '#059669' }} onClick={() => scheduleToCalendar(record.id)}>
                          ✅ Add to Calendar
                        </button>
                        <button style={S.actionBtn('secondary')} onClick={() => setScheduleId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Edit mode */}
              {isEditing && (
                <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }} onClick={e => e.stopPropagation()}>
                  {/* Title edit */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Title / Topic</label>
                    <input
                      style={S.input}
                      value={editFields.topic}
                      onChange={e => setEditFields(prev => ({ ...prev, topic: e.target.value }))}
                    />
                  </div>
                  {/* Status edit */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Status</label>
                    <select
                      style={{ ...S.input, padding: '8px 12px' }}
                      value={editFields.status}
                      onChange={e => setEditFields(prev => ({ ...prev, status: e.target.value }))}
                    >
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Post text edit */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Content Text</label>
                    <textarea
                      style={{ ...S.input, minHeight: '200px', resize: 'vertical', lineHeight: 1.6 }}
                      value={editFields.postText}
                      onChange={e => setEditFields(prev => ({ ...prev, postText: e.target.value }))}
                    />
                  </div>
                  {/* Hashtags edit */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Hashtags</label>
                    <input
                      style={S.input}
                      value={editFields.hashtags}
                      onChange={e => setEditFields(prev => ({ ...prev, hashtags: e.target.value }))}
                    />
                  </div>
                  {/* Visual direction edit */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Visual Direction</label>
                    <textarea
                      style={{ ...S.input, minHeight: '60px', resize: 'vertical' }}
                      value={editFields.visual}
                      onChange={e => setEditFields(prev => ({ ...prev, visual: e.target.value }))}
                    />
                  </div>
                  {/* Save / Cancel */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={S.actionBtn('primary')} onClick={() => saveEdit(record.id)}>💾 Save Changes</button>
                    <button style={S.actionBtn('secondary')} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div style={S.container}>
      {/* Navigation */}
      <div style={S.nav}>
        <button style={S.navBtn(view === 'create')} onClick={() => setView('create')}>
          ⚡ Create
        </button>
        <button style={S.navBtn(view === 'library')} onClick={() => { setView('library'); handleLoadLibrary(); }}>
          📚 Library
        </button>
      </div>

      {/* Views */}
      {view === 'create' && renderCreateView()}
      {view === 'library' && renderLibraryView()}
    </div>
  );
}
