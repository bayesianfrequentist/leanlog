import { useState } from 'react';

export default function SetLogger({ setNumber, defaultWeight = '', defaultReps = '', onComplete, completed }) {
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);

  function handleDone() {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    onComplete({ weight: w, reps: r });
  }

  return (
    <div className="set-row">
      <span className="set-number">#{setNumber}</span>
      <div className="set-input-group">
        <div className="set-input-wrapper">
          <label>lbs</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            disabled={completed}
          />
        </div>
        <div className="set-input-wrapper">
          <label>reps</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={reps}
            onChange={e => setReps(e.target.value)}
            disabled={completed}
          />
        </div>
      </div>
      <button
        className={`set-done-btn btn-sm ${completed ? 'completed' : 'btn-primary'}`}
        onClick={handleDone}
        disabled={completed}
      >
        {completed ? '✓' : 'Done'}
      </button>
    </div>
  );
}
