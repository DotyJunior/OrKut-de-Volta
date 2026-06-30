import React from "react";

interface CdInteractiveProps {
  isPlaying: boolean;
  coverUrl?: string;
  theme?: string;
}

export const CdInteractive: React.FC<CdInteractiveProps> = ({
  isPlaying,
}) => {
  return (
    <div className="relative w-36 h-36 mx-auto select-none group">
      {/* Outer Cyan Glow as seen in approved design */}
      <div
        className={`absolute inset-0 rounded-full blur-sm opacity-60 transition-all duration-1000 ${
          isPlaying ? "animate-pulse scale-105" : "scale-100"
        } bg-[#00ffff] shadow-[0_0_12px_rgba(0,255,255,0.6)]`}
      />

      {/* Main CD Body with Pink/Purple/Magenta glossy radial gradient */}
      <div
        id="interactive-cd-disc"
        className="relative w-full h-full rounded-full border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500"
        style={{
          background: "radial-gradient(circle, #000000 14%, #00f0ff 16%, #00f0ff 18%, #f472b6 22%, #e879f9 45%, #ec4899 75%, #a855f7 90%, #d946ef 100%)",
          animation: "spin 10s linear infinite",
          animationPlayState: isPlaying ? "running" : "paused",
          boxShadow: "inset 0 0 15px rgba(255,255,255,0.6), 0 0 15px rgba(0,255,255,0.5)",
        }}
      >
        {/* Shiny Refraction Glossy Conic Effects */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.3) 30deg, transparent 60deg, transparent 180deg, rgba(255,255,255,0.3) 210deg, transparent 240deg)",
          }}
        />
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
          style={{
            background: "conic-gradient(from 120deg, transparent 0deg, rgba(255,255,255,0.2) 40deg, transparent 80deg, transparent 180deg, rgba(255,255,255,0.2) 220deg, transparent 260deg)",
          }}
        />

        {/* Outer Circular Grooves for retro CD sheen */}
        <div className="absolute inset-3 rounded-full border border-white/20 pointer-events-none" />
        <div className="absolute inset-6 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-white/15 pointer-events-none" />

        {/* Center Black Hole with Cyan inner glowing border as seen in the screenshot */}
        <div className="absolute w-10 h-10 rounded-full bg-black border-2 border-[#00f0ff] shadow-[0_0_8px_#00f0ff] z-20 flex items-center justify-center">
          {/* Transparent-feeling center dot */}
          <div className="w-4 h-4 rounded-full bg-[#1e293b]" />
        </div>
      </div>
    </div>
  );
};

