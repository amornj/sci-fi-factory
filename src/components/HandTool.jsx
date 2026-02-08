import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { weaponDefs } from '../constants';
import { keys } from '../input';

// Animation phases
const PHASE_IDLE = 0;
const PHASE_WINDUP = 1;
const PHASE_STRIKE = 2;
const PHASE_RECOVERY = 3;
const PHASE_FIRE = 4;

const WINDUP_DUR = 0.15;
const STRIKE_DUR = 0.12;
const RECOVERY_DUR = 0.22;
const FIRE_DUR = 0.15;

const easeOut = t => 1 - (1 - t) * (1 - t);
const easeIn = t => t * t;
const smoothstep = t => t * t * (3 - 2 * t);

const _offset = new THREE.Vector3();
const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();

// Material prop objects (R3F creates instances per mesh)
const SKIN = { color: 0xddaa88, emissive: 0x553320, emissiveIntensity: 0.3, roughness: 0.65, metalness: 0.02 };
const SKIN_UNDER = { color: 0xcc9977, emissive: 0x442211, emissiveIntensity: 0.25, roughness: 0.6, metalness: 0.02 };
const SKIN_JOINT = { color: 0xc49070, emissive: 0x3a1a0a, emissiveIntensity: 0.2, roughness: 0.7, metalness: 0.02 };
const NAIL_MAT = { color: 0xeeccbb, emissive: 0x443322, emissiveIntensity: 0.15, roughness: 0.4, metalness: 0.1 };

// Grip presets — finger: [proxCurl, midCurl, distCurl], thumb: [baseCurl, tipCurl, spread]
const GRIPS = {
  open: {
    f: [[0.25, 0.30, 0.20], [0.22, 0.28, 0.18], [0.25, 0.30, 0.20], [0.30, 0.35, 0.22]],
    t: [0.12, 0.15, 0.50]
  },
  grip: {
    f: [[1.55, 1.70, 1.15], [1.50, 1.65, 1.10], [1.55, 1.70, 1.15], [1.60, 1.75, 1.20]],
    t: [0.70, 1.10, 0.20]
  },
  chisel: {
    f: [[0.30, 0.35, 0.22], [1.50, 1.65, 1.10], [1.55, 1.70, 1.15], [1.60, 1.75, 1.20]],
    t: [0.65, 1.05, 0.20]
  },
  trigger: {
    f: [[0.90, 1.10, 0.70], [1.50, 1.65, 1.10], [1.55, 1.70, 1.15], [1.60, 1.75, 1.20]],
    t: [0.45, 0.65, 0.25]
  },
  fist: {
    f: [[1.50, 1.60, 1.10], [1.45, 1.55, 1.05], [1.50, 1.60, 1.10], [1.55, 1.65, 1.15]],
    t: [0.95, 1.30, 0.10]
  },
};

// Finger anatomy — pos=knuckle position, splay=static Z rot, 3 segments with length+radii
const FINGER_LAYOUT = [
  { pos: [-0.021, 0.054, 0.008], splay: 0.06,
    pLen: 0.033, pR: [0.0100, 0.0092],
    mLen: 0.023, mR: [0.0092, 0.0082],
    dLen: 0.017, dR: [0.0082, 0.0062],
    jR: [0.0100, 0.0092, 0.0082] },
  { pos: [-0.006, 0.058, 0.008], splay: 0.01,
    pLen: 0.037, pR: [0.0108, 0.0100],
    mLen: 0.026, mR: [0.0100, 0.0088],
    dLen: 0.019, dR: [0.0088, 0.0068],
    jR: [0.0108, 0.0098, 0.0088] },
  { pos: [0.009, 0.055, 0.008], splay: -0.04,
    pLen: 0.033, pR: [0.0100, 0.0092],
    mLen: 0.023, mR: [0.0092, 0.0082],
    dLen: 0.017, dR: [0.0082, 0.0062],
    jR: [0.0100, 0.0092, 0.0082] },
  { pos: [0.021, 0.049, 0.007], splay: -0.12,
    pLen: 0.027, pR: [0.0085, 0.0078],
    mLen: 0.019, mR: [0.0078, 0.0068],
    dLen: 0.014, dR: [0.0068, 0.0052],
    jR: [0.0085, 0.0078, 0.0068] },
];

