import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { DAY_CYCLE_SPEED, SUN_ORBIT_RADIUS } from '../constants';

// Sky shader that reacts to sun elevation
const skyVertexShader = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  varying vec3 vPos;
  uniform float time;
  uniform float sunElevation; // -1 to 1 (sin of sun angle)
  void main() {
    vec3 dir = normalize(vPos);
    float y = dir.y * 0.5 + 0.5;

    // Daytime factor: 1 = full day, 0 = full night
    float dayFactor = smoothstep(-0.15, 0.3, sunElevation);

    // Night sky — very dark
    vec3 nightLow  = vec3(0.005, 0.003, 0.015);
    vec3 nightHigh = vec3(0.003, 0.012, 0.04);
    vec3 nightCol  = mix(nightLow, nightHigh, y);

    // Day sky — bright alien sky
    vec3 dayLow  = vec3(0.25, 0.40, 0.65);
    vec3 dayHigh = vec3(0.08, 0.18, 0.50);
    vec3 dayCol  = mix(dayLow, dayHigh, y);

    vec3 col = mix(nightCol, dayCol, dayFactor);

    // Nebula bands (only visible at night)
    float n = sin(dir.x * 3.0 + time * 0.02) * cos(dir.z * 2.0 + time * 0.01) * 0.5 + 0.5;
    col += vec3(0.06, 0.008, 0.10) * n * (1.0 - y) * (1.0 - dayFactor);

    // Horizon glow — shifts from dim cyan at night to warm at sunrise/sunset
    float horizon = 1.0 - abs(dir.y);
    float sunsetFactor = smoothstep(-0.1, 0.1, sunElevation) * (1.0 - smoothstep(0.1, 0.4, sunElevation));
    vec3 horizonNight  = vec3(0.0, 0.01, 0.03);
    vec3 horizonSunset = vec3(0.6, 0.2, 0.05);
    vec3 horizonDay    = vec3(0.15, 0.20, 0.35);
    vec3 horizonColor  = mix(horizonNight, horizonDay, dayFactor);
    horizonColor       = mix(horizonColor, horizonSunset, sunsetFactor);
    col += horizonColor * pow(horizon, 6.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Stars() {
  const ref = useRef();
  const geom = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts = [];
    const colors = [];
    for (let i = 0; i < 2500; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 550 + Math.random() * 50;
      verts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      const c = 0.5 + Math.random() * 0.5;
      colors.push(c, c, c + Math.random() * 0.2);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const sunElev = Math.sin(useGameStore.getState().timeOfDay);
    // Fade stars out during daytime
    const starOpacity = THREE.MathUtils.clamp(1.0 - THREE.MathUtils.smoothstep(sunElev, -0.1, 0.2), 0, 1);
    ref.current.material.opacity = starOpacity;
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial size={1.8} vertexColors sizeAttenuation transparent opacity={1} />
    </points>
  );
}

function Sky() {
  const matRef = useRef();
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    sunElevation: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    uniforms.time.value += delta;
    uniforms.sunElevation.value = Math.sin(useGameStore.getState().timeOfDay);
  });

  return (
    <mesh>
      <sphereGeometry args={[600, 32, 32]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
      />
    </mesh>
  );
}

// Giant glowing sun orb floating in the sky
function SunOrb() {
  const groupRef = useRef();
  const glowRef = useRef();
  const coronaRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const t = useGameStore.getState().timeOfDay;
    const sinT = Math.sin(t);
    const cosT = Math.cos(t);

    // Position the sun orb along the orbit
    groupRef.current.position.set(
      cosT * SUN_ORBIT_RADIUS * 0.5,
      sinT * SUN_ORBIT_RADIUS,
      80
    );

    // Scale visibility — below horizon, shrink and fade
    const visible = sinT > -0.2;
    groupRef.current.visible = visible;

    if (glowRef.current) {
      // Warmer color near horizon, white-hot when high
      const warmth = 1.0 - THREE.MathUtils.smoothstep(sinT, 0.0, 0.5);
      const r = 1.0;
      const g = 0.85 + warmth * 0.05;
      const b = 0.6 + (1.0 - warmth) * 0.4;
      glowRef.current.material.color.setRGB(r, g, b);
      glowRef.current.material.emissive.setRGB(r * 0.8, g * 0.6, b * 0.3);
      glowRef.current.material.emissiveIntensity = 2 + sinT * 2;
    }

    if (coronaRef.current) {
      // Pulsing corona
      const pulse = 1.0 + Math.sin(Date.now() * 0.001) * 0.05;
      coronaRef.current.scale.setScalar(pulse);
      coronaRef.current.material.opacity = THREE.MathUtils.clamp(sinT * 0.6 + 0.1, 0, 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core sun sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[12, 24, 16]} />
        <meshStandardMaterial
          color={0xffffcc}
          emissive={0xffaa44}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      {/* Outer corona glow */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[18, 16, 12]} />
        <meshBasicMaterial
          color={0xffdd88}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      {/* Lens flare / halo ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[14, 22, 32]} />
        <meshBasicMaterial
          color={0xffeedd}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Sun point light (for extra scene illumination) */}
      <pointLight color={0xffeedd} intensity={3} distance={500} decay={1} />
    </group>
  );
}

export default function Scene() {
  const sunRef = useRef();
  const ambientRef = useRef();
  const fillRef = useRef();
  const hemiRef = useRef();
  const fogRef = useRef();
  const { scene } = useThree();

  useFrame((_, delta) => {
    const store = useGameStore.getState();
    // Advance time of day
    let t = store.timeOfDay + DAY_CYCLE_SPEED * delta;
    if (t >= Math.PI * 2) t -= Math.PI * 2;
    useGameStore.setState({ timeOfDay: t });

    const sinT = Math.sin(t);
    const cosT = Math.cos(t);
    const dayFactor = THREE.MathUtils.smoothstep(sinT, -0.15, 0.3);

    // Sun directional light position — orbits over the sky
    if (sunRef.current) {
      sunRef.current.position.set(
        cosT * SUN_ORBIT_RADIUS * 0.5,
        sinT * SUN_ORBIT_RADIUS,
        80
      );
      // Intensity: strong during day, zero at night
      sunRef.current.intensity = THREE.MathUtils.clamp(sinT + 0.1, 0, 1) * 2.5;
      // Color shifts: warm at horizon, bright white-blue when high
      const warmth = 1.0 - THREE.MathUtils.smoothstep(sinT, 0.0, 0.5);
      sunRef.current.color.setRGB(
        0.55 + warmth * 0.45,
        0.70 - warmth * 0.10,
        1.0 - warmth * 0.45
      );
    }

    // Ambient — bright during day, very dim at night
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.06, 0.8, dayFactor);
    }

    // Fill light — subtle at night, brighter during day
    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.lerp(0.03, 0.35, dayFactor);
    }

    // Hemisphere — sky vs ground lighting
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(0.05, 0.55, dayFactor);
    }

    // Fog & background color — dark at night, blue-ish during day
    const bgR = THREE.MathUtils.lerp(0.003, 0.06, dayFactor);
    const bgG = THREE.MathUtils.lerp(0.005, 0.10, dayFactor);
    const bgB = THREE.MathUtils.lerp(0.015, 0.18, dayFactor);
    scene.background.setRGB(bgR, bgG, bgB);
    if (fogRef.current) {
      fogRef.current.color.setRGB(bgR, bgG, bgB);
      // Thicker fog at night to limit visibility
      fogRef.current.density = THREE.MathUtils.lerp(0.003, 0.0012, dayFactor);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} color={0x3355aa} intensity={0.6} />
      <directionalLight
        ref={sunRef}
        color={0xffeedd}
        intensity={2.0}
        position={[100, 200, 80]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-camera-far={500}
      />
      <directionalLight ref={fillRef} color={0xff6688} intensity={0.3} position={[-80, 50, -100]} />
      <hemisphereLight ref={hemiRef} args={[0x4466cc, 0x221133, 0.5]} />
      <fogExp2 ref={fogRef} attach="fog" args={[0x020810, 0.0015]} />
      <SunOrb />
      <Sky />
      <Stars />
    </>
  );
}
