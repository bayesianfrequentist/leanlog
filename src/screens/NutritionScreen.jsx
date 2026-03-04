import { useState, useEffect } from 'react';
import { loadData, saveData } from '../storage/storage';
import { getCurrentWeek } from '../utils/calculations';
import {
  MEAL_TARGETS, MACRO_TARGETS, STATIC_MEALS,
  DINNER_RECIPES, getDinnerForDay, LUNCH_SAUCES,
  GROCERY_LIST, GROCERY_CATEGORIES,
} from '../data/planData';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SAUCE_DAYS = [
  { day: 'Mon / Tue', key: 1 },
  { day: 'Wed / Thu', key: 3 },
  { day: 'Fri / Sat', key: 5 },
];

export default function NutritionScreen() {
  const [tab, setTab] = useState('meal-plan');
  const [week, setWeek] = useState('A');
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [groceryChecks, setGroceryChecks] = useState({ weekA: {}, weekB: {} });

  useEffect(() => {
    const d = loadData();
    const startDate = d?.settings?.start_date;
    setWeek(startDate ? getCurrentWeek(startDate) : 'A');
    setGroceryChecks(d.grocery_checklist || { weekA: {}, weekB: {} });
  }, []);

  function toggleGrocery(item) {
    const wKey = week === 'A' ? 'weekA' : 'weekB';
    const updated = {
      ...groceryChecks,
      [wKey]: { ...groceryChecks[wKey], [item]: !groceryChecks[wKey][item] },
    };
    setGroceryChecks(updated);
    const d = loadData();
    d.grocery_checklist = updated;
    saveData(d);
  }

  function resetGrocery() {
    const wKey = week === 'A' ? 'weekA' : 'weekB';
    const updated = { ...groceryChecks, [wKey]: {} };
    setGroceryChecks(updated);
    const d = loadData();
    d.grocery_checklist = updated;
    saveData(d);
  }

  const recipes = DINNER_RECIPES[week === 'A' ? 'weekA' : 'weekB'];
  const wKey = week === 'A' ? 'weekA' : 'weekB';
  const checks = groceryChecks[wKey] || {};

  const totalMacros = {
    calories: Object.values(MEAL_TARGETS).reduce((s, m) => s + m.calories, 0),
    protein: Object.values(MEAL_TARGETS).reduce((s, m) => s + m.protein, 0),
    carbs: Object.values(MEAL_TARGETS).reduce((s, m) => s + m.carbs, 0),
    fat: Object.values(MEAL_TARGETS).reduce((s, m) => s + m.fat, 0),
  };

  return (
    <div className="screen">
      <h2 style={{ marginBottom: 16 }}>Nutrition</h2>

      <div className="sub-tabs">
        {[['meal-plan', 'Meal Plan'], ['macro-summary', 'Macros'], ['grocery', 'Grocery']].map(([key, label]) => (
          <button key={key} className={`sub-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Meal Plan Tab ───────────────────────────────────────────────────── */}
      {tab === 'meal-plan' && (
        <div>
          <div className="week-toggle">
            <button className={week === 'A' ? 'active' : ''} onClick={() => setWeek('A')}>Week A</button>
            <button className={week === 'B' ? 'active' : ''} onClick={() => setWeek('B')}>Week B</button>
          </div>

          {/* Static meals */}
          {['breakfast', 'lunch', 'snack'].map(mealKey => {
            const meal = STATIC_MEALS[mealKey];
            return (
              <div key={mealKey} className="card mb-12">
                <p className="card-title">{meal.label}</p>
                <p className="text-sm" style={{ marginBottom: 8, color: 'var(--text-muted)' }}>
                  {meal.macros.calories} kcal · {meal.macros.protein}g P · {meal.macros.carbs}g C · {meal.macros.fat}g F
                </p>
                <ul style={{ paddingLeft: 16, fontSize: 13 }}>
                  {meal.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                </ul>
                {meal.notes && <p className="text-xs text-muted mt-8">{meal.notes}</p>}
              </div>
            );
          })}

          {/* Dinner recipes */}
          <p className="card-title mb-8">Dinner Rotation</p>
          <p className="text-xs text-muted mb-12">Mon/Tue → D1 · Wed/Thu → D2 · Fri/Sat → D3 · Sun → Flex</p>
          {recipes.map((recipe, idx) => (
            <div
              key={recipe.id}
              className="recipe-card"
              onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
            >
              <div className="recipe-card-header">
                <div>
                  <p style={{ fontWeight: 700 }}>D{idx + 1}: {recipe.name}</p>
                  <p className="text-xs text-muted mt-4">
                    {recipe.calories} kcal · {recipe.protein}g P · {recipe.carbs}g C · {recipe.fat}g F
                  </p>
                </div>
                <span className="text-muted" style={{ fontSize: 18 }}>{expandedRecipe === recipe.id ? '▲' : '▼'}</span>
              </div>
              {expandedRecipe === recipe.id && (
                <div className="recipe-card-body">
                  <table className="data-table" style={{ marginBottom: 12 }}>
                    <thead>
                      <tr><th>Cal</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{recipe.calories}</td>
                        <td>{recipe.protein}g</td>
                        <td>{recipe.carbs}g</td>
                        <td>{recipe.fat}g</td>
                      </tr>
                    </tbody>
                  </table>
                  {recipe.ingredients && (
                    <>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Ingredients</p>
                      <ul style={{ paddingLeft: 16, fontSize: 13, marginBottom: 12 }}>
                        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                      </ul>
                    </>
                  )}
                  {recipe.instructions && (
                    <>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Instructions</p>
                      <ol style={{ paddingLeft: 16, fontSize: 13, marginBottom: 12 }}>
                        {recipe.instructions.map((step, i) => <li key={i} style={{ marginBottom: 4 }}>{step}</li>)}
                      </ol>
                    </>
                  )}
                  <a className="recipe-link" href={recipe.url} target="_blank" rel="noopener noreferrer">
                    View Full Recipe ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Macro Summary Tab ───────────────────────────────────────────────── */}
      {tab === 'macro-summary' && (
        <div>
          <div className="card mb-12">
            <p className="card-title">Daily Macro Targets</p>
            <table className="data-table">
              <thead>
                <tr><th>Meal</th><th>Cal</th><th>P</th><th>C</th><th>F</th></tr>
              </thead>
              <tbody>
                {Object.entries(MEAL_TARGETS).map(([key, m]) => (
                  <tr key={key}>
                    <td style={{ textTransform: 'capitalize' }}>{key}</td>
                    <td>{m.calories}</td>
                    <td>{m.protein}g</td>
                    <td>{m.carbs}g</td>
                    <td>{m.fat}g</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  <td>{Math.round(totalMacros.calories)}</td>
                  <td>{Math.round(totalMacros.protein)}g</td>
                  <td>{Math.round(totalMacros.carbs)}g</td>
                  <td>{Math.round(totalMacros.fat)}g</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card mb-12">
            <p className="card-title">Carb Cycling</p>
            <p className="text-sm">On rest days (Wednesday & Sunday), reduce carbs by ~150 kcal (~37g) by having a smaller dinner portion.</p>
          </div>

          <div className="card">
            <p className="card-title">Lunch Sauce Rotation</p>
            <table className="data-table">
              <thead>
                <tr><th>Days</th><th>Sauce</th><th>Ingredients</th></tr>
              </thead>
              <tbody>
                {SAUCE_DAYS.map(({ day, key }) => (
                  <tr key={day}>
                    <td>{day}</td>
                    <td style={{ fontWeight: 600 }}>{LUNCH_SAUCES[key].name}</td>
                    <td className="text-xs">{LUNCH_SAUCES[key].ingredients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Grocery List Tab ────────────────────────────────────────────────── */}
      {tab === 'grocery' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="week-toggle" style={{ flex: 1, marginBottom: 0 }}>
              <button className={week === 'A' ? 'active' : ''} onClick={() => setWeek('A')}>Week A</button>
              <button className={week === 'B' ? 'active' : ''} onClick={() => setWeek('B')}>Week B</button>
            </div>
            <button className="btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={resetGrocery}>Reset</button>
          </div>

          {GROCERY_CATEGORIES.map(category => {
            const bothItems = GROCERY_LIST.both[category] || [];
            const weekItems = GROCERY_LIST[wKey]?.[category] || [];
            const items = [...bothItems, ...weekItems];
            if (items.length === 0) return null;

            return (
              <div key={category} className="card mb-12">
                <p className="card-title">{category}</p>
                {items.map(item => {
                  const checked = !!checks[item];
                  return (
                    <label key={item} className={`checkbox-row${checked ? ' checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGrocery(item)}
                      />
                      <span className="checkbox-label text-sm">{item}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
