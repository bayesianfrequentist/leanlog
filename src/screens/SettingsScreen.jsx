import { useState, useEffect } from 'react';
import { loadData, saveData, exportJSON, importJSON, resetAllData } from '../storage/storage';
import { getCurrentWeek } from '../utils/calculations';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SettingsScreen() {
  const [settings, setSettings] = useState({ start_date: '', rest_days: [3, 0] });
  const [latestWeight, setLatestWeight] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const d = loadData();
    setSettings({
      start_date: d.settings?.start_date || '',
      rest_days: d.settings?.rest_days || [3, 0],
    });
    const last = d.weight_log?.slice(-1)?.[0];
    setLatestWeight(last?.weight_lbs || null);
  }, []);

  function saveSettings(updated) {
    setSettings(updated);
    const d = loadData();
    d.settings = { ...d.settings, ...updated };
    saveData(d);
  }

  function toggleRestDay(day) {
    const current = settings.rest_days;
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    saveSettings({ ...settings, rest_days: updated });
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importJSON(file);
      setImportStatus('Import successful! Refresh to see updated data.');
      const d = loadData();
      setSettings({
        start_date: d.settings?.start_date || '',
        rest_days: d.settings?.rest_days || [3, 0],
      });
      const last = d.weight_log?.slice(-1)?.[0];
      setLatestWeight(last?.weight_lbs || null);
    } catch (err) {
      setImportStatus('Error: ' + err.message);
    }
    e.target.value = '';
  }

  function handleReset() {
    resetAllData();
    setShowResetConfirm(false);
    window.location.reload();
  }

  const currentWeek = settings.start_date ? getCurrentWeek(settings.start_date) : '—';

  return (
    <div className="screen">
      <h2 style={{ marginBottom: 16 }}>Settings</h2>

      {/* Preferences */}
      <div className="card mb-12">
        <p className="card-title">Preferences</p>

        <div style={{ marginBottom: 12 }}>
          <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 6 }}>
            Program Start Date
          </label>
          <input
            type="date"
            value={settings.start_date}
            onChange={e => saveSettings({ ...settings, start_date: e.target.value })}
          />
          {settings.start_date && (
            <p className="text-xs text-muted mt-4">Currently on Week {currentWeek}</p>
          )}
        </div>

        <div style={{ marginBottom: 4 }}>
          <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Rest Days</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DAY_NAMES.map((name, idx) => (
              <button
                key={idx}
                className={`btn-sm ${settings.rest_days.includes(idx) ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleRestDay(idx)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bodyweight */}
      <div className="card mb-12">
        <p className="card-title">Current Bodyweight</p>
        {latestWeight ? (
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
            {latestWeight} lbs
          </p>
        ) : (
          <p className="text-muted text-sm">No weight logged yet. Add one in the Body tab.</p>
        )}
      </div>

      {/* Data management */}
      <div className="card mb-12">
        <p className="card-title">Data Management</p>

        <button className="btn-primary btn-full mb-8" onClick={exportJSON}>
          Export JSON Backup
        </button>

        <div style={{ marginBottom: 8 }}>
          <label
            htmlFor="import-file"
            className="btn-secondary btn-full"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text)',
              background: 'var(--surface2)',
            }}
          >
            Import JSON Backup
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
        {importStatus && (
          <p className="text-sm mt-8" style={{ color: importStatus.startsWith('Error') ? 'var(--danger)' : 'var(--accent)' }}>
            {importStatus}
          </p>
        )}
      </div>

      {/* Danger zone */}
      <div className="card">
        <p className="card-title" style={{ color: 'var(--danger)' }}>Danger Zone</p>
        {!showResetConfirm ? (
          <button className="btn-danger btn-full" onClick={() => setShowResetConfirm(true)}>
            Reset All Data
          </button>
        ) : (
          <div>
            <p className="text-sm mb-12" style={{ color: 'var(--warning)' }}>
              This will permanently delete all your logs, settings, and grocery checklist. Export a backup first!
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={handleReset}>
                Yes, Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted mt-16" style={{ textAlign: 'center' }}>
        LeanLog v1.0 · All data stored on-device
      </p>
    </div>
  );
}
