import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
// postprocessing lib (SSAO, N8AO, Bloom, Vignette) all crash with Three 0.162
// Using CSS vignette + emissive materials for glow instead
import Scene from './components/Scene';
import Terrain from './components/Terrain';
import ResourceNodes from './components/ResourceNodes';
import Decorations from './components/Decorations';
import Buildings from './components/Buildings';
import GhostBuilding from './components/GhostBuilding';
import Particles from './components/Particles';
import PlayerController from './components/PlayerController';
import Flashlight from './components/Flashlight';
import HandTool from './components/HandTool';
import Enemies from './components/Enemies';
import Projectiles from './components/Projectiles';
import WaterPlane from './components/WaterPlane';
import ConveyorItems from './components/ConveyorItems';
import DamageNumbers from './components/DamageNumbers';
import Blocker from './ui/Blocker';
import HUD from './ui/HUD';
import BuildMenu from './ui/BuildMenu';
import PowerBar from './ui/PowerBar';
import Tooltip from './ui/Tooltip';
import StatusMessage from './ui/StatusMessage';
import Minimap from './ui/Minimap';
import Crosshair from './ui/Crosshair';
import CraftingMenu from './ui/CraftingMenu';
import HealthBar from './ui/HealthBar';
import DNAAnalyser from './ui/DNAAnalyser';
import CompoundLab from './ui/CompoundLab';
import WeaponBar from './ui/WeaponBar';
import KillFeed from './ui/KillFeed';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('CRASH DETECTED:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#0a0a0a', color: '#ff4444',
          padding: 40, fontFamily: 'Courier New, monospace', fontSize: 14,
          overflow: 'auto', zIndex: 99999,
        }}>
          <h1 style={{ color: '#ff6666', fontSize: 24, marginBottom: 16 }}>CRASH DETECTED</h1>
          <p style={{ color: '#ffaa44', marginBottom: 12 }}>{String(this.state.error)}</p>
          <pre style={{ color: '#888', whiteSpace: 'pre-wrap', fontSize: 12 }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              marginTop: 20, padding: '10px 20px', background: '#333', color: '#0ff',
              border: '1px solid #0ff', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 20, 0] }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          shadowMap: { type: THREE.PCFSoftShadowMap },
        }}
        style={{ position: 'fixed', inset: 0 }}
        onCreated={({ gl, scene }) => {
          scene.background = new THREE.Color(0x020810);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <Scene />
        <Terrain />
        <WaterPlane />
        <ResourceNodes />
        <Decorations />
        <Buildings />
        <ConveyorItems />
        <GhostBuilding />
        <Particles />
        <Enemies />
        <Projectiles />
        <DamageNumbers />
        <PlayerController />
        <Flashlight />
        <HandTool />
      </Canvas>
      <div id="vignette-overlay" />
      <Blocker />
      <Crosshair />
      <HUD />
      <HealthBar />
      <PowerBar />
      <BuildMenu />
      <Tooltip />
      <StatusMessage />
      <Minimap />
      <CraftingMenu />
      <WeaponBar />
      <KillFeed />
      <DNAAnalyser />
      <CompoundLab />
    </ErrorBoundary>
  );
}
