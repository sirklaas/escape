'use client';

import { useEffect, useState, useCallback } from 'react';
import { Building2, UtensilsCrossed, Rat, Save, Loader2, Download } from 'lucide-react';
import { fetchEscapeData, saveEscapeData, type EscapeData, type VariantData, type EscapeLocation, type EscapePage, type GameVariant } from '@/lib/pb';

// ── Constants ─────────────────────────────────────────────────────────────────
const ORDERED_VARIANTS: { key: GameVariant; label: string; color: string; icon: React.ElementType }[] = [
  { key: 'city',  label: 'City',  color: '#0984e3', icon: Building2       },
  { key: 'diner', label: 'Diner', color: '#6c5ce7', icon: UtensilsCrossed },
  { key: 'rat',   label: 'Rat',   color: '#e17055', icon: Rat             },
];

const LOCATIONS = [
  { name: 'Blokker', icon: '🔧' },
  { name: 'Boek',    icon: '📚' },
  { name: 'Electro', icon: '⚡' },
  { name: 'Lijst',   icon: '📋' },
  { name: 'Kerk',    icon: '⛪' },
  { name: 'Brug',    icon: '🌉' },
  { name: 'Count',   icon: '🧮' },
  { name: 'Gall',    icon: '🍸' },
  { name: 'Drog',    icon: '🧪' },
];

// ── Helper: empty data structures ─────────────────────────────────────────────
function emptyLocation(idx: number): EscapeLocation {
  return { locationNumber: idx + 1, name: LOCATIONS[idx].name, heading: '', subheading: '', body: '', startUrl: '', skip: false, mapUrl: '', verificationAnswer: '' };
}
function emptyPage(pageNum: number, locNum: number): EscapePage {
  return { pageNumber: pageNum, locationNumber: locNum, kop: '', bodyTxt: '', correctAnswer: '', hints: ['','','',''], nextPage: '', timerLimit: 600 };
}
function emptyVariant(): VariantData {
  const locations = LOCATIONS.map((_, i) => emptyLocation(i));
  const pages: EscapePage[] = [];
  for (let i = 0; i < 9; i++) {
    pages.push(emptyPage(i * 2 + 1, i + 1));
    pages.push(emptyPage(i * 2 + 2, i + 1));
  }
  return { locations, pages };
}
function emptyData(): EscapeData {
  return { activeVariant: 'city', city: emptyVariant(), diner: emptyVariant(), rat: emptyVariant() };
}

