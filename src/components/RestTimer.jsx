import { useState, useEffect, useRef } from 'react';

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch (e) {
    // AudioContext not available — silent fallback
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function RestTimer({ seconds, onComplete }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    doneRef.current = false;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (!doneRef.current) {
            doneRef.current = true;
            playChime();
            setTimeout(() => onComplete && onComplete(), 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [seconds]);

  function handleSkip() {
    clearInterval(intervalRef.current);
    if (!doneRef.current) {
      doneRef.current = true;
      onComplete && onComplete();
    }
  }

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="rest-timer">
      <p className="timer-label">Rest Timer</p>
      <div className="timer-display">{formatTime(remaining)}</div>
      <div className="macro-track" style={{ marginBottom: 12 }}>
        <div className="macro-fill calories" style={{ width: `${pct}%`, transition: 'width 1s linear' }} />
      </div>
      <button className="btn-secondary btn-sm" onClick={handleSkip}>Skip</button>
    </div>
  );
}
