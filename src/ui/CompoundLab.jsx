import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../store';
import { BASE_COMPOUNDS, getReaction, getCompoundByName, COMPOUND_CATEGORIES } from '../compounds';

// ── Physics constants ──
const GRAVITY = 400;
const PARTICLE_RADIUS = 3;
const DAMPING = 0.92;
const CANVAS_W = 700;
const CANVAS_H = 420;

// ── Container definitions ──
const CONTAINER_TYPES = [
  { type: 'beaker', label: 'Beaker', w: 60, h: 80, neckW: 60, neckH: 0, capacity: 100 },
  { type: 'flask', label: 'Flask', w: 70, h: 60, neckW: 26, neckH: 30, capacity: 120 },
  { type: 'test_tube', label: 'Test Tube', w: 28, h: 100, neckW: 28, neckH: 0, capacity: 60 },
  { type: 'vial', label: 'Vial', w: 36, h: 50, neckW: 20, neckH: 15, capacity: 40 },
];

// ── Initial lab containers placed on the workbench ──
function createInitialContainers() {
  return [
    { id: 0, typeIdx: 0, x: 100, y: 300, contents: [], particles: [] },
    { id: 1, typeIdx: 1, x: 250, y: 300, contents: [], particles: [] },
    { id: 2, typeIdx: 2, x: 390, y: 300, contents: [], particles: [] },
    { id: 3, typeIdx: 0, x: 520, y: 300, contents: [], particles: [] },
    { id: 4, typeIdx: 3, x: 640, y: 300, contents: [], particles: [] },
  ];
}

// ── Create particles for a compound in a container ──
function spawnParticles(container, compoundId, amount, cType) {
  const particles = [];
  const compound = BASE_COMPOUNDS[compoundId] || getCompoundByName(compoundId);
  if (!compound) return particles;
  const baseY = container.y + cType.h / 2;
  const halfW = cType.w / 2 - PARTICLE_RADIUS * 2;
  for (let i = 0; i < amount; i++) {
    particles.push({
      x: container.x + (Math.random() - 0.5) * halfW * 2,
      y: baseY - Math.random() * 40 - 10,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      color: compound.color,
      compoundId: typeof compoundId === 'number' ? compoundId : compound.id,
    });
  }
  return particles;
}

// ── Reaction effect particles ──
function createEffectParticles(x, y, color, effectType) {
  const particles = [];
  const count = effectType === 'flash' ? 30 : 15;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 40 + Math.random() * 80;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 20,
      vy: Math.sin(angle) * speed - 30 + (Math.random() - 0.5) * 20,
      life: 1.0,
      color,
      effectType,
    });
  }
  return particles;
}

