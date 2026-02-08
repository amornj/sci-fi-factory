import React, { useMemo, useRef, createRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { RENDER_DISTANCE } from '../constants';
import { simplex } from '../noise';

const _rdSq = RENDER_DISTANCE * RENDER_DISTANCE;

function CrystalNode({ node }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: node.color, emissive: node.emissive,
    emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.6,
  }), [node.color, node.emissive]);

  return (
    <group userData={{ isResource: true, resourceType: node.typeName, amount: node.amount, nodeId: node.id }}>
      <mesh castShadow material={mat}>
        <coneGeometry args={[0.8, 3, 5]} />
      </mesh>
      {node.crystalOffsets.map((o, i) => (
        <mesh key={i} position={[o.px, 0, o.pz]} rotation={[o.rx, o.ry, o.rz]} material={mat}>
          <coneGeometry args={[0.4, 1.8, 5]} />
        </mesh>
      ))}
    </group>
  );
}

function BlobNode({ node }) {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1.2, 8, 6);
    const positions = g.attributes.position;
    for (let k = 0; k < positions.count; k++) {
      const px = positions.getX(k);
      const py = positions.getY(k);
      const pz = positions.getZ(k);
      const noise = simplex.noise3d(px * 2 + node.noiseSeed, py * 2, pz * 2) * 0.3;
      positions.setX(k, px + px * noise);
      positions.setY(k, py + py * noise);
      positions.setZ(k, pz + pz * noise);
    }
    g.computeVertexNormals();
    return g;
  }, [node.noiseSeed]);

  return (
    <group userData={{ isResource: true, resourceType: node.typeName, amount: node.amount, nodeId: node.id }}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={node.color} emissive={node.emissive} emissiveIntensity={0.5} roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function RockNode({ node }) {
  const geo = useMemo(() => {
    const g = new THREE.DodecahedronGeometry(1.2, 1);
    const positions = g.attributes.position;
    for (let k = 0; k < positions.count; k++) {
      const px = positions.getX(k);
      const py = positions.getY(k);
      const pz = positions.getZ(k);
      const noise = simplex.noise3d(px * 1.5 + node.noiseSeed, py * 1.5, pz * 1.5) * 0.25;
      positions.setX(k, px * (1 + noise));
      positions.setY(k, py * (1 + noise));
      positions.setZ(k, pz * (1 + noise));
    }
    g.computeVertexNormals();
    return g;
  }, [node.noiseSeed]);

  return (
    <group userData={{ isResource: true, resourceType: node.typeName, amount: node.amount, nodeId: node.id }}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={node.color} emissive={node.emissive} emissiveIntensity={0.5} roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function ResourceNode({ node }) {
  if (node.shape === 'crystal') return <CrystalNode node={node} />;
  if (node.shape === 'blob') return <BlobNode node={node} />;
  return <RockNode node={node} />;
}

export default function ResourceNodes() {
  const resourceNodes = useGameStore(s => s.resourceNodes);
  const camera = useThree(s => s.camera);

  // Create stable refs array for all nodes
  const refsMap = useRef({});

  // Single useFrame for batch distance culling + userData sync
  useFrame(() => {
    const cx = camera.position.x;
    const cz = camera.position.z;
    for (let i = 0; i < resourceNodes.length; i++) {
      const node = resourceNodes[i];
      const ref = refsMap.current[node.id];
      if (!ref || !ref.current) continue;
      const dx = node.position[0] - cx;
      const dz = node.position[2] - cz;
      ref.current.visible = dx * dx + dz * dz < _rdSq;
      ref.current.userData.amount = node.amount;
    }
  });

  return (
    <group>
      {resourceNodes.map(node => {
        if (!refsMap.current[node.id]) {
          refsMap.current[node.id] = createRef();
        }
        return (
          <group key={node.id} ref={refsMap.current[node.id]} position={node.position}>
            <ResourceNode node={node} />
          </group>
        );
      })}
    </group>
  );
}
