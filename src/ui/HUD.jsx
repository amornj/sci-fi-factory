import React from 'react';
import { useGameStore } from '../store';
import Inventory from './Inventory';

export default function HUD() {
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const sinT = Math.sin(timeOfDay);
  const isNight = sinT <= 0;

  // Map timeOfDay (0 to 2π) to a rough hour display
  // sinT=1 at π/2 (noon), sinT=-1 at 3π/2 (midnight)
  const phase = timeOfDay / (Math.PI * 2); // 0..1
  const hour = Math.floor(phase * 24) % 24;
  const min = Math.floor((phase * 24 - hour) * 60);
  const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

  return (
    <div id="hud">
      <Inventory />
      <div className="hud-time" style={{ color: isNight ? '#8866cc' : '#ffcc44' }}>
        <span className="hud-time-icon">{isNight ? '\u263D' : '\u2609'}</span>
        {' '}{timeStr}
        {' '}<span className="hud-time-label">{isNight ? 'NIGHT' : 'DAY'}</span>
      </div>
    </div>
  );
}
