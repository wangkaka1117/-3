import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface GiftsProps {
  count: number;
  isScattered: boolean;
}

export const Gifts: React.FC<GiftsProps> = ({ count, isScattered }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorArray = useMemo(() => new Float32Array(count * 3), [count]);

  const { treeTransforms, scatterTransforms } = useMemo(() => {
    const treeT = [];
    const scatterT = [];
    const colors = [
        new THREE.Color('#D32F2F'), // Red
        new THREE.Color('#388E3C'), // Green
        new THREE.Color('#FBC02D'), // Gold
        new THREE.Color('#FFFFFF'), // White
    ];

    // Generate
    for (let i = 0; i < count; i++) {
        // Spiral Tree Logic - Interspersed with ornaments
        const t = i / count;
        const angle = t * Math.PI * 8 + Math.PI; // Offset angle
        const height = 5.0 - (t * 4.5); // Adjusted for smaller tree
        // Approx radius
        const coneRadius = 0.2 + ((5.25 - height) / 5.25) * 2.5; 
        const radius = coneRadius + 0.1; // Hang on tips
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const scaleVal = Math.random() * 0.1 + 0.2; // Gift size
        const scale = new THREE.Vector3(scaleVal, scaleVal, scaleVal);

        // Rotation: Align somewhat with gravity or random
        const rot = new THREE.Euler(Math.random() * 0.2, Math.random() * Math.PI * 2, Math.random() * 0.2);

        treeT.push({
            position: new THREE.Vector3(x, height, z),
            rotation: rot,
            scale
        });

        // Scatter Logic
        const r = 5 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const sx = r * Math.sin(phi) * Math.cos(theta);
        const sy = r * Math.sin(phi) * Math.sin(theta) + 3; 
        const sz = r * Math.cos(phi);

        scatterT.push({
            position: new THREE.Vector3(sx, sy, sz),
            rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI),
            scale: scale.clone().multiplyScalar(1.1)
        });

        // Assign Color
        const color = colors[Math.floor(Math.random() * colors.length)];
        color.toArray(colorArray, i * 3);
    }
    return { treeTransforms: treeT, scatterTransforms: scatterT };
  }, [count, colorArray]);

  useLayoutEffect(() => {
      if(meshRef.current) {
          for(let i=0; i<count; i++) {
              meshRef.current.setColorAt(i, new THREE.Color(colorArray[i*3], colorArray[i*3+1], colorArray[i*3+2]));
          }
          meshRef.current.instanceColor!.needsUpdate = true;
      }
  }, [count, colorArray]);

  // Current State Refs
  const currentPositions = useRef(treeTransforms.map(t => t.position.clone()));
  const currentQuats = useRef(treeTransforms.map(t => new THREE.Quaternion().setFromEuler(t.rotation)));
  const treeQuats = useMemo(() => treeTransforms.map(t => new THREE.Quaternion().setFromEuler(t.rotation)), [treeTransforms]);
  const scatterQuats = useMemo(() => scatterTransforms.map(t => new THREE.Quaternion().setFromEuler(t.rotation)), [scatterTransforms]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const dummy = new THREE.Object3D();
    const speed = 2.0 * delta; 

    for(let i=0; i < count; i++) {
        const targetPos = isScattered ? scatterTransforms[i].position : treeTransforms[i].position;
        const targetQuat = isScattered ? scatterQuats[i] : treeQuats[i];
        
        currentPositions.current[i].lerp(targetPos, speed);
        currentQuats.current[i].slerp(targetQuat, speed);
        
        dummy.position.copy(currentPositions.current[i]);
        dummy.quaternion.copy(currentQuats.current[i]);
        
        if (isScattered) {
            dummy.position.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.003;
            dummy.rotation.x += delta;
        }

        dummy.scale.copy(treeTransforms[i].scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {/* Box geometry for gifts */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        roughness={0.3} 
        metalness={0.1} 
      />
    </instancedMesh>
  );
};