const TOOL_GRIP_MAP = { hand: 'open', pickaxe: 'grip', chisel: 'chisel', ladle: 'grip', beaker: 'grip' };

function cloneGrip(g) {
  return { f: g.f.map(a => [...a]), t: [...g.t] };
}

// ── HAND MODEL (single shared instance, joints animated via refs) ──

function HandModel({ jointRefs }) {
  return (
    <group>
      {/* Forearm */}
      <mesh position={[0, -0.052, 0.010]} rotation={[0.08, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.030, 0.075, 10]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>
      {/* Wrist joint */}
      <mesh position={[0, -0.012, 0.008]} scale={[1, 0.8, 0.7]}>
        <sphereGeometry args={[0.032, 10, 8]} />
        <meshStandardMaterial {...SKIN_JOINT} />
      </mesh>

      {/* Palm — flat box base with muscle pads */}
      <mesh position={[0, 0.022, 0.002]} scale={[1, 1, 0.88]}>
        <boxGeometry args={[0.074, 0.058, 0.042]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>
      <mesh position={[0, 0.022, -0.012]} scale={[0.95, 0.90, 0.85]}>
        <sphereGeometry args={[0.038, 10, 8]} />
        <meshStandardMaterial {...SKIN_UNDER} />
      </mesh>
      <mesh position={[0, 0.046, 0.010]} scale={[1.15, 0.45, 0.88]}>
        <sphereGeometry args={[0.036, 10, 8]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>
      {/* Thenar eminence (thumb side) */}
      <mesh position={[-0.026, 0.014, -0.008]} scale={[0.75, 1.0, 0.55]}>
        <sphereGeometry args={[0.020, 8, 6]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>
      {/* Hypothenar (pinky side) */}
      <mesh position={[0.024, 0.010, -0.008]} scale={[0.55, 0.85, 0.50]}>
        <sphereGeometry args={[0.016, 8, 6]} />
        <meshStandardMaterial {...SKIN} />
      </mesh>

      {/* Knuckle bumps */}
      {FINGER_LAYOUT.map((fl, i) => (
        <mesh key={`k${i}`} position={[fl.pos[0], fl.pos[1], fl.pos[2] + 0.006]} scale={[1, 0.65, 0.75]}>
          <sphereGeometry args={[fl.jR[0] * 1.15, 7, 5]} />
          <meshStandardMaterial {...SKIN_JOINT} />
        </mesh>
      ))}

      {/* 4 Fingers — 3 segments each */}
      {FINGER_LAYOUT.map((fl, i) => {
        const pH = fl.pLen / 2;
        const mH = fl.mLen / 2;
        const dH = fl.dLen / 2;
        return (
          <group key={`f${i}`} position={fl.pos} rotation={[0, 0, fl.splay]}>
            <group ref={el => { if (jointRefs) jointRefs[`f${i}p`] = el; }}>
              <mesh position={[0, pH, 0]}>
                <cylinderGeometry args={[fl.pR[0], fl.pR[1], fl.pLen, 8]} />
                <meshStandardMaterial {...SKIN} />
              </mesh>
              <mesh position={[0, fl.pLen, 0]} scale={[1, 0.75, 0.85]}>
                <sphereGeometry args={[fl.jR[1], 7, 5]} />
                <meshStandardMaterial {...SKIN_JOINT} />
              </mesh>
              <group position={[0, fl.pLen, 0]} ref={el => { if (jointRefs) jointRefs[`f${i}m`] = el; }}>
                <mesh position={[0, mH, 0]}>
                  <cylinderGeometry args={[fl.mR[0], fl.mR[1], fl.mLen, 8]} />
                  <meshStandardMaterial {...SKIN} />
                </mesh>
                <mesh position={[0, fl.mLen, 0]} scale={[1, 0.7, 0.8]}>
                  <sphereGeometry args={[fl.jR[2], 7, 5]} />
                  <meshStandardMaterial {...SKIN_JOINT} />
                </mesh>
                <group position={[0, fl.mLen, 0]} ref={el => { if (jointRefs) jointRefs[`f${i}d`] = el; }}>
                  <mesh position={[0, dH, 0]}>
                    <cylinderGeometry args={[fl.dR[0], fl.dR[1], fl.dLen, 8]} />
                    <meshStandardMaterial {...SKIN_UNDER} />
                  </mesh>
                  <mesh position={[0, fl.dLen - 0.002, 0]} scale={[1, 0.75, 0.85]}>
                    <sphereGeometry args={[fl.dR[1] * 1.15, 6, 4]} />
                    <meshStandardMaterial {...SKIN_UNDER} />
                  </mesh>
                  <mesh position={[0, fl.dLen * 0.6, fl.dR[0] * 1.1]} scale={[0.70, 0.45, 0.22]}>
                    <sphereGeometry args={[fl.dR[0] * 1.5, 5, 4]} />
                    <meshStandardMaterial {...NAIL_MAT} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        );
      })}

      {/* Thumb — 2 segments */}
      <group position={[-0.033, 0.020, -0.002]} rotation={[0, 0.30, 0]}>
        <group ref={el => { if (jointRefs) jointRefs.tb = el; }}>
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.0120, 0.0110, 0.030, 8]} />
            <meshStandardMaterial {...SKIN} />
          </mesh>
          <mesh position={[0, 0.030, 0]} scale={[1, 0.75, 0.85]}>
            <sphereGeometry args={[0.0110, 7, 5]} />
            <meshStandardMaterial {...SKIN_JOINT} />
          </mesh>
          <group position={[0, 0.030, 0]} ref={el => { if (jointRefs) jointRefs.tt = el; }}>
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.0100, 0.0082, 0.022, 8]} />
              <meshStandardMaterial {...SKIN_UNDER} />
            </mesh>
            <mesh position={[0, 0.023, 0]} scale={[1, 0.75, 0.85]}>
              <sphereGeometry args={[0.0085, 6, 4]} />
              <meshStandardMaterial {...SKIN_UNDER} />
            </mesh>
            <mesh position={[0, 0.019, 0.009]} scale={[0.75, 0.45, 0.22]}>
              <sphereGeometry args={[0.0105, 5, 4]} />
              <meshStandardMaterial {...NAIL_MAT} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

// ── TOOL-ONLY MODELS (no hand, just tool geometry) ──

function PickaxeTool() {
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {/* Handle */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.32, 6]} />
        <meshStandardMaterial color={0x664422} emissive={0x221100} emissiveIntensity={0.25} roughness={0.8} />
      </mesh>
      {/* Pick point — now faces forward (-Z in world) */}
      <mesh position={[-0.05, 0.44, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.035, 0.2, 4]} />
        <meshStandardMaterial color={0x8888aa} emissive={0x222233} emissiveIntensity={0.2} roughness={0.25} metalness={0.8} />
      </mesh>
      {/* Back block */}
      <mesh position={[0.06, 0.44, 0]}>
        <boxGeometry args={[0.06, 0.05, 0.04]} />
        <meshStandardMaterial color={0x8888aa} emissive={0x222233} emissiveIntensity={0.2} roughness={0.25} metalness={0.8} />
      </mesh>
      {/* Head mount */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.05, 0.06, 0.045]} />
        <meshStandardMaterial color={0x777799} emissive={0x111122} emissiveIntensity={0.2} roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

function ChiselTool() {
  return (
    <group>
      <mesh position={[0, 0.18, -0.02]}>
        <cylinderGeometry args={[0.014, 0.014, 0.20, 6]} />
        <meshStandardMaterial color={0x999999} emissive={0x222222} emissiveIntensity={0.2} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.30, -0.02]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.035, 0.045, 0.006]} />
        <meshStandardMaterial color={0xaaaacc} emissive={0x333344} emissiveIntensity={0.3} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[-0.09, 0.1, 0.02]}>
        <boxGeometry args={[0.045, 0.045, 0.045]} />
        <meshStandardMaterial color={0x777788} emissive={0x222233} emissiveIntensity={0.2} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-0.09, 0.02, 0.02]}>
        <cylinderGeometry args={[0.01, 0.012, 0.14, 5]} />
        <meshStandardMaterial color={0x664422} emissive={0x221100} emissiveIntensity={0.25} roughness={0.8} />
      </mesh>
    </group>
  );
}

