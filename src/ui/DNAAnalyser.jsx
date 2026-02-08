import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store';

// ── Mushroom effect pools ──
const EDIBLE_EFFECTS = [
  { type: 'heal', name: 'Regeneration', desc: 'Restores health over 10 seconds', color: '#44ff66', duration: 10 },
  { type: 'speed', name: 'Adrenaline Rush', desc: 'Increases movement speed for 15 seconds', color: '#44ccff', duration: 15 },
  { type: 'flash', name: 'Bioluminescent Burst', desc: 'Briefly flashes your screen white', color: '#ffffff', duration: 0.5 },
  { type: 'mineFast', name: 'Mineral Sense', desc: 'Mine 3x faster for 20 seconds', color: '#ffaa44', duration: 20 },
  { type: 'resist', name: 'Chitin Shield', desc: 'Resist 50% damage for 15 seconds', color: '#8888ff', duration: 15 },
];

const TOXIC_EFFECTS = [
  { type: 'poison', name: 'Neurotoxin', desc: 'Slowly drains health for 8 seconds', color: '#88ff44', duration: 8 },
  { type: 'weaken', name: 'Muscle Decay', desc: 'Mining yields reduced for 12 seconds', color: '#ff8844', duration: 12 },
  { type: 'fadeSight', name: 'Ocular Blight', desc: 'Fades your vision for 10 seconds', color: '#666666', duration: 10 },
  { type: 'slow', name: 'Nerve Freeze', desc: 'Slows movement for 12 seconds', color: '#aa44ff', duration: 12 },
];

function randomMushroomResult() {
  const isEdible = Math.random() > 0.4; // 60% chance edible
  if (isEdible) {
    const effect = EDIBLE_EFFECTS[Math.floor(Math.random() * EDIBLE_EFFECTS.length)];
    return { edible: true, effect: { ...effect } };
  } else {
    const effect = TOXIC_EFFECTS[Math.floor(Math.random() * TOXIC_EFFECTS.length)];
    return { edible: false, effect: { ...effect } };
  }
}

