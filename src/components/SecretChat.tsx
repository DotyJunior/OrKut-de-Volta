import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Clock, Send, ShieldAlert, Circle, ChevronDown } from 'lucide-react';
import { Friend } from '../types';

interface ChatMessage {
  id: string;
  senderId: 'me' | string; // 'me' or characterId
  senderName: string;
  text: string;
  timestamp: string; // e.g. "14:32"
  createdAt: number; // raw epoch Ms for the 48-hour auto-deletion
  type?: 'photo' | 'text';
  photoUrl?: string;
  photoCaption?: string;
}

interface SecretChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; name: string; avatar: string; username: string };
  initialTargetFriendId?: string; // Friend currently selected or viewed
  friendsList: Friend[];
}

export default function SecretChat({
  isOpen,
  onClose,
  currentUser,
  initialTargetFriendId = 'lucas',
  friendsList
}: SecretChatProps) {
  // Local list of active secret chat partners (combining default Lucas Santos + others)
  const fullCharactersList = [
    {
      id: 'lucas',
      name: 'Lucas Santos',
      username: 'Lucas_Santos',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      online: true,
      bio: 'Eae parça! Sou o Lucas, curto muito bater papo de madrugada e relembrar as comunidades clássicas. Ativei meu canal seguro com criptografia de 48 horas!'
    },
    {
      id: 'alexandre',
      name: 'Alexandre Curi',
      username: 'alexandre.curi',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      online: true,
      bio: 'Presidente da Assembleia Legislativa do Paraná. Debatendo segurança cibernética.'
    },
    {
      id: 'orkut',
      name: 'Orkut Büyükkökten',
      username: 'orkut.b',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      online: true,
      bio: 'Founder of Orkut, celebrating zero-knowledge encryption.'
    },
    {
      id: 'hacker',
      name: 'H3_Elit3_Hacker',
      username: 'elit3.hacker',
      avatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150',
      online: true,
      bio: 'Auditor InfoSec aposentado que adora testar o borrow checker.'
    }
  ];

  // Set selected character
  const [activePartnerId, setActivePartnerId] = useState<string>(initialTargetFriendId);
  const [showPartnerSelector, setShowPartnerSelector] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const activePartner = fullCharactersList.find(p => p.id === activePartnerId) || fullCharactersList[0];

  // Load user fonts on mount
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;800&family=Bebas+Neue&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Update selection if prop initialTargetFriendId changes
  useEffect(() => {
    setActivePartnerId(initialTargetFriendId);
  }, [initialTargetFriendId]);

  // Clean-up expired messages and Load Saved Chat on mount & when activePartnerId changes
  useEffect(() => {
    if (!isOpen) return;

    const storageKey = `orkut_secure_secret_chat_${activePartnerId}`;
    const saved = localStorage.getItem(storageKey);
    let loadedMessages: ChatMessage[] = [];

    if (saved) {
      try {
        loadedMessages = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse secret chat history:", e);
      }
    } else {
      // Setup initial tutorial/welcome messages
      const nowMs = Date.now();
      if (activePartnerId === 'lucas') {
        loadedMessages = [
          {
            id: 'm_init_1',
            senderId: 'lucas',
            senderName: 'Lucas Santos',
            text: 'Fala Parça...\ncola na praça hj?',
            timestamp: new Date(nowMs - 5 * 60 * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            createdAt: nowMs - 5 * 60 * 1000,
          },
          {
            id: 'm_init_2',
            senderId: 'me',
            senderName: currentUser.name,
            text: 'to chegando kkk',
            timestamp: new Date(nowMs - 4 * 60 * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            createdAt: nowMs - 4 * 60 * 1000,
          }
        ];
      } else {
        loadedMessages = [
          {
            id: 'm_init_other',
            senderId: activePartnerId,
            senderName: activePartner.name,
            text: `Olá! Este é o nosso canal de chat 100% privado e temporário de 48 horas. Mande uma mensagem segura!`,
            timestamp: new Date(nowMs - 1 * 60 * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            createdAt: nowMs - 1 * 60 * 1000,
          }
        ];
      }
    }

    // FILTER MESSAGES: Remove older than 48 hours automatically
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    const cleanMessages = loadedMessages.filter(msg => msg.createdAt >= fortyEightHoursAgo);

    setMessages(cleanMessages);
    localStorage.setItem(storageKey, JSON.stringify(cleanMessages));

    // Scroll to bottom
    setTimeout(() => {
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    }, 100);
  }, [isOpen, activePartnerId]);

  // Handle auto-scroll on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendChatMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const storageKey = `orkut_secure_secret_chat_${activePartnerId}`;
    const nowMs = Date.now();
    const timeStr = new Date(nowMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: 'chat_' + Math.random().toString(36).substr(2, 9),
      senderId: 'me',
      senderName: currentUser.name,
      text: text,
      timestamp: timeStr,
      createdAt: nowMs
    };

    setMessages(prev => [...prev, newMsg]);

    // Read previous messages from storage to append correctly
    let savedMessages: ChatMessage[] = [];
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        savedMessages = JSON.parse(saved);
      } catch (err) {}
    }
    const updated = [...savedMessages, newMsg];
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Trigger synthetic/API response from the selected Orkut character!
    setIsTyping(true);

    try {
      // Call the character reply backend proxy
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: activePartnerId,
          userName: currentUser.name,
          userProfile: `Usuário do chat criptografado temporário de 48 horas.`,
          text: text,
          encrypt: true
        })
      });

      const data = await response.json();
      const replyText = data.reply || "Resposta enviada de forma criptografada.";

      const replyMsg: ChatMessage = {
        id: 'chat_rep_' + Math.random().toString(36).substr(2, 9),
        senderId: activePartnerId,
        senderName: activePartner.name,
        text: replyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
      };

      setMessages(prev => {
        const nextMsgs = [...prev, replyMsg];
        localStorage.setItem(storageKey, JSON.stringify(nextMsgs));
        return nextMsgs;
      });
    } catch (e) {
      console.error("Local fallback response execution during chat endpoint call:", e);
      // Fallbacks
      const fallbacks: Record<string, string> = {
        lucas: "Só vou TOMAR um Banho Ja tô saindo, blz? A gente se tromba!!",
        alexandre: "Excelente reflexão chapa! A Assembleia do Paraná apoia canais seguros.",
        orkut: "That structure is pure secure connection. Cheers my friend!",
        hacker: "Interceptei o quantum tunnel... mas essa chave descartável com exclusão em 48h me brecou."
      };

      const fallbackMsg: ChatMessage = {
        id: 'chat_fb_' + Math.random().toString(36).substr(2, 9),
        senderId: activePartnerId,
        senderName: activePartner.name,
        text: fallbacks[activePartnerId] || "Mensagem privada criptografada recebida com sucesso.",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
      };

      setMessages(prev => {
        const nextMsgs = [...prev, fallbackMsg];
        localStorage.setItem(storageKey, JSON.stringify(nextMsgs));
        return nextMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text) return;
    setMessageInput('');
    await sendChatMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    if (window.confirm("Deseja apagar permanentemente todas as mensagens desta conversa agora?")) {
      const storageKey = `orkut_secure_secret_chat_${activePartnerId}`;
      localStorage.removeItem(storageKey);
      setMessages([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      {/* Scope Variables Injected to exactly emulate Custom HTML template provided */}
      <div 
        className="chat-card w-[360px] max-w-full rounded-[20px] overflow-hidden flex flex-col font-sans border shadow-2xl relative"
        style={{
          backgroundColor: '#111827',
          borderColor: 'rgba(160, 60, 255, 0.35)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 40px rgba(160,60,255,0.18), 0 24px 64px rgba(0,0,0,0.7)',
          fontFamily: '"Exo 2", sans-serif',
        }}
      >
        {/* Custom Scoped inline styles for Animations and Scroll */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spinRing {
            to { transform: rotate(360deg); }
          }
          @keyframes scrollTicker {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes blink {
            0%, 100% { box-shadow: 0 0 0 2px rgba(0,230,118,0.2), 0 0 8px #00e676; }
            50%      { box-shadow: 0 0 0 4px rgba(0,230,118,0.05), 0 0 20px #00e676; }
          }
          .custom-avatar-ring {
            animation: spinRing 6s linear infinite;
          }
          .custom-online-dot {
            animation: blink 2.5s ease-in-out infinite;
          }
          .custom-ticker-track {
            animation: scrollTicker 14s linear infinite;
            will-change: transform;
          }
        `}} />

        {/* ── HEADER ─────────────────────── */}
        <div 
          className="chat-header flex items-center justify-between p-4 relative border-b border-[#a855f7]/20"
          style={{
            background: 'linear-gradient(180deg, rgba(160,60,255,0.08) 0%, transparent 100%)',
          }}
        >
          {/* Top colored aesthetic bar line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-[#00d4ff]" />

          <div className="flex items-center gap-3">
            {/* Cone ring avatar wrapper */}
            <div 
              className="avatar-shell w-11 h-11 rounded-full p-[2px] flex-shrink-0 custom-avatar-ring"
              style={{
                background: 'conic-gradient(#00d4ff 0deg, #a855f7 120deg, #f040c8 240deg, #00d4ff 360deg)'
              }}
            >
              <div className="avatar-inner w-full h-full rounded-full bg-[#1a2535] border border-[#111827] overflow-hidden flex items-center justify-center">
                <img 
                  src={activePartner.avatar} 
                  alt={activePartner.name}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* User credentials & selector switch */}
            <div className="header-text text-left flex flex-col gap-0.5 relative">
              <button 
                onClick={() => setShowPartnerSelector(!showPartnerSelector)}
                className="username font-semibold text-[#dce8ff] flex items-center gap-1 hover:text-[#00d4ff] text-[16px] tracking-wide cursor-pointer text-left bg-transparent border-none"
                style={{ fontFamily: '"Rajdhani", sans-serif' }}
              >
                @{activePartner.username}
                <ChevronDown size={14} className="opacity-70 mt-0.5" />
              </button>

              <div className="status-row flex items-center gap-1.5 text-[11px] text-[#6b7fa0]">
                <span className="online-dot w-2 h-2 rounded-full bg-[#00e676] custom-online-dot" />
                <span>Online Agora</span>
              </div>
            </div>
          </div>

          {/* Right Header Options (Clear History / Close) */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={clearChatHistory} 
              title="Limpar Histórico"
              className="p-1 text-neutral-400 hover:text-red-400 text-xs font-mono rounded cursor-pointer"
            >
              🧹 Limpar
            </button>
            <button 
              onClick={onClose} 
              className="text-neutral-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar Chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Dropdown custom partner selector floating menu */}
          <AnimatePresence>
            {showPartnerSelector && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-4 top-14 bg-[#111827] border border-[#a855f7]/30 rounded-lg shadow-xl p-2 z-50 w-56 text-left"
              >
                <div className="text-[9px] font-bold text-indigo-400 p-1 uppercase tracking-wider">Conversar com:</div>
                <div className="space-y-1">
                  {fullCharactersList.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePartnerId(item.id);
                        setShowPartnerSelector(false);
                      }}
                      className={`w-full p-1.5 text-xs flex items-center gap-2 rounded text-left transition-colors cursor-pointer ${
                        activePartnerId === item.id ? 'bg-[#a855f7]/15 text-[#00d4ff] font-bold' : 'hover:bg-white/5 text-neutral-300'
                      }`}
                    >
                      <img src={item.avatar} className="w-5 h-5 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[11px]">{item.name}</p>
                        <p className="text-[9px] text-neutral-500 truncate">@{item.username}</p>
                      </div>
                      <Circle size={8} className="fill-[#00e676] text-[#00e676] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── TICKER COLOURED TEXT LETREIRO ────────────── */}
        <div 
          className="ticker-band overflow-hidden flex items-center h-8 relative select-none"
          style={{
            backgroundColor: '#070810',
            borderTop: '1px solid rgba(248, 40, 200, 0.3)',
            borderBottom: '1px solid rgba(248, 40, 200, 0.3)'
          }}
        >
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.15)_50%,_rgba(0,0,0,0)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />

          <div className="custom-ticker-track flex whitespace-nowrap">
            <span 
              className="ticker-item px-10 text-[11px] uppercase tracking-[3px] font-bold"
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                color: '#ff38c8',
                textShadow: '0 0 6px #ff38c8, 0 0 18px #c800ff'
              }}
            >
              ⚠ essa conversa apaga permanente em 48 horas &nbsp;·&nbsp; ⚠ essa conversa apaga permanente em 48 horas &nbsp;·&nbsp; ⚠ essa conversa apaga permanente em 48 horas &nbsp;·&nbsp;
            </span>
            <span 
              className="ticker-item px-10 text-[11px] uppercase tracking-[3px] font-bold"
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                color: '#ff38c8',
                textShadow: '0 0 6px #ff38c8, 0 0 18px #c800ff'
              }}
            >
              ⚠ essa conversa apaga permanente em 48 horas &nbsp;·&nbsp; ⚠ essa conversa apaga permanente em 48 horas &nbsp;·&nbsp; ⚠ essa conversa apaga permanente em 48 horas &nbsp;·&nbsp;
            </span>
          </div>
        </div>

        {/* ── MESSAGES FEED ───────────────────── */}
        <div 
          ref={feedRef}
          className="messages-feed flex-1 p-4 flex flex-col gap-3 overflow-y-auto bg-white min-h-[220px] max-h-[340px] scrollbar-thin scrollbar-thumb-indigo-200"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6 text-neutral-400 italic text-xs">
              <Shield className="text-indigo-400 mb-1.5 opacity-60" size={20} />
              <p>Nenhuma mensagem ativa.</p>
              <p className="text-[10px] mt-1 text-neutral-500">Conversas expiram totalmente após 48 horas.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === 'me';

              return (
                <div 
                  key={msg.id}
                  className={`bubble max-w-[78%] p-2.5 px-3.5 text-[13px] leading-relaxed rounded-[16px] relative break-all text-left shadow-sm ${
                    isMe 
                      ? 'self-end bg-[#1a1035] text-[#ddd0ff] rounded-br-[4px] border border-[#a855f7]/15' 
                      : 'self-start bg-[#1e2d42] text-[#c8ddf5] rounded-bl-[4px] border border-[#00d4ff]/12'
                  }`}
                >
                  {(() => {
                    const isPhoto = msg.text.startsWith('📸 [Foto Anexada]');
                    if (isPhoto) {
                      const urlMatch = msg.text.match(/\((https?:\/\/[^\s]+)\)/);
                      const photoUrl = urlMatch ? urlMatch[1] : '';
                      const captionMatch = msg.text.match(/Referência: (.*) \(/);
                      const photoCaption = captionMatch ? captionMatch[1] : 'Foto';
                      const actualText = msg.text.replace('📸 [Foto Anexada] ', '').replace(/ - Referência: .*\(.*\)/, '');
                      
                      return (
                        <div className="flex flex-col gap-2">
                           <p className="font-bold">📸 Foto Compartilhada</p>
                           {photoUrl && (
                             <a href={photoUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg">
                                <img src={photoUrl} alt={photoCaption} loading="lazy" className="max-w-full h-auto" />
                             </a>
                           )}
                           <p className="font-semibold text-xs">{photoCaption}</p>
                           {actualText && <p className="whitespace-pre-line font-sans font-medium">"{actualText}"</p>}
                           <a href={photoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline cursor-pointer">
                              Abrir Foto
                           </a>
                        </div>
                      );
                    }
                    return <p className="whitespace-pre-line font-sans font-medium">{msg.text}</p>;
                  })()}
                  <span 
                    className="bubble-time text-[8px] text-[#6b7fa0] block mt-1 tracking-wider"
                    style={{
                      fontFamily: '"Share Tech Mono", monospace',
                      textAlign: isMe ? 'right' : 'left'
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              );
            })
          )}

          {/* Typing state bubble */}
          {isTyping && (
            <div className="self-start max-w-[70%] p-2.5 px-3.5 bg-[#1e2d42]/90 text-[#c8ddf5] rounded-[16px] rounded-bl-[4px] border border-[#00d4ff]/10 text-xs italic flex items-center gap-1.5 shadow-sm text-left">
              <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="font-sans font-medium ml-1 text-[#6b7fa0]">@{activePartner.username} está digitando...</span>
            </div>
          )}
        </div>

        {/* ── INPUT ZONE ─────────────────────── */}
        <div 
          className="input-zone p-4 bg-black/25 border-t border-[#a855f7]/12 flex flex-col gap-2.5 text-left"
        >
          <div className="textarea-wrap relative">
            <textarea
              id="chat-message-input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value.slice(0, 300))}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={2}
              className="msg-input w-full bg-white/5 border border-[#a855f7]/20 rounded-xl p-3 text-neutral-100 placeholder-neutral-600 text-xs focus:outline-none focus:border-[#a855f7]/60 focus:ring-1 focus:ring-[#a855f7]/20 resize-none font-sans leading-relaxed"
            />
          </div>

          <div className="input-footer flex justify-between items-center sm:gap-2">
            {/* Limit counter */}
            <span 
              className="char-count text-[10px] text-[#6b7fa0] select-none"
              style={{ fontFamily: '"Share Tech Mono", monospace' }}
            >
              {messageInput.length} / 300
            </span>

            {/* Expire alert icon next to button */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-[#6b7fa0] hidden sm:flex items-center gap-1 opacity-75 select-none uppercase">
                <Clock size={10} /> Canal Temporário
              </span>
              <button 
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="send-btn px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #7c22e0, #b040f0)',
                  fontFamily: '"Rajdhani", sans-serif',
                  boxShadow: messageInput.trim() ? '0 0 16px rgba(168,85,247,0.4)' : 'none'
                }}
              >
                <Send size={11} />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
