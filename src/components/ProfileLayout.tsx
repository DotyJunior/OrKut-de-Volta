import { useState, FormEvent } from 'react';
import { Eye, Edit, Save, ShieldCheck, Heart, IceCream, Smile, Star, MapPin, Sparkles, KeyRound, Palette, RefreshCw, Send, MessageSquare } from 'lucide-react';
import { Profile, Friend, Community, Album, Photo, SharedMemory } from '../types';
import { getThemeStyles } from '../lib/theme';
import SocialSidebar from './SocialSidebar';
import IdentityWizard from './IdentityWizard';
import SocialActions from './SocialActions';
import PresenceStatus from './PresenceStatus';
import GlossyRetroButton from './GlossyRetroButton';

interface ProfileLayoutProps {
  profile: Profile;
  friends: Friend[];
  communities: Community[];
  isOwnProfile: boolean;
  onSaveProfile: (updatedProfile: Partial<Profile>) => void;
  onNavigateToFriend: (id: string) => void;
  onNavigateToTab: (tab: string, forceVisitor?: boolean, autoTriggerUpload?: boolean) => void;
  userPublicKey: string;
  currentTab: string;
  albums: Album[];
  featuredPhotoId: string | null;
  sharedMemories?: SharedMemory[];
  onShareToFeed: (itemTitle: string, itemType: string) => void;
  onLikeShare: (id: string, liked: boolean, count: number) => void;
  onOpenSecretChat?: (targetFriendId?: string) => void;
}

