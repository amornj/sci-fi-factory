import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { buildingDefs, GRID_SNAP } from '../constants';

const _raycaster = new THREE.Raycaster();
const _center = new THREE.Vector2(0, 0);

export default function GhostBuilding() {
  const selectedBuild = useGameStore(s => s.selectedBuild);
  const buildRotation = useGameStore(s => s.buildRotation);
  const groupRef = useRef();
  const { camera, scene } = useThree();

  useFrame(() => {
    if (!groupRef.current || !selectedBuild) return;
    groupRef.current.visible = true;

    _raycaster.setFromCamera(_center, camera);
    // Find the terrain mesh
    let terrain = null;
    scene.traverse(child => {
      if (child.userData && child.userData.isTerrain) terrain = child;
    });
    if (!terrain) return;

    const hits = _raycaster.intersectObject(terrain);
    if (hits.length > 0) {
      const p = hits[0].point;
      groupRef.current.position.set(
        Math.round(p.x / GRID_SNAP) * GRID_SNAP,
        p.y,
        Math.round(p.z / GRID_SNAP) * GRID_SNAP
      );
      groupRef.current.rotation.y = buildRotation;
    }
  });

  if (!selectedBuild) return null;

  const def = buildingDefs[selectedBuild];
  const [w, h, d] = def.size;

  return (
    <group ref={groupRef}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={def.color}
          transparent
          opacity={0.4}
          emissive={def.color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}
