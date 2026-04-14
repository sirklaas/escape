'use client';

import { useEffect, useState, useCallback } from 'react';
import { Building2, UtensilsCrossed, Rat, Save, Loader2, Download, Plus, X } from 'lucide-react';
import { fetchEscapeData, saveEscapeData, normalizeGamedata, type EscapeData, type VariantData, type EscapeLocation, type EscapePage, type GameVariant } from '@/lib/pb';

// ── Types ────────────────────────────────────────────────────────────────────
type GameSession = {
  id: string;
  name: string;
  city: string;
  date: string;
  nrPlayers: number;
  nrTeams: number;
  priority: number;
  durationMinutes: number;
  activeVariant: GameVariant;
  createdAt: string;
  isActive?: boolean;
};

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
function Field({ label, value, onChange, area, highlight, type = 'text', placeholder }: {
  label: string; value: string | number; onChange: (v: any) => void;
  area?: boolean; highlight?: boolean; type?: string; placeholder?: string;
}) {
  const defaultPlaceholder = `Enter ${label.toLowerCase()}...`;
  const finalPlaceholder = placeholder || defaultPlaceholder;
  
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: '3px', color: '#495057', fontSize: '12px' }}>
        {label}
      </label>
      {area ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={finalPlaceholder}
          style={{
            width: '100%', padding: '6px 8px', border: '1px solid #dee2e6',
            borderRadius: '4px', fontFamily: 'Barlow Semi Condensed, sans-serif',
            fontSize: '13px', resize: 'vertical', minHeight: '60px', outline: 'none',
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
          placeholder={finalPlaceholder}
          style={{
            width: '100%', padding: '6px 8px',
            border: `1px solid ${highlight ? '#ffc107' : '#dee2e6'}`,
            borderRadius: '4px', fontFamily: 'Barlow Semi Condensed, sans-serif',
            fontSize: '13px', outline: 'none', boxSizing: 'border-box',
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
    <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="checkbox"
        id={label}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 16, height: 16, cursor: 'pointer' }}
      />
      <label htmlFor={label} style={{ fontWeight: 500, color: '#495057', fontSize: '13px', cursor: 'pointer' }}>
        {label}
      </label>
    </div>
  );
}

// ── New Game Popup ───────────────────────────────────────────────────────────
function NewGamePopup({ 
  isOpen, 
  onClose, 
  onCreate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreate: (session: Omit<GameSession, 'id' | 'createdAt'>) => Promise<void>;
}) {
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [nrPlayers, setNrPlayers] = useState(4);
  const [nrTeams, setNrTeams] = useState(1);
  const [priority, setPriority] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [activeVariant, setActiveVariant] = useState<GameVariant>('city');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Set date on client only to avoid hydration mismatch
  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const sessionName = `Great Escape Dashboard - ${city || 'Onbekende Stad'}`;
    
    try {
      await onCreate({
        name: sessionName,
        city: city || 'Onbekende Stad',
        date,
        nrPlayers,
        nrTeams,
        priority,
        durationMinutes,
        activeVariant,
      });
      
      // Success - close popup and reset form
      onClose();
      setCity('');
      setDate(typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '');
      setNrPlayers(4);
      setNrTeams(1);
      setPriority(1);
      setDurationMinutes(90);
      setActiveVariant('city');
    } catch (err: any) {
      setError(err.message || 'Failed to create game');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }} onClick={onClose}>
      <div 
        style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1f2937' }}>
            Nieuwe Game Starten
          </h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <Field 
            label="Stad" 
            value={city} 
            onChange={setCity} 
            placeholder="Bijv. Utrecht"
          />
          <Field 
            label="Datum" 
            value={date} 
            onChange={setDate} 
            type="date"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field 
              label="Aantal Spelers" 
              value={nrPlayers} 
              onChange={setNrPlayers} 
              type="number"
            />
            <Field 
              label="Aantal Teams" 
              value={nrTeams} 
              onChange={setNrTeams} 
              type="number"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field 
              label="Prioriteit (1 = actief)" 
              value={priority} 
              onChange={setPriority} 
              type="number"
            />
            <Field 
              label="Speelduur (min)" 
              value={durationMinutes} 
              onChange={(v) => setDurationMinutes(Math.max(10, Math.min(300, v)))} 
              type="number"
            />
          </div>

          {/* Variant Selector */}
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '6px', color: '#495057', fontSize: '12px' }}>
              Spelvariant
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {ORDERED_VARIANTS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setActiveVariant(v.key)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 4px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: `2px solid ${activeVariant === v.key ? v.color : '#e9ecef'}`,
                    background: activeVariant === v.key ? `${v.color}15` : '#f8f9fa',
                    color: activeVariant === v.key ? v.color : '#6c757d',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <v.icon size={18} style={{ marginBottom: '2px' }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '10px 14px',
              marginTop: '16px',
              borderRadius: '6px',
              background: '#fee2e2',
              color: '#dc2626',
              fontSize: '13px',
              border: '1px solid #fecaca',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                background: 'white',
                color: '#374151',
                fontSize: 14,
                fontWeight: 500,
                opacity: isSubmitting ? 0.5 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: 8,
                background: '#E8924B',
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Bezig...' : 'Start Game'}
            </button>
          </div>
        </form>
      </div>
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
  
  // Session state
  const [sessions, setSessions]           = useState<GameSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  
  // Game duration in minutes (configurable by game master)
  const [gameDurationMinutes, setGameDurationMinutes] = useState(90);

  const showStatus = (msg: string, type: 'success'|'error'|'info') => {
    setStatusMsg(msg); setStatusType(type);
    // Messages stay visible until manually cleared or new message shown
  };

  // Load from PocketBase
  const loadData = useCallback(async () => {
    setLoading(true);
    showStatus('Fetching data from PocketBase...', 'info');
    try {
      const [pbData, sessionRes] = await Promise.all([
        fetchEscapeData(),
        fetch('/api/dashboard/session').then(r => r.json()).catch(() => ({ session: null }))
      ]);
      
      if (pbData) {
        console.log('PB Data loaded:', pbData);
        setData(pbData);
        setUnsaved(false);
      } else {
        console.log('No PB data - using bundled');
      }
      
      // Load all sessions for dropdown
      console.log('Session response:', sessionRes);
      if (sessionRes?.allSessions) {
        console.log(`Found ${sessionRes.allSessions.length} sessions`);
        const mappedSessions: GameSession[] = sessionRes.allSessions.map((s: any) => ({
          id: s.id,
          name: `Great Escape Dashboard - ${s.city}`,
          city: s.city,
          date: s.date || '',
          nrPlayers: s.nrPlayers || 4,
          nrTeams: s.nrTeams || 1,
          priority: s.priority || 0,
          durationMinutes: s.gameDurationLimit || s.durationMinutes || 90,
          activeVariant: s.activeVariant || 'city',
          createdAt: s.created || '',
          isActive: s.priority === 1,
        }));
        console.log('Mapped sessions:', mappedSessions);
        setSessions(mappedSessions);
      } else {
        console.log('No sessions found in response');
      }
      
      // Don't auto-select any session - let user choose from dropdown
      // This avoids hydration issues and empty content on first load
      
      showStatus(pbData ? '✅ Data synced from database' : '⚠️ No game data found in PB.', pbData ? 'success' : 'info');
    } catch (err: any) {
      showStatus(`❌ PB Verbindingsfout: ${err.message}`, 'error');
      console.error('PB Load Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Save to PocketBase
  const handleSave = async () => {
    if (!currentSession) {
      showStatus('❌ No game selected! Select a game first.', 'error');
      return;
    }
    
    console.log('Saving game:', currentSession.id, currentSession.city);
    console.log('Current data activeVariant:', data.activeVariant);
    console.log('Saving to variant:', variant);
    
    showStatus('Saving to database...', 'info');
    try {
      // Save to currently selected session
      const targetSessionId = currentSession.id;
      console.log('Target session ID:', targetSessionId);
      await saveEscapeData(data, targetSessionId);
      setUnsaved(false);
      showStatus(`✅ Changes saved to ${currentSession.city}!`, 'success');
    } catch (err: any) {
      console.error('Save error:', err);
      showStatus(`❌ Save failed: ${err.message}`, 'error');
    }
  };

  // Download JSON locally
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'escapedata.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showStatus('📁 JSON downloaded to your computer', 'info');
  };

  // Create new game session - returns Promise that resolves on success, rejects on error
  const handleCreateSession = async (newSession: Omit<GameSession, 'id' | 'createdAt'>): Promise<void> => {
    // Update game duration and variant from the new session
    setGameDurationMinutes(newSession.durationMinutes);
    setVariant(newSession.activeVariant);
    
    try {
      showStatus('Creating new game session...', 'info');
      
      const res = await fetch('/api/dashboard/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_SESSION',
          payload: {
            city: newSession.city,
            date: newSession.date,
            nrPlayers: newSession.nrPlayers,
            nrTeams: newSession.nrTeams,
            priority: newSession.priority,
            durationMinutes: newSession.durationMinutes,
            activeVariant: newSession.activeVariant,
          }
        }),
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        const errorMsg = result.error || `HTTP ${res.status}`;
        const details = result.details ? JSON.stringify(result.details) : '';
        throw new Error(`${errorMsg} ${details}`);
      }
      
      // Use session from API response
      const now = typeof window !== 'undefined' ? new Date().toISOString() : '';
      const sessionData = result.session || {
        id: result.record?.id,
        city: newSession.city,
        date: now,
        nrPlayers: newSession.nrPlayers,
        nrTeams: newSession.nrTeams,
        priority: newSession.priority,
        durationMinutes: newSession.durationMinutes,
        activeVariant: newSession.activeVariant,
        created: now,
      };
      
      const createdSession: GameSession = {
        ...newSession,
        id: sessionData.id,
        createdAt: sessionData.created || now,
      };
      setCurrentSession(createdSession);
      setSessions(prev => [createdSession, ...prev]);
      showStatus(`✅ Nieuwe game gestart in ${newSession.city} (${newSession.activeVariant})!`, 'success');
      // Success - resolve promise
    } catch (err: any) {
      // PB is required - show error and re-throw so popup knows it failed
      console.error('PB Create Session Error:', err);
      console.error('Error details:', err.details || 'No details');
      console.error('Error response:', err.response || 'No response');
      const errorMsg = err.message || 'Unknown error';
      showStatus(`❌ PB Fout: ${errorMsg}. Game niet aangemaakt.`, 'error');
      throw err;
    }
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

  const variantCfg = ORDERED_VARIANTS.find(v => v.key === variant) || ORDERED_VARIANTS[0];
  const statusColors = {
    success: { bg: '#d1ecf1', color: '#0c5460', border: '#17a2b8' },
    error:   { bg: '#f8d7da', color: '#721c24', border: '#dc3545' },
    info:    { bg: '#d1ecf1', color: '#0c5460', border: '#17a2b8' },
  };

  const displayTitle = currentSession?.city 
    ? `Great Escape Dashboard - ${currentSession.city}` 
    : 'Great Escape Dashboard';

  /* Full viewport: never use PhoneWrapper / image_container / action_container here (globaldesign §2.4). */
  return (
    <div
      className="dashboard-fullscreen"
      style={{
      fontFamily: 'Barlow Semi Condensed, sans-serif',
      background: '#f8f9fa', color: '#2c3e50',
      minHeight: '100dvh', width: '100%', maxWidth: 'none', padding: '24px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Title with current game */}
      <h1 style={{ textAlign: 'center', fontWeight: 500, color: '#34495e', marginBottom: '15px', fontSize: '20px', letterSpacing: '-0.5px' }}>
        {displayTitle}
      </h1>

      {/* ── Icon Navigation ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '4px', marginBottom: '15px', padding: '10px 12px',
        background: 'white', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        flexWrap: 'nowrap', overflowX: 'auto',
      }}>
        {/* LEFT: Variants + New Game */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Variant buttons */}
          {ORDERED_VARIANTS.map(v => {
            const Icon = v.icon;
            
            // Determine button colors:
            // - BLUE: This is the game's configured variant (what the game uses)
            // - ORANGE: This is the variant currently being edited (clicked for editing)
            // - GRAY: Neither
            const gameVariant = currentSession?.activeVariant;
            const editingVariant = variant;
            
            const isGameVariant = gameVariant === v.key;
            const isEditing = editingVariant === v.key;
            
            // Build styles based on state
            let buttonStyle: React.CSSProperties = {
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '6px 4px', borderRadius: '4px', 
              cursor: currentSession ? 'pointer' : 'default',
              transition: 'all 0.2s ease', width: '64px', height: '64px',
              border: '2px solid #e9ecef',
              background: '#f8f9fa',
              color: '#6c757d',
              boxShadow: 'none',
              fontWeight: 500,
            };
            
            if (isGameVariant && isEditing) {
              // Game variant AND currently editing it = BLUE with thick border
              buttonStyle = {
                ...buttonStyle,
                border: '3px solid #0984e3',
                background: 'rgba(9, 132, 227, 0.25)',
                color: '#0984e3',
                boxShadow: '0 3px 12px rgba(9,132,227,0.45)',
                fontWeight: 700,
              };
            } else if (isGameVariant) {
              // Game variant but NOT editing = BLUE
              buttonStyle = {
                ...buttonStyle,
                border: '2px solid #0984e3',
                background: 'rgba(9, 132, 227, 0.15)',
                color: '#0984e3',
                boxShadow: '0 2px 8px rgba(9,132,227,0.35)',
                fontWeight: 700,
              };
            } else if (isEditing) {
              // Editing but NOT game variant = ORANGE
              buttonStyle = {
                ...buttonStyle,
                border: '2px solid #E8924B',
                background: '#FFE0C4',
                color: '#C2611A',
                boxShadow: '0 2px 8px rgba(232,146,75,0.35)',
                fontWeight: 600,
              };
            }
            
            return (
              <button 
                key={v.key} 
                onClick={() => currentSession && setVariant(v.key)}
                className="group relative"
                style={buttonStyle}>
                <Icon size={20} style={{ marginBottom: '2px' }} />
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', lineHeight: 1 }}>{v.label}</span>
                
                {/* GAME badge - shows this is the game's configured variant */}
                {isGameVariant && (
                  <div style={{ 
                    position: 'absolute', top: '2px', right: '2px', 
                    fontSize: '7px', background: '#0984e3', color: 'white', 
                    padding: '1px 3px', borderRadius: '3px', fontWeight: 800 
                  }}>
                    GAME
                  </div>
                )}
                
                {/* SET button - click to change game's variant */}
                {currentSession && !isGameVariant && (
                  <div onClick={(e) => {
                    e.stopPropagation();
                    setData({ ...data, activeVariant: v.key });
                    setUnsaved(true);
                  }}
                  className="opacity-0 group-hover:opacity-100"
                  style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '8px', background: '#bdc3c7', color: 'white', padding: '1px 3px', borderRadius: '3px', fontWeight: 800 }}>
                    SET
                  </div>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ width: 1, height: 48, background: '#dee2e6', margin: '0 6px', flexShrink: 0 }} />

          {/* NEW GAME BUTTON */}
          <button
            onClick={() => setIsNewGameOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 4px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '64px',
              height: '64px',
              border: '1px solid #E8924B',
              background: '#FFE0C4',
              color: '#C2611A',
              boxShadow: '0 2px 8px rgba(232,146,75,0.35)',
              flexShrink: 0,
            }}
          >
            <Plus size={20} style={{ marginBottom: '2px' }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>New Game</span>
          </button>
        </div>

        {/* CENTER: Location icon buttons - centered */}
        <div style={{ display: 'flex', gap: '4px', flex: '1', justifyContent: 'center', flexShrink: 0 }}>
          {LOCATIONS.map((loc, idx) => {
            const isActive = locationIndex === idx;
            return (
              <button key={idx} onClick={() => setLocationIndex(idx)} title={loc.name}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '6px 4px', borderRadius: '4px', cursor: 'pointer',
                  transition: 'all 0.2s ease', width: '52px', height: '52px',
                  border: `1px solid ${isActive ? '#0984e3' : '#e9ecef'}`,
                  background: isActive ? '#74b9ff' : '#f8f9fa',
                  boxShadow: isActive ? '0 2px 8px rgba(9,132,227,0.35)' : 'none',
                  flexShrink: 0,
                }}>
                <span style={{ fontSize: '18px', marginBottom: '2px', lineHeight: 1 }}>{loc.icon}</span>
                <span style={{ fontSize: '9px', fontWeight: 500, textAlign: 'center', lineHeight: 1, color: isActive ? 'white' : '#6c757d' }}>
                  {loc.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT: Game Selector Dropdown + Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <div style={{ width: 1, height: 48, background: '#dee2e6', margin: '0 6px' }} />
          <div style={{ flexShrink: 0, minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '9px', fontWeight: 500, color: '#6c757d', marginBottom: '2px', textTransform: 'uppercase' }}>
            Actieve Game {sessions.length === 0 && '(Geen games)'}
          </label>
          <select
            value={selectedSessionId}
            onChange={async (e) => {
              const selected = sessions.find(s => s.id === e.target.value);
              console.log('Selected game:', selected);
              if (selected) {
                setCurrentSession(selected);
                setSelectedSessionId(selected.id);
                setGameDurationMinutes(selected.durationMinutes);
                console.log('Setting variant to:', selected.activeVariant);
                if (selected.activeVariant) {
                  setVariant(selected.activeVariant);
                }
                // Load master dashboard config from selected game
                try {
                  console.log('Fetching config for game:', selected.id);
                  const res = await fetch(`/api/dashboard/session?id=${selected.id}`);
                  const sessionData = await res.json();
                  console.log('Session data received:', sessionData);
                  if (sessionData?.masterdasboard) {
                    console.log('Masterdasboard found, normalizing...');
                    const normalized = normalizeGamedata(sessionData.masterdasboard);
                    console.log('Normalized data:', normalized);
                    if (normalized) {
                      setData(normalized);
                      showStatus(`✅ Game geladen: ${selected.city} (${selected.activeVariant})`, 'success');
                    } else {
                      console.error('normalizeGamedata returned null');
                      showStatus(`⚠️ Config format error`, 'error');
                    }
                  } else {
                    console.log('No masterdasboard in session data');
                    showStatus(`⚠️ Geen config gevonden voor ${selected.city}`, 'info');
                  }
                } catch (err) {
                  console.error('Failed to load master config:', err);
                  showStatus(`⚠️ ${selected.city} geladen (config laden mislukt)`, 'info');
                }
              } else {
                // Deselected - clear current session
                setCurrentSession(null);
                setSelectedSessionId('');
              }
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'Barlow Semi Condensed, sans-serif',
              fontSize: '13px',
              background: 'white',
              color: '#2c3e50',
              cursor: 'pointer',
            }}
          >
            <option value="">-- Select a game --</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.city} {s.priority === 1 ? '★' : ''} ({s.activeVariant})
              </option>
            ))}
          </select>
        </div>

        {/* Game Duration - compact inline */}
        <div style={{ width: 1, height: 48, background: '#dee2e6', margin: '0 4px', flexShrink: 0 }} />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2px 4px',
          flexShrink: 0,
        }}>
          <label style={{ fontSize: '8px', fontWeight: 500, color: '#6c757d', textTransform: 'uppercase' }}>
            Duur
          </label>
          <input
            type="number"
            value={gameDurationMinutes}
            onChange={(e) => setGameDurationMinutes(Math.max(10, Math.min(300, parseInt(e.target.value) || 90)))}
            style={{
              width: '45px',
              padding: '3px 4px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'Barlow Semi Condensed, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'center',
              outline: 'none',
              background: 'white',
              color: '#2c3e50',
            }}
            min={10}
            max={300}
          />
          <span style={{ fontSize: '8px', color: '#adb5bd' }}>min</span>
        </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div style={{
          padding: '10px 14px', marginBottom: '12px', borderRadius: '6px', fontWeight: 400, fontSize: '13px',
          background: statusColors[statusType].bg, color: statusColors[statusType].color,
          borderLeft: `3px solid ${statusColors[statusType].border}`,
        }}>
          {statusMsg}
        </div>
      )}

      {/* ── Three Column Dashboard ── */}
      {!currentSession ? (
        /* No game selected - show placeholder */
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flex: 1,
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #dee2e6',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
          <h2 style={{ fontWeight: 600, color: '#495057', margin: 0, marginBottom: '8px' }}>Select a Game</h2>
          <p style={{ color: '#6c757d', fontSize: '14px', textAlign: 'center', margin: 0 }}>
            Choose a game from the dropdown above to start editing.<br />
            Or click "New Game" to create a new escape room.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', flex: 1, minHeight: 0 }}>

          {/* Column 1: Location Details */}
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <h3 style={{ fontWeight: 600, color: '#2c3e50', fontSize: '16px', margin: 0, lineHeight: 1.2 }}>
                Loc {String(currentLocIdx + 1).padStart(2, '0')} / {LOCATIONS[currentLocIdx].name}
              </h3>
              <p style={{ fontSize: '13px', color: '#6c757d', fontWeight: 400, margin: 0 }}>{variantCfg.label} variant</p>
            </div>
            <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
              {loading ? <p style={{ color: '#6c757d', fontSize: '13px' }}>Loading...</p> : <>
                <Field label="Heading"     value={loc.heading}    onChange={v => updateLoc('heading', v)}    />
                <Field label="Sub Heading" value={loc.subheading} onChange={v => updateLoc('subheading', v)} />
                <Field label="Body"        value={loc.body}       onChange={v => updateLoc('body', v)} area  />
                <Field label="Map URL"     value={loc.mapUrl ?? ''} onChange={v => updateLoc('mapUrl', v)} />
                <Field label="Plus Code (Google Open Location Code)" value={loc.plusCode ?? ''} onChange={v => updateLoc('plusCode', v)} placeholder="e.g., 9F4W9C8C+W4" />
                <Field label="Verificatie Antwoord" value={loc.verificationAnswer ?? ''} onChange={v => updateLoc('verificationAnswer', v)} highlight />
                <CheckboxField label="SKIP" checked={!!loc.skip}  onChange={v => updateLoc('skip', v)}       />
              </>}
            </div>
          </div>

          {/* Column 2: Page 1 (odd) */}
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <h3 style={{ fontWeight: 600, color: '#2c3e50', fontSize: '16px', margin: 0 }}>Page {page1.pageNumber}</h3>
            </div>
            <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
              {loading ? <p style={{ color: '#6c757d', fontSize: '13px' }}>Loading...</p> : <>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <Field label="Heading" value={page1.kop} onChange={v => updatePage(page1.pageNumber, 'kop', v)} />
                  </div>
                  <div style={{ width: '80px' }}>
                    <Field label="Timer (s)" type="number" value={page1.timerLimit ?? 600} onChange={v => updatePage(page1.pageNumber, 'timerLimit', v)} />
                  </div>
                </div>
                <Field label="Body Text" value={page1.bodyTxt} onChange={v => updatePage(page1.pageNumber, 'bodyTxt', v)} area />
                <Field label="Correct Answer" value={page1.correctAnswer} onChange={v => updatePage(page1.pageNumber, 'correctAnswer', v)} highlight />
                {[0,1,2,3].map(i => (
                  <Field key={i} label={`Hint ${i+1}`} value={page1.hints[i] ?? ''} onChange={v => {
                    const h = [...(page1.hints ?? ['','','',''])]; h[i] = v;
                    updatePage(page1.pageNumber, 'hints', h);
                  }} />
                ))}
              </>}
            </div>
          </div>

          {/* Column 3: Page 2 (even) */}
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <h3 style={{ fontWeight: 600, color: '#2c3e50', fontSize: '16px', margin: 0 }}>Page {page2.pageNumber}</h3>
            </div>
            <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
              {loading ? <p style={{ color: '#6c757d', fontSize: '13px' }}>Loading...</p> : <>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <Field label="Heading" value={page2.kop} onChange={v => updatePage(page2.pageNumber, 'kop', v)} />
                  </div>
                  <div style={{ width: '80px' }}>
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
              </>}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation ── */}
      {currentSession && (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', marginTop: '10px',
        background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setLocationIndex(i => Math.max(0, i - 1))} disabled={locationIndex === 0}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, background: locationIndex === 0 ? '#dee2e6' : '#6c757d', color: locationIndex === 0 ? '#6c757d' : 'white' }}>
            ← Previous
          </button>

          <button onClick={handleSave} disabled={loading}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, background: unsaved ? '#fd79a8' : variantCfg.color, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {unsaved ? 'Save *' : 'Save'}
          </button>

          <button onClick={handleDownload}
            style={{ padding: '8px 16px', border: '1px solid #dee2e6', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, background: 'white', color: '#495057', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={12} /> Download JSON
          </button>

          <button onClick={() => setLocationIndex(i => Math.min(LOCATIONS.length - 1, i + 1))} disabled={locationIndex === LOCATIONS.length - 1}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, background: locationIndex === LOCATIONS.length - 1 ? '#dee2e6' : '#74b9ff', color: locationIndex === LOCATIONS.length - 1 ? '#6c757d' : 'white' }}>
            Next →
          </button>
        </div>

        <div style={{ fontWeight: 500, color: '#495057', fontSize: '13px' }}>
          Location {currentLocIdx + 1} of {LOCATIONS.length} — {variantCfg.label}
        </div>
      </div>
      )}

      {/* New Game Popup */}
      <NewGamePopup
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onCreate={handleCreateSession}
      />
    </div>
  );
}
