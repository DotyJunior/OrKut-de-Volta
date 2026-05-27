import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MessageSquare, 
  Star, 
  Users, 
  Heart, 
  Eye, 
  Paperclip, 
  Plus, 
  Mail, 
  Send, 
  ShieldCheck, 
  Check, 
  X,
  Sparkles,
  Award
} from 'lucide-react';
import { Friend, Community } from '../types';

interface SocialSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  friends: Friend[];
  communities: Community[];
  onNavigateToFriend: (id: string) => void;
  themeStyles: any; // injected theme style
}

export default function SocialSidebar({
  currentTab,
  setCurrentTab,
  friends,
  communities,
  onNavigateToFriend,
  themeStyles,
}: SocialSidebarProps) {
  // Invite states
  const [inviteInput, setInviteInput] = useState('');
  const [invitesLeft, setInvitesLeft] = useState(3);
  const [selectedPhrase, setSelectedPhrase] = useState('As comunidades voltaram.');
  const [isSending, setIsSending] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [invitationsList, setInvitationsList] = useState<string[]>([]);

  // Modals / Dropdowns toggles
  const [activeModal, setActiveModal] = useState<'none' | 'visitors' | 'favorites' | 'friends'>('none');

  // Phrases list
  const invitePhrases = [
    'As comunidades voltaram.',
    'Achei que você sentiria falta da internet antiga.',
    'Volta pro lado humano da internet.',
    'Seu perfil ainda existe em algum lugar da memória.'
  ];

  // Simulated Visitors
  const mockVisitors = [
    { name: 'Alexandre Curi', time: 'Há 3 minutos', status: '🛡️ Conexão Segura', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' },
    { name: 'Orkut Büyükkökten', time: 'Há 1 hora', status: '🔑 Assinatura Verificada', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { name: 'H3_Elit3_Hacker', time: 'Há 4 horas', status: '🕵️ Auditor do Sandbox', avatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150' },
    { name: 'Ana 2008 (Estudante)', time: 'Ontem', status: '⏳ Conectada via Cyber Café', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }
  ];

  // Send invite sequence
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim() || invitesLeft <= 0 || isSending) return;

    setIsSending(true);
    setShowAnimation(true);

    // Simulated MSN sound chime would run here. We use an amazing visual envelope path animation!
    setTimeout(() => {
      setIsSending(false);
      setInvitesLeft(prev => prev - 1);
      setInvitationsList(prev => [...prev, inviteInput]);
      setInviteInput('');
      
      // Keep envelope visible for a short time
      setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Social Navigation Menu Block */}
      <div className={`rounded overflow-hidden transition-all ${themeStyles.cardBg} ${themeStyles.glow}`}>
        <div className={`px-3 py-1.5 text-[11px] font-bold uppercase ${themeStyles.accent}`}>
          Menu Social
        </div>
        <div className={`flex flex-col text-xs font-sans text-left ${themeStyles.font}`}>
          {/* 1. PERFIL */}
          <button
            id="sidebar-nav-profile"
            onClick={() => setCurrentTab('profile')}
            className={`px-3 py-2.5 transition-colors border-b border-dashed border-neutral-200/50 flex items-center gap-2 cursor-pointer text-left ${
              currentTab === 'profile' ? 'bg-neutral-100/30 font-bold text-[#d946ef]' : 'hover:bg-neutral-100/15'
            }`}
          >
            <User size={13} className="text-[#1d4ed8]" />
            <span>Perfil</span>
          </button>

          {/* 2. RECADOS */}
          <button
            id="sidebar-nav-scrapbook"
            onClick={() => setCurrentTab('scrapbook')}
            className={`px-3 py-2.5 transition-colors border-b border-dashed border-neutral-200/50 flex items-center justify-between cursor-pointer text-left ${
              currentTab === 'scrapbook' ? 'bg-neutral-100/30 font-bold text-[#d946ef]' : 'hover:bg-neutral-100/15'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare size={13} className="text-[#1d4ed8]" />
              <span>Recados</span>
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold">Secure</span>
          </button>

          {/* 3. DEPOIMENTOS */}
          <button
            id="sidebar-nav-testimonials"
            onClick={() => setCurrentTab('testimonials')}
            className={`px-3 py-2.5 transition-colors border-b border-dashed border-neutral-200/50 flex items-center justify-between cursor-pointer text-left ${
              currentTab === 'testimonials' ? 'bg-neutral-100/30 font-bold text-[#d946ef]' : 'hover:bg-neutral-100/15'
            }`}
          >
            <span className="flex items-center gap-2">
              <Star size={13} className="text-yellow-600" />
              <span>Depoimentos</span>
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold">Safe Heap</span>
          </button>

          {/* 3.5. ÁLBUM DE FOTOS */}
          <button
            id="sidebar-nav-photos"
            onClick={() => {
              try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                  const ctx = new AudioContextClass();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.type = 'sine';
                  osc.frequency.setValueAtTime(1400, ctx.currentTime);
                  gain.gain.setValueAtTime(0.04, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.08);
                }
              } catch (e) {}
              setCurrentTab('photos');
            }}
            className={`px-3 py-2.5 transition-colors border-b border-dashed border-neutral-200/50 flex items-center justify-between cursor-pointer text-left ${
              currentTab === 'photos' ? 'bg-neutral-100/30 font-bold text-[#d946ef]' : 'hover:bg-neutral-100/15'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-pink-600 font-sans">📸</span>
              <span>Álbum de Fotos</span>
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold">Nostalgic</span>
          </button>

          {/* 4. COMUNIDADES */}
          <button
            id="sidebar-nav-communities"
            onClick={() => setCurrentTab('communities')}
            className={`px-3 py-2.5 transition-colors border-b border-dashed border-neutral-200/50 flex items-center gap-2 cursor-pointer text-left ${
              currentTab === 'communities' ? 'bg-neutral-100/30 font-bold text-[#d946ef]' : 'hover:bg-neutral-100/15'
            }`}
          >
            <Users size={13} className="text-pink-600" />
            <span>Comunidades</span>
          </button>

          {/* 5. AMIGOS (MODAL TOGGLE) */}
          <button
            id="sidebar-nav-friends-popup"
            onClick={() => setActiveModal(activeModal === 'friends' ? 'none' : 'friends')}
            className={`px-3 py-2.5 transition-colors border-b border-dashed border-neutral-200/50 flex items-center justify-between cursor-pointer text-left hover:bg-neutral-100/15`}
          >
            <span className="flex items-center gap-2">
              <Heart size={13} className="text-red-500" />
              <span>Amigos</span>
            </span>
            <span className="text-[9px] bg-neutral-200/75 px-1 py-0.2 rounded text-neutral-600 font-bold font-mono">
              {friends.length} conectores
            </span>
          </button>

          {/* 6. VISITANTES (MODAL TOGGLE) */}
          <button
            id="sidebar-nav-visitors-popup"
            onClick={() => setActiveModal(activeModal === 'visitors' ? 'none' : 'visitors')}
            className={`px-3 py-2.5 transition-colors border-b border-dashed border-neutral-200/50 flex items-center justify-between cursor-pointer text-left hover:bg-neutral-100/15`}
          >
            <span className="flex items-center gap-2">
              <Eye size={13} className="text-[#d946ef]" />
              <span>Visitantes</span>
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-1 text-[8px] font-bold rounded">ONLINE NOW</span>
          </button>

          {/* 7. FAVORITOS (MODAL TOGGLE) */}
          <button
            id="sidebar-nav-favorites-popup"
            onClick={() => setActiveModal(activeModal === 'favorites' ? 'none' : 'favorites')}
            className={`px-3 py-2.5 transition-colors flex items-center justify-between cursor-pointer text-left hover:bg-neutral-100/15`}
          >
            <span className="flex items-center gap-2">
              <Award size={13} className="text-amber-500" />
              <span>Favoritos</span>
            </span>
            <span className="text-neutral-500 text-[10px]">★ Destacados</span>
          </button>
        </div>
      </div>

      {/* Floating Interactive Custom Popup for Amigos, Visitantes, Favoritos */}
      {activeModal !== 'none' && (
        <div className="border border-neutral-300 rounded overflow-hidden shadow-md bg-[#fffdfa] text-left">
          <div className="bg-[#dee7f4] px-3 py-1.5 flex justify-between items-center border-b border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-800 uppercase flex items-center gap-1">
              {activeModal === 'friends' && '👥 Painel de Conexões'}
              {activeModal === 'visitors' && '👁️ Quem andou fofocando (Visitantes)'}
              {activeModal === 'favorites' && '★ Seus Favoritos Estrela'}
            </span>
            <button onClick={() => setActiveModal('none')} className="text-neutral-500 hover:text-black cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="p-3 text-xs">
            {activeModal === 'friends' && (
              <div className="space-y-2">
                <p className="text-[11px] text-neutral-600 italic">Conversas criptografadas ponta-a-ponta abertas:</p>
                <div className="grid grid-cols-1 gap-2">
                  {friends.map(f => (
                    <div 
                      key={f.id} 
                      onClick={() => {
                        onNavigateToFriend(f.id);
                        setActiveModal('none');
                      }}
                      className="p-1 px-2 border border-neutral-200 hover:border-pink-300 rounded flex items-center gap-2 bg-white cursor-pointer transition-colors"
                    >
                      <img src={f.avatar} className="w-6 h-6 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[11px] truncate">{f.name}</p>
                        <p className="text-[9px] text-[#1d4ed8] font-mono">Chave Ed25519 ativa</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'visitors' && (
              <div className="space-y-2">
                <p className="text-[10px] text-neutral-600">Esses viajantes visitaram seu scrapbook e validaram seu borrow checking nas últimas 24 horas:</p>
                <div className="space-y-1.5">
                  {mockVisitors.map((v, i) => (
                    <div key={i} className="flex gap-2 items-center p-1.5 border-b border-dashed border-neutral-200 bg-white rounded">
                      <img src={v.avatar} className="w-6 h-6 rounded-full object-cover" />
                      <div className="text-[10px] flex-1">
                        <div className="font-bold flex justify-between">
                          <span>{v.name}</span>
                          <span className="text-[8px] text-neutral-400">{v.time}</span>
                        </div>
                        <span className="text-[8px] text-green-700 font-mono font-semibold">{v.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'favorites' && (
              <div className="space-y-2 text-center py-2">
                <p className="text-[10px] text-neutral-600">Perfís com carimbo de integridade de ouro:</p>
                <div className="flex justify-center gap-3">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-400 overflow-hidden mx-auto">
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" className="object-cover w-full h-full" />
                    </div>
                    <span className="text-[9px] font-bold block mt-1 text-orange-850">Junior (Me)</span>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-400 overflow-hidden mx-auto">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" className="object-cover w-full h-full" />
                    </div>
                    <span className="text-[9px] font-bold block mt-1 text-orange-850">Orkut B.</span>
                  </div>
                </div>
                <div className="p-1 px-2 border border-amber-200 bg-amber-50 rounded text-[9px] text-amber-800 font-mono">
                  ★ O algoritmo não decide suas conexões, você decide no abraço.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BLOCK — CONVIDAR AMIGO */}
      <div className={`border border-neutral-300 rounded shadow-sm overflow-hidden text-left bg-[#fffdf8]`}>
        <div className={`bg-[#dee7f4] border-b border-neutral-200 px-3 py-1.5 flex items-center justify-between`}>
          <span className="text-[11px] font-bold text-neutral-700 uppercase flex items-center gap-1">
            <Plus size={13} className="text-[#d946ef]" /> Convidar Amigo
          </span>
          <span className="text-[9px] bg-pink-100 text-[#d946ef] font-bold px-1.5 py-0.2 rounded font-mono">
            {invitesLeft} RESTANTES
          </span>
        </div>

        <div className="p-3 text-xs flex flex-col justify-between min-h-[190px]">
          {invitesLeft > 0 ? (
            <form onSubmit={handleSendInvite} className="flex flex-col gap-2 relative">
              <label className="text-[10px] font-bold text-neutral-600 uppercase">Username ou E-mail:</label>
              <input
                id="sidebar-invite-input"
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="Ex: rust.nomad ou dario@gmail.com"
                className="w-full px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs text-neutral-800 bg-white"
                required
              />

              {/* Quick message selector */}
              <div>
                <label className="text-[9px] font-bold text-neutral-500 uppercase block mb-1">Frase nostálgica de acompanhamento:</label>
                <div className="flex flex-col gap-1">
                  {invitePhrases.map((phrase, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedPhrase(phrase)}
                      className={`text-left p-1 text-[9px] rounded font-sans leading-tight cursor-pointer ${
                        selectedPhrase === phrase 
                          ? 'bg-[#dee7f4] text-[#1d4ed8] font-bold border border-blue-200' 
                          : 'hover:bg-neutral-50 text-neutral-600 border border-transparent'
                      }`}
                    >
                      “{phrase}”
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending || !inviteInput.trim()}
                className="w-full text-center font-bold px-3 py-1.5 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 text-white rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 font-sans"
              >
                {isSending ? (
                  <>🚀 Enviando sinal...</>
                ) : (
                  <>
                    <Send size={12} />
                    Enviar Convite
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 text-neutral-400 italic">
              🚨 Seus 3 convites mensais foram consumidos. Aguarde o ciclo de segurança renovar em 30 dias para convocar mais companheiros.
            </div>
          )}

          {/* Invitation success list */}
          {invitationsList.length > 0 && (
            <div className="mt-3 border-t border-dashed border-neutral-200 pt-2 text-[10px]">
              <span className="font-bold text-neutral-500 block">Sinais ativados este mês:</span>
              <ul className="list-disc pl-3 text-neutral-600 mt-1">
                {invitationsList.map((mail, i) => (
                  <li key={i} className="truncate">{mail} (Aguardando handcheck)</li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-dashed border-neutral-150 mt-3 pt-2 text-center text-[10px] text-neutral-500 font-sans italic">
            “A internet antiga só existia porque alguém chamou você.”
          </div>
        </div>
      </div>

      {/* Fly-out Animated Envelope Simulator Overlay */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -200 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 m-auto w-72 h-44 bg-pink-100 border-2 border-pink-400 p-4 rounded-lg shadow-2xl flex flex-col justify-center items-center z-50 text-center"
          >
            <div className="relative text-pink-600 animate-bounce mb-2">
              <Mail size={48} className="drop-shadow-md" />
              <div className="absolute top-0 right-0 bg-[#d946ef] h-3.5 w-3.5 rounded-full ring-2 ring-pink-100 animate-ping" />
            </div>
            <h4 className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest leading-none">
              CONVITE ENVIADO!
            </h4>
            <span className="text-[10px] text-neutral-600 block mt-1 font-mono">
              Convite criptografado enviado para:
            </span>
            <strong className="text-[11px] text-[#1d4ed8] font-mono mt-0.5 block truncate max-w-full">
              {inviteInput}
            </strong>
            <p className="text-[9px] text-[#d946ef] italic mt-2">
              “{selectedPhrase}”
            </p>
            <div className="flex items-center gap-1 mt-3 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[8px] font-mono border border-green-200 uppercase tracking-wider">
              <ShieldCheck size={11} /> Handshake WASM OK
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
