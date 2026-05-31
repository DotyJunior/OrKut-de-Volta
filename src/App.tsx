import { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Lock, BookOpen, RefreshCw } from 'lucide-react';
import OrkutHeader from './components/OrkutHeader';
import OrkutFooter from './components/OrkutFooter';
import ProfileLayout from './components/ProfileLayout';
import Scrapbook from './components/Scrapbook';
import ScrapbookBuilder from './components/ScrapbookBuilder';
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
import OrkutLogin from './components/OrkutLogin';

// Firebase imports
import { collection, doc, setDoc, onSnapshot, getDoc, getDocFromServer } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

const DEFAULT_PROFILES: Record<string, Profile> = {
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
    webpage: 'https://github.com/scrapzone-secure',
    passions: 'Cibersegurança, pinhão cozido, criptografia AES e herança zero-custo',
    aboutMe: 'Eae galera! Sou um entusiasta de segurança da informação e Rust de Curitiba. Estou reescrevendo todo o Scrapzone de forma robusta e livre de buffer overflow para consertar os erros que ajudaram a quebrar esse gigante de 2004. Sejam muito bem-vindos ao meu perfil criptografado, deixem um scrap ou depoimento seguro!',
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
    aboutMe: 'Deputado e presidente da Assembleia Legislativa do Paraná. Defensor inabalável do desenvolvimento tecnológico do sul. Apoiando a reconstrução criptografada do Scrapzone para mostrar que no Paraná, segurança cibernética e memória computacional limpa são tratadas como leis de estado! Chapa, quer debater as últimas do pinhão parlamentar? Deixe seu recado seguro!',
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
    aboutMe: 'Hello my friends! I am the original founder of Orkut. In 2004, internet security was very basic. We had cookie theft, XSS injections, and bad server policies. But today, seeing this Scrapzone replica backed by Rust performance, WebCrypto AES, and zero-knowledge communities, I am fully amazed! You are awesome. Be safe and leave me a scrap!',
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
    passions: 'Música retro, chats secretos, Scrapzone 2004',
    aboutMe: 'Eae parça! Sou o Lucas, curto muito bater papo de madrugada e relembrar as comunidades clássicas. Ativei meu canal seguro com criptografia de 48 horas!',
    trusty: 3,
    cool: 3,
    sexy: 2,
    fans: 15,
    username: 'Lucas_Santos',
    statusOnline: '● livre para chat',
    theme: 'default'
  }
};

const DEFAULT_SCRAPS: Scrap[] = [
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
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
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
];

