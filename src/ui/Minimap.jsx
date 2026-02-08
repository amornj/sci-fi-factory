import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store';
import { WORLD_SIZE, resourceTypes, buildingDefs } from '../constants';

export default function Minimap() {
  const canvasRef = useRef();
  const animRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function draw() {
      const state = useGameStore.getState();
      const [cx, , cz] = state.playerPosition;
      const locked = state.locked;

      ctx.fillStyle = 'rgba(0,10,20,0.9)';
      ctx.fillRect(0, 0, 160, 160);

      if (!locked) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const scale = 160 / WORLD_SIZE;

      // Resource nodes
      for (const r of state.resourceNodes) {
        const type = resourceTypes.find(t => t.name === r.typeName);
        const sx = (r.position[0] - cx) * scale + 80;
        const sz = (r.position[2] - cz) * scale + 80;
        if (sx < 0 || sx > 160 || sz < 0 || sz > 160) continue;
        ctx.fillStyle = '#' + (type ? type.emissive : 0x888888).toString(16).padStart(6, '0');
        ctx.fillRect(sx - 1, sz - 1, 3, 3);
      }

      // Buildings
      for (const b of state.buildings) {
        const sx = (b.position[0] - cx) * scale + 80;
        const sz = (b.position[2] - cz) * scale + 80;
        if (sx < 0 || sx > 160 || sz < 0 || sz > 160) continue;
        const def = buildingDefs[b.type];
        ctx.fillStyle = '#' + def.color.toString(16).padStart(6, '0');
        ctx.fillRect(sx - 2, sz - 2, 5, 5);
      }

      // Player dot
      ctx.fillStyle = '#0ff';
      ctx.beginPath();
      ctx.arc(80, 80, 3, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div id="minimap">
      <canvas ref={canvasRef} width={160} height={160} />
    </div>
  );
}
