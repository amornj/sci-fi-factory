import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { WORLD_SIZE, TERRAIN_SEGMENTS } from '../constants';
import { simplex } from '../noise';

export default function Terrain() {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      let h = 0;
      h += simplex.noise(x * 0.003, z * 0.003) * 40;  // continental-scale hills
      h += simplex.noise(x * 0.008, z * 0.008) * 20;
      h += simplex.noise(x * 0.02, z * 0.02) * 8;
      h += simplex.noise(x * 0.06, z * 0.06) * 3;
      const dist = Math.sqrt(x * x + z * z);
      if (dist < 40) h *= dist / 40;
      positions.setY(i, h);
    }
    geo.computeVertexNormals();

    const colors = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const x = positions.getX(i);
      const z = positions.getZ(i);
      let r, g, b;
      if (y < -15) { r = 0.04; g = 0.03; b = 0.10; }       // deep valleys
      else if (y < -5) { r = 0.06; g = 0.05; b = 0.12; }    // low ground
      else if (y < 5) { r = 0.06; g = 0.15; b = 0.10; }     // plains
      else if (y < 15) { r = 0.15; g = 0.12; b = 0.10; }    // rocky hills
      else if (y < 30) { r = 0.12; g = 0.10; b = 0.15; }    // highlands
      else { r = 0.08; g = 0.12; b = 0.22; }                 // peaks
      const n = simplex.noise(x * 0.05, z * 0.05) * 0.03;
      colors[i * 3] = r + n;
      colors[i * 3 + 1] = g + n;
      colors[i * 3 + 2] = b + n;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        receiveShadow
        userData={{ isTerrain: true }}
        name="terrain"
      >
        <meshStandardMaterial
          color={0x1a2a1a}
          roughness={0.85}
          metalness={0.15}
          flatShading
          vertexColors
        />
      </mesh>
      <gridHelper
        args={[WORLD_SIZE, WORLD_SIZE / 2, 0x003333, 0x001a1a]}
        position={[0, 0.05, 0]}
        material-transparent
        material-opacity={0.15}
      />
    </group>
  );
}
