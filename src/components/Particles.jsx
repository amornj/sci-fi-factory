import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

function ParticleSystem({ particle }) {
  const ref = useRef();
  const startTime = useMemo(() => performance.now() / 1000, []);
  const velocities = useMemo(() =>
    particle.velocities.map(v => new THREE.Vector3(v[0], v[1], v[2])),
  [particle.velocities]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(12 * 3);
    for (let i = 0; i < 12; i++) {
      positions[i * 3] = particle.origin[0];
      positions[i * 3 + 1] = particle.origin[1];
      positions[i * 3 + 2] = particle.origin[2];
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [particle.origin]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const positions = ref.current.geometry.attributes.position;
    for (let j = 0; j < velocities.length; j++) {
      velocities[j].y -= 9.8 * delta;
      positions.setX(j, positions.getX(j) + velocities[j].x * delta);
      positions.setY(j, positions.getY(j) + velocities[j].y * delta);
      positions.setZ(j, positions.getZ(j) + velocities[j].z * delta);
    }
    positions.needsUpdate = true;
    ref.current.material.opacity = Math.max(0, particle.life);
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={particle.color} size={0.3} transparent opacity={1} />
    </points>
  );
}

export default function Particles() {
  const particles = useGameStore(s => s.particles);
  const tickParticles = useGameStore(s => s.tickParticles);

  useFrame((_, delta) => {
    tickParticles(delta);
  });

  return (
    <group>
      {particles.map(p => (
        <ParticleSystem key={p.id} particle={p} />
      ))}
    </group>
  );
}
