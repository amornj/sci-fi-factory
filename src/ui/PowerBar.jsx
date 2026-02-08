import React, { useMemo } from 'react';
import { useGameStore } from '../store';

export default function PowerBar() {
  const powerGenerated = useGameStore(s => s.powerGenerated);
  const powerConsumed = useGameStore(s => s.powerConsumed);

  const pct = powerConsumed > 0
    ? Math.min(100, (powerGenerated / (powerConsumed + powerGenerated)) * 100)
    : 100;

  let gradient;
  if (pct < 30) gradient = 'linear-gradient(90deg, #f00, #f80)';
  else if (pct < 60) gradient = 'linear-gradient(90deg, #f80, #ff0)';
  else gradient = 'linear-gradient(90deg, #0f0, #0ff)';

  return (
    <div id="power-bar">
      <div className="label">COLONY POWER</div>
      <div className="bar-bg">
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, background: gradient }}
        />
      </div>
    </div>
  );
}
