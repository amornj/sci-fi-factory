import React from 'react';
import { useGameStore } from '../store';
import { buildingDefs } from '../constants';

export default function ConveyorItems() {
  const items = useGameStore(s => s.conveyorItems);

  return (
    <group>
      {items.map(ci => {
        const def = buildingDefs[ci.conveyorType];
        if (!def) return null;

        // Compute world position along conveyor using progress
        const cosR = Math.cos(ci.rotation);
        const sinR = Math.sin(ci.rotation);
        const halfZ = def.size[2] / 2;

        // Progress goes from input (-Z local) to output (+Z local)
        const localZ = (ci.progress - 0.5) * def.size[2];
        const x = ci.position[0] + sinR * localZ;
        const y = ci.position[1] + (def.size[1] || 0.3) + 0.15;
        const z = ci.position[2] + cosR * localZ;

        return (
          <mesh key={ci.id} position={[x, y, z]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color={ci.color}
              emissive={ci.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}