// ── Field Component ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, area, highlight, type = 'text' }: {
  label: string; value: string | number; onChange: (v: any) => void;
  area?: boolean; highlight?: boolean; type?: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: 3, color: '#495057', fontSize: 12 }}>
        {label}
      </label>
      {area ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          style={{
            width: '100%', padding: '6px 8px', border: '1px solid #dee2e6',
            borderRadius: 4, fontFamily: 'Barlow Semi Condensed, sans-serif',
            fontSize: 13, resize: 'vertical', minHeight: 60, outline: 'none',
            background: 'white', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#6c5ce7'}
          onBlur={e => e.target.style.borderColor = '#dee2e6'}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          style={{
            width: '100%', padding: '6px 8px',
            border: `1px solid ${highlight ? '#ffc107' : '#dee2e6'}`,
            borderRadius: 4, fontFamily: 'Barlow Semi Condensed, sans-serif',
            fontSize: 13, outline: 'none', boxSizing: 'border-box',
            background: highlight ? '#fffdf0' : 'white',
          }}
          onFocus={e => e.target.style.borderColor = highlight ? '#e0a800' : '#6c5ce7'}
          onBlur={e => e.target.style.borderColor = highlight ? '#ffc107' : '#dee2e6'}
        />
      )}
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="checkbox"
        id={label}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 16, height: 16, cursor: 'pointer' }}
      />
      <label htmlFor={label} style={{ fontWeight: 500, color: '#495057', fontSize: 13, cursor: 'pointer' }}>
        {label}
      </label>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [variant, setVariant]             = useState<GameVariant>('city');
  const [locationIndex, setLocationIndex] = useState(0);
  const [data, setData]                   = useState<EscapeData>(emptyData());
  const [loading, setLoading]             = useState(true);
  const [statusMsg, setStatusMsg]         = useState('');
  const [statusType, setStatusType]       = useState<'success'|'error'|'info'>('info');
  const [unsaved, setUnsaved]             = useState(false);

  const showStatus = (msg: string, type: 'success'|'error'|'info') => {
    setStatusMsg(msg); setStatusType(type);
    if (type !== 'info') setTimeout(() => setStatusMsg(''), 4000);
  };

  // Load from PocketBase
  const loadData = useCallback(async () => {
    setLoading(true);
    showStatus('Fetching data from PocketBase...', 'info');
    try {
      const pbData = await fetchEscapeData();
      if (pbData) {
        setData(pbData);
        setUnsaved(false);
        showStatus('✅ Data synced from database', 'success');
      } else {
        showStatus('⚠️ No data in database yet. Using local template.', 'info');
      }
    } catch (err: any) {
      showStatus(`❌ Failed to fetch: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Save to PocketBase
  const handleSave = async () => {
    showStatus('Updating database...', 'info');
    try {
      const success = await saveEscapeData(data);
      if (success) {
        setUnsaved(false);
        showStatus('✅ Changes saved to cloud!', 'success');
      } else {
        throw new Error('PocketBase write failed (Check API rules!)');
      }
    } catch (err: any) {
      showStatus(`❌ Save failed: ${err.message}`, 'error');
    }
  };

  // Download JSON locally (like the original downloadJsonFile)
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'escapedata.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showStatus('📁 JSON downloaded to your computer', 'info');
  };

  // Helpers to get/set current location and pages from active variant
  const currentLocIdx = locationIndex;
  const currentVariantData = data[variant];
  const loc    = currentVariantData.locations[currentLocIdx]   ?? emptyLocation(currentLocIdx);
  const page1  = currentVariantData.pages.find(p => p.locationNumber === currentLocIdx + 1 && (p.pageNumber === currentLocIdx * 2 + 1)) ?? emptyPage(currentLocIdx * 2 + 1, currentLocIdx + 1);
  const page2  = currentVariantData.pages.find(p => p.locationNumber === currentLocIdx + 1 && (p.pageNumber === currentLocIdx * 2 + 2)) ?? emptyPage(currentLocIdx * 2 + 2, currentLocIdx + 1);

  const updateLoc = (field: keyof EscapeLocation, value: any) => {
    setData(prev => ({
      ...prev,
      [variant]: {
        ...prev[variant],
        locations: prev[variant].locations.map((l, i) => i === currentLocIdx ? { ...l, [field]: value } : l),
      },
    }));
    setUnsaved(true);
  };

  const updatePage = (pageNum: number, field: keyof EscapePage, value: any) => {
    setData(prev => ({
      ...prev,
      [variant]: {
        ...prev[variant],
        pages: prev[variant].pages.map(p => p.pageNumber === pageNum ? { ...p, [field]: value } : p),
      },
    }));
    setUnsaved(true);
  };

  const variantCfg = ORDERED_VARIANTS.find(v => v.key === variant)!;
  const statusColors = {
    success: { bg: '#d1ecf1', color: '#0c5460', border: '#17a2b8' },
    error:   { bg: '#f8d7da', color: '#721c24', border: '#dc3545' },
    info:    { bg: '#d1ecf1', color: '#0c5460', border: '#17a2b8' },
  };

  return (
    <div style={{
      fontFamily: 'Barlow Semi Condensed, sans-serif',
      background: '#f8f9fa', color: '#2c3e50',
      minHeight: '100vh', padding: '24px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Title */}
      <h1 style={{ textAlign: 'center', fontWeight: 500, color: '#34495e', marginBottom: 15, fontSize: 20, letterSpacing: '-0.5px' }}>
        Great Escape Dashboard
      </h1>

      {/* ── Icon Navigation ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 4, marginBottom: 15, padding: '10px 12px',
        background: 'white', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        flexWrap: 'nowrap', overflowX: 'auto',
      }}>
        {/* LEFT: Variant buttons */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {ORDERED_VARIANTS.map(v => {
            const Icon = v.icon;
            const isActive = variant === v.key;
            return (
              <button key={v.key} onClick={() => setVariant(v.key)}
                className="group relative"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '6px 4px', borderRadius: 4, cursor: 'pointer',
                  transition: 'all 0.2s ease', width: 64, height: 64,
                  border: `1px solid ${isActive ? '#E8924B' : '#e9ecef'}`,
                  background: isActive ? '#FFE0C4' : '#f8f9fa',
                  color: isActive ? '#C2611A' : '#6c757d',
                  boxShadow: isActive ? '0 2px 8px rgba(232,146,75,0.35)' : 'none',
                }}>
                <Icon size={20} style={{ marginBottom: 2 }} />
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>{v.label}</span>
                
                {/* Active Game Indicator */}
                {data.activeVariant === v.key ? (
                  <div style={{ position: 'absolute', top: 2, right: 2, fontSize: 8, background: '#27ae60', color: 'white', padding: '1px 3px', borderRadius: 3, fontWeight: 800 }}>
                    ACTIVE
                  </div>
                ) : (
                  <div onClick={(e) => {
                    e.stopPropagation();
                    setData({ ...data, activeVariant: v.key });
                    setUnsaved(true);
                  }}
                  className="opacity-0 group-hover:opacity-100"
                  style={{ position: 'absolute', top: 2, right: 2, fontSize: 8, background: '#bdc3c7', color: 'white', padding: '1px 3px', borderRadius: 3, fontWeight: 800 }}>
                    SET
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 48, background: '#dee2e6', margin: '0 6px', flexShrink: 0 }} />

        {/* CENTER: Location icon buttons */}
        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
          {LOCATIONS.map((loc, idx) => {
            const isActive = locationIndex === idx;
            return (
              <button key={idx} onClick={() => setLocationIndex(idx)} title={loc.name}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '6px 4px', borderRadius: 4, cursor: 'pointer',
                  transition: 'all 0.2s ease', width: 56, height: 56,
                  border: `1px solid ${isActive ? '#0984e3' : '#e9ecef'}`,
                  background: isActive ? '#74b9ff' : '#f8f9fa',
                  boxShadow: isActive ? '0 2px 8px rgba(9,132,227,0.35)' : 'none',
                }}>
                <span style={{ fontSize: 20, marginBottom: 2, lineHeight: 1 }}>{loc.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 500, textAlign: 'center', lineHeight: 1, color: isActive ? 'white' : '#6c757d' }}>
                  {loc.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div style={{
          padding: '10px 14px', marginBottom: 12, borderRadius: 6, fontWeight: 400, fontSize: 13,
          background: statusColors[statusType].bg, color: statusColors[statusType].color,
          borderLeft: `3px solid ${statusColors[statusType].border}`,
        }}>
          {statusMsg}
        </div>
      )}

      {/* ── Three Column Dashboard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>

        {/* Column 1: Location Details */}
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
            <h3 style={{ fontWeight: 600, color: '#2c3e50', fontSize: 16, margin: 0, lineHeight: 1.2 }}>
              Loc {String(currentLocIdx + 1).padStart(2, '0')} / {LOCATIONS[currentLocIdx].name}
            </h3>
            <p style={{ fontSize: 13, color: '#6c757d', fontWeight: 400, margin: 0 }}>{variantCfg.label} variant</p>
          </div>
          <div style={{ padding: 12, flex: 1, overflowY: 'auto' }}>
            {loading ? <p style={{ color: '#6c757d', fontSize: 13 }}>Loading...</p> : <>
              <Field label="Heading"     value={loc.heading}    onChange={v => updateLoc('heading', v)}    />
              <Field label="Sub Heading" value={loc.subheading} onChange={v => updateLoc('subheading', v)} />
              <Field label="Body"        value={loc.body}       onChange={v => updateLoc('body', v)} area  />
              <Field label="Start URL"   value={loc.startUrl}   onChange={v => updateLoc('startUrl', v)}   />
              <Field label="Map URL"     value={loc.mapUrl ?? ''} onChange={v => updateLoc('mapUrl', v)} />
              <Field label="Verificatie Antwoord" value={loc.verificationAnswer ?? ''} onChange={v => updateLoc('verificationAnswer', v)} highlight />
              <CheckboxField label="SKIP" checked={!!loc.skip}  onChange={v => updateLoc('skip', v)}       />
            </>}
          </div>
        </div>

        {/* Column 2: Page 1 (odd) */}
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
            <h3 style={{ fontWeight: 600, color: '#2c3e50', fontSize: 16, margin: 0 }}>Page {page1.pageNumber}</h3>
          </div>
  <div style={{ padding: 12, flex: 1, overflowY: 'auto' }}>
            {loading ? <p style={{ color: '#6c757d', fontSize: 13 }}>Loading...</p> : <>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Field label="Heading" value={page1.kop} onChange={v => updatePage(page1.pageNumber, 'kop', v)} />
                </div>
                <div style={{ width: 80 }}>
                  <Field label="Timer (s)" type="number" value={page1.timerLimit ?? 600} onChange={v => updatePage(page1.pageNumber, 'timerLimit', v)} />
                </div>
              </div>
              <Field label="Body Text"      value={page1.bodyTxt}        onChange={v => updatePage(page1.pageNumber, 'bodyTxt', v)} area  />
              <Field label="Correct Answer" value={page1.correctAnswer}  onChange={v => updatePage(page1.pageNumber, 'correctAnswer', v)} highlight />
              {[0,1,2,3].map(i => (
                <Field key={i} label={`Hint ${i+1}`} value={page1.hints[i] ?? ''} onChange={v => {
                  const h = [...(page1.hints ?? ['','','',''])]; h[i] = v;
                  updatePage(page1.pageNumber, 'hints', h);
                }} />
              ))}
              <Field label="Next Page URL"  value={page1.nextPage}       onChange={v => updatePage(page1.pageNumber, 'nextPage', v)}      />
            </>}
          </div>
        </div>

        {/* Column 3: Page 2 (even) */}
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
            <h3 style={{ fontWeight: 600, color: '#2c3e50', fontSize: 16, margin: 0 }}>Page {page2.pageNumber}</h3>
          </div>
  <div style={{ padding: 12, flex: 1, overflowY: 'auto' }}>
            {loading ? <p style={{ color: '#6c757d', fontSize: 13 }}>Loading...</p> : <>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Field label="Heading" value={page2.kop} onChange={v => updatePage(page2.pageNumber, 'kop', v)} />
                </div>
                <div style={{ width: 80 }}>
                  <Field label="Timer (s)" type="number" value={page2.timerLimit ?? 600} onChange={v => updatePage(page2.pageNumber, 'timerLimit', v)} />
                </div>
              </div>
              <Field label="Body Text"      value={page2.bodyTxt}        onChange={v => updatePage(page2.pageNumber, 'bodyTxt', v)} area  />
              <Field label="Correct Answer" value={page2.correctAnswer}  onChange={v => updatePage(page2.pageNumber, 'correctAnswer', v)} highlight />
              {[0,1,2,3].map(i => (
                <Field key={i} label={`Hint ${i+1}`} value={page2.hints[i] ?? ''} onChange={v => {
                  const h = [...(page2.hints ?? ['','','',''])]; h[i] = v;
                  updatePage(page2.pageNumber, 'hints', h);
                }} />
              ))}
              <Field label="Next Page URL"  value={page2.nextPage}       onChange={v => updatePage(page2.pageNumber, 'nextPage', v)}      />
            </>}
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', marginTop: 10,
        background: 'white', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setLocationIndex(i => Math.max(0, i - 1))} disabled={locationIndex === 0}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: locationIndex === 0 ? '#dee2e6' : '#6c757d', color: locationIndex === 0 ? '#6c757d' : 'white' }}>
            ← Previous
          </button>

          <button onClick={handleSave} disabled={loading}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: unsaved ? '#fd79a8' : variantCfg.color, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {unsaved ? 'Save *' : 'Save'}
          </button>

          <button onClick={handleDownload}
            style={{ padding: '8px 16px', border: '1px solid #dee2e6', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: 'white', color: '#495057', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={12} /> Download JSON
          </button>

          <button onClick={() => setLocationIndex(i => Math.min(LOCATIONS.length - 1, i + 1))} disabled={locationIndex === LOCATIONS.length - 1}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, background: locationIndex === LOCATIONS.length - 1 ? '#dee2e6' : '#74b9ff', color: locationIndex === LOCATIONS.length - 1 ? '#6c757d' : 'white' }}>
            Next →
          </button>
        </div>

        <div style={{ fontWeight: 500, color: '#495057', fontSize: 13 }}>
          Location {currentLocIdx + 1} of {LOCATIONS.length} — {variantCfg.label}
        </div>
      </div>
    </div>
  );
}
