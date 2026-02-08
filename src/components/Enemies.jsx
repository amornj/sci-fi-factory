import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { enemyDefs, RENDER_DISTANCE } from '../constants';

const _rdSq = RENDER_DISTANCE * RENDER_DISTANCE;

// Shared geometries for most-spawned enemy types
const _crawlerBodyGeo = new THREE.BoxGeometry(0.8, 0.4, 1.2);
const _crawlerHeadGeo = new THREE.SphereGeometry(0.25, 6, 4);
const _crawlerBodyMat = new THREE.MeshStandardMaterial({ color: 0x44cc44, emissive: 0x227722, emissiveIntensity: 0.3, roughness: 0.6 });
const _crawlerHeadMat = new THREE.MeshStandardMaterial({ color: 0x44cc44, emissive: 0x227722, emissiveIntensity: 0.4 });
const _crawlerLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 4);
const _crawlerLegMat = new THREE.MeshStandardMaterial({ color: 0x336633 });

const _spitterBodyGeo = new THREE.CylinderGeometry(0.3, 0.5, 1.2, 6);
const _spitterHeadGeo = new THREE.SphereGeometry(0.35, 6, 5);
const _spitterBodyMat = new THREE.MeshStandardMaterial({ color: 0xcc44cc, emissive: 0x661166, emissiveIntensity: 0.2, roughness: 0.5 });
const _spitterHeadMat = new THREE.MeshStandardMaterial({ color: 0xcc44cc, emissive: 0x661166, emissiveIntensity: 0.3 });

const _sporeBeastBodyGeo = new THREE.SphereGeometry(0.6, 6, 5);
const _sporeBeastCapGeo = new THREE.SphereGeometry(0.45, 6, 4);
const _sporeBeastBodyMat = new THREE.MeshStandardMaterial({ color: 0x447744, emissive: 0x224422, emissiveIntensity: 0.3, roughness: 0.8 });
const _sporeBeastCapMat = new THREE.MeshStandardMaterial({ color: 0x668844, emissive: 0x334422, emissiveIntensity: 0.4 });

function CrawlerMesh() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow geometry={_crawlerBodyGeo} material={_crawlerBodyMat} />
      <mesh position={[0, 0.35, -0.5]} castShadow geometry={_crawlerHeadGeo} material={_crawlerHeadMat} />
      {[-0.4, 0, 0.4].map((z, i) => (
        <React.Fragment key={i}>
          <mesh position={[-0.45, 0.1, z]} rotation={[0, 0, 0.5]} geometry={_crawlerLegGeo} material={_crawlerLegMat} />
          <mesh position={[0.45, 0.1, z]} rotation={[0, 0, -0.5]} geometry={_crawlerLegGeo} material={_crawlerLegMat} />
        </React.Fragment>
      ))}
    </group>
  );
}

function SpitterMesh() {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow geometry={_spitterBodyGeo} material={_spitterBodyMat} />
      <mesh position={[0, 1.3, 0]} castShadow geometry={_spitterHeadGeo} material={_spitterHeadMat} />
      <mesh position={[0, 0.4, 0.35]}>
        <sphereGeometry args={[0.2, 5, 4]} />
        <meshStandardMaterial color={0xaaff00} emissive={0x88cc00} emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function BruteMesh() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.8, 1.4, 1.5]} />
        <meshStandardMaterial color={0xcc4444} emissive={0x661111} emissiveIntensity={0.2} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, -0.2]} castShadow>
        <boxGeometry args={[1.1, 0.7, 0.7]} />
        <meshStandardMaterial color={0xcc4444} emissive={0x661111} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[-0.85, 0.9, 0]}>
        <boxGeometry args={[0.35, 0.8, 1.1]} />
        <meshStandardMaterial color={0x882222} emissive={0x441111} emissiveIntensity={0.2} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.85, 0.9, 0]}>
        <boxGeometry args={[0.35, 0.8, 1.1]} />
        <meshStandardMaterial color={0x882222} emissive={0x441111} emissiveIntensity={0.2} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function SporeBeastMesh() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow geometry={_sporeBeastBodyGeo} material={_sporeBeastBodyMat} />
      <mesh position={[0, 1.2, 0]} castShadow geometry={_sporeBeastCapGeo} material={_sporeBeastCapMat} />
      {[0, 1.2, 2.4, 3.6, 4.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.5, 0.4, Math.sin(a) * 0.5]} rotation={[0.3, a, 0]}>
          <cylinderGeometry args={[0.04, 0.02, 0.5, 4]} />
          <meshStandardMaterial color={0x556633} />
        </mesh>
      ))}
    </group>
  );
}

function VoidStalkerMesh() {
  return (
    <group>
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 2.5, 6]} />
        <meshStandardMaterial color={0x221133} emissive={0x110022} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={0x331144} emissive={0x220033} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.35, 1.5, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.04, 0.06, 1.2, 4]} />
        <meshStandardMaterial color={0x221133} />
      </mesh>
      <mesh position={[0.35, 1.5, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.04, 0.06, 1.2, 4]} />
        <meshStandardMaterial color={0x221133} />
      </mesh>
    </group>
  );
}

