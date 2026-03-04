import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { loadData, saveTodayMeals, getTodayMeals } from '../storage/storage';
import { getCurrentWeek } from '../utils/calculations';
import { MEAL_TARGETS, WEEKLY_SCHEDULE, DAY_TO_WORKOUT } from '../data/planData';
import MacroBar from '../components/MacroBar';

const MEAL_KEYS = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };

function getTodaySchedule() {
  const dow = new Date().getDay();
  return WEEKLY_SCHEDULE.find(s => s.dayOfWeek === dow) || null;
}

export default function TodayScreen() {
  const [data, setData] = useState(null);
  const [mealsEaten, setMealsEaten] = useState([]);

  useEffect(() => {
    const d = loadData();
    setData(d);
    const entry = getTodayMeals(d);
    setMealsEaten(entry.meals_eaten || []);
  }, []);

  function toggleMeal(meal) {
    const d = loadData();
    const entry = getTodayMeals(d);
    const updated = mealsEaten.includes(meal)
      ? mealsEaten.filter(m => m !== meal)
      : [...mealsEaten, meal];
    setMealsEaten(updated);
    saveTodayMeals(d, { ...entry, meals_eaten: updated });
  }

  const totals = mealsEaten.reduce((acc, meal) => {
    const m = MEAL_TARGETS[meal];
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
  const week = startDate ? getCurrentWeek(startDate) : 'A';
  const schedule = getTodaySchedule();

  return (
    <div className="screen">
      <div className="mb-16">
        <h1>{todayLabel}</h1>
        <p className="text-muted text-sm">Week {week}</p>
      </div>

      {/* Today's Workout */}
      <div className="card mb-12">
        <p className="card-title">Today's Workout</p>
        {schedule ? (
          <div>
            <p style={{ fontWeight: 600 }}>{schedule.session}</p>
            {schedule.duration !== '—' && (
              <p className="text-muted text-sm mt-4">{schedule.duration}</p>
            )}
          </div>
        ) : (
          <p className="text-muted">No workout scheduled today</p>
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
          const targets = MEAL_TARGETS[meal];
          return (
            <label key={meal} className={`checkbox-row${checked ? ' checked' : ''}`}>
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
          );
        })}
      </div>
    </div>
  );
}
