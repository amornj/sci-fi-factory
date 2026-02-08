import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

const _projectileGeo = new THREE.SphereGeometry(0.12, 6, 4);

export default function Projectiles() {
  const projectiles = useGameStore(s => s.projectiles);

  useFrame((_, delta) => {
    useGameStore.getState().tickProjectiles(delta);
  });

  return (
    <>
      {projectiles.map(p => (
        <mesh key={p.id} position={p.position} geometry={_projectileGeo}>
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}