function PlasmaWraithMesh() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial
          color={0x4444ff} emissive={0x2222ff} emissiveIntensity={1.5}
          transparent opacity={0.7} roughness={0.1} metalness={0.8}
        />
      </mesh>
      {[0, 1.5, 3, 4.5].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.3, 0.3 + i * 0.15, Math.sin(a) * 0.3]}>
          <sphereGeometry args={[0.12 - i * 0.02, 4, 3]} />
          <meshStandardMaterial color={0x6666ff} emissive={0x4444ff} emissiveIntensity={1} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function CrystalGolemMesh() {
  return (
    <group>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.4, 1.6, 1.2]} />
        <meshStandardMaterial color={0x446688} emissive={0x223344} emissiveIntensity={0.3} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-0.4, 2.0, 0.1]} rotation={[0.2, 0, -0.3]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={0x00ddff} emissive={0x0088ff} emissiveIntensity={1} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.3, 2.1, -0.2]} rotation={[-0.1, 0.5, 0.2]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color={0x00ccee} emissive={0x0066cc} emissiveIntensity={1} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 2.0, -0.1]} castShadow>
        <boxGeometry args={[0.9, 0.7, 0.7]} />
        <meshStandardMaterial color={0x446688} emissive={0x223344} emissiveIntensity={0.3} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-0.85, 1.2, 0]}>
        <boxGeometry args={[0.4, 1.0, 0.5]} />
        <meshStandardMaterial color={0x335566} emissive={0x112233} emissiveIntensity={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0.85, 1.2, 0]}>
        <boxGeometry args={[0.4, 1.0, 0.5]} />
        <meshStandardMaterial color={0x335566} emissive={0x112233} emissiveIntensity={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[-0.35, 0.25, 0]}>
        <boxGeometry args={[0.45, 0.5, 0.5]} />
        <meshStandardMaterial color={0x446688} metalness={0.5} />
      </mesh>
      <mesh position={[0.35, 0.25, 0]}>
        <boxGeometry args={[0.45, 0.5, 0.5]} />
        <meshStandardMaterial color={0x446688} metalness={0.5} />
      </mesh>
    </group>
  );
}

function HealthBarBillboard({ hp, maxHp, height }) {
  const ref = useRef();
  const camera = useThree(s => s.camera);

  useFrame(() => {
    if (ref.current) {
      ref.current.quaternion.copy(camera.quaternion);
    }
  });

  const pct = hp / maxHp;
  return (
    <group ref={ref} position={[0, height + 0.5, 0]}>
      <mesh>
        <planeGeometry args={[1.2, 0.12]} />
        <meshBasicMaterial color={0x330000} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[(pct - 1) * 0.6, 0, 0.001]}>
        <planeGeometry args={[1.2 * pct, 0.1]} />
        <meshBasicMaterial color={pct > 0.5 ? 0x44ff44 : 0xff4444} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function EnemyInstance({ enemy }) {
  const ref = useRef();
  const camera = useThree(s => s.camera);
  const def = enemyDefs[enemy.type];

  useFrame(() => {
    if (!ref.current) return;
    const dx = enemy.position[0] - camera.position.x;
    const dz = enemy.position[2] - camera.position.z;
    ref.current.visible = dx * dx + dz * dz < _rdSq;

    if (ref.current.visible && (enemy.state === 'chase' || enemy.state === 'attack' || enemy.state === 'cooldown')) {
      const angle = Math.atan2(
        camera.position.x - enemy.position[0],
        camera.position.z - enemy.position[2]
      );
      ref.current.rotation.y = angle;
    }
  });

  return (
    <group ref={ref} position={enemy.position} userData={{ isEnemy: true, enemyId: enemy.id, enemyType: enemy.type }}>
      {enemy.type === 'crawler' && <CrawlerMesh />}
      {enemy.type === 'spitter' && <SpitterMesh />}
      {enemy.type === 'brute' && <BruteMesh />}
      {enemy.type === 'sporeBeast' && <SporeBeastMesh />}
      {enemy.type === 'voidStalker' && <VoidStalkerMesh />}
      {enemy.type === 'plasmaWraith' && <PlasmaWraithMesh />}
      {enemy.type === 'crystalGolem' && <CrystalGolemMesh />}
      {enemy.hp < enemy.maxHp && def && (
        <HealthBarBillboard hp={enemy.hp} maxHp={enemy.maxHp} height={def.size[1]} />
      )}
      {enemy.hitFlash > 0 && (
        <pointLight color={0xffffff} intensity={enemy.hitFlash * 20} distance={3} />
      )}
    </group>
  );
}

export default function Enemies() {
  const enemies = useGameStore(s => s.enemies);

  useFrame((_, delta) => {
    const store = useGameStore.getState();
    store.tickEnemies(delta);
    store.tickRoaming(delta);
    store.tickWaves(delta);
    store.tickTransport(delta);
    store.tickWeaponCooldown(delta);
    store.tickPlayerRegen(delta);
    store.tickDamageNumbers(delta);
    store.tickHitMarker(delta);
    store.tickKillFeed(delta);
  });

  return (
    <group>
      {enemies.map(e => (
        <EnemyInstance key={e.id} enemy={e} />
      ))}
    </group>
  );
}