function LadleTool() {
  return (
    <group>
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.014, 0.018, 0.26, 6]} />
        <meshStandardMaterial color={0x664422} emissive={0x221100} emissiveIntensity={0.25} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.38, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.065, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={0x8888aa} emissive={0x222233} emissiveIntensity={0.2} roughness={0.3} metalness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.065, 0.005, 6, 12]} />
        <meshStandardMaterial color={0x999999} emissive={0x222222} emissiveIntensity={0.2} metalness={0.7} />
      </mesh>
    </group>
  );
}

function StunBatonTool() {
  return (
    <group>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.016, 0.02, 0.24, 6]} />
        <meshStandardMaterial color={0x333344} emissive={0x111122} emissiveIntensity={0.2} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.40, 0]}>
        <cylinderGeometry args={[0.012, 0.014, 0.14, 6]} />
        <meshStandardMaterial color={0x44ccff} emissive={0x2288cc} emissiveIntensity={0.8} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.018, 6, 4]} />
        <meshStandardMaterial color={0x44ccff} emissive={0x44ccff} emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function EnergySwordTool() {
  return (
    <group>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.02, 0.022, 0.10, 6]} />
        <meshStandardMaterial color={0x333333} emissive={0x111111} emissiveIntensity={0.2} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.06, 0.01, 0.03]} />
        <meshStandardMaterial color={0x444444} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <boxGeometry args={[0.006, 0.32, 0.025]} />
        <meshStandardMaterial color={0x00ff88} emissive={0x00ff88} emissiveIntensity={2} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <boxGeometry args={[0.015, 0.32, 0.04]} />
        <meshStandardMaterial color={0x00ff88} emissive={0x00ff88} emissiveIntensity={0.5} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function PlasmaPistolTool() {
  return (
    <group>
      <mesh position={[0, 0.12, 0.02]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.025, 0.07, 0.035]} />
        <meshStandardMaterial color={0x444444} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.16, -0.04]}>
        <boxGeometry args={[0.03, 0.035, 0.1]} />
        <meshStandardMaterial color={0x555555} emissive={0x221122} emissiveIntensity={0.2} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.16, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.08, 6]} />
        <meshStandardMaterial color={0xff4488} emissive={0xff2266} emissiveIntensity={0.6} roughness={0.2} metalness={0.5} />
      </mesh>
    </group>
  );
}

