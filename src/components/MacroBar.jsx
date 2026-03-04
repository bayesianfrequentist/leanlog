import { MACRO_TARGETS } from '../data/planData';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function proteinClass(g) {
  if (g >= 100) return 'protein-red';
  if (g >= 80) return 'protein-yellow';
  return 'protein-green';
}

export default function MacroBar({ calories = 0, protein = 0, carbs = 0, fat = 0 }) {
  const calPct = clamp((calories / MACRO_TARGETS.calories) * 100, 0, 100);
  const proteinPct = clamp((protein / MACRO_TARGETS.protein) * 100, 0, 100);
  const carbsPct = clamp((carbs / MACRO_TARGETS.carbs) * 100, 0, 100);
  const fatPct = clamp((fat / MACRO_TARGETS.fat) * 100, 0, 100);

  const rows = [
    { label: 'Calories', value: `${Math.round(calories)} / ${MACRO_TARGETS.calories} kcal`, pct: calPct, cls: 'calories' },
    { label: 'Protein', value: `${Math.round(protein)}g / ${MACRO_TARGETS.protein}g`, pct: proteinPct, cls: proteinClass(protein) },
    { label: 'Carbs', value: `${Math.round(carbs)}g / ${MACRO_TARGETS.carbs}g`, pct: carbsPct, cls: 'carbs' },
    { label: 'Fat', value: `${Math.round(fat)}g / ${MACRO_TARGETS.fat}g`, pct: fatPct, cls: 'fat' },
  ];

  return (
    <div className="macro-bars">
      {rows.map(row => (
        <div key={row.label} className="macro-row">
          <div className="macro-label-row">
            <span className="macro-label">{row.label}</span>
            <span className="macro-value">{row.value}</span>
          </div>
          <div className="macro-track">
            <div className={`macro-fill ${row.cls}`} style={{ width: `${row.pct}%` }} />
          </div>
        </div>
      ))}
      <p className="protein-warning">Physician limit: 110g protein/day</p>
    </div>
  );
}