// ── DNA Helix canvas animation ──
function DNAHelixCanvas({ scanning, progress }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = 'rgba(0,5,10,0.15)';
      ctx.fillRect(0, 0, w, h);

      if (!scanning) {
        animFrame = requestAnimationFrame(draw);
        return;
      }

      const time = frameRef.current * 0.03;
      frameRef.current++;

      // Draw DNA helix strands
      const centerX = w / 2;
      const amplitude = 30;
      const strandSpacing = 8;

      for (let y = 0; y < h; y += 3) {
        const yNorm = y / h;
        if (yNorm > progress) break;

        const phase = y * 0.08 + time;
        const x1 = centerX + Math.sin(phase) * amplitude;
        const x2 = centerX + Math.sin(phase + Math.PI) * amplitude;

        // Strand 1
        const alpha1 = 0.5 + Math.sin(phase) * 0.3;
        ctx.fillStyle = `rgba(0,255,200,${alpha1})`;
        ctx.fillRect(x1 - 1.5, y, 3, 2);

        // Strand 2
        const alpha2 = 0.5 + Math.sin(phase + Math.PI) * 0.3;
        ctx.fillStyle = `rgba(0,180,255,${alpha2})`;
        ctx.fillRect(x2 - 1.5, y, 3, 2);

        // Base pair bridges
        if (y % 12 < 3) {
          const depth = Math.cos(phase);
          if (depth > 0) {
            ctx.strokeStyle = `rgba(100,255,200,${depth * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();

            // Base pair dots
            const midX = (x1 + x2) / 2;
            ctx.fillStyle = `rgba(255,255,100,${depth * 0.6})`;
            ctx.fillRect(midX - 1, y - 1, 2, 2);
          }
        }
      }

      // Scanning line
      const scanY = progress * h;
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animFrame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [scanning, progress]);

  return <canvas ref={canvasRef} width={120} height={200} className="dna-helix-canvas" />;
}

export default function DNAAnalyser() {
  const analyserOpen = useGameStore(s => s.dnaAnalyserOpen);
  const closeAnalyser = useGameStore(s => s.closeDNAAnalyser);
  const inventory = useGameStore(s => s.inventory);
  const addResource = useGameStore(s => s.addResource);
  const spendResources = useGameStore(s => s.spendResources);
  const applyMushroomEffect = useGameStore(s => s.applyMushroomEffect);
  const showStatus = useGameStore(s => s.showStatus);

  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [consumed, setConsumed] = useState(false);

  const scanInterval = useRef(null);

  const startScan = useCallback(() => {
    if (scanning || (inventory['Bioluminescent Mushroom'] || 0) < 1) return;

    spendResources({ 'Bioluminescent Mushroom': 1 });
    setScanning(true);
    setProgress(0);
    setResult(null);
    setConsumed(true);

    let p = 0;
    scanInterval.current = setInterval(() => {
      p += 0.02;
      setProgress(Math.min(1, p));
      if (p >= 1) {
        clearInterval(scanInterval.current);
        const res = randomMushroomResult();
        setResult(res);
        setScanning(false);
      }
    }, 50);
  }, [scanning, inventory, spendResources]);

  const consumeEffect = useCallback(() => {
    if (!result) return;
    applyMushroomEffect(result.effect);
    showStatus(
      result.edible
        ? `Consumed: ${result.effect.name} — ${result.effect.desc}`
        : `WARNING: ${result.effect.name} — ${result.effect.desc}`,
      result.edible ? '#44ff66' : '#ff4444'
    );
    setResult(null);
    setConsumed(false);
  }, [result, applyMushroomEffect, showStatus]);

  const resetScan = useCallback(() => {
    if (scanInterval.current) clearInterval(scanInterval.current);
    setScanning(false);
    setProgress(0);
    setResult(null);
    setConsumed(false);
  }, []);

  useEffect(() => {
    if (!analyserOpen) resetScan();
  }, [analyserOpen, resetScan]);

  if (!analyserOpen) return null;

  const mushroomCount = inventory['Bioluminescent Mushroom'] || 0;

  return (
    <div id="dna-overlay" onClick={(e) => {
      if (e.target.id === 'dna-overlay') closeAnalyser();
    }}>
      <div className="dna-panel">
        <div className="dna-header">
          <span>// DNA ANALYSER</span>
          <span className="dna-close" onClick={closeAnalyser}>[ESC]</span>
        </div>

        <div className="dna-content">
          {/* Left: Helix visualization */}
          <div className="dna-viz">
            <DNAHelixCanvas scanning={scanning} progress={progress} />
            {scanning && (
              <div className="dna-progress-bar">
                <div className="dna-progress-fill" style={{ width: `${progress * 100}%` }} />
              </div>
            )}
            {scanning && (
              <div className="dna-scan-label">SCANNING... {Math.floor(progress * 100)}%</div>
            )}
          </div>

          {/* Right: Controls & Results */}
          <div className="dna-controls">
            <div className="dna-mushroom-count">
              Mushrooms: <span className="dna-count">{mushroomCount}</span>
            </div>

            {!scanning && !result && (
              <button
                className={`dna-scan-btn${mushroomCount < 1 ? ' disabled' : ''}`}
                onClick={startScan}
                disabled={mushroomCount < 1}
              >
                {mushroomCount < 1 ? 'NO MUSHROOMS' : 'INSERT & SCAN'}
              </button>
            )}

            {result && (
              <div className="dna-result">
                <div className={`dna-result-badge ${result.edible ? 'edible' : 'toxic'}`}>
                  {result.edible ? 'EDIBLE' : 'TOXIC'}
                </div>
                <div className="dna-effect-name" style={{ color: result.effect.color }}>
                  {result.effect.name}
                </div>
                <div className="dna-effect-desc">{result.effect.desc}</div>
                <div className="dna-effect-duration">
                  Duration: {result.effect.duration}s
                </div>

                <div className="dna-result-actions">
                  <button className="dna-consume-btn" onClick={consumeEffect}>
                    {result.edible ? 'CONSUME' : 'CONSUME ANYWAY'}
                  </button>
                  <button className="dna-discard-btn" onClick={resetScan}>
                    DISCARD
                  </button>
                </div>
              </div>
            )}

            <div className="dna-info">
              <div className="dna-info-header">// HOW IT WORKS</div>
              <div className="dna-info-text">
                Insert a Bioluminescent Mushroom to analyze its DNA structure.
                The scanner will determine if it is edible or toxic, and reveal its effects.
              </div>
              <div className="dna-info-text" style={{ marginTop: 6 }}>
                <span style={{ color: '#44ff66' }}>Edible</span> mushrooms provide buffs.
                <br />
                <span style={{ color: '#ff4444' }}>Toxic</span> mushrooms cause debuffs.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
