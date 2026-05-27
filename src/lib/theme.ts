export interface ThemeStyle {
  bg: string;
  cardBg: string;
  text: string;
  borderClass: string;
  accent: string;
  glow: string;
  font: string;
  bannerGradient: string;
  badgeBg: string;
  badgeText: string;
}

export const getThemeStyles = (themeId: string = 'default'): ThemeStyle => {
  // Always force standard light Orkut theme (#dee7f4 background and white blocks)
  const finalThemeId: string = 'default';
  switch (finalThemeId) {
    case 'neon-hacker':
      return {
        bg: 'bg-black text-[#22c55e]',
        cardBg: 'bg-[#050505] border-[#22c55e] border text-[#22c55e]',
        text: 'text-[#22c55e]',
        borderClass: 'border-[#22c55e]/60 border-double border-4',
        accent: 'text-green-400 bg-green-950/40 border-green-500 border',
        glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        font: 'font-mono uppercase tracking-wider',
        bannerGradient: 'from-black via-zinc-950 to-green-950 border-[#22c55e] border-b',
        badgeBg: 'bg-green-950 border-green-500 border',
        badgeText: 'text-green-300'
      };
    case 'emo-2008':
      return {
        bg: 'bg-neutral-950 text-[#ec4899]',
        cardBg: 'bg-zinc-900 border-[#ec4899] border text-white',
        text: 'text-[#ec4899]',
        borderClass: 'border-[#ec4899] border-dashed border-2',
        accent: 'text-[#f43f5e] bg-[#ec4899]/10 border-[#ec4899] border',
        glow: 'shadow-[0_0_15px_rgba(236,72,153,0.4)]',
        font: 'font-sans',
        bannerGradient: 'from-pink-950 via-neutral-900 to-purple-950 border-[#ec4899] border-b',
        badgeBg: 'bg-pink-950 border-[#ec4899] border',
        badgeText: 'text-pink-300'
      };
    case 'rock-underground':
      return {
        bg: 'bg-zinc-900 text-[#f97316]',
        cardBg: 'bg-zinc-950 border-zinc-800 border text-neutral-200',
        text: 'text-[#f97316]',
        borderClass: 'border-[#f97316] border-2',
        accent: 'text-red-500 bg-red-950/20 border-[#f97316] border',
        glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]',
        font: 'font-sans',
        bannerGradient: 'from-neutral-950 via-zinc-900 to-[#7c2d12] border-[#f97316] border-b',
        badgeBg: 'bg-orange-950 border-orange-500 border',
        badgeText: 'text-orange-300'
      };
    case 'cyberdeck':
      return {
        bg: 'bg-[#0f172a] text-[#06b6d4]',
        cardBg: 'bg-[#1e293b]/90 border-[#06b6d4] border text-[#06b6d4]',
        text: 'text-[#06b6d4]',
        borderClass: 'border-[#06b6d4]/50 border-2 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
        accent: 'text-fuchsia-400 bg-[#1e1b4b] border-[#d946ef] border',
        glow: 'shadow-[0_0_12px_rgba(217,70,239,0.35)]',
        font: 'font-mono',
        bannerGradient: 'from-[#0f172a] via-[#1e1b4b] to-[#4c1d95] border-[#06b6d4] border-b',
        badgeBg: 'bg-[#155e75] border-[#06b6d4] border',
        badgeText: 'text-cyan-200'
      };
    case 'vaporwave':
      return {
        bg: 'bg-gradient-to-tr from-[#fbcfe8] via-[#e9d5ff] to-[#ccfbf1] text-[#9333ea]',
        cardBg: 'bg-white/85 border-[#d946ef] border backdrop-blur-xs text-[#9333ea]',
        text: 'text-[#9333ea]',
        borderClass: 'border-[#d946ef]/60 border-2 border-double',
        accent: 'text-cyan-600 bg-[#ccfbf1]/50 border-cyan-300 border-b',
        glow: 'shadow-[4px_4px_0px_#9333ea]',
        font: 'font-sans italic',
        bannerGradient: 'from-pink-300 via-purple-300 to-cyan-300 border-b-2 border-[#d946ef]',
        badgeBg: 'bg-purple-100 border-[#d946ef] border',
        badgeText: 'text-purple-700'
      };
    case 'minimal-oldweb':
      return {
        bg: 'bg-[#d5d0c9] text-black',
        cardBg: 'bg-[#d5d0c9] border-white border-t-2 border-l-2 border-b-black border-r-black border text-black',
        text: 'text-black',
        borderClass: 'border-t-2 border-l-2 border-b-stone-800 border-r-stone-800 border bg-[#d5d0c9]',
        accent: 'text-black bg-[#d5d0c9] border-black border',
        glow: 'shadow-none',
        font: 'font-serif',
        bannerGradient: 'from-stone-400 via-stone-300 to-stone-500 border-b-2 border-black',
        badgeBg: 'bg-stone-300 border-stone-500 border',
        badgeText: 'text-black'
      };
    case 'gotico-retro':
      return {
        bg: 'bg-[#0f0505] text-[#991b1b]',
        cardBg: 'bg-[#1a0f0f] border-[#991b1b] border text-[#fca5a5]',
        text: 'text-[#991b1b]',
        borderClass: 'border-[#991b1b] border-2 shadow-[0_0_10px_rgba(153,27,27,0.5)]',
        accent: 'text-red-400 bg-red-950/40 border-red-700 border',
        glow: 'shadow-[0_0_15px_#991b1b]',
        font: 'font-serif italic',
        bannerGradient: 'from-[#0f0505] via-[#450a0a] to-zinc-950 border-b border-[#991b1b]',
        badgeBg: 'bg-red-950 border-red-700 border',
        badgeText: 'text-red-300'
      };
    case 'matrix-terminal':
      return {
        bg: 'bg-black text-[#15803d]',
        cardBg: 'bg-black border-[#15803d] border text-[#22c55e]',
        text: 'text-[#22c55e]',
        borderClass: 'border-[#15803d]/70 border',
        accent: 'text-emerald-400 bg-black border-emerald-500 border',
        glow: 'shadow-[inset_0_0_10px_#15803d]',
        font: 'font-mono uppercase',
        bannerGradient: 'from-black via-[#041a0e] to-black border-b border-emerald-800',
        badgeBg: 'bg-black border-emerald-700 border',
        badgeText: 'text-emerald-400'
      };
    default:
      return {
        bg: 'bg-[#dee7f4] text-neutral-800',
        cardBg: 'bg-white border-neutral-300 border text-neutral-800',
        text: 'text-neutral-800',
        borderClass: 'border-neutral-300 border',
        accent: 'text-[#1d4ed8] bg-[#dee7f4]/40 border-[#adc3df] border',
        glow: 'shadow-sm',
        font: 'font-sans',
        bannerGradient: 'from-[#dee7f4] via-[#c6d7ed] to-[#dee7f4] border-b border-[#9ebade]',
        badgeBg: 'bg-[#dee7f4] border-[#adc3df] border',
        badgeText: 'text-[#1d4ed8]'
      };
  }
};
