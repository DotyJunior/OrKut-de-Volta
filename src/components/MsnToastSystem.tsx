import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Sparkles } from 'lucide-react';

interface FriendAlert {
  id: string;
  name: string;
  avatar: string;
  statusText: string;
  actionType: 'online' | 'away' | 'status-change';
}

const POPULAR_STATUS_PRESETS = [
  'ouvindo Linkin Park 🎸',
  'escrevendo compilador Rust 🦀',
  'perdido no ciber café 🖥️',
  'viajando sem rumo 🏔️',
  'jogando CS 1.6 - de faca! ⚔️',
  'comendo pinhão cozido quente 🌲',
  'configurando RSA keypairs 🔑'
];

export default function MsnToastSystem() {
  const [activeAlert, setActiveAlert] = useState<FriendAlert | null>(null);
  
  // Audio synthesizer for classic MSN signature popup tone
  const playMsnSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Quick double tone: Tugudum!
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // First drum tone (330Hz) starting instantly
      osc1.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      // Second bright chime tone (659.25Hz) starting with minor delay
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.075); // E5

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);

      osc2.start(ctx.currentTime + 0.075);
      osc2.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('MSN alert audio deferred.');
    }
  };

  useEffect(() => {
    // List of virtual friends for simulation
    const simulatedFriends = [
      {
        name: 'Alexandre Curi',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      },
      {
        name: 'Orkut Büyükkökten',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      },
      {
        name: 'H3_Elit3_Hacker',
        avatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150',
      }
    ];

    const triggers = [
      { statusText: 'acabou de entrar online!', actionType: 'online' as const },
      { statusText: 'ficou ausente.', actionType: 'away' as const },
      { statusText: 'atualizou o status personalizado.', actionType: 'status-change' as const },
    ];

    // Trigger first alert after 18 seconds, then periodically
    const triggerRandomAlert = () => {
      // Choose random friend
      const friend = simulatedFriends[Math.floor(Math.random() * simulatedFriends.length)];
      // Choose random action
      const trigger = triggers[Math.floor(Math.random() * triggers.length)];
      
      let finalStatusText = trigger.statusText;
      if (trigger.actionType === 'status-change') {
        const randomPreset = POPULAR_STATUS_PRESETS[Math.floor(Math.random() * POPULAR_STATUS_PRESETS.length)];
        finalStatusText = `mudou status: "${randomPreset}"`;
      }

      setActiveAlert({
        id: 'alert_' + Date.now(),
        name: friend.name,
        avatar: friend.avatar,
        statusText: finalStatusText,
        actionType: trigger.actionType
      });

      // Play MSN chime sound
      playMsnSound();

      // Dismiss automatically after 7 seconds
      setTimeout(() => {
        setActiveAlert(current => {
          if (current?.name === friend.name && current?.statusText === finalStatusText) {
            return null;
          }
          return current;
        });
      }, 7000);
    };

    // Set first interval
    const timeout = setTimeout(() => {
      triggerRandomAlert();
    }, 15000);

    // Continuous intervals
    const interval = setInterval(() => {
      triggerRandomAlert();
    }, 45000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none font-sans select-none">
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="pointer-events-auto w-72 bg-[#fdfdfd] border-2 border-sky-600 rounded shadow-[0_6px_20px_rgba(0,0,0,0.18)] overflow-hidden text-left"
          >
            {/* Header / MSN style window bar */}
            <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 text-white px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider flex justify-between items-center shadow-inner">
              <span className="flex items-center gap-1 font-mono">
                <span className="animate-pulse">💬</span> MSN Messenger Alerta
              </span>
              <button 
                onClick={() => setActiveAlert(null)}
                className="text-white/80 hover:text-white cursor-pointer hover:bg-white/10 p-0.5 rounded transition-colors"
              >
                <X size={10} />
              </button>
            </div>

            {/* Content box / MSN speech notification aesthetic */}
            <div className="p-3 bg-gradient-to-br from-[#ebf4fa] to-white flex items-center gap-3">
              {/* Profile Image with MSN status frame style */}
              <div className="relative">
                <img
                  src={activeAlert.avatar}
                  alt={activeAlert.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#10b981] shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-0.5 text-xs bg-[#e0f2fe] border border-sky-300 rounded px-0.5 leading-none">
                  {activeAlert.actionType === 'online' ? '🟢' : activeAlert.actionType === 'away' ? '🟡' : '✏️'}
                </span>
              </div>

              {/* Msg Content */}
              <div className="flex-1 min-w-0 text-left">
                <h5 className="text-[11.5px] font-bold text-neutral-800 tracking-tight truncate">
                  {activeAlert.name}
                </h5>
                <p className="text-[10px] text-[#1e3a8a] leading-snug mt-0.5">
                  {activeAlert.statusText}
                </p>
                <span className="text-[8px] text-neutral-400 font-mono mt-1 block">
                  MSN Service 2026.05.27
                </span>
              </div>
            </div>

            {/* Glowing bottom line indicator */}
            <div className="h-0.5 bg-gradient-to-r from-teal-400 via-sky-500 to-pink-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
