const KEY = 'leanlog_data';

function getDefaultData() {
  return {
    settings: { start_date: null, rest_days: [3, 0] },
    weight_log: [],
    meal_log: [],
    workout_log: [],
    grocery_checklist: { weekA: {}, weekB: {} },
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : getDefaultData();
    // Ensure all keys exist (handles partial data from older versions)
    const defaults = getDefaultData();
    return { ...defaults, ...parsed, settings: { ...defaults.settings, ...parsed.settings } };
  } catch {
    return getDefaultData();
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function exportJSON() {
  const data = loadData();
  data.exported_at = new Date().toISOString();
  data.app_version = '1.0.0';
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leanlog_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        saveData(data);
        resolve();
      } catch {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.readAsText(file);
  });
}

export function resetAllData() {
  localStorage.removeItem(KEY);
}

// Helper: get or create today's meal_log entry
export function getTodayMeals(data) {
  const today = new Date().toISOString().slice(0, 10);
  return data.meal_log.find(e => e.date === today) || { date: today, meals_eaten: [] };
}

// Helper: save today's meal_log entry
export function saveTodayMeals(data, mealsEntry) {
  const today = new Date().toISOString().slice(0, 10);
  const idx = data.meal_log.findIndex(e => e.date === today);
  if (idx >= 0) {
    data.meal_log[idx] = mealsEntry;
  } else {
    data.meal_log.push(mealsEntry);
  }
  saveData(data);
}