export default function CompoundLab() {
  const labOpen = useGameStore(s => s.compoundLabOpen);
  const closeLab = useGameStore(s => s.closeCompoundLab);
  const labCompounds = useGameStore(s => s.labCompounds);
  const addLabCompound = useGameStore(s => s.addLabCompound);
  const removeLabCompound = useGameStore(s => s.removeLabCompound);
  const showStatus = useGameStore(s => s.showStatus);

  const canvasRef = useRef(null);
  const [containers, setContainers] = useState(createInitialContainers);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [effectParticles, setEffectParticles] = useState([]);
  const [reactionNote, setReactionNote] = useState(null);
  const [hoveredCompound, setHoveredCompound] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [discoveredOutputs, setDiscoveredOutputs] = useState([]);

  const animRef = useRef(null);
  const noteTimeout = useRef(null);

  // ── Physics loop ──
  useEffect(() => {
    if (!labOpen) return;
    let last = performance.now();

    function tick() {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      setContainers(prev => prev.map(cont => {
        if (cont.particles.length === 0) return cont;
        const cType = CONTAINER_TYPES[cont.typeIdx];
        const halfW = cType.w / 2 - PARTICLE_RADIUS;
        const top = cont.y - cType.h / 2 - (cType.neckH || 0);
        const bottom = cont.y + cType.h / 2;
        const left = cont.x - halfW;
        const right = cont.x + halfW;

        const newParticles = cont.particles.map(p => {
          let { x, y, vx, vy, color, compoundId } = p;
          vy += GRAVITY * dt;
          x += vx * dt;
          y += vy * dt;
          vx *= DAMPING;
          vy *= DAMPING;

          // Container bounds
          if (x - PARTICLE_RADIUS < left) { x = left + PARTICLE_RADIUS; vx = Math.abs(vx) * 0.5; }
          if (x + PARTICLE_RADIUS > right) { x = right - PARTICLE_RADIUS; vx = -Math.abs(vx) * 0.5; }
          if (y + PARTICLE_RADIUS > bottom) { y = bottom - PARTICLE_RADIUS; vy = -Math.abs(vy) * 0.3; }
          if (y - PARTICLE_RADIUS < top + 4) { y = top + PARTICLE_RADIUS + 4; vy = Math.abs(vy) * 0.3; }

          return { x, y, vx, vy, color, compoundId };
        });

        return { ...cont, particles: newParticles };
      }));

      // Effect particles
      setEffectParticles(prev => {
        if (prev.length === 0) return prev;
        return prev.map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + GRAVITY * 0.3 * dt,
          life: p.life - dt * 1.5,
        })).filter(p => p.life > 0);
      });

      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [labOpen]);

  // ── Canvas rendering ──
  useEffect(() => {
    if (!labOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let drawFrame;

    function draw() {
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Workbench
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(0, CANVAS_H - 60, CANVAS_W, 60);
      ctx.strokeStyle = 'rgba(0,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H - 60);
      ctx.lineTo(CANVAS_W, CANVAS_H - 60);
      ctx.stroke();

      // Grid lines
      ctx.strokeStyle = 'rgba(0,255,255,0.04)';
      for (let x = 0; x < CANVAS_W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H - 60); ctx.stroke();
      }
      for (let y = 0; y < CANVAS_H - 60; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
      }

      // Draw containers
      for (const cont of containers) {
        const cType = CONTAINER_TYPES[cont.typeIdx];
        const isSelected = selectedContainer === cont.id;

        // Container body
        ctx.strokeStyle = isSelected ? '#0ff' : 'rgba(0,255,255,0.3)';
        ctx.lineWidth = isSelected ? 2 : 1;

        const bx = cont.x - cType.w / 2;
        const by = cont.y - cType.h / 2;

        if (cType.neckH > 0) {
          // Flask/vial with neck
          // Body (rounded bottom)
          ctx.beginPath();
          ctx.moveTo(cont.x - cType.neckW / 2, by - cType.neckH);
          ctx.lineTo(cont.x - cType.neckW / 2, by);
          ctx.lineTo(bx, by + cType.h * 0.3);
          ctx.lineTo(bx, by + cType.h);
          ctx.quadraticCurveTo(bx, by + cType.h + 8, cont.x, by + cType.h + 8);
          ctx.quadraticCurveTo(bx + cType.w, by + cType.h + 8, bx + cType.w, by + cType.h);
          ctx.lineTo(bx + cType.w, by + cType.h * 0.3);
          ctx.lineTo(cont.x + cType.neckW / 2, by);
          ctx.lineTo(cont.x + cType.neckW / 2, by - cType.neckH);
          ctx.stroke();
        } else {
          // Beaker / test tube
          ctx.beginPath();
          if (cType.type === 'test_tube') {
            ctx.moveTo(bx, by);
            ctx.lineTo(bx, by + cType.h - 10);
            ctx.quadraticCurveTo(bx, by + cType.h + 5, cont.x, by + cType.h + 5);
            ctx.quadraticCurveTo(bx + cType.w, by + cType.h + 5, bx + cType.w, by + cType.h - 10);
            ctx.lineTo(bx + cType.w, by);
          } else {
            ctx.strokeRect(bx, by, cType.w, cType.h);
          }
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = isSelected ? '#0ff' : 'rgba(0,255,255,0.4)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cType.label, cont.x, cont.y + cType.h / 2 + 18);

        // Content labels
        if (cont.contents.length > 0) {
          const unique = [...new Set(cont.contents)];
          unique.forEach((cid, i) => {
            const comp = BASE_COMPOUNDS[cid] || getCompoundByName(cid);
            if (comp) {
              ctx.fillStyle = comp.color || '#888';
              ctx.fillText(comp.name.substring(0, 10), cont.x, by - 8 - i * 12);
            }
          });
        }

        // Particles
        for (const p of cont.particles) {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Effect particles
      for (const p of effectParticles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + (1 - p.life) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      drawFrame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(drawFrame);
  }, [labOpen, containers, selectedContainer, effectParticles]);

  // ── Add compound to selected container ──
  const addCompoundToContainer = useCallback((compoundId) => {
    if (selectedContainer === null) {
      showStatus('Select a container first!', '#ff8844');
      return;
    }

    const amt = labCompounds[compoundId] || 0;
    if (amt < 1) {
      showStatus('Not enough compound!', '#ff4444');
      return;
    }

    removeLabCompound(compoundId, 1);

    setContainers(prev => prev.map(cont => {
      if (cont.id !== selectedContainer) return cont;
      const cType = CONTAINER_TYPES[cont.typeIdx];
      if (cont.particles.length >= cType.capacity) {
        showStatus('Container full!', '#ff8844');
        return cont;
      }
      const newParticles = spawnParticles(cont, compoundId, 8, cType);
      return {
        ...cont,
        contents: [...cont.contents, compoundId],
        particles: [...cont.particles, ...newParticles],
      };
    }));
  }, [selectedContainer, labCompounds, removeLabCompound, showStatus]);

  // ── Mix compounds in container ──
  const mixContainer = useCallback((containerId) => {
    setContainers(prev => {
      const cont = prev.find(c => c.id === containerId);
      if (!cont || cont.contents.length < 2) {
        showStatus('Need at least 2 compounds to mix!', '#ff8844');
        return prev;
      }

      // Get unique compound IDs
      const unique = [...new Set(cont.contents)];
      if (unique.length < 2) {
        showStatus('Need different compounds to mix!', '#ff8844');
        return prev;
      }

      // Try reactions between all pairs
      let foundReaction = null;
      let usedPair = null;
      for (let i = 0; i < unique.length && !foundReaction; i++) {
        for (let j = i + 1; j < unique.length && !foundReaction; j++) {
          const reaction = getReaction(unique[i], unique[j]);
          if (reaction) {
            foundReaction = reaction;
            usedPair = [unique[i], unique[j]];
          }
        }
      }

      if (!foundReaction) {
        // No reaction
        if (noteTimeout.current) clearTimeout(noteTimeout.current);
        setReactionNote({ x: cont.x, y: cont.y - 60 });
        noteTimeout.current = setTimeout(() => setReactionNote(null), 3000);
        return prev;
      }

      // Reaction found!
      const cType = CONTAINER_TYPES[cont.typeIdx];
      const outputCompound = getCompoundByName(foundReaction.output);
      const outputColor = foundReaction.color;

      // Create effect particles
      setEffectParticles(createEffectParticles(cont.x, cont.y, outputColor, foundReaction.effect));

      // Track discovery
      setDiscoveredOutputs(d => {
        if (d.includes(foundReaction.output)) return d;
        return [...d, foundReaction.output];
      });

      // Add output to lab inventory
      if (outputCompound) {
        addLabCompound(outputCompound.id, 1);
      }

      showStatus(`Reaction: ${foundReaction.output} — ${foundReaction.desc}`, outputColor);

      // Remove used compounds, replace particles
      const newContents = [...cont.contents];
      // Remove one of each used compound
      for (const cid of usedPair) {
        const idx = newContents.indexOf(cid);
        if (idx >= 0) newContents.splice(idx, 1);
      }

      // Recolor remaining particles to output color
      const newParticles = cont.particles.map(p => {
        if (usedPair.includes(p.compoundId)) {
          return { ...p, color: outputColor, compoundId: outputCompound ? outputCompound.id : -1, vy: -50 - Math.random() * 30 };
        }
        return p;
      });

      return prev.map(c => c.id === containerId ? { ...c, contents: newContents, particles: newParticles } : c);
    });
  }, [showStatus, addLabCompound]);

  // ── Empty container ──
  const emptyContainer = useCallback((containerId) => {
    setContainers(prev => prev.map(c =>
      c.id === containerId ? { ...c, contents: [], particles: [] } : c
    ));
  }, []);

  // ── Canvas click handler ──
  const handleCanvasClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (CANVAS_W / rect.width);
    const my = (e.clientY - rect.top) * (CANVAS_H / rect.height);

    // Check if clicked on a container
    for (const cont of containers) {
      const cType = CONTAINER_TYPES[cont.typeIdx];
      const dx = Math.abs(mx - cont.x);
      const dy = Math.abs(my - cont.y);
      if (dx < cType.w / 2 + 10 && dy < cType.h / 2 + 20) {
        setSelectedContainer(cont.id);
        return;
      }
    }
    setSelectedContainer(null);
  }, [containers]);

  if (!labOpen) return null;

  // Build available compounds list
  const availableCompounds = Object.entries(labCompounds)
    .filter(([, amt]) => amt > 0)
    .map(([id, amt]) => {
      const compound = BASE_COMPOUNDS[Number(id)] || getCompoundByName(id);
      return compound ? { ...compound, amount: amt, origId: Number(id) } : null;
    })
    .filter(Boolean);

  const filteredCompounds = filterCat === 'all'
    ? availableCompounds
    : availableCompounds.filter(c => c.cat === filterCat);

  return (
    <div id="lab-overlay" onClick={(e) => {
      if (e.target.id === 'lab-overlay') closeLab();
    }}>
      <div className="lab-panel">
        <div className="lab-header">
          <span>// COMPOUND LABORATORY</span>
          <span className="lab-discovered">{discoveredOutputs.length} discoveries</span>
          <span className="lab-close" onClick={closeLab}>[ESC]</span>
        </div>

        <div className="lab-content">
          {/* Left sidebar: compounds */}
          <div className="lab-sidebar">
            <div className="lab-sidebar-header">COMPOUNDS</div>

            {/* Category filters */}
            <div className="lab-cat-filters">
              <button
                className={`lab-cat-btn${filterCat === 'all' ? ' active' : ''}`}
                onClick={() => setFilterCat('all')}
              >ALL</button>
              {Object.entries(COMPOUND_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  className={`lab-cat-btn${filterCat === key ? ' active' : ''}`}
                  onClick={() => setFilterCat(key)}
                  style={{ '--cat-color': cat.color }}
                >{cat.label.substring(0, 5).toUpperCase()}</button>
              ))}
            </div>

            <div className="lab-compound-list">
              {filteredCompounds.length === 0 && (
                <div className="lab-empty">No compounds available. Gather mushrooms and analyze them!</div>
              )}
              {filteredCompounds.map(c => (
                <div
                  key={c.id}
                  className={`lab-compound-item${hoveredCompound === c.id ? ' hovered' : ''}`}
                  onClick={() => addCompoundToContainer(c.origId)}
                  onMouseEnter={() => setHoveredCompound(c.id)}
                  onMouseLeave={() => setHoveredCompound(null)}
                >
                  <div className="lab-compound-swatch" style={{ background: c.color }} />
                  <div className="lab-compound-info">
                    <div className="lab-compound-name">{c.name}</div>
                    <div className="lab-compound-cat">{c.cat}</div>
                  </div>
                  <div className="lab-compound-amt">x{c.amount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: canvas workbench */}
          <div className="lab-workbench">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="lab-canvas"
              onClick={handleCanvasClick}
            />

            {/* "Nothing happening" note */}
            {reactionNote && (
              <div className="lab-no-reaction" style={{
                left: `${(reactionNote.x / CANVAS_W) * 100}%`,
                top: `${(reactionNote.y / CANVAS_H) * 100}%`,
              }}>
                Nothing appears to be happening here...
              </div>
            )}

            {/* Container actions */}
            {selectedContainer !== null && (
              <div className="lab-actions">
                <button className="lab-action-btn mix" onClick={() => mixContainer(selectedContainer)}>
                  MIX
                </button>
                <button className="lab-action-btn empty" onClick={() => emptyContainer(selectedContainer)}>
                  EMPTY
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: discovered compounds */}
        {discoveredOutputs.length > 0 && (
          <div className="lab-discoveries">
            <div className="lab-disc-header">// DISCOVERIES ({discoveredOutputs.length})</div>
            <div className="lab-disc-list">
              {discoveredOutputs.map((name, i) => {
                const c = getCompoundByName(name);
                return (
                  <div key={i} className="lab-disc-item" style={{ borderColor: c?.color || '#444' }}>
                    <div className="lab-disc-swatch" style={{ background: c?.color || '#444' }} />
                    <span>{name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
