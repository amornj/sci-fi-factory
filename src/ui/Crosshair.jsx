import React from 'react';
import { useGameStore } from '../store';

export default function Crosshair() {
  const hitMarker = useGameStore(s => s.hitMarker);

  return (
    <>
      <div id="crosshair" />
      {hitMarker > 0 && (
        <div id="hit-marker" style={{ opacity: hitMarker / 0.3 }}>
          <div className="hm-line" style={{ transform: 'rotate(45deg)' }} />
          <div className="hm-line" style={{ transform: 'rotate(135deg)' }} />
          <div className="hm-line" style={{ transform: 'rotate(225deg)' }} />
          <div className="hm-line" style={{ transform: 'rotate(315deg)' }} />
        </div>
      )}
    </>
  );
}
