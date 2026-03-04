import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subWeeks } from 'date-fns';
import { epley1RM, normalized1RM } from '../utils/calculations';

export default function OneRMChart({ workoutLog, exercise, bodyweight }) {
  if (!workoutLog || workoutLog.length === 0 || !exercise) {
    return (
      <div className="empty-state">
        <p>No data yet. Complete some workouts to see your strength progress.</p>
      </div>
    );
  }

  const cutoff = subWeeks(new Date(), 12);

  const data = workoutLog
    .filter(session => parseISO(session.date) >= cutoff)
    .flatMap(session =>
      (session.exercises || [])
        .filter(ex => ex.name === exercise)
        .map(ex => {
          const bestSet = (ex.sets || []).reduce((best, s) => {
            if (!s.completed || !s.weight_lbs || !s.reps) return best;
            const oneRM = epley1RM(s.weight_lbs, s.reps);
            return oneRM > best ? oneRM : best;
          }, 0);
          if (bestSet === 0) return null;
          return {
            date: session.date,
            dateLabel: format(parseISO(session.date), 'M/d'),
            oneRM: bestSet,
            normalizedRM: normalized1RM(bestSet, bodyweight || 1),
          };
        })
        .filter(Boolean)
    );

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <p>No data for {exercise} in the last 12 weeks.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#0f3460', border: '1px solid #2a2a4a', borderRadius: 8 }}
            labelStyle={{ color: '#e0e0e0' }}
            itemStyle={{ color: '#e0e0e0' }}
            formatter={(val) => [val.toFixed(2), bodyweight ? 'Norm. 1RM (×BW)' : '1RM (lbs)']}
          />
          <Line
            type="monotone"
            dataKey={bodyweight ? 'normalizedRM' : 'oneRM'}
            name={bodyweight ? 'Norm. 1RM' : '1RM (lbs)'}
            stroke="#4ecca3"
            dot={{ r: 3 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
