import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';

const _dir = new THREE.Vector3();

export default function Flashlight() {
  const spotRef = useRef();
  const targetRef = useRef();
  const { camera, scene } = useThree();

  // Add target to scene once
  React.useEffect(() => {
    if (targetRef.current && !targetRef.current.parent) {
      scene.add(targetRef.current);
    }
    return () => {
      if (targetRef.current && targetRef.current.parent) {
        scene.remove(targetRef.current);
      }
    };
  }, [scene]);

  useFrame(() => {
    const on = useGameStore.getState().flashlightOn;
    if (!spotRef.current) return;

    spotRef.current.visible = on;
    if (!on) return;

    // Position at camera
    spotRef.current.position.copy(camera.position);

    // Target 10 units ahead of camera
    camera.getWorldDirection(_dir);
    if (targetRef.current) {
      targetRef.current.position.copy(camera.position).add(_dir.multiplyScalar(10));
      spotRef.current.target = targetRef.current;
    }
  });

  return (
    <>
      <spotLight
        ref={spotRef}
        color={0xffe8c0}
        intensity={8}
        distance={100}
        angle={Math.PI / 4.5}
        penumbra={0.5}
        decay={1.2}
        castShadow={false}
      />
      <object3D ref={targetRef} />
    </>
  );
}
