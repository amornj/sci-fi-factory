import React from 'react';
import { useGameStore } from '../store';

export default function StatusMessage() {
  const msg = useGameStore(s => s.statusMessage);
  const color = useGameStore(s => s.statusColor);

  return (
    <div
      id="status-msg"
      style={{
        opacity: msg ? 1 : 0,
        color: color,
        textShadow: `0 0 10px ${color}`,
      }}
    >
      {msg || ''}
    </div>
  );
}
