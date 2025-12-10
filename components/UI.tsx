import React, { useState } from 'react';
import { AppState, GOLD_COLOR, SILVER_COLOR, PALE_PINK } from '../types';

interface UIProps {
  config: AppState;
  onConfigChange: (key: keyof AppState, value: any) => void;
}

const BLESSINGS = [
    "May your days be merry and bright.",
    "Wishing you peace, love, and joy this holiday season.",
    "Ho Ho Ho! Happiness is coming your way.",
    "May the magic of Christmas fill your heart.",
    "Sending you warm wishes and holiday cheer.",
    "Sparkle and shine, it's Christmas time!",
    "Joy to the world, and especially to you.",
    "May all your Christmas dreams come true."
];

export const UI: React.FC<UIProps> = ({ config, onConfigChange }) => {
  const [showBlessing, setShowBlessing] = useState(false);
  const [blessingText, setBlessingText] = useState("");

  const handleBlessingClick = () => {
    const randomBlessing = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
    setBlessingText(randomBlessing);
    setShowBlessing(true);
  };

  return (
    <>
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-20 font-sans">
        
        {/* Header */}
        <div className="flex flex-col items-center w-full pointer-events-auto select-none mt-8 md:mt-4">
            <h1 className="text-5xl md:text-8xl font-serif text-[#FFD1DC] drop-shadow-[0_0_15px_rgba(255,209,220,0.5)] tracking-widest text-center" style={{ textShadow: '0 0 20px #FFD1DC' }}>
            MERRY CHRISTMAS
            </h1>
            <p className="text-[#FFD1DC]/70 text-sm mt-2 tracking-[0.3em] uppercase">Interactive Experience</p>
        </div>

        {/* Gesture Guide Hint */}
        <div className="absolute top-1/2 left-6 transform -translate-y-1/2 pointer-events-none opacity-50 hidden md:block">
            <div className="text-[#FFD1DC] text-xs space-y-2">
                <p>🖐️ Open Hand: Unleash</p>
                <p>✊ Closed Fist: Assemble</p>
                <p>👋 Move Hand: Rotate View</p>
            </div>
        </div>

        {/* Bottom Controls */}
        <div className="w-full max-w-3xl mx-auto backdrop-blur-xl bg-black/60 border border-[#FFD1DC]/20 rounded-full p-4 pointer-events-auto transition-all hover:bg-black/80 hover:border-[#FFD1DC]/40 shadow-[0_0_30px_rgba(255,209,220,0.1)]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                
                {/* Toggles */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => onConfigChange('isScattered', !config.isScattered)}
                        className={`px-8 py-3 rounded-full font-serif text-sm font-bold uppercase tracking-wider transition-all duration-500 border
                            ${!config.isScattered 
                                ? 'bg-transparent text-[#FFD1DC] border-[#FFD1DC] hover:bg-[#FFD1DC] hover:text-black shadow-[0_0_10px_#FFD1DC]' 
                                : 'bg-[#FFD1DC] text-black border-[#FFD1DC] hover:bg-transparent hover:text-[#FFD1DC]'
                            }`}
                    >
                        {config.isScattered ? 'Assemble' : 'Unleash'}
                    </button>
                    
                    {/* Blessing Button */}
                    <button
                        onClick={handleBlessingClick}
                        className="w-12 h-12 flex items-center justify-center rounded-full border border-[#FFD1DC] text-[#FFD1DC] hover:bg-[#FFD1DC] hover:text-black transition-all shadow-[0_0_10px_rgba(255,209,220,0.3)]"
                        title="Get a Blessing"
                    >
                        🎁
                    </button>
                </div>

                {/* Color Pickers */}
                <div className="flex gap-4">
                    <div 
                        onClick={() => onConfigChange('ornamentColor', SILVER_COLOR)} 
                        className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${config.ornamentColor === SILVER_COLOR ? 'border-[#FFD1DC] scale-110 shadow-[0_0_15px_#C0C0C0]' : 'border-transparent bg-[#C0C0C0]/20'}`}
                        style={{ backgroundColor: SILVER_COLOR }}
                        title="Silver"
                    />
                    <div 
                        onClick={() => onConfigChange('ornamentColor', GOLD_COLOR)} 
                        className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${config.ornamentColor === GOLD_COLOR ? 'border-[#FFD1DC] scale-110 shadow-[0_0_15px_#FFD700]' : 'border-transparent bg-[#FFD700]/20'}`}
                        style={{ backgroundColor: GOLD_COLOR }}
                        title="Gold"
                    />
                    <div 
                        onClick={() => onConfigChange('ornamentColor', PALE_PINK)} 
                        className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${config.ornamentColor === PALE_PINK ? 'border-white scale-110 shadow-[0_0_15px_#FFD1DC]' : 'border-transparent bg-[#FFD1DC]/20'}`}
                        style={{ backgroundColor: PALE_PINK }}
                        title="Pink"
                    />
                </div>

            </div>
        </div>
        </div>

        {/* Blessing Modal */}
        {showBlessing && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto" onClick={() => setShowBlessing(false)}>
                <div 
                    className="bg-[#FFD1DC] text-black p-10 rounded-[3rem] max-w-md w-full text-center transform transition-all scale-100 shadow-[0_0_50px_rgba(255,209,220,0.6)] cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-4xl mb-4">🎄</div>
                    <h3 className="font-serif text-2xl font-bold mb-4 tracking-wider">A Holiday Wish</h3>
                    <p className="font-sans text-lg leading-relaxed italic">
                        "{blessingText}"
                    </p>
                    <button 
                        onClick={() => setShowBlessing(false)}
                        className="mt-8 px-6 py-2 bg-black text-[#FFD1DC] rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
    </>
  );
};