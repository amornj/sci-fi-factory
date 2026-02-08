import React from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../store';

export default function DamageNumbers() {
  const damageNumbers = useGameStore(s => s.damageNumbers);

  return (
    <group>
      {damageNumbers.map(dn => {
        const opacity = dn.life < 0.3 ? dn.life / 0.3 : 1;
        const yOff = (1.2 - dn.life) * 2;
        return (
          <group key={dn.id} position={[dn.position[0], dn.position[1] + yOff, dn.position[2]]}>
            <Html center style={{ pointerEvents: 'none' }}>
              <div style={{
                color: dn.color,
                fontSize: dn.isCrit ? '24px' : '16px',
                fontFamily: "'Courier New', monospace",
                fontWeight: 'bold',
                textShadow: `0 0 6px ${dn.color}, 0 2px 4px rgba(0,0,0,0.8)`,
                opacity,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}>
                {dn.isCrit ? 'CRIT ' : ''}{dn.amount}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
