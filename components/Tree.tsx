import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Ornaments } from './Ornaments';
import { Gifts } from './Gifts';
import { EMERALD_COLOR, TreeProps } from '../types';

// Utility to generate random point in sphere
const randomInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const Tree: React.FC<TreeProps> = ({ ornamentColor, isScattered }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const requestedCount = 1800; // Slightly reduced count for smaller tree

  // Dual Position System Generation
  const { treeTransforms, scatterTransforms } = useMemo(() => {
    const treeT: { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }[] = [];
    const scatterT: { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }[] = [];

    const layerCount = 7;
    let currentIdx = 0;

    // Generate Tree Positions (Conical Layers) - SCALED DOWN
    // Height multiplier reduced from 1.0 to 0.75
    // Radius multiplier reduced from 0.6 to 0.45
    for (let i = 0; i < layerCount; i++) {
      const layerY = (layerCount - i) * 0.75; 
      const layerRadius = 0.2 + (i * 0.45); 
      const layerParticles = Math.floor(requestedCount / layerCount);

      for (let j = 0; j < layerParticles; j++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * layerRadius;
        const yOffset = (Math.random() - 0.5) * 1.0; // Reduced thickness spread

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = layerY + yOffset;

        // Tree Transform
        const pos = new THREE.Vector3(x, y, z);
        const rot = new THREE.Euler(
            Math.random() * Math.PI, 
            Math.random() * Math.PI, 
            Math.random() * Math.PI
        );
        const scale = new THREE.Vector3(1, 1, 1).multiplyScalar(Math.random() * 0.4 + 0.4);

        treeT.push({ position: pos, rotation: rot, scale });

        // Scatter Transform
        const scatterPos = randomInSphere(6); // Reduced scatter radius
        scatterPos.y += 3; 
        
        scatterT.push({
            position: scatterPos,
            rotation: new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0),
            scale: scale
        });

        currentIdx++;
      }
    }
    return { treeTransforms: treeT, scatterTransforms: scatterT };
  }, []);

  const actualCount = treeTransforms.length;

  // Animation Logic
  const dummy = new THREE.Object3D();
  const currentPositions = useRef(treeTransforms.map(t => t.position.clone()));
  const currentQuaternions = useRef(treeTransforms.map(t => new THREE.Quaternion().setFromEuler(t.rotation)));
  
  const treeQuats = useMemo(() => treeTransforms.map(t => new THREE.Quaternion().setFromEuler(t.rotation)), [treeTransforms]);
  const scatterQuats = useMemo(() => scatterTransforms.map(t => new THREE.Quaternion().setFromEuler(t.rotation)), [scatterTransforms]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speed = 2.5 * delta;

    for (let i = 0; i < actualCount; i++) {
        const targetPos = isScattered ? scatterTransforms[i].position : treeTransforms[i].position;
        const targetQuat = isScattered ? scatterQuats[i] : treeQuats[i];

        currentPositions.current[i].lerp(targetPos, speed);
        currentQuaternions.current[i].slerp(targetQuat, speed);

        dummy.position.copy(currentPositions.current[i]);
        dummy.quaternion.copy(currentQuaternions.current[i]);
        dummy.scale.copy(treeTransforms[i].scale); 
        
        if (isScattered) {
            dummy.position.y += Math.sin(state.clock.elapsedTime + i) * 0.002;
            dummy.rotation.x += 0.001;
        }

        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[0, -0.5, 0]}> {/* Adjust group height slightly */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, actualCount]} castShadow receiveShadow>
        <tetrahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial 
            color={EMERALD_COLOR} 
            roughness={0.4} 
            metalness={0.1}
        />
      </instancedMesh>
      
      <TrunkAnimator isScattered={isScattered} />
      <Star isScattered={isScattered} />
      
      {/* Ornaments and Gifts */}
      <Ornaments color={ornamentColor} count={50} isScattered={isScattered} />
      <Gifts count={20} isScattered={isScattered} />
    </group>
  );
};

const TrunkAnimator: React.FC<{isScattered: boolean}> = ({ isScattered }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            const targetScale = isScattered ? 0 : 1;
            ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3);
        }
    });
    return (
        <mesh ref={ref} position={[0, 1.0, 0]} castShadow> {/* Lowered trunk position */}
             <cylinderGeometry args={[0.15, 0.5, 2.5, 16]} />
             <meshStandardMaterial color="#3d2817" roughness={0.8} />
        </mesh>
    );
};

// 5-Point Star Component
const Star: React.FC<{isScattered: boolean}> = ({ isScattered }) => {
    const ref = useRef<THREE.Group>(null);

    // Create a 5-point star shape
    const starShape = useMemo(() => {
        const shape = new THREE.Shape();
        const points = 5;
        const outerRadius = 0.5;
        const innerRadius = 0.25;
        
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const a = (i / (points * 2)) * Math.PI * 2 - (Math.PI / 2); // Start at top
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        shape.closePath();
        return shape;
    }, []);

    const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3
    };

    useFrame((state, delta) => {
        if (ref.current) {
            // Updated height for smaller tree (Top layer is around 5.25 now)
            const targetPos = isScattered ? new THREE.Vector3(0, 8, 0) : new THREE.Vector3(0, 5.8, 0);
            const targetScale = isScattered ? 0.1 : 1;
            
            ref.current.position.lerp(targetPos, delta * 2);
            ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
            // Continuous rotation
            ref.current.rotation.y += delta * 0.8;
        }
    });
    
    return (
        <group ref={ref} position={[0, 5.8, 0]}>
            <mesh castShadow>
                <extrudeGeometry args={[starShape, extrudeSettings]} />
                <meshStandardMaterial
                    color="#FFDD88"
                    emissive="#FFDD88"
                    emissiveIntensity={3}
                    toneMapped={false}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>
            <pointLight intensity={6} color="#ffaa00" distance={6} decay={2} />
        </group>
    );
}