import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrnamentsProps } from '../types';

export const Ornaments: React.FC<OrnamentsProps> = ({ color, count, isScattered }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Generate transforms for both states
  const { treeTransforms, scatterTransforms } = useMemo(() => {
    const treeT = [];
    const scatterT = [];
    
    // 1. Spiral Tree Logic - Adjusted for smaller tree
    // Height top 5.25 -> 0.5
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 14; 
      const height = 5.25 - (t * 4.75); // Top to bottom scaled
      
      // Cone radius at this height (approximate from Tree.tsx logic)
      // Base radius ~2.8 at bottom
      const coneRadiusAtHeight = 0.2 + ((5.25 - height) / 5.25) * 2.3; 
      const radius = coneRadiusAtHeight + 0.1; // Slightly outside
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const scaleVal = Math.random() * 0.12 + 0.12;
      const scale = new THREE.Vector3(scaleVal, scaleVal, scaleVal);

      treeT.push({
        position: new THREE.Vector3(x, height, z),
        rotation: new THREE.Euler(0, 0, 0),
        scale
      });

      // 2. Scatter Logic
      const r = 5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const sx = r * Math.sin(phi) * Math.cos(theta);
      const sy = r * Math.sin(phi) * Math.sin(theta) + 3; 
      const sz = r * Math.cos(phi);

      scatterT.push({
        position: new THREE.Vector3(sx, sy, sz),
        rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
        scale: scale.clone().multiplyScalar(1.2)
      });
    }
    return { treeTransforms: treeT, scatterTransforms: scatterT };
  }, [count]);

  // Current State for Animation
  const currentPositions = useRef(treeTransforms.map(t => t.position.clone()));
  const currentQuats = useRef(treeTransforms.map(t => new THREE.Quaternion())); 

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const dummy = new THREE.Object3D();
    const speed = 2.0 * delta; 

    for(let i=0; i < count; i++) {
        const targetPos = isScattered ? scatterTransforms[i].position : treeTransforms[i].position;
        
        currentPositions.current[i].lerp(targetPos, speed);
        
        dummy.position.copy(currentPositions.current[i]);
        
        // Bobbing effect
        const time = state.clock.getElapsedTime();
        dummy.position.y += Math.sin(time * 3 + i) * 0.005;

        // Rotation
        dummy.rotation.x = time * 0.5 + i;
        dummy.rotation.y = time * 0.3 + i;
        
        dummy.scale.copy(treeTransforms[i].scale);

        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial 
        color={color} 
        roughness={0.1} 
        metalness={1} 
        clearcoat={1} 
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
};