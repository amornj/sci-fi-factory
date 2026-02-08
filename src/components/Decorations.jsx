import React, { useRef, useMemo, createRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { RENDER_DISTANCE } from '../constants';

const _rdSq = RENDER_DISTANCE * RENDER_DISTANCE;

function Mushroom({ d }) {
  const color = useMemo(() => new THREE.Color().setHSL(d.hue, 0.8, 0.4), [d.hue]);
  const emissive = useMemo(() => new THREE.Color().setHSL(d.hue, 0.9, 0.2), [d.hue]);

  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.1, 0.15, d.stemHeight, 6]} />
        <meshStandardMaterial color={0x334433} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[d.capSize, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Spike({ d }) {
  return (
    <mesh>
      <coneGeometry args={[0.15, d.spikeHeight, 4]} />
      <meshStandardMaterial color={0x115533} emissive={0x002211} emissiveIntensity={0.3} roughness={0.6} />
    </mesh>
  );
}

// Orb mesh — no individual useFrame, float handled in parent batch
function OrbMesh({ d }) {
  const color = useMemo(() => new THREE.Color().setHSL(d.hue, 0.7, 0.5), [d.hue]);
  const emissive = useMemo(() => new THREE.Color().setHSL(d.hue, 0.9, 0.3), [d.hue]);

  return (
    <mesh position={[0, d.orbYOffset, 0]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.0} transparent opacity={0.8} />
    </mesh>
  );
}

function GrassClump({ d }) {
  const color = useMemo(() => new THREE.Color().setHSL(d.hue, 0.6, 0.35), [d.hue]);
  const blades = d.bladeCount || 7;
  return (
    <group>
      {Array.from({ length: blades }, (_, i) => {
        const angle = (i / blades) * Math.PI * 2 + i * 0.3;
        const dist = 0.15 + Math.random() * 0.2;
        const height = 0.4 + Math.random() * 0.5;
        const lean = (Math.random() - 0.5) * 0.3;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * dist, height / 2, Math.sin(angle) * dist]}
            rotation={[lean, angle, 0]}
          >
            <coneGeometry args={[0.03, height, 3]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function BushMesh({ d }) {
  const color = useMemo(() => new THREE.Color().setHSL(d.hue, 0.5, 0.3), [d.hue]);
  const emissive = useMemo(() => new THREE.Color().setHSL(d.hue, 0.6, 0.1), [d.hue]);
  const size = d.bushSize || 0.6;
  return (
    <group>
      {/* Trunk */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 5]} />
        <meshStandardMaterial color={0x3d2b1f} roughness={0.9} />
      </mesh>
      {/* Leaf clusters */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[size * 0.6, 7, 5]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[size * 0.3, 0.35, size * 0.2]}>
        <sphereGeometry args={[size * 0.4, 6, 4]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[-size * 0.25, 0.38, -size * 0.15]}>
        <sphereGeometry args={[size * 0.35, 6, 4]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.2} roughness={0.7} />
      </mesh>
    </group>
  );
}

function PlantMesh({ d }) {
  const color = useMemo(() => new THREE.Color().setHSL(d.hue, 0.7, 0.35), [d.hue]);
  const emissive = useMemo(() => new THREE.Color().setHSL(d.hue + 0.05, 0.8, 0.15), [d.hue]);
  const h = d.plantHeight || 1.0;
  return (
    <group>
      {/* Stem */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.04, h, 5]} />
        <meshStandardMaterial color={0x2d5a27} roughness={0.8} />
      </mesh>
      {/* Leaves — flat planes at angles */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((rot, i) => (
        <mesh
          key={i}
          position={[Math.cos(rot) * 0.12, h * 0.3 + i * h * 0.12, Math.sin(rot) * 0.12]}
          rotation={[0.4, rot, 0.3]}
        >
          <planeGeometry args={[0.2, 0.08]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} side={THREE.DoubleSide} roughness={0.6} />
        </mesh>
      ))}
      {/* Top bud */}
      <mesh position={[0, h + 0.05, 0]}>
        <sphereGeometry args={[0.06, 6, 4]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function Decorations() {
  const decorations = useGameStore(s => s.decorations);
  const camera = useThree(s => s.camera);

  // Stable refs for all decorations
  const refsMap = useRef({});
  // Extra refs for orb meshes that need float animation
  const orbRefs = useRef({});

  // Single useFrame: batch visibility culling + orb float animation
  useFrame(({ clock }) => {
    const cx = camera.position.x;
    const cz = camera.position.z;
    const elapsed = clock.getElapsedTime();

    for (let i = 0; i < decorations.length; i++) {
      const d = decorations[i];
      const ref = refsMap.current[d.id];
      if (!ref || !ref.current) continue;

      const dx = d.position[0] - cx;
      const dz = d.position[2] - cz;
      const visible = dx * dx + dz * dz < _rdSq;
      ref.current.visible = visible;

      // Animate orb float only if visible
      if (visible && d.type === 'orb') {
        const orbRef = orbRefs.current[d.id];
        if (orbRef && orbRef.current) {
          orbRef.current.position.y = d.orbYOffset + Math.sin(elapsed * 1.5 + d.floatOffset) * 0.3;
        }
      }
    }
  });

  return (
    <group>
      {decorations.map(d => {
        if (!refsMap.current[d.id]) {
          refsMap.current[d.id] = createRef();
        }
        if (d.type === 'orb' && !orbRefs.current[d.id]) {
          orbRefs.current[d.id] = createRef();
        }
        return (
          <group
            key={d.id}
            ref={refsMap.current[d.id]}
            position={d.position}
            rotation={[0, d.rotY, 0]}
            scale={[d.scale, d.scale, d.scale]}
            userData={d.type === 'mushroom' ? { isDecoration: true, decorationType: 'mushroom', decorationId: d.id } : {}}
          >
            {d.type === 'mushroom' && <Mushroom d={d} />}
            {d.type === 'spike' && <Spike d={d} />}
            {d.type === 'orb' && <OrbWithRef d={d} orbRef={orbRefs.current[d.id]} />}
            {d.type === 'grass' && <GrassClump d={d} />}
            {d.type === 'bush' && <BushMesh d={d} />}
            {d.type === 'plant' && <PlantMesh d={d} />}
          </group>
        );
      })}
    </group>
  );
}

// Thin wrapper to forward ref to the orb mesh
function OrbWithRef({ d, orbRef }) {
  const color = useMemo(() => new THREE.Color().setHSL(d.hue, 0.7, 0.5), [d.hue]);
  const emissive = useMemo(() => new THREE.Color().setHSL(d.hue, 0.9, 0.3), [d.hue]);

  return (
    <mesh ref={orbRef} position={[0, d.orbYOffset, 0]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.0} transparent opacity={0.8} />
    </mesh>
  );
}
