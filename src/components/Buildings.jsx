import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../store';
import { RENDER_DISTANCE, buildingDefs, CONVEYOR_SPEED_MK1, CONVEYOR_SPEED_MK2 } from '../constants';
import BuildingMesh from './BuildingMesh';

const _rdSqBuildings = RENDER_DISTANCE * RENDER_DISTANCE;

// Category → idle animation type (with per-type overrides)
const IDLE_ANIM = {
  production: 'spin',
  power: 'spin',
  defense: 'scan',
  research: 'pulse_glow',
  logistics: 'pulse_flow',
  colony: 'breathe',
  endgame: 'orbit',
  core: 'pulse_glow',
};
const TYPE_OVERRIDES = {
  dna_analyser: 'spin',
  radar: 'spin',
  turret: 'scan',
  wind_turbine: 'spin',
  compound_lab: 'pulse_glow',
};
// Static types — no idle animation on idleRef
const STATIC_TYPES = { wall: 1, laser_fence: 1 };

// Belt types that need animation
const BELT_TYPES = { conveyor: 1, conveyor_mk2: 1 };
const PIPE_TYPES = { pipe: 1 };

function Building({ building, camera }) {
  const groupRef = useRef();
  const idleRef = useRef();
  const glowRef = useRef();
  const beltRef = useRef();
  const rollerRefs = useRef([]);
  const pipeFlowRef = useRef();
  const anim = useRef({
    placementT: 0,
    placed: false,
    pulseT: 0,
    lastProducedAt: 0,
    elapsed: 0,
  });

  const def = buildingDefs[building.type];
  const category = def ? def.category : 'production';
  const idleType = STATIC_TYPES[building.type] ? null : (TYPE_OVERRIDES[building.type] || IDLE_ANIM[category] || 'pulse_glow');

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dx = building.position[0] - camera.position.x;
    const dz = building.position[2] - camera.position.z;
    const visible = dx * dx + dz * dz < _rdSqBuildings;
    groupRef.current.visible = visible;
    if (!visible) return;

    const a = anim.current;
    a.elapsed += delta;

    // ── Placement animation (0.5s scale-up) ──
    if (!a.placed) {
      const age = performance.now() / 1000 - building.placedAt;
      if (age < 0.5) {
        const t = age / 0.5;
        // easeOutBack
        const c1 = 1.70158;
        const c3 = c1 + 1;
        const s = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        groupRef.current.scale.setScalar(s);
        return; // skip other animations during placement
      }
      groupRef.current.scale.setScalar(1);
      a.placed = true;
    }

    // ── Production pulse (0.3s bounce + glow) ──
    if (building.lastProducedAt > 0 && building.lastProducedAt !== a.lastProducedAt) {
      a.lastProducedAt = building.lastProducedAt;
      a.pulseT = 0.3;
    }
    if (a.pulseT > 0) {
      a.pulseT -= delta;
      const pt = Math.max(0, a.pulseT) / 0.3;
      const bounce = 1 + 0.05 * Math.sin(pt * Math.PI);
      groupRef.current.scale.setScalar(bounce);
      if (glowRef.current && glowRef.current.material) {
        glowRef.current.material.emissiveIntensity =
          (glowRef.current.material.userData?.baseEmissive ?? glowRef.current.material.emissiveIntensity) + 2.0 * pt;
      }
    } else if (a.placed) {
      groupRef.current.scale.setScalar(1);
    }

    // ── Idle animation ──
    if (!idleType) return;
    const t = a.elapsed;

    if (idleType === 'spin') {
      if (idleRef.current) {
        if (building.type === 'wind_turbine') {
          idleRef.current.rotation.z += delta * 2;
        } else {
          idleRef.current.rotation.y += delta * 1.5;
        }
      }
    } else if (idleType === 'scan') {
      if (idleRef.current) {
        idleRef.current.rotation.y += delta * 0.4;
      }
    } else if (idleType === 'pulse_glow') {
      if (idleRef.current && idleRef.current.material) {
        if (!idleRef.current.material.userData) idleRef.current.material.userData = {};
        if (idleRef.current.material.userData.baseEmissive === undefined) {
          idleRef.current.material.userData.baseEmissive = idleRef.current.material.emissiveIntensity;
        }
        const base = idleRef.current.material.userData.baseEmissive;
        idleRef.current.material.emissiveIntensity = base + 0.4 * Math.sin(t * 2);
      }
    } else if (idleType === 'pulse_flow') {
      if (idleRef.current) {
        if (!idleRef.current.userData) idleRef.current.userData = {};
        if (idleRef.current.userData.baseY === undefined) idleRef.current.userData.baseY = idleRef.current.position.y;
        idleRef.current.position.y = idleRef.current.userData.baseY + 0.05 * Math.sin(t * 2.5);
      }
    } else if (idleType === 'breathe') {
      if (idleRef.current) {
        const s = 1.0 + 0.015 * Math.sin(t * 1.8);
        idleRef.current.scale.setScalar(s);
      }
    } else if (idleType === 'orbit') {
      if (idleRef.current) {
        idleRef.current.rotation.y += delta * 0.6;
        idleRef.current.rotation.x = 0.15 * Math.sin(t * 0.8);
      }
    }

    // ── Belt animation (conveyor/conveyor_mk2) ──
    if (BELT_TYPES[building.type]) {
      const speed = building.type === 'conveyor_mk2' ? CONVEYOR_SPEED_MK2 : CONVEYOR_SPEED_MK1;
      if (beltRef.current && beltRef.current.material && beltRef.current.material.map) {
        beltRef.current.material.map.offset.y += delta * speed * 2;
      }
      for (const roller of rollerRefs.current) {
        if (roller) roller.rotation.x += delta * speed * 6;
      }
    }

    // ── Pipe flow animation ──
    if (PIPE_TYPES[building.type] && pipeFlowRef.current) {
      pipeFlowRef.current.position.z = Math.sin(t * 2) * 0.6;
    }
  });

  return (
    <group
      ref={groupRef}
      position={building.position}
      rotation={[0, building.rotation, 0]}
      userData={{ isBuilding: true, buildingType: building.type, buildingId: building.id }}
    >
      <BuildingMesh type={building.type} idleRef={idleRef} glowRef={glowRef} beltRef={beltRef} rollerRefs={rollerRefs} pipeFlowRef={pipeFlowRef} />
    </group>
  );
}

export default function Buildings() {
  const buildings = useGameStore(s => s.buildings);
  const tickBuildings = useGameStore(s => s.tickBuildings);
  const camera = useThree(s => s.camera);

  useFrame((_, delta) => {
    tickBuildings(delta);
  });

  return (
    <group>
      {buildings.map(b => (
        <Building key={b.id} building={b} camera={camera} />
      ))}
    </group>
  );
}
