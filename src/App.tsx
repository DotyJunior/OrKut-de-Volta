import { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Lock, BookOpen } from 'lucide-react';
import OrkutHeader from './components/OrkutHeader';
import OrkutFooter from './components/OrkutFooter';
import ProfileLayout from './components/ProfileLayout';
import Scrapbook from './components/Scrapbook';
import Testimonials from './components/Testimonials';
import Communities from './components/Communities';
import SearchResults from './components/SearchResults';
import RustSecLab from './components/RustSecLab';
import PhotoAlbums from './components/PhotoAlbums';
import MsnToastSystem from './components/MsnToastSystem';
import SecretChat from './components/SecretChat';
import { getInitialAlbums } from './data/initialAlbums';
import { Profile, Friend, Community, Scrap, Testimonial, Album, SharedMemory } from './types';
import { getThemeStyles } from './lib/theme';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('profile');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProfileId, setActiveProfileId] = useState<string>('me');
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(['1', '3']);
  const [userPublicKey, setUserPublicKey] = useState<string>('04f9810b14c3e2182fe91da938b82dfc394ca0e2193bde1a5928d1ac297b47e2b1029c');

  // Secret Chat modal state
  const [isSecretChatOpen, setIsSecretChatOpen] = useState<boolean>(false);
  const [secretChatFriendId, setSecretChatFriendId] = useState<string>('lucas');

  // Photo Albums Nostalgic state engine
  const [albums, setAlbums] = useState<Album[]>(() => getInitialAlbums());
  const [isVisitorMode, setIsVisitorMode] = useState<boolean>(false);
  const [autoOpenUpload, setAutoOpenUpload] = useState<boolean>(false);
  const [sharedMemories, setSharedMemories] = useState<SharedMemory[]>(() => [
    {
      id: "sh1",
      sharerName: "Alexandre Curi",
      sharerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
      itemType: "album",
      itemTitle: "Rolês 2008 de Curitiba chapa! 🌲",
      timestamp: "27/05/2026 - 15:00",
      likes: 5,
      likedByMe: false
    },
    {
      id: "sh2",
      sharerName: "Orkut Büyükkökten",
      sharerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      itemType: "photo",
      itemTitle: "Silicon Valley Memories (2004) 💻",
      timestamp: "27/05/2026 - 13:40",
      likes: 12,
      likedByMe: true
    },
    {
      id: "sh3",
      sharerName: "H3_Elit3_Hacker",
      sharerAvatar: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150",
      itemType: "post",
      itemTitle: "Compilador Rust WASM heap safety audit 🧬",
      timestamp: "27/05/2026 - 10:11",
      likes: 9,
      likedByMe: false
    }
  ]);

  const handleLikeScrap = (id: string, liked: boolean, count: number) => {
    setScraps(prev => prev.map(s => s.id === id ? { ...s, likes: count, likedByMe: liked } : s));
  };

  const handleLikeTestimonial = (id: string, liked: boolean, count: number) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, likes: count, likedByMe: liked } : t));
  };

  const handleAddNewShare = (itemTitle: string, itemType: any, friendName?: string) => {
    const timestampStr = new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -');
    const newShare: SharedMemory = {
      id: 'sh_' + Math.random().toString(36).substr(2, 9),
      sharerName: profiles.me.name,
      sharerAvatar: profiles.me.avatar,
      itemType: itemType,
      itemTitle: itemTitle,
      targetUser: friendName,
      timestamp: timestampStr,
      likes: 0,
      likedByMe: false
    };
    setSharedMemories(prev => [newShare, ...prev]);
  };

  const [featuredPhotoIds, setFeaturedPhotoIds] = useState<Record<string, string | null>>({
    me: 'me_photo_1',
    alexandre: 'ale_photo_1',
    orkut: 'ork_photo_1',
    hacker: 'hac_photo_1'
  });

  // Orkut Profiles Data
  const [profiles, setProfiles] = useState<Record<string, Profile>>({
    me: {
      id: 'me',
      name: 'Junior Sombra',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      location: 'Curitiba, PR - Brasil',
      relationship: 'Namorando com compilador Rust',
      humor: 'Focado em memory safety',
      hereFor: 'Amigos e hackathons',
      fashion: 'Capuz preto e jeans básico',
      religion: 'Borrow Checker da Salvação',
      ethnicity: 'Latino Criptográfico',
      languages: 'Português, Rust, TypeScript, Assembly',
      hometown: 'Curitiba',
      webpage: 'https://github.com/orkut-secure',
      passions: 'Cibersegurança, pinhão cozido, criptografia AES e herança zero-custo',
      aboutMe: 'Eae galera! Sou um entusiasta de segurança da informação e Rust de Curitiba. Estou reescrevendo todo o Orkut de forma robusta e livre de buffer overflow para consertar os erros que ajudaram a quebrar esse gigante de 2004. Sejam muito bem-vindos ao meu perfil criptografado, deixem um scrap ou depoimento seguro!',
      trusty: 3,
      cool: 3,
      sexy: 2,
      fans: 18,
      username: 'junior.sombra',
      statusOnline: '● programando em Rust',
      theme: 'default'
    },
    alexandre: {
      id: 'alexandre',
      name: 'Alexandre Curi',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      location: 'Curitiba, PR - Brasil',
      relationship: 'Casado legalmente',
      humor: 'Político / Diplomático',
      hereFor: 'Serviço público e cibersegurança do Paraná',
      fashion: 'Terno parlamentar sob medida',
      religion: 'Católico',
      ethnicity: 'Italiano-Brasileiro',
      languages: 'Português, Inglês',
      hometown: 'Curitiba',
      webpage: 'https://www.assembleia.pr.leg.br',
      passions: 'Leis estaduais do Paraná, infraestrutura de votação, ecossistema Rust',
      aboutMe: 'Deputado e presidente da Assembleia Legislativa do Paraná. Defensor inabalável do desenvolvimento tecnológico do sul. Apoiando a reconstrução criptografada do Orkut para mostrar que no Paraná, segurança cibernética e memória computacional limpa são tratadas como leis de estado! Chapa, quer debater as últimas do pinhão parlamentar? Deixe seu recado seguro!',
      trusty: 3,
      cool: 2,
      sexy: 2,
      fans: 1337,
      username: 'alexandre.curi',
      statusOnline: '● na assembleia do Paraná',
      theme: 'rock-underground'
    },
    orkut: {
      id: 'orkut',
      name: 'Orkut Büyükkökten',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      location: 'San Francisco, CA - USA',
      relationship: 'Married to social networks',
      humor: 'Extremely friendly & excited',
      hereFor: 'Connecting humanity securely',
      fashion: 'Silicon Valley retro',
      religion: 'Universal love',
      ethnicity: 'Turkish',
      languages: 'English, Turkish, Portuglês',
      hometown: 'Ankara',
      webpage: 'https://hello.com',
      passions: 'Algorithms, E2E Encryption, community building, WASM sandbox',
      aboutMe: 'Hello my friends! I am the original founder of Orkut. In 2004, internet security was very basic. We had cookie theft, XSS injections, and bad server policies. But today, seeing this replica backed by Rust performance, WebCrypto AES, and zero-knowledge communities, I am fully amazed! You are awesome. Be safe and leave me a scrap!',
      trusty: 3,
      cool: 3,
      sexy: 2,
      fans: 412521,
      username: 'orkut.b',
      statusOnline: '● no café com donuts',
      theme: 'vaporwave'
    },
    hacker: {
      id: 'hacker',
      name: 'H3_Elit3_Hacker',
      avatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150',
      location: 'Deep Web, Tor Network',
      relationship: 'Solteiro Criptográfico',
      humor: 'Sarcástico',
      hereFor: 'Pentesting e engenharia reversa',
      fashion: 'Hoodie preto e óculos escuros indoor',
      religion: 'Zero-Trace Entropy',
      ethnicity: 'Anonymous',
      languages: 'C, Rust, Python, Bash, Binary Hex',
      hometown: 'localhost',
      webpage: 'http://h3_elit3_tor.onion',
      passions: 'Invasões de depoimento, roubo de cookies, quebra de hashes obsoletos',
      aboutMe: 'Ex-script kiddie que virou InfoSec auditor. Fui testar as vulnerabilidades clássicas de depoimentos "hackeados" de 2004 nessa réplica e adivinha? O compilador Rust WASM de vocês isolou toda a pilha de memória de uma forma que meu Wireshark chora. Vocês estragaram a fofoca, mas elevaram a criptografia ao limite. Parabéns aos envolvidos.',
      trusty: 1,
      cool: 3,
      sexy: 1,
      fans: 13,
      username: 'elit3.hacker',
      statusOnline: '● analisando vulnerabilidades',
      theme: 'neon-hacker'
    },
    lucas: {
      id: 'lucas',
      name: 'Lucas Santos',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      location: 'São Paulo, SP - Brasil',
      relationship: 'Solteiro',
      humor: 'Sempre conectado',
      hereFor: 'Bater papo em canais criptografados',
      fashion: 'Camiseta de banda e tênis clássico',
      religion: 'Tecnologia livre',
      ethnicity: 'Brasileiro',
      languages: 'Português, C#',
      hometown: 'São Paulo',
      webpage: 'https://github.com/lucas-santos',
      passions: 'Música retro, chats secretos, Orkut 2004',
      aboutMe: 'Eae parça! Sou o Lucas, curto muito bater papo de madrugada e relembrar as comunidades clássicas. Ativei meu canal seguro com criptografia de 48 horas!',
      trusty: 3,
      cool: 3,
      sexy: 2,
      fans: 15,
      username: 'Lucas_Santos',
      statusOnline: '● livre para chat',
      theme: 'default'
    }
  });

  // Simulated Friends list (Classical layout)
  const friends: Friend[] = [
    { id: 'lucas', name: 'Lucas Santos', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', location: 'São Paulo, SP' },
    { id: 'alexandre', name: 'Alexandre Curi', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', location: 'Curitiba, PR' },
    { id: 'orkut', name: 'Orkut Büyükkökten', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', location: 'San Francisco, CA' },
    { id: 'hacker', name: 'H3_Elit3_Hacker', avatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150', location: 'Deep Web' }
  ];

  // Simulated Communities List
  const communities: Community[] = [
    { id: '1', name: 'Eu odeio acordar cedo', description: 'Porque o sono pós-compilação em Rust é sagrado.', members: 42152, avatar: '⏰', category: 'Lazer', secureMode: false },
    { id: '2', name: 'Digo "Oi" e continuo programando', description: 'Ative sua chave simétrica e não interrompa meu raciocínio.', members: 12510, avatar: '💻', category: 'Tecnologia', secureMode: false },
    { id: '3', name: 'Eu amo chocolate preto', description: 'Combina muito bem com café preto e revisões estritas de código.', members: 8920, avatar: '🍫', category: 'Culinária', secureMode: false },
    { id: 'sec_pr', name: 'Assembleia Segura PR (Rust)', description: 'Fórum da Assembleia Legislativa do Paraná para debater leis de cibersegurança do pinhão.', members: 1337, avatar: '🌲', category: 'Governo', secureMode: true },
    { id: 'hacker_guild', name: 'Hacker Elite - Anti-XSS Guild', description: 'Debates puros sobre buffer safety e como aniquilar XSS com isolamento de WebAssembly linear-memory.', members: 777, avatar: '🕵️', category: 'Segurança', secureMode: true },
    { id: 'orkut_devs', name: 'Orkut Devs & Zero-Knowledge', description: 'Simulações de zk-SNARKs e criptossistemas de alto gabarito sob governança descentralizada.', members: 502, avatar: '🔑', category: 'Cripto', secureMode: true }
  ];

  // Scraps State
  const [scraps, setScraps] = useState<Scrap[]>([
    {
      id: 's1',
      fromId: 'alexandre',
      fromName: 'Alexandre Curi',
      fromAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      toId: 'me',
      timestamp: '27/05/2026 - 10:15',
      rawContent: 'Fala, Júnior! Tudo certo? Passando aqui pra te convencer a participar da conferência de criptografia e Rust na Assembleia Legislativa em Curitiba. Traga pinhão cozido chapa! Um abraço.',
      isEncrypted: false
    },
    {
      id: 's2',
      fromId: 'orkut',
      fromName: 'Orkut Büyükkökten',
      fromAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      toId: 'me',
      timestamp: '27/05/2026 - 11:20',
      rawContent: 'Hello Junior! Your secure platform is so sweet! In 2004 we had very simple servers. But with WebCrypto and Rust safety, your scrapbooking is beautiful! Cheers!',
      isEncrypted: false
    }
  ]);

  // Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 't1',
      fromId: 'alexandre',
      fromName: 'Alexandre Curi',
      fromAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      toId: 'me',
      timestamp: '27/05/2026 - 09:30',
      content: 'Esse júnior é de confiança! Trabalhador de Curitiba que entende de Rust e segurança parlamentar mais do que qualquer outro chapa da região.',
      isEncrypted: false,
      unlocked: true
    },
    {
      id: 't2',
      fromId: 'hacker',
      fromName: 'H3_Elit3_Hacker',
      fromAvatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150',
      toId: 'me',
      timestamp: '27/05/2026 - 14:45',
      content: 'Tentativa de sequestrar sessão: Fracassada. Depoimento isolado no heap.',
      isEncrypted: true,
      ciphertext: '0x_sec_depo_54656e74617469766120646520736571756573747261722073657373e36f3a20467261636173736164612e204465706f696d656e746f2069736f6c61646f206e6f20686561702e',
      aesKeyHex: 'hacker-1234',
      unlocked: false
    }
  ]);

  // Save editable profile locally
  const handleSaveProfile = (updatedProfile: Partial<Profile>) => {
    setProfiles(prev => ({
      ...prev,
      me: {
        ...prev.me,
        ...updatedProfile
      }
    }));
  };

  // Switch visited profile
  const handleNavigateToFriend = (id: string) => {
    setActiveProfileId(id);
    setCurrentTab('profile');
  };

  // Add new Scrap with real-time Express Gemini proxy response!
  const handleAddScrap = async (scrap: Omit<Scrap, 'id' | 'timestamp'> & { needsAiResponse?: boolean }) => {
    const timestampStr = new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -');
    const newId = 'sc_' + Math.random().toString(36).substr(2, 9);
    
    const newScrapItem: Scrap = {
      id: newId,
      ...scrap,
      timestamp: timestampStr
    };

    // Add user scrap to feed
    setScraps(prev => [...prev, newScrapItem]);

    // Handle character AI response via Express proxy, keeping API keys secure!
    if (scrap.needsAiResponse) {
      const activeChar = activeProfileId; // 'alexandre', 'orkut', 'hacker'
      
      // Inject simulated "digitando..." message in scrapbook list
      const typingId = 'typing_' + Math.random().toString(36).substr(2, 9);
      const typingItem: Scrap = {
        id: typingId,
        fromId: activeChar,
        fromName: profiles[activeChar].name,
        fromAvatar: profiles[activeChar].avatar,
        toId: 'me',
        timestamp: 'Digitando...',
        rawContent: '✍️ Processando criptografia e pensando em uma resposta memory-safe...',
        isEncrypted: false
      };

      setScraps(prev => [...prev, typingItem]);

      try {
        const response = await fetch('/api/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: activeChar,
            userName: profiles.me.name,
            userProfile: profiles.me.aboutMe,
            text: scrap.rawContent,
            encrypt: scrap.isEncrypted
          })
        });

        const data = await response.json();
        
        // Remove typing item and add genuine Gemini response
        setScraps(prev => {
          const filtered = prev.filter(s => s.id !== typingId);
          return [
            ...filtered,
            {
              id: 'ai_rep_' + Math.random().toString(36).substr(2, 9),
              fromId: activeChar,
              fromName: profiles[activeChar].name,
              fromAvatar: profiles[activeChar].avatar,
              toId: 'me',
              timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -'),
              rawContent: data.reply || "Resposta assinada criptograficamente.",
              isEncrypted: false
            }
          ];
        });
      } catch (err) {
        console.error("Express Gemini Proxy Error:", err);
        // Fallback replacement if api fails
        setScraps(prev => {
          const filtered = prev.filter(s => s.id !== typingId);
          return [
            ...filtered,
            {
              id: 'fallback_rep_' + Math.random().toString(36).substr(2, 9),
              fromId: activeChar,
              fromName: profiles[activeChar].name,
              fromAvatar: profiles[activeChar].avatar,
              toId: 'me',
              timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -'),
              rawContent: `[Secure Local Fallback] Recebi seu recado chapa! Desculpe, não consegui me conectar ao cérebro inteligente do servidor agora, mas garanto que o Borrow Checker de Curitiba está rodando.`,
              isEncrypted: false
            }
          ];
        });
      }
    }
  };

  const handleAddTestimonial = (testimonial: Omit<Testimonial, 'id' | 'timestamp' | 'unlocked'>) => {
    const timestampStr = new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -');
    const newTest: Testimonial = {
      id: 'test_' + Math.random().toString(36).substr(2, 9),
      ...testimonial,
      timestamp: timestampStr,
      unlocked: !testimonial.isEncrypted
    };
    setTestimonials(prev => [...prev, newTest]);
  };

  const handleJoinCommunity = (id: string) => {
    if (!joinedCommunities.includes(id)) {
      setJoinedCommunities(prev => [...prev, id]);
    }
  };

  const currentViewedProfile = profiles[activeProfileId] || profiles.me;
  const themeStyles = getThemeStyles(currentViewedProfile.theme);

  return (
    <div className={`min-h-screen ${themeStyles.bg} flex flex-col justify-between transition-colors duration-300 selection:bg-pink-100 antialiased`}>
      {/* 1. Header */}
      <OrkutHeader
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userName={profiles.me.name}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Main content container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 font-sans">
        {/* If viewing a friend's profile, show a nice retro ribbon allowing return to my own profile */}
        {activeProfileId !== 'me' && (
          <div className="bg-[#fffbeb] border border-amber-200 rounded p-3 mb-5 flex justify-between items-center text-xs text-amber-800">
            <span className="font-semibold font-sans">
              🔍 Você está visualizando o perfil seguro de: <strong>{currentViewedProfile.name}</strong>
            </span>
            <button
              id="btn-return-myprofile"
              onClick={() => setActiveProfileId('me')}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-sm text-[11px] cursor-pointer"
            >
              Voltar ao Meu Perfil
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        {currentTab === 'profile' && (
          <ProfileLayout
            profile={currentViewedProfile}
            friends={friends}
            communities={communities}
            isOwnProfile={activeProfileId === 'me'}
            onSaveProfile={handleSaveProfile}
            onNavigateToFriend={handleNavigateToFriend}
            onNavigateToTab={(tab, forceVisitor = false, autoTriggerUpload = false) => {
              setCurrentTab(tab);
              setIsVisitorMode(forceVisitor);
              setAutoOpenUpload(autoTriggerUpload);
            }}
            userPublicKey={userPublicKey}
            currentTab={currentTab}
            albums={albums}
            featuredPhotoId={featuredPhotoIds[currentViewedProfile.id] || null}
            sharedMemories={sharedMemories}
            onShareToFeed={handleAddNewShare}
            onLikeShare={(id, liked, count) => setSharedMemories(prev => prev.map(sm => sm.id === id ? { ...sm, likes: count, likedByMe: liked } : sm))}
            onOpenSecretChat={(targetFriendId) => {
              setSecretChatFriendId(targetFriendId || 'lucas');
              setIsSecretChatOpen(true);
            }}
          />
        )}
 
        {currentTab === 'photos' && (
          <PhotoAlbums
            profileId={currentViewedProfile.id}
            profileName={currentViewedProfile.name}
            profileAvatar={currentViewedProfile.avatar}
            albums={albums}
            isOwnProfile={activeProfileId === 'me' && !isVisitorMode}
            isVisitorMode={isVisitorMode}
            onUpdateAlbums={setAlbums}
            featuredPhotoId={featuredPhotoIds[currentViewedProfile.id] || null}
            onSetFeaturedPhoto={(photoId) => {
              setFeaturedPhotoIds(prev => ({
                ...prev,
                [currentViewedProfile.id]: photoId
              }));
            }}
            onShareToFeed={handleAddNewShare}
            initialOpenUpload={autoOpenUpload}
            onResetUploadTrigger={() => setAutoOpenUpload(false)}
          />
        )}

        {currentTab === 'scrapbook' && (
          <Scrapbook
            scraps={scraps}
            onAddScrap={handleAddScrap}
            activeProfile={currentViewedProfile}
            isOwnProfile={activeProfileId === 'me'}
            currentUser={{ id: profiles.me.id, name: profiles.me.name, avatar: profiles.me.avatar }}
            onLikeScrap={handleLikeScrap}
            onShareToFeed={handleAddNewShare}
          />
        )}

        {currentTab === 'testimonials' && (
          <Testimonials
            testimonials={testimonials}
            onAddTestimonial={handleAddTestimonial}
            activeProfile={currentViewedProfile}
            isOwnProfile={activeProfileId === 'me'}
            currentUser={{ id: profiles.me.id, name: profiles.me.name, avatar: profiles.me.avatar }}
            onLikeTestimonial={handleLikeTestimonial}
            onShareToFeed={handleAddNewShare}
          />
        )}

        {currentTab === 'communities' && (
          <Communities
            communities={communities}
            onJoinCommunity={handleJoinCommunity}
            joinedIds={joinedCommunities}
          />
        )}

        {currentTab === 'search' && (
          <SearchResults
            query={searchQuery}
            profiles={profiles}
            communities={communities}
            scraps={scraps}
            onNavigateToFriend={handleNavigateToFriend}
            onJoinCommunity={handleJoinCommunity}
            joinedCommunityIds={joinedCommunities}
            onNavigateToTab={setCurrentTab}
            onClearSearch={() => {
              setSearchQuery('');
              setCurrentTab('profile');
            }}
          />
        )}

        {currentTab === 'rust-sec-lab' && (
          <RustSecLab />
        )}
      </main>

      {/* 3. Footer */}
      <OrkutFooter />

      {/* MSN Alert Toast Notification System */}
      <MsnToastSystem />

      {/* Secret Privacidade Chat Modal */}
      <SecretChat
        isOpen={isSecretChatOpen}
        onClose={() => setIsSecretChatOpen(false)}
        currentUser={{
          id: profiles.me.id,
          name: profiles.me.name,
          avatar: profiles.me.avatar,
          username: profiles.me.username || 'junior.sombra'
        }}
        initialTargetFriendId={secretChatFriendId}
        friendsList={friends}
      />
    </div>
  );
}
