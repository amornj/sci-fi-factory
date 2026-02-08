import React, { useMemo } from 'react';
import * as THREE from 'three';
import { buildingDefs } from '../constants';

function darken(hex, factor = 0.4) {
  const r = ((hex >> 16) & 0xff) * factor;
  const g = ((hex >> 8) & 0xff) * factor;
  const b = (hex & 0xff) * factor;
  return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
}

// Create a striped canvas texture for conveyor belts
function createBeltTexture(mk2) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = mk2 ? '#334466' : '#2a2a2a';
  ctx.fillRect(0, 0, 32, 64);
  ctx.fillStyle = mk2 ? '#556688' : '#444444';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(0, i * 16, 32, 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  return tex;
}

export default function BuildingMesh({ type, idleRef, glowRef, beltRef, rollerRefs, pipeFlowRef }) {
  const def = buildingDefs[type];
  if (!def) return null;
  const [w, h, d] = def.size;

  // ═══════════════════════════════════════════════
  //  CORE
  // ═══════════════════════════════════════════════

  if (type === 'hub') {
    return (
      <group>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w / 2, w / 2 + 0.3, 0.6, 6]} />
          <meshStandardMaterial color={0x1a3330} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, h * 0.36, 0]} castShadow receiveShadow>
          <sphereGeometry args={[w * 0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={def.color} metalness={0.5} roughness={0.3} transparent opacity={0.85} />
        </mesh>
        <mesh ref={glowRef} position={[0, h * 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, h * 0.4, 8]} />
          <meshStandardMaterial color={0x88ffdd} emissive={0x44ffaa} emissiveIntensity={0.8} />
        </mesh>
        <mesh ref={idleRef} position={[0, h * 0.64, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[w * 0.36, 0.04, 8, 24]} />
          <meshStandardMaterial color={0x00ffaa} emissive={0x00ffaa} emissiveIntensity={1.2} transparent opacity={0.6} />
        </mesh>
        {[-1, 1].map(side => (
          <mesh key={side} position={[side * w * 0.25, h * 0.5, 0]} castShadow>
            <coneGeometry args={[0.1, h * 0.3, 4]} />
            <meshStandardMaterial color={0xaaffcc} emissive={0x44ff88} emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  PRODUCTION
  // ═══════════════════════════════════════════════

  if (type === 'miner') {
    return (
      <group>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.5, d]} />
          <meshStandardMaterial color={0x223344} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.7, h - 0.5, d * 0.7]} />
          <meshStandardMaterial color={def.color} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh ref={idleRef} position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[w * 0.1, h * 0.3, 6]} />
          <meshStandardMaterial color={0xff4400} emissive={0x881100} emissiveIntensity={0.5} />
        </mesh>
        <mesh ref={glowRef} position={[0, h - 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[w * 0.4, 0.08, 8, 16]} />
          <meshStandardMaterial color={0x00ffff} emissive={0x00ffff} emissiveIntensity={1} />
        </mesh>
      </group>
    );
  }

  if (type === 'smelter') {
    return (
      <group>
        <mesh position={[0, h * 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h * 0.6, d]} />
          <meshStandardMaterial color={0x332211} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh ref={idleRef} position={[w * 0.17, h * 0.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.13, w * 0.17, h * 0.6, 8]} />
          <meshStandardMaterial color={0x444444} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={glowRef} position={[0, h * 0.3, d / 2 + 0.01]}>
          <boxGeometry args={[w * 0.5, h * 0.2, 0.05]} />
          <meshStandardMaterial color={0xff6600} emissive={0xff4400} emissiveIntensity={0.8} transparent opacity={0.9} />
        </mesh>
      </group>
    );
  }

  if (type === 'assembler') {
    return (
      <group>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={0x221133} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, h + h * 0.12, 0]} castShadow>
          <boxGeometry args={[0.2, h * 0.5, 0.2]} />
          <meshStandardMaterial color={0x888888} metalness={0.9} />
        </mesh>
        <mesh ref={(node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; }} position={[0, h + h * 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[w * 0.38, 0.04, 8, 24]} />
          <meshStandardMaterial color={0xaa00ff} emissive={0xaa00ff} emissiveIntensity={1} transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }

  if (type === 'refinery') {
    return (
      <group>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.38, w * 0.45, h, 10]} />
          <meshStandardMaterial color={0x331122} metalness={0.7} roughness={0.3} />
        </mesh>
        {[-1, 1].map(side => (
          <mesh key={side} position={[side * w * 0.4, h * 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, h * 0.5, 6]} />
            <meshStandardMaterial color={0x555555} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        <mesh ref={glowRef} position={[0, h * 0.7, d / 2 + 0.01]}>
          <boxGeometry args={[w * 0.4, h * 0.07, 0.05]} />
          <meshStandardMaterial color={0xff3388} emissive={0xff1166} emissiveIntensity={0.8} transparent opacity={0.8} />
        </mesh>
        <mesh ref={idleRef} position={[0, h + 0.3, 0]} castShadow>
          <sphereGeometry args={[w * 0.1, 8, 8]} />
          <meshStandardMaterial color={0xff3388} emissive={0xff1166} emissiveIntensity={0.6} />
        </mesh>
      </group>
    );
  }

  if (type === 'lab') {
    return (
      <group>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={0x112233} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh ref={glowRef} position={[0, h, 0]}>
          <sphereGeometry args={[w * 0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={0x33ccff} emissive={0x1188cc} emissiveIntensity={0.4} transparent opacity={0.5} />
        </mesh>
        <mesh ref={idleRef} position={[0, h + w * 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[w * 0.2, 0.03, 8, 20]} />
          <meshStandardMaterial color={0x33ccff} emissive={0x33ccff} emissiveIntensity={0.8} transparent opacity={0.5} />
        </mesh>
        {[-1, 1].map(side => (
          <group key={side} position={[side * w * 0.4, h, side * d * 0.3]}>
            <mesh rotation={[0.3 * side, 0, 0]} castShadow>
              <sphereGeometry args={[w * 0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={0x445566} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  LOGISTICS — CONVEYOR BELTS (redesigned)
  // ═══════════════════════════════════════════════

  if (type === 'conveyor' || type === 'conveyor_mk2') {
    const mk2 = type === 'conveyor_mk2';
    const railColor = mk2 ? 0x4466aa : 0x3a4444;
    const accentColor = mk2 ? 0x4488ff : 0x00aaff;
    const frameColor = mk2 ? 0x556688 : 0x444444;
    const beltTex = useMemo(() => createBeltTexture(mk2), [mk2]);

    if (rollerRefs) rollerRefs.current = [];

    return (
      <group>
        {/* Frame / base structure */}
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[w - 0.2, 0.04, d]} />
          <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Side rails */}
        {[-1, 1].map(side => (
          <group key={`rail-${side}`}>
            <mesh position={[side * (w / 2 - 0.08), 0.18, 0]} castShadow>
              <boxGeometry args={[0.1, 0.22, d]} />
              <meshStandardMaterial color={railColor} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[side * (w / 2 - 0.08), 0.3, 0]}>
              <boxGeometry args={[0.12, 0.02, d]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.4} />
            </mesh>
          </group>
        ))}

        {/* Belt surface with animated texture */}
        <mesh ref={beltRef} position={[0, 0.2, 0]} receiveShadow>
          <boxGeometry args={[w - 0.3, 0.04, d]} />
          <meshStandardMaterial map={beltTex} metalness={0.4} roughness={0.7} />
        </mesh>

        {/* Rollers with refs for spinning */}
        {Array.from({ length: 6 }, (_, i) => {
          const z = (i - 2.5) * (d / 6);
          return (
            <mesh key={`roller-${i}`} ref={el => { if (rollerRefs) rollerRefs.current[i] = el; }} position={[0, 0.14, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, w - 0.4, 6]} />
              <meshStandardMaterial color={0x777777} metalness={0.9} roughness={0.2} />
            </mesh>
          );
        })}

        {/* Support legs */}
        {[-1, 1].map(sx => [-1, 1].map(sz => (
          <mesh key={`leg-${sx}-${sz}`} position={[sx * (w / 2 - 0.25), 0.02, sz * (d / 2 - 0.25)]}>
            <boxGeometry args={[0.08, 0.04, 0.08]} />
            <meshStandardMaterial color={0x333333} metalness={0.7} roughness={0.5} />
          </mesh>
        )))}

        {/* Direction chevrons on belt */}
        {[-0.5, 0, 0.5].map((z, i) => (
          <mesh key={`chev-${i}`} position={[0, 0.23, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.12, 0.22, 3]} />
            <meshStandardMaterial
              color={accentColor} emissive={accentColor}
              emissiveIntensity={mk2 ? 0.8 : 0.5}
              transparent opacity={0.55}
            />
          </mesh>
        ))}

        {/* End connectors */}
        {[-1, 1].map(zs => (
          <mesh key={`end-${zs}`} position={[0, 0.16, zs * (d / 2)]}>
            <boxGeometry args={[w - 0.1, 0.14, 0.06]} />
            <meshStandardMaterial color={railColor} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === 'splitter') {
    return (
      <group>
        {/* Base box */}
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={0x333322} metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Accent stripe */}
        <mesh position={[0, h * 0.65, d / 2 + 0.02]}>
          <boxGeometry args={[w * 0.6, h * 0.15, 0.04]} />
          <meshStandardMaterial color={0xaaaa44} emissive={0xaaaa44} emissiveIntensity={0.8} />
        </mesh>
        {/* Output arrows (3 directions) */}
        {[-0.6, 0, 0.6].map((x, i) => (
          <mesh key={i} position={[x, h + 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.1, 0.2, 3]} />
            <meshStandardMaterial color={0xffff44} emissive={0xaaaa00} emissiveIntensity={0.6} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === 'merger') {
    return (
      <group>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={0x223333} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, h * 0.65, d / 2 + 0.02]}>
          <boxGeometry args={[w * 0.6, h * 0.15, 0.04]} />
          <meshStandardMaterial color={0x44aaaa} emissive={0x44aaaa} emissiveIntensity={0.8} />
        </mesh>
        {/* Converging arrows */}
        <mesh position={[0, h + 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.15, 0.25, 3]} />
          <meshStandardMaterial color={0x44ffff} emissive={0x22aaaa} emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }

  if (type === 'pipe') {
    return (
      <group>
        {/* Main pipe */}
        <mesh position={[0, h * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[w * 0.17, w * 0.17, d, 8]} />
          <meshStandardMaterial color={0x446688} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Connector rings */}
        {[-1, 1].map(zs => (
          <mesh key={zs} position={[0, h * 0.5, zs * (d / 2 - 0.05)]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[w * 0.2, 0.04, 6, 12]} />
            <meshStandardMaterial color={0x668899} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Support brackets */}
        {[-d * 0.2, d * 0.2].map(z => (
          <mesh key={z} position={[0, h * 0.19, z]} castShadow>
            <boxGeometry args={[0.1, h * 0.38, 0.06]} />
            <meshStandardMaterial color={0x333344} metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        {/* Flow indicator — animated via pipeFlowRef */}
        <mesh ref={pipeFlowRef} position={[0, h * 0.5, 0]}>
          <sphereGeometry args={[w * 0.08, 6, 6]} />
          <meshStandardMaterial color={0x88ccff} emissive={0x4488cc} emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
      </group>
    );
  }

  if (type === 'storage') {
    return (
      <group>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={0x224422} metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, h * 0.6, d / 2 + 0.03]}>
          <boxGeometry args={[w * 0.6, h * 0.3, 0.05]} />
          <meshStandardMaterial color={0x00ff88} emissive={0x00ff88} emissiveIntensity={0.5} transparent opacity={0.8} />
        </mesh>
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  COLONY
  // ═══════════════════════════════════════════════

  if (type === 'habitat') {
    const capR = w * 0.38;
    return (
      <group>
        <mesh position={[0, h * 0.43, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[capR, h * 0.28, 8, 12]} />
          <meshStandardMaterial color={0x445522} metalness={0.4} roughness={0.5} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * (capR + 0.05), h * 0.51, Math.sin(angle) * (capR + 0.05)]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[w * 0.15, h * 0.09, 0.05]} />
            <meshStandardMaterial color={0xffdd66} emissive={0xffaa22} emissiveIntensity={0.8} transparent opacity={0.7} />
          </mesh>
        ))}
        <mesh position={[0, h * 0.23, d / 2 + 0.01]}>
          <boxGeometry args={[w * 0.2, h * 0.4, 0.05]} />
          <meshStandardMaterial color={0x556633} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    );
  }

  if (type === 'oxygenator') {
    return (
      <group>
        <mesh position={[0, h * 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h * 0.7, d]} />
          <meshStandardMaterial color={0x223344} metalness={0.6} roughness={0.3} />
        </mesh>
        {[-w * 0.27, w * 0.27].map(x => (
          <mesh key={x} position={[x, h * 0.85, 0]} castShadow>
            <cylinderGeometry args={[w * 0.08, w * 0.1, h * 0.4, 8]} />
            <meshStandardMaterial color={0x44ddff} emissive={0x22aacc} emissiveIntensity={0.6} />
          </mesh>
        ))}
        {[-w * 0.27, w * 0.27].map(x => (
          <mesh key={`glow-${x}`} position={[x, h + 0.1, 0]}>
            <sphereGeometry args={[w * 0.07, 8, 8]} />
            <meshStandardMaterial color={0x88eeff} emissive={0x44ddff} emissiveIntensity={0.8} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  DEFENSE
  // ═══════════════════════════════════════════════

  if (type === 'turret') {
    return (
      <group>
        <mesh position={[0, h * 0.11, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.4, w * 0.5, h * 0.23, 8]} />
          <meshStandardMaterial color={0x333333} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh ref={idleRef} position={[0, h * 0.37, 0]} castShadow receiveShadow>
          <sphereGeometry args={[w * 0.35, 8, 8]} />
          <meshStandardMaterial color={0x442222} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, h * 0.43, w * 0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[w * 0.06, w * 0.04, w * 0.75, 6]} />
          <meshStandardMaterial color={0xff4444} emissive={0x881111} emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={glowRef} position={[0, h * 0.63, 0]}>
          <sphereGeometry args={[w * 0.05, 6, 6]} />
          <meshStandardMaterial color={0xff0000} emissive={0xff0000} emissiveIntensity={1.0} />
        </mesh>
      </group>
    );
  }

  if (type === 'wall') {
    return (
      <group>
        {/* Main wall slab */}
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={0x555555} metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Reinforcement ribs */}
        {[-w * 0.3, 0, w * 0.3].map(x => (
          <mesh key={x} position={[x, h / 2, d / 2 + 0.02]} castShadow>
            <boxGeometry args={[0.15, h - 0.3, 0.08]} />
            <meshStandardMaterial color={0x444444} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Top rail */}
        <mesh position={[0, h + 0.08, 0]}>
          <boxGeometry args={[w + 0.1, 0.15, d + 0.1]} />
          <meshStandardMaterial color={0x666666} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === 'laser_fence') {
    const postX = w * 0.35;
    return (
      <group>
        {/* Posts */}
        {[-postX, postX].map(x => (
          <mesh key={x} position={[x, h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, h, 6]} />
            <meshStandardMaterial color={0x444444} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Laser beams between posts */}
        {[0, 1, 2, 3].map(i => {
          const y = h * 0.27 + i * h * 0.2;
          return (
            <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, postX * 1.7, 4]} />
              <meshStandardMaterial color={0xff2222} emissive={0xff0000} emissiveIntensity={1.0} transparent opacity={0.8} />
            </mesh>
          );
        })}
        {/* Post top emitters */}
        {[-postX, postX].map(x => (
          <mesh key={`emit-${x}`} position={[x, h + 0.1, 0]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color={0xff4444} emissive={0xff0000} emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === 'shield_gen') {
    return (
      <group>
        {/* Base unit */}
        <mesh position={[0, h * 0.13, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.38, w * 0.45, h * 0.25, 8]} />
          <meshStandardMaterial color={0x223344} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Projector pillar */}
        <mesh position={[0, h * 0.5, 0]} castShadow>
          <cylinderGeometry args={[w * 0.08, w * 0.13, h * 0.63, 8]} />
          <meshStandardMaterial color={0x334466} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Shield dome (holographic) */}
        <mesh ref={glowRef} position={[0, h * 0.25, 0]}>
          <sphereGeometry args={[w * 0.75, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={0x4488ff} emissive={0x2244aa} emissiveIntensity={0.6} transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
        {/* Energy rings */}
        <group ref={idleRef}>
          {[0.38, 0.63].map((yf, i) => (
            <mesh key={i} position={[0, h * yf, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[w * (0.2 - i * 0.05), 0.03, 6, 16]} />
              <meshStandardMaterial color={0x4488ff} emissive={0x4488ff} emissiveIntensity={0.8} transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      </group>
    );
  }

  if (type === 'radar') {
    return (
      <group>
        {/* Tower */}
        <mesh position={[0, h / 2, 0]} castShadow>
          <cylinderGeometry args={[w * 0.07, w * 0.12, h, 6]} />
          <meshStandardMaterial color={0x334433} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Dish */}
        <mesh ref={idleRef} position={[0, h - h * 0.07, w * 0.1]} rotation={[-0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, w * 0.4, h * 0.04, 12]} />
          <meshStandardMaterial color={0x44ff44} emissive={0x22aa22} emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Rotating ring indicator */}
        <mesh ref={glowRef} position={[0, h + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[w * 0.2, 0.025, 6, 16]} />
          <meshStandardMaterial color={0x44ff44} emissive={0x44ff44} emissiveIntensity={1} transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  RESEARCH
  // ═══════════════════════════════════════════════

  if (type === 'telescope') {
    return (
      <group>
        {/* Base platform */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.38, w * 0.45, 0.6, 8]} />
          <meshStandardMaterial color={0x223344} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Tower */}
        <mesh position={[0, h * 0.4, 0]} castShadow>
          <cylinderGeometry args={[w * 0.08, w * 0.13, h * 0.6, 6]} />
          <meshStandardMaterial color={0x445566} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Telescope tube */}
        <mesh position={[0, h * 0.7, w * 0.13]} rotation={[-0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[w * 0.13, w * 0.08, h * 0.38, 8]} />
          <meshStandardMaterial color={0x6688cc} emissive={0x334466} emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Lens glow */}
        <mesh ref={(node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; }} position={[0, h * 0.7 + h * 0.09, w * 0.13 + h * 0.17]} rotation={[-0.5, 0, 0]}>
          <circleGeometry args={[w * 0.08, 12]} />
          <meshStandardMaterial color={0x88bbff} emissive={0x4488ff} emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  POWER
  // ═══════════════════════════════════════════════

  if (type === 'solar') {
    return (
      <group>
        <mesh position={[0, h * 0.36, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.08, w * 0.1, h * 0.71, 8]} />
          <meshStandardMaterial color={0x444466} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh ref={(node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; }} position={[0, h * 0.8, 0]} rotation={[-0.3, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.9, 0.1, d * 0.9]} />
          <meshStandardMaterial color={0x003355} emissive={0x002244} emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    );
  }

  if (type === 'wind_turbine') {
    const bladeLen = h * 0.24;
    return (
      <group>
        {/* Base */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.33, w * 0.4, 0.5, 8]} />
          <meshStandardMaterial color={0x334433} metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Tower */}
        <mesh position={[0, h / 2, 0]} castShadow>
          <cylinderGeometry args={[w * 0.07, w * 0.12, h - 0.5, 6]} />
          <meshStandardMaterial color={0xaabbaa} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Nacelle */}
        <mesh ref={glowRef} position={[0, h - 0.3, w * 0.1]} castShadow>
          <boxGeometry args={[w * 0.17, w * 0.17, w * 0.27]} />
          <meshStandardMaterial color={0xbbccbb} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Rotor (blades + hub) */}
        <group ref={idleRef} position={[0, h - 0.3, w * 0.1 + w * 0.13]}>
          {[0, 1, 2].map(i => {
            const angle = (i / 3) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.sin(angle) * bladeLen * 0.55, Math.cos(angle) * bladeLen * 0.55, 0]} rotation={[0, 0, angle]}>
                <boxGeometry args={[w * 0.05, bladeLen, 0.04]} />
                <meshStandardMaterial color={0xddddcc} metalness={0.4} roughness={0.5} />
              </mesh>
            );
          })}
          {/* Hub */}
          <mesh position={[0, 0, 0.05]}>
            <sphereGeometry args={[w * 0.05, 6, 6]} />
            <meshStandardMaterial color={0xccddcc} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      </group>
    );
  }

  if (type === 'geothermal') {
    return (
      <group>
        {/* Base ring */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.45, w * 0.5, 0.6, 10]} />
          <meshStandardMaterial color={0x443322} metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Central pipe stack */}
        <mesh position={[0, h / 2 + 0.3, 0]} castShadow>
          <cylinderGeometry args={[w * 0.15, w * 0.2, h - 0.6, 8]} />
          <meshStandardMaterial color={0x554433} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Heat vents */}
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2 + 0.4;
          return (
            <mesh key={i} position={[Math.cos(angle) * w * 0.33, h * 0.23, Math.sin(angle) * d * 0.33]}>
              <boxGeometry args={[w * 0.08, h * 0.23, d * 0.08]} />
              <meshStandardMaterial color={0xff6644} emissive={0xff4422} emissiveIntensity={0.8} transparent opacity={0.7} />
            </mesh>
          );
        })}
        {/* Steam top */}
        <mesh ref={(node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; }} position={[0, h + 0.2, 0]}>
          <sphereGeometry args={[w * 0.1, 8, 8]} />
          <meshStandardMaterial color={0xffffff} emissive={0xff8866} emissiveIntensity={0.6} transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === 'reactor') {
    return (
      <group>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.4, w * 0.44, h, 12]} />
          <meshStandardMaterial color={0x221133} metalness={0.8} roughness={0.3} />
        </mesh>
        {[0, 1, 2].map(i => (
          <mesh key={i} ref={i === 1 ? (node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; } : undefined} position={[0, h * 0.21 + i * h * 0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[w * 0.46, 0.06, 8, 24]} />
            <meshStandardMaterial color={0xff00ff} emissive={0xff00ff} emissiveIntensity={0.8} transparent opacity={0.6} />
          </mesh>
        ))}
        <pointLight color={0xff00ff} intensity={2} distance={8} position={[0, h, 0]} />
      </group>
    );
  }

  if (type === 'fusion') {
    return (
      <group>
        {/* Containment chamber */}
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.36, w * 0.4, h, 12]} />
          <meshStandardMaterial color={0x221133} metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Magnetic rings */}
        {[0, 1, 2, 3, 4].map(i => (
          <mesh key={i} position={[0, h * 0.13 + i * h * 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[w * 0.41, 0.08, 8, 24]} />
            <meshStandardMaterial color={0xffaaff} emissive={0xff88ff} emissiveIntensity={0.8} transparent opacity={0.5} />
          </mesh>
        ))}
        {/* Core glow */}
        <mesh ref={(node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; }} position={[0, h / 2, 0]}>
          <sphereGeometry args={[w * 0.17, 12, 12]} />
          <meshStandardMaterial color={0xffccff} emissive={0xff88ff} emissiveIntensity={1.0} transparent opacity={0.4} />
        </mesh>
        {/* Support struts */}
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh key={`strut-${i}`} position={[Math.cos(angle) * w * 0.31, h * 0.3, Math.sin(angle) * d * 0.31]} castShadow>
              <boxGeometry args={[0.3, h * 0.5, 0.3]} />
              <meshStandardMaterial color={0x333344} metalness={0.8} roughness={0.3} />
            </mesh>
          );
        })}
        <pointLight color={0xff88ff} intensity={3} distance={10} position={[0, h / 2, 0]} />
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  ENDGAME
  // ═══════════════════════════════════════════════

  if (type === 'beacon') {
    return (
      <group>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w * 0.13, w * 0.27, h, 8]} />
          <meshStandardMaterial color={0x444433} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, h * 0.7, 0]} rotation={[-0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.1, w * 0.5, h * 0.025, 12]} />
          <meshStandardMaterial color={0xffcc00} emissive={0xaa8800} emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={(node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; }} position={[0, h + 0.3, 0]}>
          <sphereGeometry args={[w * 0.1, 8, 8]} />
          <meshStandardMaterial color={0xffcc00} emissive={0xffcc00} emissiveIntensity={1.0} />
        </mesh>
        {[0, 1, 2].map(i => (
          <mesh key={i} position={[0, h - h * 0.04 - i * h * 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[w * 0.3 + i * w * 0.1, 0.03, 8, 16]} />
            <meshStandardMaterial color={0xffcc00} emissive={0xffcc00} emissiveIntensity={1} transparent opacity={0.4 - i * 0.1} />
          </mesh>
        ))}
        <pointLight color={0xffcc00} intensity={2} distance={10} position={[0, h, 0]} />
      </group>
    );
  }

  if (type === 'launchpad') {
    return (
      <group>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[w / 2, w / 2, 0.5, 12]} />
          <meshStandardMaterial color={0x888888} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh ref={(node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; }} position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[w * 0.19, 0.1, 4, 24]} />
          <meshStandardMaterial color={0xff8800} emissive={0xff6600} emissiveIntensity={0.8} />
        </mesh>
        {[0, 1, 2, 3].map(i => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(angle) * w * 0.31, 0.5, Math.sin(angle) * d * 0.31]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.15, 0.15, h * 1.5, 6]} />
                <meshStandardMaterial color={0xaaaa99} metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, h * 0.9, 0]}>
                <sphereGeometry args={[0.12, 6, 6]} />
                <meshStandardMaterial color={0x00ff00} emissive={0x00ff00} emissiveIntensity={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  if (type === 'warp_core') {
    return (
      <group>
        {/* Containment frame */}
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={0x221133} metalness={0.7} roughness={0.3} transparent opacity={0.6} />
        </mesh>
        {/* Core energy sphere */}
        <mesh ref={glowRef} position={[0, h / 2, 0]}>
          <sphereGeometry args={[w * 0.25, 16, 16]} />
          <meshStandardMaterial color={0xff44ff} emissive={0xff22ff} emissiveIntensity={1.0} transparent opacity={0.6} />
        </mesh>
        {/* Orbit rings */}
        <group ref={idleRef}>
          {[0, 1, 2].map(i => (
            <mesh key={i} position={[0, h / 2, 0]} rotation={[i * 0.6, i * 0.8, i * 0.3]}>
              <torusGeometry args={[w * 0.33, 0.04, 8, 24]} />
              <meshStandardMaterial color={0xff88ff} emissive={0xff44ff} emissiveIntensity={0.8} transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
        {/* Corner pylons */}
        {[-1, 1].map(x => [-1, 1].map(z => (
          <mesh key={`${x}-${z}`} position={[x * w * 0.33, h / 2, z * d * 0.33]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, h - 1, 6]} />
            <meshStandardMaterial color={0x444455} metalness={0.8} roughness={0.3} />
          </mesh>
        )))}
      </group>
    );
  }

  if (type === 'colony_ship') {
    return (
      <group>
        {/* Hull base plate */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.5, d]} />
          <meshStandardMaterial color={0x888899} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Hull frame ribs */}
        {[-d * 0.25, 0, d * 0.25].map(z => (
          <mesh key={z} position={[0, h * 0.36, z]} castShadow>
            <boxGeometry args={[w - 1, h * 0.5, 0.3]} />
            <meshStandardMaterial color={0xaaaabb} metalness={0.6} roughness={0.4} transparent opacity={0.8} />
          </mesh>
        ))}
        {/* Engine mounts */}
        {[-w * 0.2, w * 0.2].map(x => (
          <mesh key={x} position={[x, h * 0.16, -d / 2 + 0.5]} castShadow>
            <cylinderGeometry args={[w * 0.05, w * 0.07, h * 0.24, 8]} />
            <meshStandardMaterial color={0x666677} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Engine glow */}
        {[-w * 0.2, w * 0.2].map(x => (
          <mesh key={`glow-${x}`} position={[x, h * 0.16, -d / 2 + 0.1]}>
            <circleGeometry args={[w * 0.04, 8]} />
            <meshStandardMaterial color={0x44aaff} emissive={0x2288ff} emissiveIntensity={1} transparent opacity={0.5} />
          </mesh>
        ))}
        {/* Status lights */}
        {[-w * 0.3, 0, w * 0.3].map(x => (
          <mesh key={`light-${x}`} position={[x, h * 0.62, 0]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial color={0x00ff88} emissive={0x00ff88} emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  DNA ANALYSER
  // ═══════════════════════════════════════════════
  if (type === 'dna_analyser') {
    return (
      <group>
        {/* Base platform */}
        <mesh position={[0, h * 0.09, 0]} castShadow>
          <boxGeometry args={[w, h * 0.17, d]} />
          <meshStandardMaterial color={0x112222} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Main body — scanner chamber */}
        <mesh position={[0, h * 0.43, 0]} castShadow>
          <cylinderGeometry args={[w * 0.35, w * 0.4, h * 0.57, 8]} />
          <meshStandardMaterial color={0x1a3333} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Transparent dome */}
        <mesh position={[0, h * 0.74, 0]}>
          <sphereGeometry args={[w * 0.35, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={def.color} transparent opacity={0.4} metalness={0.3} roughness={0.2} />
        </mesh>
        {/* DNA helix rods inside */}
        <mesh ref={glowRef} position={[0.2, h * 0.51, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.05, 0.05, h * 0.43, 6]} />
          <meshStandardMaterial color={0x00ffaa} emissive={0x00ffaa} emissiveIntensity={1} />
        </mesh>
        <mesh position={[-0.2, h * 0.51, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.05, 0.05, h * 0.43, 6]} />
          <meshStandardMaterial color={0x00aaff} emissive={0x00aaff} emissiveIntensity={1} />
        </mesh>
        {/* Scan ring */}
        <mesh ref={idleRef} position={[0, h * 0.43, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[w * 0.38, 0.04, 6, 16]} />
          <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={0.8} />
        </mesh>
        {/* Input slot */}
        <mesh position={[0, h * 0.23, w * 0.4]}>
          <boxGeometry args={[0.5, h * 0.09, 0.2]} />
          <meshStandardMaterial color={0x224422} emissive={0x44ffaa} emissiveIntensity={0.3} />
        </mesh>
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  COMPOUND LAB
  // ═══════════════════════════════════════════════
  if (type === 'compound_lab') {
    return (
      <group>
        {/* Lab table */}
        <mesh position={[0, h * 0.23, 0]} castShadow>
          <boxGeometry args={[w, 0.15, d]} />
          <meshStandardMaterial color={0x1a1a2a} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Table legs */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx * (w * 0.4), h * 0.1, sz * (d * 0.4)]}>
            <cylinderGeometry args={[0.08, 0.08, h * 0.2, 6]} />
            <meshStandardMaterial color={0x333344} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Beakers on table */}
        <mesh position={[-w * 0.15, h * 0.4, 0]}>
          <cylinderGeometry args={[0.2, 0.25, h * 0.23, 8]} />
          <meshStandardMaterial color={0x224488} transparent opacity={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[w * 0.08, h * 0.37, -d * 0.1]}>
          <cylinderGeometry args={[0.15, 0.15, h * 0.17, 8]} />
          <meshStandardMaterial color={0x882244} transparent opacity={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[w * 0.15, h * 0.43, d * 0.08]}>
          <cylinderGeometry args={[0.1, 0.18, h * 0.27, 8]} />
          <meshStandardMaterial color={0x448822} transparent opacity={0.4} metalness={0.3} />
        </mesh>
        {/* Liquid colors inside beakers */}
        <mesh ref={(node) => { if (idleRef) idleRef.current = node; if (glowRef) glowRef.current = node; }} position={[-w * 0.15, h * 0.32, 0]}>
          <cylinderGeometry args={[0.18, 0.23, h * 0.07, 8]} />
          <meshStandardMaterial color={0x4488ff} emissive={0x2244aa} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[w * 0.08, h * 0.3, -d * 0.1]}>
          <cylinderGeometry args={[0.13, 0.13, h * 0.05, 8]} />
          <meshStandardMaterial color={0xff44aa} emissive={0xaa2266} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[w * 0.15, h * 0.33, d * 0.08]}>
          <cylinderGeometry args={[0.08, 0.16, h * 0.07, 8]} />
          <meshStandardMaterial color={0x44ff88} emissive={0x22aa44} emissiveIntensity={0.8} />
        </mesh>
        {/* Equipment frame */}
        <mesh position={[0, h * 0.67, 0]} castShadow>
          <boxGeometry args={[w * 0.8, 0.1, d * 0.8]} />
          <meshStandardMaterial color={0x222233} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  LIQUID PROCESSING
  // ═══════════════════════════════════════════════

  if (type === 'water_pump') {
    return (
      <group>
        {/* Submerged base plate */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.4, 0.4, 8]} />
          <meshStandardMaterial color={0x223344} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Pump housing */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.8, 1.6, 8]} />
          <meshStandardMaterial color={0x2288cc} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Intake pipe (goes down into water) */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 1.2, 6]} />
          <meshStandardMaterial color={0x335566} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Output pipe */}
        <mesh position={[0.7, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 6]} />
          <meshStandardMaterial color={0x446688} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Status light */}
        <mesh position={[0, 2.1, 0]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color={0x2288ff} emissive={0x2288ff} emissiveIntensity={1.5} />
        </mesh>
        {/* Water accent ring */}
        <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85, 0.04, 6, 12]} />
          <meshStandardMaterial color={0x44aaff} emissive={0x2288cc} emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
      </group>
    );
  }

  if (type === 'coolant_mixer') {
    return (
      <group>
        {/* Tank body */}
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.3, h, 10]} />
          <meshStandardMaterial color={0x1a3333} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Mixing vane shaft */}
        <mesh ref={idleRef} position={[0, h + 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.0, 6]} />
          <meshStandardMaterial color={0x888888} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Vane blades */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.5, h * 0.5, Math.sin(angle) * 0.5]} rotation={[0, angle, Math.PI / 4]}>
            <boxGeometry args={[0.6, 0.05, 0.15]} />
            <meshStandardMaterial color={0x667788} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Cyan glow ring */}
        <mesh ref={glowRef} position={[0, h * 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.25, 0.05, 6, 16]} />
          <meshStandardMaterial color={0x22cccc} emissive={0x22cccc} emissiveIntensity={1.2} transparent opacity={0.6} />
        </mesh>
        {/* Input/output pipes */}
        {[-1, 1].map(side => (
          <mesh key={side} position={[side * 1.1, h * 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 6]} />
            <meshStandardMaterial color={0x446666} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === 'acid_refiner') {
    return (
      <group>
        {/* Base */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.5, d]} />
          <meshStandardMaterial color={0x1a2a1a} metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Distillation column */}
        <mesh position={[0, h / 2 + 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.7, h - 0.5, 8]} />
          <meshStandardMaterial color={0x223322} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Green emissive bands */}
        {[0.3, 0.5, 0.7].map((frac, i) => (
          <mesh key={i} position={[0, h * frac + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55 + (2 - i) * 0.05, 0.03, 6, 12]} />
            <meshStandardMaterial color={0x44cc44} emissive={0x44ff44} emissiveIntensity={1.5} transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Condenser coil */}
        <mesh position={[0.8, h * 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, h * 0.4, 6]} />
          <meshStandardMaterial color={0x334433} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Output drip */}
        <mesh ref={glowRef} position={[0.8, h * 0.3, 0]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color={0x44ff44} emissive={0x22aa22} emissiveIntensity={1.5} transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }

  if (type === 'pump') {
    return (
      <group>
        {/* Pump housing */}
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.7, 0.8, h, 8]} />
          <meshStandardMaterial color={0x334466} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Intake pipe */}
        <mesh position={[0, h * 0.3, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 6]} />
          <meshStandardMaterial color={0x446688} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Output pipe */}
        <mesh position={[0, h * 0.3, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 6]} />
          <meshStandardMaterial color={0x446688} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Status light */}
        <mesh position={[0, h + 0.15, 0]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color={0x4488ff} emissive={0x4488ff} emissiveIntensity={1.5} />
        </mesh>
        {/* Pressure gauge */}
        <mesh position={[0.5, h * 0.7, 0.4]}>
          <circleGeometry args={[0.15, 8]} />
          <meshStandardMaterial color={0x88aacc} emissive={0x4466aa} emissiveIntensity={0.6} />
        </mesh>
      </group>
    );
  }

  // ═══════════════════════════════════════════════
  //  IMPROVED FALLBACK — for any building without a custom mesh
  // ═══════════════════════════════════════════════

  const bodyColor = darken(def.color, 0.45);

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.2, 0.24, d + 0.2]} />
        <meshStandardMaterial color={0x1a1a22} metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, h / 2 + 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={bodyColor} metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Front accent stripe */}
      <mesh ref={glowRef} position={[0, h * 0.55 + 0.24, d / 2 + 0.02]}>
        <boxGeometry args={[w * 0.75, h * 0.12, 0.04]} />
        <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>
      {/* Side accent stripes */}
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * (w / 2 + 0.02), h * 0.55 + 0.24, 0]}>
          <boxGeometry args={[0.04, h * 0.12, d * 0.75]} />
          <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Top detail unit */}
      <mesh ref={idleRef} position={[0, h + 0.4, 0]} castShadow>
        <boxGeometry args={[w * 0.3, 0.3, d * 0.3]} />
        <meshStandardMaterial color={0x333344} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Status indicator light */}
      <mesh position={[0, h + 0.6, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}
