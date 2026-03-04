import { differenceInWeeks } from 'date-fns';

export function epley1RM(weight, reps) {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function normalized1RM(oneRM, bodyweight) {
  if (!bodyweight || bodyweight === 0) return 0;
  return parseFloat((oneRM / bodyweight).toFixed(2));
}

export function rollingAverage(entries, windowDays = 7) {
  return entries.map((entry, i) => {
    const window = entries.slice(Math.max(0, i - windowDays + 1), i + 1);
    const avg = window.reduce((sum, e) => sum + e.weight_lbs, 0) / window.length;
    return { ...entry, rolling_avg: parseFloat(avg.toFixed(1)) };
  });
}

export function getCurrentWeek(startDate) {
  if (!startDate) return 'A';
  const weeks = differenceInWeeks(new Date(), new Date(startDate));
  return weeks % 2 === 0 ? 'A' : 'B';
}

export function getCurrentPhase(startDate) {
  if (!startDate) return { label: 'Not started', message: 'Set your start date in Settings to track your phase.' };
  const weeks = differenceInWeeks(new Date(), new Date(startDate));
  if (weeks <= 2) return { label: 'Adaptation', message: 'Expect water weight fluctuation — scale may drop fast.' };
  if (weeks <= 8) return { label: 'Active Fat Loss', message: 'Target 0.5–0.8 lbs/week. Strength should hold.' };
  if (weeks <= 12) return { label: 'Plateau Watch', message: 'Trim 20–30g carbs before adding cardio volume.' };
  return { label: 'Reassessment', message: 'Consider a 2-week diet break at TDEE before continuing.' };
}

export function fatLossRate(weightLog) {
  if (!weightLog || weightLog.length < 8) return null;
  const recent = weightLog.slice(-28);
  if (recent.length < 2) return null;
  const first = recent[0].weight_lbs;
  const last = recent[recent.length - 1].weight_lbs;
  const weeks = recent.length / 7;
  return parseFloat(((first - last) / weeks).toFixed(2));
}

export function getBodyComposition(weightLog) {
  return weightLog.map(entry => {
    if (entry.body_fat_pct == null) return entry;
    const fatMass = parseFloat((entry.weight_lbs * entry.body_fat_pct / 100).toFixed(1));
    const leanMass = parseFloat((entry.weight_lbs - fatMass).toFixed(1));
    return { ...entry, fat_mass: fatMass, lean_mass: leanMass };
  });
}
