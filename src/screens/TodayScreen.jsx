import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { loadData, saveTodayMeals, getTodayMeals } from '../storage/storage';
import { getCurrentWeek } from '../utils/calculations';
import { MEAL_TARGETS, DAY_TO_WORKOUT, WEEKLY_SCHEDULE, DINNER_RECIPES, getDinnerForDay } from '../data/planData';
import MacroBar from '../components/MacroBar';

const MEAL_KEYS = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getNextWorkout() {
  const dow = new Date().getDay();
  for (let i = 1; i <= 7; i++) {
    const nextDow = (dow + i) % 7;
    const wKey = DAY_TO_WORKOUT[nextDow];
    if (wKey) {
      const sched = WEEKLY_SCHEDULE.find(s => s.dayOfWeek === nextDow);
      return { day: DAY_NAMES[nextDow], session: wKey, duration: sched?.duration };
    }
  }
  return null;
}

function getAllDinnersForWeek(week) {
  return DINNER_RECIPES[week === 'A' ? 'weekA' : 'weekB'];
}

function getDinnerMacros(dinnerId, week) {
  if (!dinnerId) return MEAL_TARGETS.dinner;
  const dinners = getAllDinnersForWeek(week);
  const found = dinners.find(d => d.id === dinnerId);
  return found ? { calories: found.calories, protein: found.protein, carbs: found.carbs, fat: found.fat } : MEAL_TARGETS.dinner;
}

export default function TodayScreen() {
  const [data, setData] = useState(null);
  const [mealsEaten, setMealsEaten] = useState([]);
  const [week, setWeek] = useState('A');
  const [dinnerSelection, setDinnerSelection] = useState(null);

  useEffect(() => {
    const d = loadData();
    setData(d);
    const startDate = d?.settings?.start_date;
    const currentWeek = startDate ? getCurrentWeek(startDate) : 'A';
    setWeek(currentWeek);

    const entry = getTodayMeals(d);
    setMealsEaten(entry.meals_eaten || []);

    // Pre-select today's scheduled dinner, fall back to saved dinner_id
    const dow = new Date().getDay();
    const dinnerIdx = getDinnerForDay(dow);
    const weekKey = currentWeek === 'A' ? 'weekA' : 'weekB';
    const scheduledId = dinnerIdx !== null ? DINNER_RECIPES[weekKey][dinnerIdx]?.id : null;
    setDinnerSelection(entry.dinner_id || scheduledId);
  }, []);

  function toggleMeal(meal) {
    const d = loadData();
    const entry = getTodayMeals(d);
    const updated = mealsEaten.includes(meal)
      ? mealsEaten.filter(m => m !== meal)
      : [...mealsEaten, meal];
    setMealsEaten(updated);
    saveTodayMeals(d, { ...entry, meals_eaten: updated, dinner_id: dinnerSelection });
  }

  function changeDinner(id) {
    setDinnerSelection(id);
    const d = loadData();
    const entry = getTodayMeals(d);
    saveTodayMeals(d, { ...entry, meals_eaten: mealsEaten, dinner_id: id });
  }

  const totals = mealsEaten.reduce((acc, meal) => {
    const m = meal === 'dinner' ? getDinnerMacros(dinnerSelection, week) : MEAL_TARGETS[meal];
    if (!m) return acc;
    return {
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const today = new Date();
  const todayLabel = format(today, 'EEEE, MMMM d');
  const startDate = data?.settings?.start_date;
  const dow = today.getDay();
  const isWorkoutDay = !!DAY_TO_WORKOUT[dow];
  const nextWorkout = isWorkoutDay ? null : getNextWorkout();
  const todaySchedule = WEEKLY_SCHEDULE.find(s => s.dayOfWeek === dow);
  const dinners = getAllDinnersForWeek(week);

  return (
    <div className="screen">
      <div className="mb-16">
        <h1>{todayLabel}</h1>
        <p className="text-muted text-sm">Week {week}</p>
      </div>

      {/* Today's Workout */}
      <div className="card mb-12">
        <p className="card-title">Today's Workout</p>
        {isWorkoutDay ? (
          <div>
            <p style={{ fontWeight: 600 }}>{DAY_TO_WORKOUT[dow]}</p>
            {todaySchedule?.duration && todaySchedule.duration !== '—' && (
              <p className="text-muted text-sm mt-4">{todaySchedule.duration}</p>
            )}
          </div>
        ) : (
          <div>
            {nextWorkout ? (
              <>
                <p className="text-muted text-sm" style={{ marginBottom: 2 }}>Next workout:</p>
                <p style={{ fontWeight: 600 }}>{nextWorkout.day} — {nextWorkout.session}</p>
                {nextWorkout.duration && nextWorkout.duration !== '—' && (
                  <p className="text-muted text-sm mt-4">{nextWorkout.duration}</p>
                )}
              </>
            ) : (
              <p className="text-muted">No upcoming workouts found</p>
            )}
          </div>
        )}
      </div>

      {/* Macro Summary */}
      <div className="card mb-12">
        <p className="card-title">Macros Today</p>
        <MacroBar
          calories={totals.calories}
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
        />
      </div>

      {/* Meal Checklist */}
      <div className="card">
        <p className="card-title">Meals</p>
        {MEAL_KEYS.map(meal => {
          const checked = mealsEaten.includes(meal);
          const targets = meal === 'dinner' ? getDinnerMacros(dinnerSelection, week) : MEAL_TARGETS[meal];
          return (
            <div key={meal}>
              <label className={`checkbox-row${checked ? ' checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleMeal(meal)}
                />
                <div style={{ flex: 1 }}>
                  <p className="checkbox-label" style={{ fontWeight: 600 }}>{MEAL_LABELS[meal]}</p>
                  <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                    {targets.calories} kcal · {targets.protein}g P · {targets.carbs}g C · {targets.fat}g F
                  </p>
                </div>
              </label>
              {meal === 'dinner' && dinners.length > 0 && (
                <div style={{ paddingLeft: 28, paddingBottom: 8 }}>
                  <select
                    value={dinnerSelection || ''}
                    onChange={e => changeDinner(e.target.value)}
                    style={{ fontSize: 13, width: '100%' }}
                  >
                    {dinnerSelection === null && <option value="">— select dinner —</option>}
                    {dinners.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
