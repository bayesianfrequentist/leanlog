import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { loadData, saveData } from '../storage/storage';
import { WORKOUTS, WEEKLY_SCHEDULE, DAY_TO_WORKOUT } from '../data/planData';
import { epley1RM } from '../utils/calculations';
import SetLogger from '../components/SetLogger';
import RestTimer from '../components/RestTimer';
import OneRMChart from '../components/OneRMChart';

function getTodayWorkoutKey() {
  const dow = new Date().getDay();
  return DAY_TO_WORKOUT[dow] || null;
}

function getAllExercises() {
  return [...new Set(
    Object.values(WORKOUTS).flatMap(w => w.exercises.map(e => e.name))
  )];
}

export default function WorkoutScreen() {
  const [tab, setTab] = useState('logger');
  const [appData, setAppData] = useState(null);
  const [session, setSession] = useState(null);   // { workoutKey, exercises: [{...plan, sets:[], note:''}] }
  const [activeTimer, setActiveTimer] = useState(null); // { exerciseIdx, setIdx, seconds }
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(getAllExercises()[0] || '');

  useEffect(() => {
    const d = loadData();
    setAppData(d);

    const wKey = getTodayWorkoutKey();
    if (wKey && WORKOUTS[wKey]) {
      const plan = WORKOUTS[wKey];
      setSession({
        workoutKey: wKey,
        exercises: plan.exercises.map(ex => ({
          ...ex,
          setData: Array.from({ length: ex.sets }, (_, i) => ({
            setNumber: i + 1,
            weight_lbs: '',
            reps: ex.reps || '',
            completed: false,
          })),
          note: '',
        })),
      });
    }
  }, []);

  function handleSetDone(exerciseIdx, setIdx, { weight, reps }) {
    setSession(prev => {
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exerciseIdx) return ex;
        const setData = ex.setData.map((s, si) => {
          if (si !== setIdx) return s;
          return { ...s, weight_lbs: weight, reps, completed: true };
        });
        return { ...ex, setData };
      });
      return { ...prev, exercises };
    });

    const restSecs = session.exercises[exerciseIdx].restSeconds;
    if (restSecs > 0) {
      setActiveTimer({ exerciseIdx, setIdx, seconds: restSecs });
    }
  }

  function addSet(exerciseIdx) {
    setSession(prev => {
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exerciseIdx) return ex;
        const newSet = {
          setNumber: ex.setData.length + 1,
          weight_lbs: '',
          reps: ex.reps || '',
          completed: false,
        };
        return { ...ex, setData: [...ex.setData, newSet] };
      });
      return { ...prev, exercises };
    });
  }

  function updateNote(exerciseIdx, note) {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, ei) => ei === exerciseIdx ? { ...ex, note } : ex),
    }));
  }

  function saveWorkout() {
    if (!session) return;
    const d = loadData();
    const entry = {
      date: new Date().toISOString().slice(0, 10),
      session: session.workoutKey,
      exercises: session.exercises.map(ex => ({
        name: ex.name,
        sets: ex.setData.map(s => ({
          set_number: s.setNumber,
          weight_lbs: s.weight_lbs,
          reps: s.reps,
          completed: s.completed,
        })),
        estimated_1rm: (() => {
          const best = ex.setData
            .filter(s => s.completed && s.weight_lbs && s.reps)
            .reduce((m, s) => Math.max(m, epley1RM(s.weight_lbs, s.reps)), 0);
          return best || null;
        })(),
        notes: ex.note,
      })),
    };

    const todayIdx = d.workout_log.findIndex(w => w.date === entry.date);
    if (todayIdx >= 0) {
      d.workout_log[todayIdx] = entry;
    } else {
      d.workout_log.push(entry);
    }
    saveData(d);
    setAppData(d);
    alert('Workout saved!');
  }

  const allExercises = getAllExercises();
  const latestWeight = appData?.weight_log?.slice(-1)?.[0]?.weight_lbs || null;
  const history = (appData?.workout_log || []).slice().reverse();

  return (
    <div className="screen">
      <h2 style={{ marginBottom: 16 }}>Workouts</h2>

      <div className="sub-tabs">
        {[['logger', 'Log'], ['oneRM', '1RM Chart'], ['history', 'History']].map(([key, label]) => (
          <button key={key} className={`sub-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Logger Tab ──────────────────────────────────────────────────────── */}
      {tab === 'logger' && (
        <div>
          {session ? (
            <>
              <div className="card mb-12">
                <p className="card-title">Today's Session</p>
                <p style={{ fontWeight: 700, fontSize: 17 }}>{session.workoutKey}</p>
                <p className="text-sm text-muted">{format(new Date(), 'EEEE, MMMM d')}</p>
              </div>

              {session.exercises.map((ex, ei) => (
                <div key={ei} className="exercise-block">
                  <div className="exercise-header">
                    <h3>{ex.name}</h3>
                  </div>
                  <p className="exercise-meta">
                    {ex.sets} × {ex.reps > 0 ? ex.reps + ' reps' : ex.note || '—'}
                    {ex.restSeconds > 0 ? ` · ${ex.restSeconds}s rest` : ''}
                  </p>

                  {ex.setData.map((s, si) => (
                    <SetLogger
                      key={si}
                      setNumber={s.setNumber}
                      defaultWeight={s.weight_lbs}
                      defaultReps={s.reps}
                      completed={s.completed}
                      onComplete={(result) => handleSetDone(ei, si, result)}
                    />
                  ))}

                  {activeTimer && activeTimer.exerciseIdx === ei && (
                    <RestTimer
                      key={`${ei}-${activeTimer.setIdx}`}
                      seconds={activeTimer.seconds}
                      onComplete={() => setActiveTimer(null)}
                    />
                  )}

                  <button
                    className="btn-ghost btn-sm mt-8"
                    onClick={() => addSet(ei)}
                  >
                    + Add Set
                  </button>

                  <div className="exercise-note">
                    <textarea
                      placeholder="Notes..."
                      value={ex.note}
                      onChange={e => updateNote(ei, e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <button className="btn-primary btn-full mt-16" onClick={saveWorkout}>
                Save Workout
              </button>
            </>
          ) : (
            <div className="empty-state">
              <p style={{ fontSize: 32 }}>🏖️</p>
              <p>No workout scheduled today. Enjoy your rest!</p>
            </div>
          )}
        </div>
      )}

      {/* ── 1RM Chart Tab ───────────────────────────────────────────────────── */}
      {tab === 'oneRM' && (
        <div>
          <div className="card mb-12">
            <p className="card-title">Exercise</p>
            <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}>
              {allExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>

          <div className="card mb-12">
            <p className="card-title">
              Normalized 1RM{latestWeight ? ` (÷ ${latestWeight} lbs)` : ''}
            </p>
            <OneRMChart
              workoutLog={appData?.workout_log || []}
              exercise={selectedExercise}
              bodyweight={latestWeight}
            />
          </div>

          {!latestWeight && (
            <p className="text-xs text-muted">Log your bodyweight in the Body tab to see normalized 1RM values.</p>
          )}
        </div>
      )}

      {/* ── History Tab ─────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="empty-state"><p>No workout history yet.</p></div>
          ) : (
            history.map((session, idx) => (
              <div key={idx} className="history-item">
                <div className="history-header" onClick={() => setExpandedHistory(expandedHistory === idx ? null : idx)}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{session.session}</p>
                    <p className="text-xs text-muted">{session.date}</p>
                  </div>
                  <span className="text-muted">{expandedHistory === idx ? '▲' : '▼'}</span>
                </div>
                {expandedHistory === idx && (
                  <div className="history-body">
                    {(session.exercises || []).map((ex, ei) => (
                      <div key={ei} style={{ marginBottom: 10 }}>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{ex.name}</p>
                        {(ex.sets || [])
                          .filter(s => s.completed)
                          .map((s, si) => (
                            <p key={si} className="text-xs text-muted">
                              Set {s.set_number}: {s.weight_lbs} lbs × {s.reps} reps
                            </p>
                          ))}
                        {ex.estimated_1rm && (
                          <p className="text-xs text-accent">Est. 1RM: {ex.estimated_1rm} lbs</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
