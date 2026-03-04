import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { rollingAverage } from '../utils/calculations';

export default function WeightChart({ weightLog, showComposition = false }) {
  if (!weightLog || weightLog.length === 0) {
    return (
      <div className="empty-state">
        <p>No weight data yet. Log your first entry above.</p>
      </div>
    );
  }

  const data = rollingAverage(weightLog).map(entry => ({
    ...entry,
    dateLabel: format(parseISO(entry.date), 'M/d'),
  }));

  const domain = () => {
    const weights = data.map(d => d.weight_lbs);
    const min = Math.floor(Math.min(...weights) - 2);
    const max = Math.ceil(Math.max(...weights) + 2);
    return [min, max];
  };

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis domain={domain()} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#0f3460', border: '1px solid #2a2a4a', borderRadius: 8 }}
            labelStyle={{ color: '#e0e0e0' }}
            itemStyle={{ color: '#e0e0e0' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="weight_lbs"
            name="Weight (lbs)"
            stroke="#4ecca3"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="rolling_avg"
            name="7-day avg"
            stroke="#f4a261"
            dot={false}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
          {showComposition && (
            <>
              <Line
                type="monotone"
                dataKey="lean_mass"
                name="Lean mass"
                stroke="#7c83fd"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="fat_mass"
                name="Fat mass"
                stroke="#e63946"
                dot={false}
                strokeWidth={2}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
