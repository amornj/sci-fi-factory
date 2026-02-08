import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store';
import { SHIP_ID, PLANET_NAME, LORE_INTRO, LORE_PLAYER } from '../constants';
import sfx from '../sfx/SFXEngine';

function requestLock() {
  // Must lock the canvas element so PointerLockControls detects it
  const canvas = document.querySelector('canvas');
  if (canvas) canvas.requestPointerLock();
}

export default function Blocker() {
  const locked = useGameStore(s => s.locked);
  const [showLore, setShowLore] = useState(false);
  const [lorePage, setLorePage] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const advance = useCallback(() => {
    sfx.init();
    if (hasStarted) {
      requestLock();
      return;
    }
    if (!showLore) {
      setShowLore(true);
      setLorePage(0);
      return;
    }
    if (lorePage === 0) {
      setLorePage(1);
      return;
    }
    setHasStarted(true);
    requestLock();
  }, [hasStarted, showLore, lorePage]);

  // Space / Enter key to advance
  useEffect(() => {
    if (locked) return;
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        advance();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [locked, advance]);

  // Hide blocker when pointer is locked
  if (locked) return null;

  const handleClick = () => advance();

  // Resume screen
  if (hasStarted) {
    return (
      <div id="blocker" onClick={handleClick}>
        <h2>PAUSED</h2>
        <div className="start-hint">[ CLICK OR PRESS SPACE TO RESUME ]</div>
      </div>
    );
  }

  if (!showLore) {
    return (
      <div id="blocker" onClick={handleClick}>
        <h1>NEXUS FORGE</h1>
        <h2>DEEP SPACE COLONY BUILDER</h2>
        <div className="lore-tagline">
          Ship {SHIP_ID} &bull; Planet {PLANET_NAME}
        </div>
        <div className="start-hint">[ CLICK OR PRESS SPACE ]</div>
      </div>
    );
  }

  const lines = lorePage === 0 ? LORE_INTRO : LORE_PLAYER;
  const isLastPage = lorePage === 1;

  return (
    <div id="blocker" onClick={handleClick}>
      <div className="lore-panel">
        <div className="lore-header">
          {lorePage === 0 ? '// ARCHIVED TRANSMISSION — SOL COUNCIL' : `// SHIP LOG — ${SHIP_ID}`}
        </div>
        <div className="lore-text">
          {lines.map((line, i) => (
            <div key={i} className={line === '' ? 'lore-break' : 'lore-line'}>
              {line}
            </div>
          ))}
        </div>
        {isLastPage && (
          <div className="controls" style={{ marginTop: 20 }}>
            <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move &nbsp;&nbsp;
            <kbd>SPACE</kbd> Jump &nbsp;&nbsp;
            <kbd>SHIFT</kbd> Sprint<br />
            <kbd>MOUSE</kbd> Look &nbsp;&nbsp;
            <kbd>LEFT CLICK</kbd> Mine / Place &nbsp;&nbsp;
            <kbd>RIGHT CLICK</kbd> Remove<br />
            <kbd>B</kbd> Build Menu &nbsp;&nbsp;
            <kbd>R</kbd> Rotate &nbsp;&nbsp;
            <kbd>Q</kbd> Cancel Build &nbsp;&nbsp;
            <kbd>F</kbd> Flashlight<br />
            <kbd>E</kbd> Interact / Pick Up &nbsp;&nbsp;
            <kbd>1-9</kbd> Quick Select Building<br />
            <kbd>TAB</kbd> Weapons &nbsp;&nbsp;
            <kbd>SCROLL</kbd> Switch Weapon
          </div>
        )}
        <div className="start-hint">
          {isLastPage ? '[ CLICK OR PRESS SPACE TO INITIALIZE COLONY ]' : '[ CLICK OR PRESS SPACE TO CONTINUE ]'}
        </div>
      </div>
    </div>
  );
}
