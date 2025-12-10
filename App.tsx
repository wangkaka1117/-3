import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { AppState, SILVER_COLOR } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppState>({
    rotate: true,
    bloomIntensity: 1.5,
    lightColor: "#ffffff",
    ornamentColor: SILVER_COLOR, // Default to Silver for the Pink/Black theme
    showSnow: true,
    isScattered: false,
  });

  const handleConfigChange = (key: keyof AppState, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Background Gradient for Pink/Black theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a050a] via-[#050002] to-black z-0" />

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 4, 20], fov: 45 }} // Updated Camera Position
        className="z-10"
      >
        <Suspense fallback={null}>
          <Scene config={config} setConfig={setConfig} />
        </Suspense>
      </Canvas>

      <UI config={config} onConfigChange={handleConfigChange} />
      
      {/* Loading Overlay */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black text-[#FFD1DC] font-serif">
          <span className="animate-pulse tracking-widest">LOADING EXPERIENCE...</span>
        </div>
      }>
       {null}
      </Suspense>
    </div>
  );
};

export default App;