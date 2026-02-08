import React from 'react';
import { useGameStore } from '../store';

export default function KillFeed() {
  const killFeed = useGameStore(s => s.killFeed);
  const locked = useGameStore(s => s.locked);

  if (!locked || killFeed.length === 0) return null;

  return (
    <div id="kill-feed">
      {killFeed.map(kf => (
        <div
          key={kf.id}
          className="kill-entry"
          style={{
            color: kf.color,
            opacity: kf.life < 0.5 ? kf.life / 0.5 : 1,
            textShadow: `0 0 8px ${kf.color}`,
          }}
        >
          {kf.text}
        </div>
      ))}
    </div>
  );
}