function PulseRifleTool() {
  return (
    <group>
      <mesh position={[0, 0.10, 0.06]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.025, 0.04, 0.08]} />
        <meshStandardMaterial color={0x333333} roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.15, -0.04]}>
        <boxGeometry args={[0.03, 0.04, 0.18]} />
        <meshStandardMaterial color={0x444466} emissive={0x112244} emissiveIntensity={0.2} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.15, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.012, 0.12, 6]} />
        <meshStandardMaterial color={0x4488ff} emissive={0x2244cc} emissiveIntensity={0.5} roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.185, -0.02]}>
        <cylinderGeometry args={[0.008, 0.008, 0.06, 6]} />
        <meshStandardMaterial color={0x222222} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

function ScatterGunTool() {
  return (
    <group>
      <mesh position={[0, 0.12, 0.02]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.03, 0.07, 0.04]} />
        <meshStandardMaterial color={0x553322} roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, -0.03]}>
        <boxGeometry args={[0.04, 0.04, 0.12]} />
        <meshStandardMaterial color={0x555544} emissive={0x222211} emissiveIntensity={0.2} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.16, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.014, 0.1, 8]} />
        <meshStandardMaterial color={0xffaa00} emissive={0xcc8800} emissiveIntensity={0.4} roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

function BeakerTool() {
  return (
    <group>
      {/* Glass cylinder body */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.032, 0.028, 0.18, 8, 1, true]} />
        <meshStandardMaterial color={0x88ccff} emissive={0x224466} emissiveIntensity={0.3} transparent opacity={0.4} roughness={0.1} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Beaker bottom (solid) */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.005, 8]} />
        <meshStandardMaterial color={0x88ccff} emissive={0x224466} emissiveIntensity={0.2} transparent opacity={0.5} roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.032, 0.003, 6, 12]} />
        <meshStandardMaterial color={0xaaddff} emissive={0x446688} emissiveIntensity={0.3} roughness={0.15} metalness={0.4} />
      </mesh>
      {/* Pour spout */}
      <mesh position={[-0.03, 0.31, 0]} rotation={[0.3, 0, -0.3]}>
        <boxGeometry args={[0.015, 0.008, 0.02]} />
        <meshStandardMaterial color={0x88ccff} transparent opacity={0.5} roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Water fill inside */}
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.08, 8]} />
        <meshStandardMaterial color={0x2288ff} emissive={0x1166cc} emissiveIntensity={0.6} transparent opacity={0.6} />
      </mesh>
      {/* Graduation marks */}
      <mesh position={[0.031, 0.20, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.001, 0.008, 0.001]} />
        <meshStandardMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.031, 0.24, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.001, 0.008, 0.001]} />
        <meshStandardMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// ── MAIN COMPONENT ──

