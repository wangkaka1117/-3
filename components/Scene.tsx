import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Tree } from './Tree';
import { Effects } from './Effects';
import { AppState } from '../types';
import { GestureController } from './GestureController';

interface SceneProps {
  config: AppState;
  setConfig: React.Dispatch<React.SetStateAction<AppState>>;
}

export const Scene: React.FC<SceneProps> = ({ config, setConfig }) => {
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const [handControlling, setHandControlling] = useState(false);

  useFrame((state, delta) => {
    // Rotation logic: Only rotate automatically if not being controlled by hand and enabled
    if (config.rotate && !handControlling && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const handleGestureScatter = (scattered: boolean) => {
     if (config.isScattered !== scattered) {
         setConfig(prev => ({ ...prev, isScattered: scattered }));
     }
  };

  const handleCameraMove = (x: number, y: number) => {
     if (controlsRef.current) {
         setHandControlling(true);
         // Map Hand X (-1 to 1) to Azimuth angle
         // Map Hand Y (-1 to 1) to Polar angle
         const targetAzimuth = -x * 2; 
         const targetPolar = (Math.PI / 2) + (y * 0.5);

         // Smoothly interpolate current angles to target
         const currentAzimuth = controlsRef.current.getAzimuthalAngle();
         const currentPolar = controlsRef.current.getPolarAngle();

         controlsRef.current.setAzimuthalAngle(THREE.MathUtils.lerp(currentAzimuth, targetAzimuth, 0.1));
         controlsRef.current.setPolarAngle(THREE.MathUtils.lerp(currentPolar, targetPolar, 0.1));
         
         // Reset "hand controlling" flag after a short timeout if no input, 
         // but since this runs per frame on detection, it effectively stays true while hand is there.
         // We'll rely on the stream presence.
     }
  };

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      <GestureController 
        onScatterChange={handleGestureScatter} 
        onCameraMove={handleCameraMove}
      />

      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={5}
        maxDistance={25}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Lighting Setup */}
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 20, 10]}
        angle={0.2}
        penumbra={1}
        intensity={30}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color={config.lightColor}
      />
      <pointLight position={[-10, -10, -10]} intensity={5} color="#FFD1DC" />
      <pointLight position={[0, 5, 0]} intensity={2} color="#ffaa00" distance={10} decay={2} />

      {/* Environment for reflections - Lobby */}
      <Environment preset="lobby" />

      {/* Main Content Group */}
      <group position={[0, -2, 0]}>
        
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} enabled={!config.isScattered}>
            <group ref={groupRef}>
                <Tree ornamentColor={config.ornamentColor} isScattered={config.isScattered} />
            </group>
        </Float>

        {/* Floor Reflections */}
        <ContactShadows
          resolution={1024}
          scale={50}
          blur={2}
          opacity={0.5}
          far={10}
          color="#FFD1DC"
        />

        {/* Ambient Particles & Snow */}
        {config.showSnow && (
            <>
                <Sparkles 
                    count={100} 
                    scale={12} 
                    size={4} 
                    speed={0.4} 
                    opacity={0.5} 
                    color={config.ornamentColor} 
                />
                
                <Sparkles 
                    count={2000} 
                    scale={[20, 20, 20]} 
                    size={1.0} 
                    speed={0.8} 
                    opacity={0.6} 
                    color="#ffffff" 
                    noise={0.1}
                />
            </>
        )}
      </group>

      <Effects bloomIntensity={1.2} />
    </>
  );
};