export default function ProfileLayout({
  profile,
  friends,
  communities,
  isOwnProfile,
  onSaveProfile,
  onNavigateToFriend,
  onNavigateToTab,
  userPublicKey,
  currentTab,
  albums,
  featuredPhotoId,
  sharedMemories = [],
  onShareToFeed,
  onLikeShare,
  onOpenSecretChat,
}: ProfileLayoutProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showIdentityWizard, setShowIdentityWizard] = useState(false);

  // Status and thought feed parameters
  const [newStatusText, setNewStatusText] = useState('');
  const [postingStatus, setPostingStatus] = useState(false);

  const handlePostStatus = (e: FormEvent) => {
    e.preventDefault();
    if (!newStatusText.trim()) return;
    setPostingStatus(true);
    setTimeout(() => {
      onShareToFeed(newStatusText.trim(), 'post');
      setNewStatusText('');
      setPostingStatus(false);
    }, 450);
  };

  // Sound generator
  const playShutterSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playBeep = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playBeep(2100, 0, 0.05);
      playBeep(2100, 0.08, 0.05);

      const shutterStart = 0.18;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(900, ctx.currentTime + shutterStart);
      osc1.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + shutterStart + 0.05);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(450, ctx.currentTime + shutterStart);
      osc2.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + shutterStart + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.18, ctx.currentTime + shutterStart);
      gainNode.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + shutterStart + 0.14);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(ctx.currentTime + shutterStart);
      osc2.start(ctx.currentTime + shutterStart);
      osc1.stop(ctx.currentTime + shutterStart + 0.16);
      osc2.stop(ctx.currentTime + shutterStart + 0.16);
    } catch (e) {
      console.log("Audio gesture restriction active on sandbox.");
    }
  };

  // Theme support
  const themeStyles = getThemeStyles(profile.theme);

  const [editForm, setEditForm] = useState({
    name: profile.name,
    aboutMe: profile.aboutMe,
    relationship: profile.relationship,
    humor: profile.humor,
    fashion: profile.fashion,
    religion: profile.religion,
    passions: profile.passions,
    username: profile.username || 'junior.sombra',
    statusOnline: profile.statusOnline || '● programando em Rust',
    theme: profile.theme || 'default',
  });

  const handleSave = () => {
    onSaveProfile(editForm);
    setIsEditing(false);
  };

  // Icon arrays for rating visualization
  const renderSmileys = (count: number) => {
    return Array.from({ length: 3 }).map((_, idx) => (
      <Smile
        key={idx}
        size={18}
        fill={idx < count ? '#fbbf24' : 'none'}
        className={`${idx < count ? 'text-[#f59e0b]' : 'text-neutral-300'}`}
      />
    ));
  };

  const renderIceCubes = (count: number) => {
    return Array.from({ length: 3 }).map((_, idx) => (
      <IceCream
        key={idx}
        size={18}
        fill={idx < count ? '#38bdf8' : 'none'}
        className={`${idx < count ? 'text-[#0284c7]' : 'text-neutral-300'}`}
      />
    ));
  };

  const renderHearts = (count: number) => {
    return Array.from({ length: 3 }).map((_, idx) => (
      <Heart
        key={idx}
        size={18}
        fill={idx < count ? '#f43f5e' : 'none'}
        className={`${idx < count ? 'text-[#e11d48]' : 'text-neutral-300'}`}
      />
    ));
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 p-1 transition-all rounded ${themeStyles.font}`}>
      {/* Identity Creator call to action banner for own profile */}
      {isOwnProfile && (!profile.username || profile.username === 'me') && (
        <div className="lg:col-span-12 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white rounded-lg p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-left">
            <h4 className="font-bold flex items-center gap-1.5 text-sm">
              <Sparkles size={16} /> Ainda não personalizou sua Identidade Digital Orkut?
            </h4>
            <p className="text-[11px] text-[#dee7f4] mt-1">
              Escolha seu nome de autor, username exclusivo, status clássico dos anos 2000 chapa e ative um dos 8 temas de profile!
            </p>
          </div>
          <button
            onClick={() => setShowIdentityWizard(true)}
            className="px-4 py-1.5 bg-white text-indigo-700 font-bold rounded-full text-xs hover:bg-neutral-105 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1"
          >
            Configurar Identidade 🎭
          </button>
        </div>
      )}

      {/* 1. Left Side: Photo, Interactive Sidebar and Key Fingerprint */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Profile Card */}
        <div className={`border rounded p-3 text-center transition-all ${themeStyles.cardBg} ${themeStyles.glow} ${themeStyles.borderClass}`}>
          <div className="relative group mx-auto w-36 h-36 border border-neutral-300 overflow-hidden bg-neutral-100 rounded">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isOwnProfile && (
              <div 
                onClick={() => setShowIdentityWizard(true)}
                className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <span className="text-white text-xs font-semibold">Editar Foto</span>
              </div>
            )}
          </div>

          <h2 className="text-sm font-bold mt-2 font-sans flex items-center justify-center gap-1">
            {profile.name}
            {isOwnProfile && (
              <button 
                onClick={() => setShowIdentityWizard(true)} 
                title="Configurar Identidade"
                className="p-1 text-pink-500 hover:text-pink-600 cursor-pointer"
              >
                <Palette size={13} />
              </button>
            )}
          </h2>
          {profile.username && (
            <p className="text-[10px] font-mono opacity-80 mt-0.5">
              @{profile.username}
            </p>
          )}
          
          <p className="text-[11px] font-sans flex items-center justify-center gap-1 mt-1 opacity-75">
            <MapPin size={12} />
            {profile.location}
          </p>

          <div className="border-t border-dashed border-neutral-350 mt-3 pt-3 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest block mb-1 opacity-70">Criptografia Local</span>
            <div className="flex items-center gap-1.5 p-1 px-2 bg-green-500/10 border border-green-500/40 rounded text-[10px] text-green-700 font-semibold font-mono">
              <ShieldCheck size={14} className="text-green-650 flex-shrink-0" />
              Chave RSA Ativa
            </div>
            <div className="flex items-center gap-1.5 p-1 px-2 mt-1.5 bg-blue-500/15 border border-blue-500/30 rounded text-[9px] text-[#1d4ed8] font-semibold font-mono">
              🛡️ Protegido contra Exploit Antigo
            </div>
          </div>

          <div className="border-t border-dashed border-neutral-350 mt-2.5 pt-2.5 text-center">
            <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1.5 font-sans">
              Gerenciar Imagens
            </div>
            <GlossyRetroButton
              id="sidebar-btn-photos-owner"
              onClick={() => {
                playShutterSound();
                onNavigateToTab('photos', false, true); // Owner Mode with auto photo upload panel trigger
              }}
              variant="action"
              className="w-full h-11"
            >
              Add Fotos
            </GlossyRetroButton>
          </div>

          <div className="border-t border-dashed border-neutral-350 mt-2.5 pt-2.5 text-center">
            <div className="text-[10px] uppercase font-bold text-neutral-500 mb-1.5 font-sans">
              Conversa Secreta (48h)
            </div>
            <GlossyRetroButton
              id="sidebar-btn-secret-messages"
              onClick={() => {
                playShutterSound();
                if (onOpenSecretChat) {
                  // Connects to active friend if viewing a friend's page, or defaults to lucas
                  onOpenSecretChat(profile.id === 'me' ? 'lucas' : profile.id);
                }
              }}
              variant="action"
              className="w-full h-11 bg-pink-600 hover:bg-pink-700 text-white"
            >
              💬 Mensagem
            </GlossyRetroButton>
          </div>

        </div>

        {/* Nostalgic Sidebar Component */}
        <SocialSidebar
          currentTab={currentTab}
          setCurrentTab={onNavigateToTab}
          friends={friends}
          communities={communities}
          onNavigateToFriend={onNavigateToFriend}
          themeStyles={themeStyles}
        />

        {/* Digital Signature Card */}
        <div className="bg-neutral-900 text-neutral-300 p-3 rounded font-mono text-[9px] shadow-sm leading-relaxed border border-neutral-800">
          <div className="flex items-center gap-1 text-[#f59e0b] font-bold uppercase tracking-wider mb-2 text-[10px]">
            <KeyRound size={12} />
            Identidade Digital
          </div>
          <div className="space-y-1 text-left select-all">
            <div><span className="text-neutral-500">PROT:</span> END-TO-END-ORCRYPT</div>
            <div><span className="text-neutral-500">SHA-256 FINGERPRINT:</span></div>
            <div className="bg-black/40 text-green-400 p-1 rounded font-semibold text-[8px] truncate">
              {userPublicKey}
            </div>
            <div><span className="text-neutral-500">STATUS:</span> SIGNATURE_VERIFIED</div>
          </div>
        </div>
      </div>

      {/* 2. Center Column: Profile Stats and Editable Fields */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Dynamic Name Header Box */}
        <div className={`border rounded p-4 transition-all ${themeStyles.cardBg} ${themeStyles.glow} ${themeStyles.borderClass} text-left`}>
          <div className="flex justify-between items-start border-b border-dashed border-neutral-350 pb-2 mb-3">
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
                  {profile.name}
                  <Sparkles className="text-pink-500" size={18} />
                </h1>
                {profile.username && (
                  <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-200/50 px-1.5 rounded">
                    @{profile.username}
                  </span>
                )}
              </div>
              
              {/* Presence and status row (MSN/Orkut modern style) */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex flex-wrap items-center gap-3">
                  <PresenceStatus
                    profileId={profile.id}
                    isOwnProfile={isOwnProfile}
                    profileName={profile.name}
                  />

                  <span className="text-[10px] text-neutral-400 font-mono">
                    orky.net/{profile.username || 'me'}
                  </span>
                </div>

                {/* Status personalizado secundário */}
                {(() => {
                  const rawStatus = profile.statusOnline || '';
                  const cleanStatus = rawStatus.replace(/^●\s*/, '').trim();
                  if (!cleanStatus || cleanStatus === 'offline') return null;

                  let statusIcon = '✏️';
                  const lowercaseStatus = cleanStatus.toLowerCase();
                  if (lowercaseStatus.includes('ouvindo') || lowercaseStatus.includes('linkin') || lowercaseStatus.includes('música') || lowercaseStatus.includes('music')) {
                    statusIcon = '🎵';
                  } else if (lowercaseStatus.includes('programando') || lowercaseStatus.includes('rust') || lowercaseStatus.includes('código') || lowercaseStatus.includes('audit')) {
                    statusIcon = '💻';
                  } else if (lowercaseStatus.includes('café') || lowercaseStatus.includes('comendo') || lowercaseStatus.includes('donuts') || lowercaseStatus.includes('comer') || lowercaseStatus.includes('assembléia') || lowercaseStatus.includes('paraná')) {
                    statusIcon = '☕';
                  } else if (lowercaseStatus.includes('viajando') || lowercaseStatus.includes('viagem') || lowercaseStatus.includes('destino')) {
                    statusIcon = '🏔️';
                  } else if (lowercaseStatus.includes('hack') || lowercaseStatus.includes('pentest') || lowercaseStatus.includes('vulnerabilidade')) {
                    statusIcon = '🕵️‍♂️';
                  }

                  return (
                    <div className="flex items-center mt-1">
                      <div 
                        onClick={() => { if (isOwnProfile) setIsEditing(true); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs border border-pink-250 bg-[#fae8ff]/50 text-[#86198f] font-mono shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
                          isOwnProfile ? 'cursor-pointer hover:bg-[#fae8ff] hover:border-pink-300 transition-all' : ''
                        }`}
                        title={isOwnProfile ? "Clique para alterar seu status personalizado" : undefined}
                      >
                        <span className="text-[10px] text-[#a21caf] font-bold">{statusIcon}</span>
                        <span className="font-medium tracking-wide">
                          {cleanStatus}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            {isOwnProfile && (
              <button
                id="btn-edit-profile"
                onClick={() => {
                  if (isEditing) handleSave();
                  else setIsEditing(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded cursor-pointer border shadow-sm transition-all ${
                  isEditing 
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                    : 'bg-[#dee7f4] hover:bg-[#c6d7ed] text-[#1d4ed8] border-[#adc3df]'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save size={14} /> Salvar Perfil
                  </>
                ) : (
                  <>
                    <Edit size={14} /> Editar Perfil
                  </>
                )}
              </button>
            )}
          </div>

          {/* Retro Orkut Badges Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-1 mb-2 font-sans">
            <div className="bg-neutral-100/40 border border-neutral-200/40 rounded p-2 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Confiável</span>
              <div id="meter-trusty" className="flex gap-0.5">
                {renderSmileys(profile.trusty)}
              </div>
            </div>

            <div className="bg-neutral-100/40 border border-neutral-200/40 rounded p-2 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Legal</span>
              <div id="meter-cool" className="flex gap-0.5">
                {renderIceCubes(profile.cool)}
              </div>
            </div>

            <div className="bg-neutral-100/40 border border-neutral-200/40 rounded p-2 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Sexy</span>
              <div id="meter-sexy" className="flex gap-0.5">
                {renderHearts(profile.sexy)}
              </div>
            </div>

            <div className="bg-neutral-100/40 border border-neutral-200/40 rounded p-2 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Fãs</span>
              <div id="meter-fans" className="flex gap-0.5 items-center justify-center text-[#d97706] font-bold text-sm">
                <Star size={16} fill="#fbbf24" className="text-[#fbbf24]" />
                <span className="ml-1 text-[11px] font-sans">{profile.fans} fãs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Foto do Momento (Photo of the Week) */}
        {(() => {
          // Find featured photo
          let featuredPhoto: Photo | undefined;
          let parentAlbumId = '';
          const profileAlbums = albums.filter(a => a.profileId === profile.id);
          
          if (featuredPhotoId) {
            for (const alb of profileAlbums) {
              const ph = alb.photos.find(p => p.id === featuredPhotoId);
              if (ph) {
                featuredPhoto = ph;
                parentAlbumId = alb.id;
                break;
              }
            }
          }
          
          // Fallback to first photo in first album if none explicitly set
          if (!featuredPhoto && profileAlbums.length > 0 && profileAlbums[0].photos.length > 0) {
            featuredPhoto = profileAlbums[0].photos[0];
            parentAlbumId = profileAlbums[0].id;
          }

          if (!featuredPhoto) return null;

          return (
            <div 
              onClick={() => {
                playShutterSound();
                onNavigateToTab('photos');
              }}
              className="bg-white border border-[#c4dafa] rounded shadow-xs text-left cursor-pointer transition-all hover:border-[#a0c2f7] overflow-hidden relative flex flex-col font-sans"
            >
              {/* Header: Foto do Momento */}
              <div className="bg-[#e5f0fc] px-4 py-3 flex items-center justify-between border-b border-[#c4dafa] select-none">
                <h3 className="text-[13px] font-bold text-[#1f407a] font-sans flex items-center gap-1.5 m-0 leading-none">
                  📸 Foto do Momento
                </h3>
                <span className="px-2 py-0.5 bg-[#ffdf85] border border-[#f3c853] text-[#704f05] font-extrabold text-[9px] rounded uppercase tracking-wider">
                  📌 DESTAQUE DA SEMANA
                </span>
              </div>

              {/* Main Stack Content */}
              <div className="p-5 flex flex-col gap-4 bg-transparent">
                
                {/* 1. FOTO: Aumentar tamanho, dominando visualmente o card */}
                <div className="w-full flex justify-center bg-neutral-100/50 p-3 rounded border border-neutral-150 relative">
                  <div className="relative max-w-full md:max-w-md w-full aspect-square md:aspect-[4/3] bg-neutral-900 rounded-xs overflow-hidden border border-neutral-250 shadow-sm">
                    <img 
                      src={featuredPhoto.url} 
                      alt="Foto do Momento" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {featuredPhoto.gifUrl && (
                      <span className="absolute bottom-1.5 right-1.5 bg-pink-600 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider select-none">
                        GIF ATIVO
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. LEGENDA: Texto limpo, sem caixa pesada, alinhamento simples */}
                <div className="text-center sm:text-left mt-0.5 px-1">
                  <p className="text-xs font-sans text-neutral-700 italic leading-relaxed">
                    “{featuredPhoto.caption}”
                  </p>
                </div>

                {/* 3. MÚSICA: Linha discreta */}
                {featuredPhoto.song && (
                  <div className="flex items-center gap-1.5 px-1 text-xs text-neutral-500 font-sans select-none">
                    <span>🎵</span>
                    <span>Ouvindo: <span className="font-semibold text-neutral-700">{featuredPhoto.song}</span></span>
                  </div>
                )}

                {/* 4. INTERAÇÕES & COMENTÁRIOS */}
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  <SocialActions
                    itemId={featuredPhoto.id}
                    itemType={featuredPhoto.gifUrl ? 'post' : 'photo'}
                    itemTitle={featuredPhoto.gifUrl ? `GIF Animado: "${featuredPhoto.caption}"` : `Foto do Momento: "${featuredPhoto.caption}"`}
                    initialLikes={featuredPhoto.likes}
                    initialLikedByMe={featuredPhoto.likedByMe}
                    onLikeUpdate={(liked, count) => {
                      if (featuredPhoto) {
                        featuredPhoto.likes = count;
                        featuredPhoto.likedByMe = liked;
                      }
                    }}
                    onShareToFeed={onShareToFeed}
                    layout="retro-feed"
                    onCommentClick={() => {
                      playShutterSound();
                      onNavigateToTab('photos');
                    }}
                    commentCount={featuredPhoto.comments.length}
                  />
                </div>

                {/* 5. DATA */}
                <div className="text-[10px] text-neutral-400 font-sans px-1 select-none">
                  <span>📅 Postado em {featuredPhoto.date}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Profile Detail Fields */}
        <div className={`border rounded p-4 transition-all ${themeStyles.cardBg} ${themeStyles.glow} ${themeStyles.borderClass} text-left`}>
          <h3 className="text-sm font-bold font-sans border-b pb-1 mb-3">Informações de Perfil</h3>

          <div className="space-y-3 font-sans text-xs">
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">Nome:</label>
                    <input
                      id="edit-input-name"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">Username:</label>
                    <input
                      id="edit-input-username"
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">✏️ Status Personalizado (Nostálgico):</label>
                    <input
                      id="edit-input-status-custom"
                      type="text"
                      value={editForm.statusOnline}
                      onChange={(e) => setEditForm({ ...editForm, statusOnline: e.target.value })}
                      placeholder="Ex: ouvindo Linkin Park de madrugada..."
                      className="w-full px-2.5 py-1.5 border border-pink-350/65 rounded font-sans focus:outline-none focus:ring-1 focus:ring-pink-500 text-xs bg-white text-neutral-800"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[
                        '● ouvindo Linkin Park 🎸',
                        '● programando em Rust 🦀',
                        '● perdido no cyber café 🖥️',
                        '● viajando sem destino 🏔️'
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, statusOnline: preset })}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-[#fae8ff] border border-neutral-350 rounded text-[9px] cursor-pointer text-neutral-600 font-mono transition-all"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1 font-mono">Tema Cyber/Nostálgico do Perfil:</label>
                  <select
                    id="edit-select-theme"
                    value={editForm.theme}
                    onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                    className="w-full px-2 py-1.5 border border-pink-400 bg-pink-50/10 text-[#d946ef] font-bold rounded cursor-pointer"
                  >
                    <option value="default">Padrão Orkut Clássico (Azul)</option>
                    <option value="neon-hacker">Neon Hacker (Verde Terminal)</option>
                    <option value="emo-2008">Emo 2008 (Rosa Choque e Preto)</option>
                    <option value="rock-underground">Rock Underground (Chapa Laranja)</option>
                    <option value="cyberdeck">Cyberdeck (Aço Marinho e Cyan)</option>
                    <option value="vaporwave">Vaporwave (Aesthetic Pastel Gradient)</option>
                    <option value="minimal-oldweb">Minimal Old Web (Windows 95 Cinza)</option>
                    <option value="gotico-retro">Gótico Retrô (Vermelho Escarlate)</option>
                    <option value="matrix-terminal">Matrix Terminal (Monitor Fósforo Verde)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">Quem sou eu (Bio):</label>
                  <textarea
                    id="edit-input-aboutme"
                    value={editForm.aboutMe}
                    onChange={(e) => setEditForm({ ...editForm, aboutMe: e.target.value })}
                    rows={4}
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">Relacionamento:</label>
                    <input
                      id="edit-input-relationship"
                      type="text"
                      value={editForm.relationship}
                      onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1 font-mono">Humor do dia:</label>
                    <input
                      id="edit-input-humor"
                      type="text"
                      value={editForm.humor}
                      onChange={(e) => setEditForm({ ...editForm, humor: e.target.value })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">Moda:</label>
                    <input
                      id="edit-input-fashion"
                      type="text"
                      value={editForm.fashion}
                      onChange={(e) => setEditForm({ ...editForm, fashion: e.target.value })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">Paixão:</label>
                    <input
                      id="edit-input-passions"
                      type="text"
                      value={editForm.passions}
                      onChange={(e) => setEditForm({ ...editForm, passions: e.target.value })}
                      className="w-full px-2 py-1.5 border border-neutral-300 rounded"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-neutral-200/50 pb-2">
                  <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-0.5">Quem sou eu:</span>
                  <p id="profile-aboutme-text" className="leading-relaxed font-sans whitespace-pre-wrap">{profile.aboutMe}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block">Relacionamento:</span>
                    <span id="profile-relationship-text" className="font-semibold">{profile.relationship}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block">Aqui para:</span>
                    <span id="profile-herefor-text" className="font-semibold">{profile.hereFor}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block">De onde:</span>
                    <span id="profile-location-text" className="font-semibold">{profile.location}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block">Cidade natal:</span>
                    <span id="profile-hometown-text" className="font-semibold">{profile.hometown}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block">Humor:</span>
                    <span id="profile-humor-text" className="font-semibold">{profile.humor}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block">Moda:</span>
                    <span id="profile-fashion-text" className="font-semibold">{profile.fashion}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block">Paixões:</span>
                    <span id="profile-passions-text" className="font-semibold">{profile.passions}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block">Idiomas:</span>
                    <span id="profile-languages-text" className="font-semibold">{profile.languages}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ✍️ No que você está pensando, chapa? (Nostalgic Status Input) */}
        <div className={`border rounded p-4 transition-all ${themeStyles.cardBg} ${themeStyles.glow} ${themeStyles.borderClass} text-left`}>
          <h4 className="text-xs font-bold font-sans uppercase text-[#1d4ed8] tracking-wider mb-2 select-none flex items-center gap-1.5 ">
            <span>✍️</span> No que você está pensando, chapa?
          </h4>
          <form onSubmit={handlePostStatus} className="flex flex-col gap-2 mt-1">
            <textarea
              id="thought-status-textarea"
              rows={2}
              value={newStatusText}
              onChange={(e) => setNewStatusText(e.target.value)}
              placeholder="Digite um pensamento nostálgico, novidade ou status clássico chapa..."
              className="w-full px-2.5 py-1.5 text-xs border border-neutral-350 rounded font-sans focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white"
              disabled={postingStatus}
            />
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 text-[10.5px] text-neutral-450 select-none">
              <span>Publicado instantaneamente no seu feed de recordações.</span>
              <button
                id="btn-post-thought"
                type="submit"
                disabled={postingStatus || !newStatusText.trim()}
                className="px-4 py-1.5 bg-[#fae8ff] hover:bg-[#f5d0fe] border border-[#f0abfc] text-pink-700 font-bold text-xs rounded transition-all cursor-pointer shadow-sm disabled:opacity-50 font-sans"
              >
                {postingStatus ? 'Enviando...' : 'Postar Pensamento chapa!'}
              </button>
            </div>
          </form>
        </div>

        {/* 🔁 MURAL DE RECORDAÇÕES COMPARTILHADAS (Dynamic Activities Feed) */}
        <div className={`border rounded shadow-sm overflow-hidden text-left transition-all ${themeStyles.cardBg} ${themeStyles.glow} ${themeStyles.borderClass}`}>
          <div className={`px-4 py-2 flex justify-between items-center ${themeStyles.accent} border-b border-dashed border-neutral-350`}>
            <span className="text-xs font-bold uppercase flex items-center gap-1.5">
              <span>🔁</span> Mural de Recordações & Feed ({sharedMemories.length})
            </span>
            <span className="text-[9px] font-mono select-none">ATUALIZADO EM REAL-TIME</span>
          </div>

          <div className="p-4 space-y-4 bg-transparent max-h-[600px] overflow-y-auto custom-scrollbar">
            {sharedMemories.length === 0 ? (
              <div className="text-center py-10 text-xs text-neutral-500 italic font-sans animate-pulse">
                Nenhuma atividade relatada no mural ainda chapa. Curta ou compartilhe fotos, scraps ou depoimentos para vê-los aqui!
              </div>
            ) : (
              sharedMemories.map((entry) => {
                return (
                  <div 
                    key={entry.id} 
                    className="border border-neutral-200/60 rounded p-3 bg-white/40 shadow-xs relative hover:border-[#1d4ed8]/30 transition-all group"
                  >
                    {/* Activity Header */}
                    <div className="flex items-center justify-between border-b border-neutral-200/20 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={entry.sharerAvatar}
                          alt={entry.sharerName}
                          className="w-6 h-6 rounded-full object-cover border border-neutral-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-[11px] leading-tight text-left">
                          <strong className="text-neutral-800 font-sans border-b border-transparent group-hover:border-purple-500/30">
                            {entry.sharerName}
                          </strong>
                          <span className="text-neutral-500 text-[10.5px] ml-1">
                            {entry.itemType === 'photo' && 'compartilhou uma foto:'}
                            {entry.itemType === 'album' && 'recomendou um álbum de fotos:'}
                            {entry.itemType === 'post' && 'postou um pensamento chapa:'}
                            {entry.itemType === 'scrap' && 'divulgou um scrap:'}
                            {entry.itemType === 'testimonial' && 'divulgou um depoimento:'}
                          </span>
                          {entry.targetUser && (
                            <span className="text-neutral-500 text-[10.5px]">
                              {' '}para <strong className="text-neutral-800">@{entry.targetUser}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] text-neutral-450 font-mono">
                        {entry.timestamp.split(' - ')[1] || entry.timestamp}
                      </span>
                    </div>

                    {/* Shared Content preview */}
                    <div className="px-2.5 py-2.5 bg-white/85 border border-neutral-250/30 rounded text-xs text-neutral-800 leading-relaxed font-sans mt-1">
                      {entry.itemType === 'photo' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🖼️</span>
                          <div>
                            <p className="font-bold text-sky-700 italic">“{entry.itemTitle.replace('Foto: ', '')}”</p>
                            <span className="text-[9px] text-neutral-400">Verificado em Orkut Secure Albums</span>
                          </div>
                        </div>
                      )}
                      {entry.itemType === 'album' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">FolderPath</span>
                          <div>
                            <p className="font-bold text-pink-700 uppercase tracking-wide">📂 {entry.itemTitle}</p>
                            <span className="text-[9px] text-neutral-400">Clique em Acessar Fotos para decodificar esse rolo analógico</span>
                          </div>
                        </div>
                      )}
                      {entry.itemType === 'post' && (
                        <div className="flex flex-col gap-1">
                          <p className="font-sans text-[11.5px] text-neutral-800 leading-normal font-medium bg-neutral-100/10 rounded">
                            “{entry.itemTitle}”
                          </p>
                          <span className="text-[8.5px] text-neutral-400 font-mono">Publicado via Rede Local Descentralizada</span>
                        </div>
                      )}
                      {entry.itemType !== 'photo' && entry.itemType !== 'album' && entry.itemType !== 'post' && (
                        <p className="italic text-neutral-700 font-medium">“{entry.itemTitle}”</p>
                      )}
                    </div>

                    {/* Social Interaction options for the Feed Activity item */}
                    <SocialActions
                      itemId={entry.id}
                      itemType="post"
                      itemTitle={entry.itemTitle}
                      initialLikes={entry.likes}
                      initialLikedByMe={entry.likedByMe}
                      onLikeUpdate={(liked, count) => onLikeShare(entry.id, liked, count)}
                      onShareToFeed={onShareToFeed}
                      layout="retro-feed"
                    />

                    {/* CRT Scan line HUD vibe overlay */}
                    <div className="absolute inset-0 bg-neutral-900/[0.005] pointer-events-none rounded select-none" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. Right Side: Friends and Communities lists (Classic 3x3 layout) */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Friends Grid */}
        <div className={`border rounded shadow-sm overflow-hidden text-left transition-all ${themeStyles.cardBg} ${themeStyles.glow} ${themeStyles.borderClass}`}>
          <div className={`px-3 py-1.5 flex justify-between items-center ${themeStyles.accent}`}>
            <span className="text-[11px] font-bold uppercase">Amigos ({friends.length})</span>
            <button onClick={() => onNavigateToTab('profile')} className="text-[10px] hover:underline font-bold">ver todos</button>
          </div>

          <div className="p-3 grid grid-cols-3 gap-2 bg-transparent">
            {friends.slice(0, 9).map((friend) => (
              <div
                key={friend.id}
                onClick={() => onNavigateToFriend(friend.id)}
                className="flex flex-col items-center justify-center cursor-pointer p-1.5 rounded transition-all group hover:bg-neutral-100/10"
              >
                <div className="w-12 h-12 border border-neutral-300 overflow-hidden rounded bg-neutral-100 group-hover:border-[#d946ef]">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[9px] font-bold text-center mt-1 truncate w-full group-hover:underline">
                  {friend.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        <div className={`border rounded shadow-sm overflow-hidden text-left transition-all ${themeStyles.cardBg} ${themeStyles.glow} ${themeStyles.borderClass}`}>
          <div className={`px-3 py-1.5 flex justify-between items-center ${themeStyles.accent}`}>
            <span className="text-[11px] font-bold uppercase">Comunidades ({communities.length})</span>
            <button onClick={() => onNavigateToTab('communities')} className="text-[10px] hover:underline font-bold">ver todas</button>
          </div>

          <div className="p-3 grid grid-cols-3 gap-2 bg-transparent">
            {communities.slice(0, 9).map((comm) => (
              <div
                key={comm.id}
                onClick={() => onNavigateToTab('communities')}
                className="flex flex-col items-center justify-center cursor-pointer p-1.5 rounded transition-all group hover:bg-neutral-100/10"
              >
                <div className="w-12 h-12 border border-neutral-300 flex items-center justify-center text-xl overflow-hidden rounded bg-pink-100 text-pink-600 group-hover:border-[#1d4ed8]">
                  <span>{comm.avatar}</span>
                </div>
                <span className="text-[9px] font-bold text-center mt-1 truncate w-full group-hover:underline leading-tight font-sans">
                  {comm.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Album de Fotos Widget Block */}
        <div 
          onClick={() => {
            playShutterSound();
            onNavigateToTab('photos', true); // Guest Access Mode
          }}
          className={`border rounded shadow-sm overflow-hidden text-left transition-all cursor-pointer hover:scale-[1.02] ${themeStyles.cardBg} ${themeStyles.glow} ${themeStyles.borderClass} group hover:border-[#d946ef] mt-1.5`}
          title="Explorar memórias do perfil (Acesso de Visitante)"
        >
          <div className={`px-3 py-1.5 flex justify-between items-center ${themeStyles.accent}`}>
            <span className="text-[11px] font-bold uppercase flex items-center gap-1.5">
              📸 Álbum de Fotos
            </span>
            <span className="text-[9px] group-hover:translate-x-0.5 transition-transform">explorar →</span>
          </div>
          <div className="p-3 bg-transparent font-sans text-[11px] leading-relaxed text-left flex flex-col gap-1.5">
            <p className="opacity-95">
              Veja fotos, gifs, memórias e momentos do perfil.
            </p>
            <div className="p-1.5 bg-neutral-100/15 border border-neutral-200/20 rounded flex items-center gap-2 text-[10px] text-[#1d4ed8] font-sans">
              <span>🖼️</span>
              <span className="italic">"{profile.name} compartilhou lembranças!"</span>
            </div>

            {/* Added: Acessar Fotos Button (Visitor Access) */}
            <div className="mt-2 pt-2 border-t border-dashed border-neutral-300/30">
              <GlossyRetroButton
                id="btn-access-photos-visitor"
                onClick={(e) => {
                  e.stopPropagation();
                  playShutterSound();
                  onNavigateToTab('photos', true); // Guest/Visitor Access Mode
                }}
                variant="visitor"
                className="w-full h-11"
              >
                Ver Fotos
              </GlossyRetroButton>
            </div>
          </div>
        </div>
      </div>


      {/* Identity Creator Modal Wizard */}
      {showIdentityWizard && (
        <IdentityWizard
          currentProfile={profile}
          onClose={() => setShowIdentityWizard(false)}
          onComplete={(completedData) => {
            onSaveProfile(completedData);
            setShowIdentityWizard(false);
          }}
        />
      )}
    </div>
  );
}
