import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';

interface EffectsProps {
  bloomIntensity: number;
}

export const Effects: React.FC<EffectsProps> = ({ bloomIntensity }) => {
  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        luminanceThreshold={0.8} 
        luminanceSmoothing={0.9} 
        height={300} 
        intensity={1.2} 
      />
      <Vignette eskil={false} offset={0.1} darkness={0.6} />
      <Noise opacity={0.02} />
    </EffectComposer>
  );
};