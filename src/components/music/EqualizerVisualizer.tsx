import React, { useEffect, useState, useRef } from "react";

interface EqualizerVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  theme?: string;
  className?: string;
}

export const EqualizerVisualizer: React.FC<EqualizerVisualizerProps> = ({
  isPlaying,
  audioRef,
  theme = "default",
  className = "w-full bg-[#293545] rounded-xl py-3 px-4 flex items-end justify-center gap-1 h-16 select-none border border-[#1e293b]/30",
}) => {
  const barCount = 14;
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(15));
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    // If we have an active audio element and we are playing, try to connect Web Audio Analyser
    if (isPlaying && audioRef?.current) {
      try {
        const audio = audioRef.current;
        
        // Only initialize AudioContext once
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        }

        const ctx = audioContextRef.current;
        if (ctx) {
          // Resume if suspended (browser security)
          if (ctx.state === "suspended") {
            ctx.resume();
          }

          // Create Analyser if not created
          if (!analyserRef.current) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64; // Small fft for few bars
            analyserRef.current = analyser;
          }

          const analyser = analyserRef.current;

          // Connect audio element source to analyser
          // Note: HTMLMediaElement can only be connected once to a source node.
          if (!sourceRef.current) {
            try {
              const src = ctx.createMediaElementSource(audio);
              sourceRef.current = src;
              src.connect(analyser);
              analyser.connect(ctx.destination);
            } catch (err) {
              console.warn("Could not connect audio node to analyser (CORS or already connected):", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to setup Web Audio API analyser:", err);
      }
    }

    // Loop function to update heights
    const updateEqualizer = () => {
      if (!isPlaying) {
        // Slow decay to baseline when paused/stopped
        setHeights((prev) => prev.map((h) => Math.max(4, h - 2)));
        animationRef.current = requestAnimationFrame(updateEqualizer);
        return;
      }

      const analyser = analyserRef.current;
      const ctx = audioContextRef.current;

      if (analyser && ctx && ctx.state === "running") {
        // Use real audio frequencies
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const newHeights = Array(barCount)
          .fill(0)
          .map((_, i) => {
            // Map the frequency bin data to visual height (4px to 45px)
            const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
            const val = dataArray[dataIndex] || 0;
            const mappedHeight = Math.max(4, Math.floor((val / 255) * 45));
            return mappedHeight;
          });
        setHeights(newHeights);
      } else {
        // Fallback procedural animation when audio analyser is not connected/supported
        setHeights((prev) =>
          prev.map(() => {
            const delta = Math.floor(Math.random() * 15) - 7;
            const target = 22 + delta;
            return Math.min(45, Math.max(4, target));
          })
        );
      }

      animationRef.current = requestAnimationFrame(updateEqualizer);
    };

    updateEqualizer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioRef]);

  // Determine color theme for equalizer bars - always bright green/mint as in approved screenshot
  const getBarColor = () => {
    return "bg-[#00ffaa] shadow-[0_0_8px_rgba(0,255,170,0.6)]";
  };

  return (
    <div className={className}>
      {heights.map((height, idx) => (
        <div
          key={idx}
          className={`w-1.5 rounded-sm transition-all duration-75 ${getBarColor()}`}
          style={{
            height: `${Math.max(4, height)}px`,
            transitionProperty: "height",
          }}
        />
      ))}
    </div>
  );
};