export default function HandTool() {
  const { camera } = useThree();
  const groupRef = useRef();
  const pickaxeRef = useRef();
  const chiselRef = useRef();
  const ladleRef = useRef();
  const stunBatonRef = useRef();
  const energySwordRef = useRef();
  const plasmaPistolRef = useRef();
  const pulseRifleRef = useRef();
  const scatterGunRef = useRef();
  const beakerRef = useRef();
  const muzzleFlashRef = useRef();

  // Joint refs populated by HandModel via callback refs
  const jointRefs = useRef({});
  // Current grip values (lerped each frame toward target)
  const gripCurrent = useRef(cloneGrip(GRIPS.open));

  const anim = useRef({
    phase: PHASE_IDLE,
    timer: 0,
    currentTool: 'hand',
    lastActionT: 0,
    muzzleFlash: 0,
    actionType: null,
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const gs = useGameStore.getState();
    const a = anim.current;
    const jr = jointRefs.current;

    if (!gs.locked || gs.craftingOpen) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // Tick weapon cooldown
    gs.tickWeaponCooldown(delta);

    // Determine tool
    let desiredTool;
    if (gs.weaponMode && gs.currentWeapon) {
      desiredTool = gs.currentWeapon;
    } else {
      const TOOL_MAP = { rock: 'pickaxe', crystal: 'chisel', blob: 'ladle', mushroom: 'hand', liquid: 'beaker' };
      desiredTool = TOOL_MAP[gs.targetShape] || 'hand';
    }

    if (desiredTool !== a.currentTool && a.phase === PHASE_IDLE) {
      a.currentTool = desiredTool;
    }

    // Toggle tool-geometry visibility (hand always visible)
    const ct = a.currentTool;
    if (pickaxeRef.current) pickaxeRef.current.visible = ct === 'pickaxe';
    if (chiselRef.current) chiselRef.current.visible = ct === 'chisel';
    if (ladleRef.current) ladleRef.current.visible = ct === 'ladle';
    if (stunBatonRef.current) stunBatonRef.current.visible = ct === 'stun_baton';
    if (energySwordRef.current) energySwordRef.current.visible = ct === 'energy_sword';
    if (plasmaPistolRef.current) plasmaPistolRef.current.visible = ct === 'plasma_pistol';
    if (pulseRifleRef.current) pulseRifleRef.current.visible = ct === 'pulse_rifle';
    if (scatterGunRef.current) scatterGunRef.current.visible = ct === 'scatter_gun';
    if (beakerRef.current) beakerRef.current.visible = ct === 'beaker';

    // Muzzle flash decay
    if (a.muzzleFlash > 0) {
      a.muzzleFlash = Math.max(0, a.muzzleFlash - delta * 15);
    }
    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.visible = a.muzzleFlash > 0;
      if (a.muzzleFlash > 0) {
        muzzleFlashRef.current.scale.setScalar(a.muzzleFlash * 0.05);
      }
    }

    // Trigger animation from toolAction
    if (gs.toolAction && gs.toolAction.t !== a.lastActionT) {
      a.lastActionT = gs.toolAction.t;
      a.actionType = gs.toolAction.type || null;
      if (a.phase === PHASE_IDLE) {
        const isWeapon = gs.weaponMode && gs.currentWeapon;
        const wDef = isWeapon ? weaponDefs[gs.currentWeapon] : null;
        if (wDef && (wDef.type === 'ranged' || wDef.type === 'ranged_spread')) {
          a.phase = PHASE_FIRE;
          a.timer = 0;
          a.muzzleFlash = 1;
        } else {
          a.phase = PHASE_WINDUP;
          a.timer = 0;
        }
      }
    }

    // ── DETERMINE TARGET GRIP ──
    let targetGripName;
    if (gs.weaponMode && gs.currentWeapon) {
      const wDef = weaponDefs[gs.currentWeapon];
      targetGripName = (wDef && wDef.type === 'melee') ? 'grip' : 'trigger';
    } else if (ct === 'hand') {
      targetGripName = (a.phase === PHASE_WINDUP || a.phase === PHASE_STRIKE) ? 'fist' : 'open';
    } else {
      targetGripName = TOOL_GRIP_MAP[ct] || 'grip';
    }

    // ── LERP GRIP VALUES ──
    const targetGrip = GRIPS[targetGripName] || GRIPS.open;
    const gc = gripCurrent.current;
    const lerpFactor = Math.min(1, delta * 14);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        gc.f[i][j] += (targetGrip.f[i][j] - gc.f[i][j]) * lerpFactor;
      }
    }
    for (let j = 0; j < 3; j++) {
      gc.t[j] += (targetGrip.t[j] - gc.t[j]) * lerpFactor;
    }

    // ── APPLY GRIP TO JOINT REFS ──
    for (let i = 0; i < 4; i++) {
      if (jr[`f${i}p`]) jr[`f${i}p`].rotation.x = -gc.f[i][0];
      if (jr[`f${i}m`]) jr[`f${i}m`].rotation.x = -gc.f[i][1];
      if (jr[`f${i}d`]) jr[`f${i}d`].rotation.x = -gc.f[i][2];
    }
    if (jr.tb) jr.tb.rotation.set(-gc.t[0], 0, gc.t[2]);
    if (jr.tt) jr.tt.rotation.x = -gc.t[1];

    // ── POSITION / ROTATION ANIMATION ──
    const moving = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'];
    const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const bobSpeed = isSprinting ? 12 : 7;
    const bobAmt = isSprinting ? 0.02 : 0.012;
    const time = performance.now() / 1000;
    const bobY = moving ? Math.sin(time * bobSpeed) * bobAmt : 0;
    const bobX = moving ? Math.cos(time * bobSpeed * 0.5) * bobAmt * 0.5 : 0;

    const idleY = Math.sin(time * 1.2) * 0.003;
    const idleX = Math.cos(time * 0.8) * 0.002;

    let animOffsetY = 0;
    let animOffsetX = 0;
    let animOffsetZ = 0;
    let animRotX = 0;
    let animRotZ = 0;
    let wristTwist = 0;

    if (a.phase === PHASE_FIRE) {
      a.timer += delta;
      const t = a.timer / FIRE_DUR;
      if (t < 0.3) {
        const k = easeOut(t / 0.3);
        animOffsetY = k * 0.03;
        animRotX = -k * 0.15;
      } else {
        const k = smoothstep((t - 0.3) / 0.7);
        animOffsetY = 0.03 * (1 - k);
        animRotX = -0.15 * (1 - k);
      }
      if (t >= 1) { a.phase = PHASE_IDLE; a.timer = 0; gs.clearToolAction(); }
    } else if (a.phase === PHASE_WINDUP) {
      a.timer += delta;
      const t = easeOut(Math.min(a.timer / WINDUP_DUR, 1));
      const isWeaponMelee = gs.weaponMode && gs.currentWeapon &&
        weaponDefs[gs.currentWeapon] && weaponDefs[gs.currentWeapon].type === 'melee';
      if (isWeaponMelee) {
        animOffsetY = t * 0.12;
        animRotX = -t * 0.4;
        animRotZ = t * 0.2;
        wristTwist = t * 0.2;
      } else if (ct === 'hand') {
        if (a.actionType === 'pickup') {
          // Reach forward slightly, start dipping
          animOffsetZ = -t * 0.06;
          animOffsetY = -t * 0.02;
        } else {
          // Punch wind-up
          animOffsetY = t * 0.08;
          animRotX = -t * 0.35;
          wristTwist = t * 0.15;
        }
      } else if (ct === 'pickaxe' || ct === 'chisel' || ct === 'ladle' || ct === 'beaker') {
        // All mining tools: raise up before swing
        animOffsetY = t * 0.15;
        animRotX = -t * 0.5;
        wristTwist = t * 0.25;
      } else {
        animOffsetY = t * 0.08;
        animRotX = -t * 0.3;
        wristTwist = t * 0.15;
      }
      if (a.timer >= WINDUP_DUR) { a.phase = PHASE_STRIKE; a.timer = 0; }
    } else if (a.phase === PHASE_STRIKE) {
      a.timer += delta;
      const t = easeIn(Math.min(a.timer / STRIKE_DUR, 1));
      const isWeaponMelee = gs.weaponMode && gs.currentWeapon &&
        weaponDefs[gs.currentWeapon] && weaponDefs[gs.currentWeapon].type === 'melee';
      if (isWeaponMelee) {
        animOffsetY = 0.12 - t * 0.2;
        animRotX = -0.4 + t * 0.8;
        animRotZ = 0.2 - t * 0.4;
        wristTwist = 0.2 - t * 0.4;
      } else if (ct === 'hand') {
        if (a.actionType === 'pickup') {
          // Pull hand straight up (the actual grab-and-lift)
          animOffsetZ = -0.06;
          animOffsetY = -0.02 + t * 0.16;
        } else {
          // Punch downswing
          animOffsetY = 0.08 - t * 0.18;
          animRotX = -0.35 + t * 0.7;
          wristTwist = 0.15 - t * 0.3;
        }
      } else if (ct === 'pickaxe' || ct === 'chisel' || ct === 'ladle' || ct === 'beaker') {
        // All mining tools: swing down
        animOffsetY = 0.15 - t * 0.30;
        animRotX = -0.5 + t * 1.0;
        wristTwist = 0.25 - t * 0.4;
      } else {
        animOffsetY = 0.08 - t * 0.14;
        animRotX = -0.3 + t * 0.6;
        wristTwist = 0.15 - t * 0.3;
      }
      if (a.timer >= STRIKE_DUR) { a.phase = PHASE_RECOVERY; a.timer = 0; }
    } else if (a.phase === PHASE_RECOVERY) {
      a.timer += delta;
      const t = Math.min(a.timer / RECOVERY_DUR, 1);
      const ease = smoothstep(t);
      const isWeaponMelee = gs.weaponMode && gs.currentWeapon &&
        weaponDefs[gs.currentWeapon] && weaponDefs[gs.currentWeapon].type === 'melee';
      if (isWeaponMelee) {
        animOffsetY = -0.08 * (1 - ease);
        animRotX = 0.4 * (1 - ease);
        animRotZ = -0.2 * (1 - ease);
        wristTwist = -0.2 * (1 - ease);
      } else if (ct === 'hand') {
        if (a.actionType === 'pickup') {
          // Return from lifted position to idle
          animOffsetZ = -0.06 * (1 - ease);
          animOffsetY = 0.14 * (1 - ease);
        } else {
          // Return from punch
          animOffsetY = -0.10 * (1 - ease);
          animRotX = 0.35 * (1 - ease);
          wristTwist = -0.15 * (1 - ease);
        }
      } else if (ct === 'pickaxe' || ct === 'chisel' || ct === 'ladle' || ct === 'beaker') {
        // All mining tools: return to idle
        animOffsetY = -0.15 * (1 - ease);
        animRotX = 0.5 * (1 - ease);
        wristTwist = -0.15 * (1 - ease);
      } else {
        animOffsetY = -0.06 * (1 - ease);
        animRotX = 0.3 * (1 - ease);
        wristTwist = -0.15 * (1 - ease);
      }
      if (t >= 1) { a.phase = PHASE_IDLE; a.timer = 0; gs.clearToolAction(); }
    }

    _offset.set(
      0.28 + bobX + idleX + animOffsetX,
      -0.26 + bobY + idleY + animOffsetY,
      -0.4 + animOffsetZ
    );
    _offset.applyQuaternion(camera.quaternion);
    groupRef.current.position.copy(camera.position).add(_offset);

    groupRef.current.quaternion.copy(camera.quaternion);
    _euler.set(animRotX, 0, animRotZ + wristTwist);
    _quat.setFromEuler(_euler);
    groupRef.current.quaternion.multiply(_quat);
  });

  return (
    <group ref={groupRef} scale={[1.8, 1.8, 1.8]}>
      <pointLight color={0xffeedd} intensity={0.5} distance={1.5} decay={2} position={[0, 0.05, -0.1]} />
      <HandModel jointRefs={jointRefs.current} />
      {/* Tool geometries — positioned in palm grip zone */}
      <group ref={pickaxeRef} visible={false} position={[0, -0.07, 0]}><PickaxeTool /></group>
      <group ref={chiselRef} visible={false} position={[0, -0.05, 0]}><ChiselTool /></group>
      <group ref={ladleRef} visible={false} position={[0, -0.07, 0]}><LadleTool /></group>
      <group ref={stunBatonRef} visible={false} position={[0, -0.07, 0]}><StunBatonTool /></group>
      <group ref={energySwordRef} visible={false} position={[0, -0.08, 0]}><EnergySwordTool /></group>
      <group ref={plasmaPistolRef} visible={false} position={[0, -0.06, 0]}><PlasmaPistolTool /></group>
      <group ref={pulseRifleRef} visible={false} position={[0, -0.05, 0]}><PulseRifleTool /></group>
      <group ref={scatterGunRef} visible={false} position={[0, -0.06, 0]}><ScatterGunTool /></group>
      <group ref={beakerRef} visible={false} position={[0, -0.10, 0]}><BeakerTool /></group>
      {/* Muzzle flash */}
      <mesh ref={muzzleFlashRef} position={[0, 0.1, -0.2]} visible={false}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial color={0xffffff} emissive={0xffaa44} emissiveIntensity={3} transparent opacity={0.6} toneMapped={false} />
      </mesh>
    </group>
  );
}
