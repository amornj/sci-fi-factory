import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { RENDER_DISTANCE } from '../constants';

const _rdSq = RENDER_DISTANCE * RENDER_DISTANCE;

const vertexShader = `
  uniform float time;
  varying vec2 vUv;
  varying float vWaveHeight;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave = sin(pos.x * 0.15 + time * 0.8) * 0.3
               + sin(pos.z * 0.12 + time * 0.6) * 0.25
               + sin((pos.x + pos.z) * 0.1 + time * 1.2) * 0.15;
    pos.y += wave;
    vWaveHeight = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying float vWaveHeight;
  void main() {
    vec3 deepColor = vec3(0.02, 0.08, 0.18);
    vec3 surfaceColor = vec3(0.05, 0.25, 0.4);
    vec3 highlightColor = vec3(0.1, 0.5, 0.6);
    float blend = smoothstep(-0.3, 0.3, vWaveHeight);
    vec3 color = mix(deepColor, surfaceColor, blend);
    color += highlightColor * smoothstep(0.15, 0.35, vWaveHeight) * 0.4;
    float shimmer = sin(vUv.x * 40.0 + time * 2.0) * sin(vUv.y * 40.0 + time * 1.5) * 0.03;
    color += shimmer;
    gl_FragColor = vec4(color, 0.65);
  }
`;

function PondPatch({ body }) {
  const ref = useRef();
  const uniforms = useMemo(() => ({
    time: { value: 0 },
  }), []);

  const diameter = body.radius * 2;
  const segments = Math.max(16, Math.min(48, Math.floor(body.radius * 2)));

  return (
    <mesh
      ref={ref}
      position={[body.cx, body.y, body.cz]}
      rotation={[-Math.PI / 2, 0, 0]}
      userData={{ isWater: true, waterBodyId: body.id }}
    >
      <circleGeometry args={[body.radius, segments]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function RiverSegment({ body }) {
  const ref = useRef();
  const uniforms = useMemo(() => ({
    time: { value: 0 },
  }), []);

  const cx = (body.x1 + body.x2) / 2;
  const cz = (body.z1 + body.z2) / 2;
  const dx = body.x2 - body.x1;
  const dz = body.z2 - body.z1;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);

  return (
    <mesh
      ref={ref}
      position={[cx, body.y, cz]}
      rotation={[-Math.PI / 2, 0, angle]}
      userData={{ isWater: true, waterBodyId: body.id }}
    >
      <planeGeometry args={[body.width, length, 4, Math.max(4, Math.floor(length / 3))]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function WaterPlane() {
  const waterBodies = useGameStore(s => s.waterBodies);
  const camera = useThree(s => s.camera);
  const groupRef = useRef();

  // Shared time uniform — update all children each frame
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const cx = camera.position.x;
    const cz = camera.position.z;

    groupRef.current.children.forEach((child, i) => {
      if (!child.material || !child.material.uniforms) return;
      child.material.uniforms.time.value += delta;

      // Distance cull
      const dx = child.position.x - cx;
      const dz = child.position.z - cz;
      child.visible = dx * dx + dz * dz < _rdSq;
    });
  });

  return (
    <group ref={groupRef}>
      {waterBodies.map(wb =>
        wb.type === 'pond'
          ? <PondPatch key={`p${wb.id}`} body={wb} />
          : <RiverSegment key={`r${wb.id}`} body={wb} />
      )}
    </group>
  );
}
