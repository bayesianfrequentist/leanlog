import { useState, useEffect } from 'react';
import { loadData, saveData } from '../storage/storage';
import { getCurrentPhase, fatLossRate, getBodyComposition } from '../utils/calculations';
import WeightChart from '../components/WeightChart';

export default function BodyScreen() {
  const [appData, setAppData] = useState(null);
  const [weightInput, setWeightInput] = useState('');
  const [bfInput, setBfInput] = useState('');
  const [showBf, setShowBf] = useState(false);

  useEffect(() => {
    const d = loadData();
    setAppData(d);
  }, []);

  function logWeight() {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) return;
    const d = loadData();
    const today = new Date().toISOString().slice(0, 10);
    const entry = { date: today, weight_lbs: w };
    if (bfInput && parseFloat(bfInput) > 0) {
      entry.body_fat_pct = parseFloat(bfInput);
    }
    const idx = d.weight_log.findIndex(e => e.date === today);
    if (idx >= 0) {
      d.weight_log[idx] = entry;
    } else {
      d.weight_log.push(entry);
    }
    saveData(d);
    setAppData({ ...d });
    setWeightInput('');
    setBfInput('');
  }

  if (!appData) return null;

  const { weight_log, settings } = appData;
  const startDate = settings?.start_date;
  const phase = getCurrentPhase(startDate);
  const rate = fatLossRate(weight_log);
  const hasBf = weight_log.some(e => e.body_fat_pct != null);
  const chartData = showBf && hasBf ? getBodyComposition(weight_log) : weight_log;

  return (
    <div className="screen">
      <h2 style={{ marginBottom: 16 }}>Body</h2>

      {/* Phase indicator */}
      <div className="phase-card">
        <p className="phase-label">{phase.label}</p>
        <p className="phase-message">{phase.message}</p>
      </div>

      {rate !== null && (
        <div className="card mb-12">
          <p className="card-title">Fat Loss Rate (last 4 wks)</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: rate > 0 ? 'var(--accent)' : 'var(--warning)' }}>
            {Math.abs(rate)} lbs/week {rate > 0 ? '↓' : '↑'}
          </p>
          <p className="text-xs text-muted mt-4">Target: 0.5–0.8 lbs/week</p>
        </div>
      )}

      {/* Log weight */}
      <div className="card mb-12">
        <p className="card-title">Log Today's Weight</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <input
              type="number"
              inputMode="decimal"
              placeholder="Weight (lbs)"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
            />
          </div>
          <button className="btn-primary" style={{ flexShrink: 0 }} onClick={logWeight}>
            Log
          </button>
        </div>

        <button
          className="btn-ghost btn-sm"
          style={{ marginBottom: 8 }}
          onClick={() => setShowBf(v => !v)}
        >
          {showBf ? 'Hide body fat %' : '+ Add body fat %'}
        </button>

        {showBf && (
          <input
            type="number"
            inputMode="decimal"
            placeholder="Body fat % (optional)"
            value={bfInput}
            onChange={e => setBfInput(e.target.value)}
          />
        )}
      </div>

      {/* Weight chart */}
      <div className="card mb-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p className="card-title" style={{ marginBottom: 0 }}>Weight History</p>
          {hasBf && (
            <button
              className={`btn-sm ${showBf ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setShowBf(v => !v)}
            >
              {showBf ? 'Composition' : 'Composition'}
            </button>
          )}
        </div>
        <WeightChart weightLog={chartData} showComposition={showBf && hasBf} />
      </div>

      {weight_log.length > 0 && (
        <div className="card">
          <p className="card-title">Recent Entries</p>
          {weight_log.slice(-7).reverse().map(entry => (
            <div key={entry.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span className="text-muted">{entry.date}</span>
              <span style={{ fontWeight: 600 }}>
                {entry.weight_lbs} lbs
                {entry.body_fat_pct ? <span className="text-muted"> · {entry.body_fat_pct}% BF</span> : null}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