const DEFAULT_SHARED_MEMORIES: SharedMemory[] = [
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
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('profile');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
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
  const [sharedMemories, setSharedMemories] = useState<SharedMemory[]>(() => DEFAULT_SHARED_MEMORIES);

  // Authentication & Session States
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Google Firebase Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setIsAuthLoading(true);
      if (firebaseUser) {
        // Watch user profile in firestore
        const docRef = doc(db, 'profiles', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentUserProfile(data as Profile);
          } else {
            // If registration is in progress, do not seed defaultMe.
            // Wait for the register process to write newUserProfile first.
            if (localStorage.getItem('scrapzone_registering_in_progress') === 'true') {
              setIsAuthLoading(false);
              return;
            }

            // First time seeding fallback (for console/dev manual auth accounts)
            const defaultMe = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Novo Usuário',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              location: 'Curitiba, PR - Brasil',
              relationship: 'Solteiro',
              humor: 'Amigável',
              hereFor: 'Amigos',
              fashion: 'Básico',
              religion: 'Nenhuma',
              ethnicity: 'Latino Criptográfico',
              languages: 'Português',
              hometown: 'Curitiba',
              webpage: '',
              passions: 'Scrapzone Seguro',
              aboutMe: 'Oi! Sou novo por aqui no Scrapzone Seguro. Deixe um recado!',
              trusty: 3,
              cool: 3,
              sexy: 3,
              fans: 0,
              username: firebaseUser.email?.split('@')[0] || 'membro',
              theme: 'default',
              statusOnline: '● Online Agora',
              isEmailVerified: true
            };
            setDoc(docRef, defaultMe).catch(err => console.error(err));
            setCurrentUserProfile(defaultMe);
          }
          setIsAuthLoading(false);
        }, (error) => {
          console.error("Profile snap error: ", error);
          setIsAuthLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        // Not logged in with Firebase Auth. Check for static demo login cache
        const cachedDemoId = localStorage.getItem('orkut_demo_me_id');
        if (cachedDemoId && DEFAULT_PROFILES[cachedDemoId]) {
          setCurrentUserProfile(DEFAULT_PROFILES[cachedDemoId]);
        } else {
          setCurrentUserProfile(null);
        }
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Automatic Presence Heartbeat Tracker (online/away/offline)
  useEffect(() => {
    if (!currentUserProfile) return;
    
    // Skip built-in characters presence triggers
    const builtInIds = ['alexandre', 'orkut', 'hacker', 'lucas'];
    if (builtInIds.includes(currentUserProfile.id)) return;

    let lastActive = Date.now();
    const handleActive = () => { lastActive = Date.now(); };
    const listenEvents = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    listenEvents.forEach(ev => window.addEventListener(ev, handleActive, { passive: true }));

    const interval = setInterval(async () => {
      const now = Date.now();
      const diff = now - lastActive;
      const isAway = diff > 40000; // 40s
      const isOf = diff > 90000; // 90s

      let targetStatus = "● Online Agora";
      if (isOf) {
        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        targetStatus = `⚫ Offline desde ${timeStr}`;
      } else if (isAway) {
        targetStatus = "● Ausente da máquina";
      }

      if (currentUserProfile.statusOnline !== targetStatus) {
        try {
          await setDoc(doc(db, 'profiles', currentUserProfile.id), {
            ...currentUserProfile,
            statusOnline: targetStatus
          });
        } catch (e) {
          console.error("Auto heartbeat update failed: ", e);
        }
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      listenEvents.forEach(ev => window.removeEventListener(ev, handleActive));
    };
  }, [currentUserProfile]);

  const handleLoginSuccess = (userProfile: Profile, isDemo: boolean) => {
    setCurrentUserProfile(userProfile);
    if (isDemo) {
      localStorage.setItem('orkut_demo_me_id', userProfile.id);
    } else {
      localStorage.removeItem('orkut_demo_me_id');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('orkut_demo_me_id');
    localStorage.removeItem('orkut_remember_uid');
    try {
      await auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setCurrentUserProfile(null);
    setActiveProfileId('me');
    setCurrentTab('profile');
  };

  // Firestore Connection Test & Sync Effect
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test_connection', 'ping'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or network status.");
        }
      }
    }
    testConnection();

    // Attach real-time snapshot listeners for total full-stack auto-sync
    const unsubscribeProfiles = onSnapshot(collection(db, 'profiles'), (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed/bootstrap profiles in database
        Object.keys(DEFAULT_PROFILES).forEach(async (key) => {
          try {
            await setDoc(doc(db, 'profiles', key), DEFAULT_PROFILES[key]);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `profiles/${key}`);
          }
        });
      } else {
        const fetched: Record<string, Profile> = {};
        snapshot.forEach((doc) => {
          fetched[doc.id] = doc.data() as Profile;
        });

        // Ensure that our logged in identity takes precedence under the 'me' key
        const cachedDemoId = localStorage.getItem('orkut_demo_me_id');
        const authUid = auth.currentUser?.uid;
        const currentUid = authUid || cachedDemoId;
        if (currentUid && fetched[currentUid]) {
          fetched['me'] = fetched[currentUid];
        } else if (currentUserProfile) {
          fetched['me'] = currentUserProfile;
        }

        setProfiles(fetched);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'profiles');
    });

    const unsubscribeScraps = onSnapshot(collection(db, 'scraps'), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_SCRAPS.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'scraps', item.id), item);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `scraps/${item.id}`);
          }
        });
      } else {
        const list: Scrap[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Scrap);
        });
        // Sort or display
        setScraps(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scraps');
    });

    const unsubscribeTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_TESTIMONIALS.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'testimonials', item.id), item);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `testimonials/${item.id}`);
          }
        });
      } else {
        const list: Testimonial[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Testimonial);
        });
        setTestimonials(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'testimonials');
    });

    const unsubscribeAlbums = onSnapshot(collection(db, 'albums'), (snapshot) => {
      if (snapshot.empty) {
        // Seeding initial albums if DB is empty
        const initial = getInitialAlbums();
        initial.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'albums', item.id), item);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `albums/${item.id}`);
          }
        });
      } else {
        const list: Album[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Album);
        });
        setAlbums(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'albums');
    });

    const unsubscribeSharedMemories = onSnapshot(collection(db, 'shared_memories'), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_SHARED_MEMORIES.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'shared_memories', item.id), item);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `shared_memories/${item.id}`);
          }
        });
      } else {
        const list: SharedMemory[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as SharedMemory);
        });
        setSharedMemories(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'shared_memories');
    });

    return () => {
      unsubscribeProfiles();
      unsubscribeScraps();
      unsubscribeTestimonials();
      unsubscribeAlbums();
      unsubscribeSharedMemories();
    };
  }, []);

  // Dynamic subscription to Joined Communities depending on current logged-in identity
  useEffect(() => {
    const activeId = currentUserProfile?.id || 'me';
    const docRef = doc(db, 'joined_communities', activeId);
    
    const unsubscribeJoinedCommunities = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.communityIds)) {
          setJoinedCommunities(data.communityIds);
        }
      } else {
        // Fallback or seed default communities
        setDoc(docRef, { communityIds: ['1', '3'] }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `joined_communities/${activeId}`);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `joined_communities/${activeId}`);
    });

    return () => {
      unsubscribeJoinedCommunities();
    };
  }, [currentUserProfile?.id]);

  const handleLikeScrap = async (id: string, liked: boolean, count: number) => {
    const item = scraps.find(s => s.id === id);
    if (item) {
      const updated = { ...item, likes: count, likedByMe: liked };
      try {
        await setDoc(doc(db, 'scraps', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `scraps/${id}`);
      }
    }
  };

  const handleLikeTestimonial = async (id: string, liked: boolean, count: number) => {
    const item = testimonials.find(t => t.id === id);
    if (item) {
      const updated = { ...item, likes: count, likedByMe: liked };
      try {
        await setDoc(doc(db, 'testimonials', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `testimonials/${id}`);
      }
    }
  };

  const handleAddNewShare = async (itemTitle: string, itemType: any, friendName?: string) => {
    const timestampStr = new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -');
    const newId = 'sh_' + Math.random().toString(36).substr(2, 9);
    const newShare: SharedMemory = {
      id: newId,
      sharerName: profiles.me.name,
      sharerAvatar: profiles.me.avatar,
      itemType: itemType,
      itemTitle: itemTitle,
      targetUser: friendName,
      timestamp: timestampStr,
      likes: 0,
      likedByMe: false
    };
    try {
      await setDoc(doc(db, 'shared_memories', newId), newShare);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `shared_memories/${newId}`);
    }
  };

  const handleLikeShare = async (id: string, liked: boolean, count: number) => {
    const item = sharedMemories.find(sm => sm.id === id);
    if (item) {
      const updated = { ...item, likes: count, likedByMe: liked };
      try {
        await setDoc(doc(db, 'shared_memories', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `shared_memories/${id}`);
      }
    }
  };

  const handleUpdateAlbums = async (newAlbums: Album[] | ((prev: Album[]) => Album[])) => {
    const resolvedAlbums = typeof newAlbums === 'function' ? newAlbums(albums) : newAlbums;
    setAlbums(resolvedAlbums);
    for (const album of resolvedAlbums) {
      try {
        await setDoc(doc(db, 'albums', album.id), album);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `albums/${album.id}`);
      }
    }
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
      webpage: 'https://github.com/scrapzone-secure',
      passions: 'Cibersegurança, pinhão cozido, criptografia AES e herança zero-custo',
      aboutMe: 'Eae galera! Sou um entusiasta de segurança da informação e Rust de Curitiba. Estou reescrevendo todo o Scrapzone de forma robusta e livre de buffer overflow para consertar os erros que ajudaram a quebrar esse gigante de 2004. Sejam muito bem-vindos ao meu perfil criptografado, deixem um scrap ou depoimento seguro!',
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
      aboutMe: 'Deputado e presidente da Assembleia Legislativa do Paraná. Defensor inabalável do desenvolvimento tecnológico do sul. Apoiando a reconstrução criptografada do Scrapzone para mostrar que no Paraná, segurança cibernética e memória computacional limpa são tratadas como leis de estado! Chapa, quer debater as últimas do pinhão parlamentar? Deixe seu recado seguro!',
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
      aboutMe: 'Hello my friends! I am the original founder of Orkut. In 2004, internet security was very basic. We had cookie theft, XSS injections, and bad server policies. But today, seeing this Scrapzone replica backed by Rust performance, WebCrypto AES, and zero-knowledge communities, I am fully amazed! You are awesome. Be safe and leave me a scrap!',
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
      passions: 'Música retro, chats secretos, Scrapzone 2004',
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
    { id: 'orkut_devs', name: 'Scrapzone Devs & Zero-Knowledge', description: 'Simulações de zk-SNARKs e criptossistemas de alto gabarito sob governança descentralizada.', members: 502, avatar: '🔑', category: 'Cripto', secureMode: true }
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

  // Save editable profile locally and sync to Firestore
  const handleSaveProfile = async (updatedProfile: Partial<Profile>) => {
    const updatedMe = {
      ...profiles.me,
      ...updatedProfile
    };
    setProfiles(prev => ({
      ...prev,
      me: updatedMe
    }));
    try {
      const realId = profiles.me?.id || currentUserProfile?.id || 'me';
      await setDoc(doc(db, 'profiles', realId), updatedMe);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `profiles/${profiles.me?.id || currentUserProfile?.id || 'me'}`);
    }
  };

  // Rate another user's profile and synchronize with Firebase Firestore
  const handleRateProfile = async (profileId: string, type: 'trusty' | 'cool' | 'sexy' | 'fans', deltaOrValue: number) => {
    if (!profileId || profileId === 'me' || (currentUserProfile && profileId === currentUserProfile.id)) {
      return; // Can't self-rate
    }

    const currentProfile = profiles[profileId];
    if (!currentProfile) return;

    let updatedValue = currentProfile[type] || 0;
    if (type === 'fans') {
      updatedValue += deltaOrValue; // delta is +1 or -1
    } else {
      updatedValue = deltaOrValue; // 1, 2, or 3
    }

    // Guard negative ranges
    updatedValue = Math.max(0, updatedValue);

    const updatedProfile = {
      ...currentProfile,
      [type]: updatedValue
    };

    setProfiles(prev => ({
      ...prev,
      [profileId]: updatedProfile
    }));

    try {
      await setDoc(doc(db, 'profiles', profileId), updatedProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `profiles/${profileId}`);
    }
  };

  // Switch visited profile
  const handleNavigateToFriend = (id: string) => {
    setActiveProfileId(id);
    setCurrentTab('profile');
  };

  // Add new Scrap with real-time Express Gemini proxy response and sync to Firestore
  const handleAddScrap = async (scrap: Omit<Scrap, 'id' | 'timestamp'> & { needsAiResponse?: boolean }) => {
    const timestampStr = new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -');
    const newId = 'sc_' + Math.random().toString(36).substr(2, 9);
    
    const newScrapItem: Scrap = {
      id: newId,
      ...scrap,
      timestamp: timestampStr
    };

    try {
      await setDoc(doc(db, 'scraps', newId), newScrapItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `scraps/${newId}`);
    }

    if (scrap.needsAiResponse) {
      const activeChar = activeProfileId; // 'alexandre', 'orkut', 'hacker'
      
      const typingId = 'typing_' + Math.random().toString(36).substr(2, 9);
      const typingItem: Scrap = {
        id: typingId,
        fromId: activeChar,
        fromName: profiles[activeChar]?.name || activeChar,
        fromAvatar: profiles[activeChar]?.avatar || '',
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
        
        const aiScrap: Scrap = {
          id: 'ai_rep_' + Math.random().toString(36).substr(2, 9),
          fromId: activeChar,
          fromName: profiles[activeChar]?.name || activeChar,
          fromAvatar: profiles[activeChar]?.avatar || '',
          toId: 'me',
          timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -'),
          rawContent: data.reply || "Resposta assinada criptograficamente.",
          isEncrypted: false
        };

        await setDoc(doc(db, 'scraps', aiScrap.id), aiScrap);
        setScraps(prev => prev.filter(s => s.id !== typingId));
      } catch (err) {
        console.error("Express Gemini Proxy Error:", err);
        const fallbackScrap: Scrap = {
          id: 'fallback_rep_' + Math.random().toString(36).substr(2, 9),
          fromId: activeChar,
          fromName: profiles[activeChar]?.name || activeChar,
          fromAvatar: profiles[activeChar]?.avatar || '',
          toId: 'me',
          timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -'),
          rawContent: `[Secure Local Fallback] Recebi seu recado chapa! Desculpe, não consegui me conectar ao cérebro inteligente do servidor agora, mas garanto que o Borrow Checker de Curitiba está rodando.`,
          isEncrypted: false
        };
        await setDoc(doc(db, 'scraps', fallbackScrap.id), fallbackScrap);
        setScraps(prev => prev.filter(s => s.id !== typingId));
      }
    }
  };

  const handleAddTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'timestamp' | 'unlocked'>) => {
    const timestampStr = new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -');
    const newId = 'test_' + Math.random().toString(36).substr(2, 9);
    const newTest: Testimonial = {
      id: newId,
      ...testimonial,
      timestamp: timestampStr,
      unlocked: !testimonial.isEncrypted
    };
    try {
      await setDoc(doc(db, 'testimonials', newId), newTest);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `testimonials/${newId}`);
    }
  };

  const handleJoinCommunity = async (id: string) => {
    if (!joinedCommunities.includes(id)) {
      const updated = [...joinedCommunities, id];
      setJoinedCommunities(updated);
      try {
        const activeId = currentUserProfile?.id || 'me';
        await setDoc(doc(db, 'joined_communities', activeId), { communityIds: updated });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `joined_communities/${currentUserProfile?.id || 'me'}`);
      }
    }
  };

  // Loading state during session check
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#cbdcf3] to-[#fbcfe8] flex flex-col items-center justify-center font-sans gap-4 select-none">
        <div className="flex items-center gap-1.5 mb-1.5 animate-pulse">
          <h1 className="text-5xl font-extrabold text-[#ed3fa7] tracking-tighter">
            orkut
          </h1>
          <span className="bg-[#1b4372] text-[8px] text-white font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            secure
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1b4372] bg-white border border-[#92afd9] rounded-full py-1.5 px-4 shadow-sm">
          <RefreshCw className="animate-spin text-pink-600" size={13} strokeWidth={2.5} />
          <span>Sincronizando integridade de sessão...</span>
        </div>
      </div>
    );
  }

  // Session gate
  if (!currentUserProfile || currentUserProfile.isEmailVerified === false) {
    return (
      <OrkutLogin 
        onLoginSuccess={handleLoginSuccess} 
        defaultProfiles={DEFAULT_PROFILES} 
        isEmailUnverifiedProfile={currentUserProfile}
        onLogout={handleLogout}
      />
    );
  }

  const currentViewedProfile = profiles[activeProfileId] || profiles.me || DEFAULT_PROFILES.me;
  const themeStyles = getThemeStyles(currentViewedProfile.theme);

  return (
    <div className={`min-h-screen ${themeStyles.bg} flex flex-col justify-between transition-colors duration-300 selection:bg-pink-100 antialiased`}>
      {/* 1. Header */}
      <OrkutHeader
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'communities') {
            setSelectedCommunityId(null);
          }
          setCurrentTab(tab);
        }}
        userName={profiles.me?.name || currentUserProfile.name}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLogout={handleLogout}
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
            onNavigateToTab={(tab, forceVisitor = false, autoTriggerUpload = false, communityId) => {
              setCurrentTab(tab);
              setIsVisitorMode(forceVisitor);
              setAutoOpenUpload(autoTriggerUpload);
              if (tab === 'communities') {
                setSelectedCommunityId(communityId || null);
              }
            }}
            userPublicKey={userPublicKey}
            currentTab={currentTab}
            albums={albums}
            featuredPhotoId={featuredPhotoIds[currentViewedProfile.id] || null}
            sharedMemories={sharedMemories}
            onShareToFeed={handleAddNewShare}
            onLikeShare={handleLikeShare}
            onOpenSecretChat={(targetFriendId) => {
              setSecretChatFriendId(targetFriendId || 'lucas');
              setIsSecretChatOpen(true);
            }}
            onRateProfile={handleRateProfile}
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
            onUpdateAlbums={handleUpdateAlbums}
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
            currentUser={{ id: currentUserProfile?.id || profiles.me.id || 'me', name: profiles.me.name, avatar: profiles.me.avatar }}
            onLikeScrap={handleLikeScrap}
            onShareToFeed={handleAddNewShare}
            onGoToBuilder={() => setCurrentTab('scrapbook-builder')}
          />
        )}

        {currentTab === 'scrapbook-builder' && (
          <ScrapbookBuilder
            profiles={profiles}
            currentUser={{ id: currentUserProfile?.id || profiles.me.id || 'me', name: profiles.me.name, avatar: profiles.me.avatar }}
            onPostScrap={handleAddScrap}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'testimonials' && (
          <Testimonials
            testimonials={testimonials}
            onAddTestimonial={handleAddTestimonial}
            activeProfile={currentViewedProfile}
            isOwnProfile={activeProfileId === 'me'}
            currentUser={{ id: currentUserProfile?.id || profiles.me.id || 'me', name: profiles.me.name, avatar: profiles.me.avatar }}
            onLikeTestimonial={handleLikeTestimonial}
            onShareToFeed={handleAddNewShare}
          />
        )}

        {currentTab === 'communities' && (
          <Communities
            communities={communities}
            onJoinCommunity={handleJoinCommunity}
            joinedIds={joinedCommunities}
            profiles={profiles}
            currentUser={{ id: currentUserProfile?.id || profiles.me.id || 'me', name: profiles.me.name, avatar: profiles.me.avatar }}
            onNavigateToFriend={handleNavigateToFriend}
            onNavigateToTab={(tab, forceVisitor = false, autoTriggerUpload = false, communityId) => {
              setCurrentTab(tab);
              setIsVisitorMode(forceVisitor);
              setAutoOpenUpload(autoTriggerUpload);
              if (tab === 'communities') {
                setSelectedCommunityId(communityId || null);
              }
            }}
            activeCommunityId={selectedCommunityId}
            setActiveCommunityId={setSelectedCommunityId}
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
          id: currentUserProfile?.id || profiles.me.id || 'me',
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
