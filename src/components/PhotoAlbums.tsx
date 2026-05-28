import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Play, 
  Pause, 
  Image as ImageIcon, 
  ArrowLeft, 
  Sparkles, 
  Camera, 
  Tv, 
  ShieldCheck, 
  Volume2, 
  User, 
  ChevronRight, 
  Share2, 
  Star,
  Film,
  Smile,
  Info
} from 'lucide-react';
import { Album, Photo, PhotoComment } from '../types';
import SocialActions from './SocialActions';

interface PhotoAlbumsProps {
  profileId: string;
  profileName: string;
  profileAvatar: string;
  albums: Album[];
  isOwnProfile: boolean;
  onUpdateAlbums: (updatedAlbums: Album[]) => void;
  featuredPhotoId: string | null;
  onSetFeaturedPhoto: (photoId: string | null) => void;
  isVisitorMode?: boolean;
  onShareToFeed: (itemTitle: string, itemType: string) => void;
  initialOpenUpload?: boolean;
  onResetUploadTrigger?: () => void;
}

// Preset visual suggestion options for rich user experience
const RETRO_PRESETS = [
  { name: '💿 Fita de CD Emo Rock', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600' },
  { name: '📟 Monitor de Fósforo Verde', url: 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?w=600' },
  { name: '📺 Televisão Antiga Bombada', url: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600' },
  { name: '🕹️ Fliperama Retrô Curitiba', url: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=600' },
  { name: '💻 Computador de Tubo Branco', url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600' },
  { name: '📼 Fita Cassete Magnética', url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600' }
];

const GIF_PRESETS = [
  { name: '⚡ Pikachu Dance', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWZscDBsbnFlN3pqa3FjcndwNWZ5M3YweHFtNmxyZ2MzbzlwdjI4NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Y2pC52M48T9v2/giphy.gif' },
  { name: '🌹 Rosa Brilhante Retro', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3pjdWRhbW41dzNqNTRkOWI1aWNoOGtydWZmb3hyOGo5c2YxeTJjNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LMc8vEIsS0PFC/giphy.gif' },
  { name: '🌀 Matrix Rain Code', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTYyeTFzbDN4bnFpeTdxNXBhbmtsajAweTViMmdnMnA2dzQxdnpxNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TdU3S76uAn7v83e6S7/giphy.gif' },
  { name: '👾 Cyber Glitch Animation', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejhpYzY0cnE5MmZwbTZleTZlajRkNzdpODhzd3VyOHEyMzd6MXZzeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZElXUvIsO2ef6/giphy.gif' },
  { name: '🎸 Emo Punk Skull', url: 'https://media.giphy.com/media/3o7aTskHEUdgCQAXde/giphy.gif' }
];

// Synth Shutter Sound using Web Audio API
export const playShutterSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Camera lens auto-focus beep beep
    const playBeep = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playBeep(2100, 0, 0.05);
    playBeep(2100, 0.08, 0.05);

    // Shutter tsclick
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

export default function PhotoAlbums({
  profileId,
  profileName,
  profileAvatar,
  albums,
  isOwnProfile,
  onUpdateAlbums,
  featuredPhotoId,
  onSetFeaturedPhoto,
  isVisitorMode = false,
  onShareToFeed,
  initialOpenUpload = false,
  onResetUploadTrigger,
}: PhotoAlbumsProps) {
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  
  // View states: 'list' | 'album' | 'photo'
  const [viewMode, setViewMode] = useState<'list' | 'album' | 'photo'>('list');

  // Edit Caption states
  const [showEditCaption, setShowEditCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');

  // Organize/Manage Album states
  const [showOrganizeAlbum, setShowOrganizeAlbum] = useState(false);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editAlbumDesc, setEditAlbumDesc] = useState('');
  const [editAlbumTheme, setEditAlbumTheme] = useState<'neon-hacker' | 'emo-2008' | 'vhs' | 'cyberpunk' | 'glitter' | 'gotico' | 'polaroid' | 'old-camera'>('neon-hacker');

  // Loading simulate state for that delicious dial-up 2004 nostalgia
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');

  // Creation State modals
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  // Form Fields
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [newAlbumTheme, setNewAlbumTheme] = useState<'neon-hacker' | 'emo-2008' | 'vhs' | 'cyberpunk' | 'glitter' | 'gotico' | 'polaroid' | 'old-camera'>('neon-hacker');

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoSong, setNewPhotoSong] = useState('');
  const [newPhotoGif, setNewPhotoGif] = useState('');

  // Comment posting
  const [commentInput, setCommentInput] = useState('');

  // Song visualizer simulator
  const [isSongPlaying, setIsSongPlaying] = useState(false);

  // Filter profiles albums loaded (only of current viewed profile!)
  const profileAlbums = albums.filter(a => a.profileId === profileId);

  // Retrieve Active elements
  const activeAlbum = albums.find(a => a.id === activeAlbumId);
  const activePhoto = activeAlbum?.photos.find(p => p.id === selectedPhotoId);

  // Sync edited caption and album details when editing targets change
  useEffect(() => {
    if (activePhoto) {
      setEditedCaption(activePhoto.caption);
    }
  }, [selectedPhotoId, activePhoto]);

  useEffect(() => {
    if (activeAlbum) {
      setEditAlbumName(activeAlbum.name);
      setEditAlbumDesc(activeAlbum.description);
      setEditAlbumTheme(activeAlbum.theme);
    }
  }, [activeAlbumId, activeAlbum]);

  // Handle auto-triggering uploads / custom photo panel actions
  useEffect(() => {
    if (initialOpenUpload) {
      if (profileAlbums.length > 0) {
        setActiveAlbumId(profileAlbums[0].id);
        setViewMode('album');
        setShowAddPhoto(true);
      } else {
        setViewMode('list');
        setShowCreateAlbum(true);
      }
      if (onResetUploadTrigger) {
        onResetUploadTrigger();
      }
    }
  }, [initialOpenUpload, profileAlbums.length, onResetUploadTrigger]);

  // Retro Loaders phrases
  const loaderPhrases = [
    'Discando via Curitiba Telecom USRobotics 56kpbs...',
    'Realizando handshake analógico de frequências...',
    'Borrow Checker liberando porta do álbum...',
    'Verificando pilha de frames estáticos...',
    'Desenhaste pixels interlaçados CRT...',
    'Iniciando tubo estático de raios catódicos...'
  ];

  const triggerNostalgicLoading = (callback: () => void, textOverride?: string) => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingText(textOverride || loaderPhrases[Math.floor(Math.random() * loaderPhrases.length)]);
    playShutterSound();

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            callback();
          }, 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 150);
  };

  const handleOpenAlbum = (id: string) => {
    triggerNostalgicLoading(() => {
      setActiveAlbumId(id);
      setViewMode('album');
      setSelectedPhotoId(null);
    }, 'Baixando fotos do álbum no cache seguro...');
  };

  const handleOpenPhoto = (photoId: string) => {
    triggerNostalgicLoading(() => {
      setSelectedPhotoId(photoId);
      setViewMode('photo');
      setIsSongPlaying(true); // Auto play visualizer song of the moment!
    }, 'Abrindo registro de imagem e tocando trilha...');
  };

  const handleBackToAlbums = () => {
    triggerNostalgicLoading(() => {
      setViewMode('list');
      setActiveAlbumId(null);
      setSelectedPhotoId(null);
    });
  };

  const handleBackToAlbum = () => {
    triggerNostalgicLoading(() => {
      setViewMode('album');
      setSelectedPhotoId(null);
    });
  };

  // Create Album
  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    const newAlbum: Album = {
      id: 'album_' + Math.random().toString(36).substr(2, 9),
      profileId: profileId,
      name: newAlbumName.trim(),
      description: newAlbumDesc.trim() || 'Sem descrição.',
      theme: newAlbumTheme,
      photos: [],
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    onUpdateAlbums([...albums, newAlbum]);
    setNewAlbumName('');
    setNewAlbumDesc('');
    setShowCreateAlbum(false);
    triggerNostalgicLoading(() => {
      setActiveAlbumId(newAlbum.id);
      setViewMode('album');
    }, 'Pintando tema sob demanda e compilando sandbox...');
  };

  // Add Photo
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !activeAlbumId) return;

    const newPhoto: Photo = {
      id: 'photo_' + Math.random().toString(36).substr(2, 9),
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Sem legenda.',
      song: newPhotoSong.trim() || undefined,
      gifUrl: newPhotoGif.trim() || undefined,
      likes: 0,
      comments: [],
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedAlbums = albums.map(a => {
      if (a.id === activeAlbumId) {
        return {
          ...a,
          photos: [newPhoto, ...a.photos]
        };
      }
      return a;
    });

    onUpdateAlbums(updatedAlbums);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoSong('');
    setNewPhotoGif('');
    setShowAddPhoto(false);

    triggerNostalgicLoading(() => {
      setSelectedPhotoId(newPhoto.id);
      setViewMode('photo');
    }, 'Processando cores de filme analógico...');
  };

  // Like photo toggle
  const handleLikePhoto = () => {
    if (!activeAlbumId || !selectedPhotoId) return;
    playShutterSound();

    const updatedAlbums = albums.map(a => {
      if (a.id === activeAlbumId) {
        const updatedPhotos = a.photos.map(p => {
          if (p.id === selectedPhotoId) {
            const isLiked = p.likedByMe;
            return {
              ...p,
              likes: isLiked ? p.likes - 1 : p.likes + 1,
              likedByMe: !isLiked
            };
          }
          return p;
        });
        return { ...a, photos: updatedPhotos };
      }
      return a;
    });

    onUpdateAlbums(updatedAlbums);
  };

  // Post comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeAlbumId || !selectedPhotoId) return;

    const newComment: PhotoComment = {
      id: 'comm_' + Math.random().toString(36).substr(2, 9),
      authorName: profileName,
      authorAvatar: profileAvatar,
      text: commentInput.trim(),
      date: new Date().toLocaleString('pt-BR', { timeZone: 'UTC' }).slice(0, 16).replace(',', ' -')
    };

    const updatedAlbums = albums.map(a => {
      if (a.id === activeAlbumId) {
        const updatedPhotos = a.photos.map(p => {
          if (p.id === selectedPhotoId) {
            return {
              ...p,
              comments: [...p.comments, newComment]
            };
          }
          return p;
        });
        return { ...a, photos: updatedPhotos };
      }
      return a;
    });

    onUpdateAlbums(updatedAlbums);
    setCommentInput('');
  };

  // Delete photo
  const handleDeletePhoto = (photoId: string) => {
    if (!activeAlbumId) return;
    if (!confirm('Deseja realmente apagar esta foto do álbum chapa?')) return;

    const updatedAlbums = albums.map(a => {
      if (a.id === activeAlbumId) {
        return {
          ...a,
          photos: a.photos.filter(p => p.id !== photoId)
        };
      }
      return a;
    });

    onUpdateAlbums(updatedAlbums);
    setViewMode('album');
    setSelectedPhotoId(null);
  };

  // Update photo caption (editar legenda)
  const handleUpdateCaption = () => {
    if (!activeAlbumId || !selectedPhotoId || !editedCaption.trim()) return;

    const updatedAlbums = albums.map(a => {
      if (a.id === activeAlbumId) {
         const updatedPhotos = a.photos.map(p => {
          if (p.id === selectedPhotoId) {
            return {
              ...p,
              caption: editedCaption.trim()
            };
          }
          return p;
        });
        return { ...a, photos: updatedPhotos };
      }
      return a;
    });

    onUpdateAlbums(updatedAlbums);
    setShowEditCaption(false);
  };

  // Update album info (organizar álbum / mudar tema)
  const handleUpdateAlbumInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAlbumName.trim() || !activeAlbumId) return;

    const updatedAlbums = albums.map(a => {
      if (a.id === activeAlbumId) {
        return {
          ...a,
          name: editAlbumName.trim(),
          description: editAlbumDesc.trim() || 'Sem descrição.',
          theme: editAlbumTheme
        };
      }
      return a;
    });

    onUpdateAlbums(updatedAlbums);
    setShowOrganizeAlbum(false);
    triggerNostalgicLoading(() => {}, 'Recompilando e alterando tema visual do álbum...');
  };

  // Delete entire album
  const handleDeleteAlbum = () => {
    if (!activeAlbumId) return;
    if (!confirm(`🚨 ALERTA GERAL CHAPA!\nVocê deseja realmente DELETAR o álbum inteiro "${activeAlbum?.name}"?\nIsso apagará todas as ${activeAlbum?.photos.length} fotos do servidor!\nEsta ação é irreversível.`)) return;

    const updatedAlbums = albums.filter(a => a.id !== activeAlbumId);
    onUpdateAlbums(updatedAlbums);
    setViewMode('list');
    setActiveAlbumId(null);
    setShowOrganizeAlbum(false);
  };

  // Get dynamic styles based on album theme
  const getAlbumThemeClass = (theme: string) => {
    // Always force standard light theme styling
    const finalTheme: string = 'default';
    switch (finalTheme) {
      case 'neon-hacker':
        return {
          container: 'bg-black text-[#22c55e] border-[#22c55e] font-mono',
          card: 'bg-[#050505] border-[#22c55e]/60 border shadow-[0_0_15px_rgba(34,197,94,0.15)] text-[#22c55e]',
          header: 'bg-green-950/40 border-b border-[#22c55e]',
          buttonColors: 'bg-green-950 text-[#22c55e] hover:bg-green-900 border border-[#22c55e]',
          scanlines: true,
          label: 'text-[#22c55e]/70 uppercase tracking-widest'
        };
      case 'emo-2008':
        return {
          container: 'bg-zinc-950 text-white border-[#ec4899] font-sans',
          card: 'bg-zinc-900 border-[#ec4899] border border-dashed text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]',
          header: 'bg-pink-950/60 border-b border-[#ec4899]',
          buttonColors: 'bg-pink-950 text-[#ec4899] hover:bg-pink-900 border border-[#ec4899]',
          scanlines: false,
          label: 'text-[#ec4899] font-serif font-bold italic'
        };
      case 'vhs':
        return {
          container: 'bg-[#0b0c10] text-[#45f3ff] border-[#ff007f] font-mono select-none',
          card: 'bg-[#12121e] border-2 border-double border-[#45f3ff] text-[#45f3ff] shadow-[0_0_10px_#45f3ff]',
          header: 'bg-[#ff007f]/20 border-b-2 border-dashed border-[#45f3ff]',
          buttonColors: 'bg-[#1f2833] text-[#45f3ff] hover:bg-cyan-900 border border-[#45f3ff]',
          scanlines: true,
          label: 'text-yellow-400 font-mono italic font-bold tracking-widest'
        };
      case 'cyberpunk':
        return {
          container: 'bg-[#0a0a16] text-[#00f0ff] border-[#f3ee00] font-mono',
          card: 'bg-[#0d0d21] border-[#00f0ff] border-2 border-r-4 border-b-4 text-[#00f0ff]',
          header: 'bg-[#1a0033] border-b-2 border-[#f3ee00]',
          buttonColors: 'bg-[#f3ee00] text-black hover:bg-yellow-400 font-bold',
          scanlines: true,
          label: 'text-[#f3ee00] uppercase tracking-wider'
        };
      case 'glitter':
        return {
          container: 'bg-gradient-to-br from-[#ffe4e6] via-[#fdf2f8] to-[#f3e8ff] text-[#db2777] font-sans italic',
          card: 'bg-white/85 border-[#db2777]/50 border shadow-[4px_4px_0px_#db2777] text-neutral-800',
          header: 'bg-[#fce7f3] border-b border-[#db2777]',
          buttonColors: 'bg-[#db2777] text-white hover:bg-pink-700',
          scanlines: false,
          label: 'text-[#c084fc] font-sans font-bold'
        };
      case 'gotico':
        return {
          container: 'bg-[#050101] text-[#b91c1c] border-[#7f1d1d] font-serif italic',
          card: 'bg-[#150a0a] border-2 border-[#b91c1c]/40 text-[#fca5a5] shadow-[0_0_12px_rgba(185,28,28,0.45)]',
          header: 'bg-[#2d0a0a] border-b border-[#b91c1c]',
          buttonColors: 'bg-red-950 text-red-300 hover:bg-red-900 border border-red-700',
          scanlines: false,
          label: 'text-red-500 font-serif lowercase italic'
        };
      case 'polaroid':
        return {
          container: 'bg-[#e2e8f0] text-neutral-800 border-neutral-400 font-serif',
          card: 'bg-white border border-neutral-300 p-4 shadow-md text-slate-800',
          header: 'bg-neutral-100 border-b border-neutral-200',
          buttonColors: 'bg-slate-700 text-white hover:bg-slate-800',
          scanlines: false,
          label: 'text-neutral-500 font-sans tracking-wide'
        };
      case 'old-camera':
        return {
          container: 'bg-[#f0ece1] text-amber-950 border-amber-900/60 font-serif',
          card: 'bg-[#faf6eb] border-2 border-amber-900/40 text-neutral-800 shadow-sm',
          header: 'bg-amber-100 border-b border-amber-200',
          buttonColors: 'bg-amber-900 text-[#faf6eb] hover:bg-amber-950',
          scanlines: false,
          label: 'text-amber-800 font-mono font-bold'
        };
      default:
        return {
          container: 'bg-[#dee7f4] text-neutral-800 border-neutral-300 font-sans',
          card: 'bg-white border border-neutral-300 text-neutral-800',
          header: 'bg-[#dee7f4] border-b border-[#adc3df]',
          buttonColors: 'bg-[#1d4ed8] text-white hover:bg-blue-700',
          scanlines: false,
          label: 'text-[#1d4ed8] font-sans font-semibold'
        };
    }
  };

  const activeThemeStyles = activeAlbum ? getAlbumThemeClass(activeAlbum.theme) : getAlbumThemeClass('default');

  return (
    <div className="relative flex flex-col gap-4">
      
      {/* 2004 Dialup Connection Simulator Loading Screen Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-55 flex flex-col justify-center items-center p-4 backdrop-blur-xs font-mono"
          >
            <div className="bg-neutral-900 border-2 border-indigo-500 p-6 rounded-lg max-w-sm w-full text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 text-[8px] bg-indigo-500 text-white uppercase font-bold">56kbps SECURE</div>
              
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase mb-3">
                <Camera size={14} className="animate-spin text-pink-500" />
                Scrapzone-Secure Photo Loader
              </div>

              <span className="text-[11px] text-green-400 block h-10 italic leading-snug">
                {loadingText}
              </span>

              {/* Classic Loading Bar */}
              <div className="w-full bg-black h-4 border border-indigo-800 overflow-hidden relative mt-2 rounded">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-150 relative bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:1rem_1rem]" 
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-2 font-mono">
                <span>COM PORT 3 OK</span>
                <span>{loadingProgress}% RENDERIZADO</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------ VIEW 1: ALBUMS LIST ------------------ */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-neutral-300 rounded shadow-md overflow-hidden text-left bg-[#fffdfa]"
        >
          {/* Header bar */}
          <div className="bg-[#dee7f4] border-b border-neutral-300 px-4 py-3 flex justify-between items-center bg-gradient-to-r from-[#dee7f4] to-[#adc3df]">
            <div>
              <h2 className="text-sm font-bold text-neutral-800 uppercase flex items-center gap-2">
                <Camera size={16} className="text-[#1d4ed8]" />
                Álbum de Fotos — {profileName}
              </h2>
              <p className="text-[10px] text-neutral-500 font-sans mt-0.5">
                Investigando memórias digitais, gifs, sentimentos e imagens raras chapa!
              </p>
            </div>
            
            {isOwnProfile && (
              <button
                id="btn-trigger-create-album"
                onClick={() => setShowCreateAlbum(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 font-sans"
              >
                <Plus size={14} />
                Novo Álbum
              </button>
            )}
          </div>

          {isVisitorMode && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-800 font-sans flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <Info size={14} className="text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Acesso do Visitante:</strong> Você está visualizando o álbum de recordações em <strong>Modo Somente Leitura</strong>. As permissões de edição, remoção e novas fotos estão bloqueadas chapa!
                </span>
              </span>
              <span className="text-[9px] bg-amber-500 text-neutral-900 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Visitante
              </span>
            </div>
          )}

          <div className="p-4 bg-transparent min-h-[380px]">
            {profileAlbums.length === 0 ? (
              <div className="text-center py-16 text-neutral-400 italic font-sans flex flex-col items-center justify-center gap-2">
                <ImageIcon size={36} className="text-neutral-300" />
                <span>Nenhum álbum foi compilado para este perfil de segurança ainda.</span>
                {isOwnProfile && (
                  <p className="text-[10px] text-neutral-500 mt-1">Crie seu primeiro álbum acima e eternize suas fotos de Lan House!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {profileAlbums.map(album => {
                  const albumStyles = getAlbumThemeClass(album.theme);
                  const firstPhoto = album.photos[0];
                  
                  return (
                    <div
                      key={album.id}
                      onClick={() => handleOpenAlbum(album.id)}
                      className={`group border rounded-lg overflow-hidden flex flex-col justify-between hover:scale-[1.02] cursor-pointer transition-all ${albumStyles.card} hover:border-[#d946ef] max-h-72`}
                      title="Explorar memórias do perfil"
                    >
                      {/* Album cover */}
                      <div className="h-40 bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                        {firstPhoto ? (
                          <img
                            src={firstPhoto.url}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-500 gap-1.5 p-4 text-center">
                            <ImageIcon size={28} className="text-neutral-400 opacity-60 animate-pulse" />
                            <span className="text-[9px] font-mono">Álbum vazio</span>
                          </div>
                        )}
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 text-white rounded font-mono font-bold text-[9px] border border-white/20">
                          {album.photos.length} FOTOS
                        </span>
                        
                        {/* Film theme strip watermark indicator on top */}
                        <div className="absolute bottom-0 inset-x-0 bg-black/45 p-1 text-center text-[8px] font-mono tracking-widest text-[#d946ef] uppercase font-bold border-t border-dashed border-white/10">
                          📌 {album.theme.toUpperCase()} PRESSET
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="p-3">
                        <h3 className="text-xs font-bold font-sans truncate pr-4 text-left">
                          📂 {album.name}
                        </h3>
                        <p className="text-[10px] opacity-75 truncate text-left mt-0.5">
                          {album.description}
                        </p>
                        <div className="flex justify-between items-center text-[9px] mt-2 border-t border-neutral-100/10 pt-1.5">
                          <span className="font-mono">📅 Criado em {album.createdAt}</span>
                          <span className="underline group-hover:text-pink-500">abrir →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ------------------ VIEW 2: SINGLE ALBUM GRID ------------------ */}
      {viewMode === 'album' && activeAlbum && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`border-2 rounded shadow-lg overflow-hidden text-left min-h-[420px] pb-10 ${activeThemeStyles.container}`}
        >
          {/* Theme Special Overlay elements */}
          {activeThemeStyles.scanlines && (
            <div className="absolute inset-0 bg-[#000]/06 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] z-20" />
          )}

          {/* VHS Visual elements */}
          {activeAlbum.theme === 'vhs' && (
            <div className="absolute top-2 left-2 z-10 p-1 px-2 bg-black text-red-500 text-[10px] font-bold font-mono border border-red-500 animate-pulse uppercase flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-605 inline-block" />
              • REC 00:00:24
            </div>
          )}

          {/* Album Title Block */}
          <div className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${activeThemeStyles.header}`}>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToAlbums}
                className="p-1 rounded bg-neutral-100/10 hover:bg-neutral-100/25 transition-colors cursor-pointer text-current"
                title="Voltar aos Álbuns"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide flex items-center gap-1 text-left">
                  📂 {activeAlbum.name}
                  <span className="text-[10px] bg-[#d946ef] text-white rounded px-1.5 font-mono ml-1.5 font-bold uppercase py-0.2">
                    {activeAlbum.theme}
                  </span>
                </h2>
                <p className="text-[10px] opacity-80 mt-1 max-w-xl text-left leading-relaxed">
                  {activeAlbum.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => setShowOrganizeAlbum(!showOrganizeAlbum)}
                    className="px-3 py-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-bold rounded text-xs transition-all flex items-center gap-1 cursor-pointer font-sans"
                  >
                    🛠️ Organizar Álbum
                  </button>
                  <button
                    id="btn-trigger-add-photo"
                    onClick={() => setShowAddPhoto(true)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <Plus size={13} />
                    Postar Foto
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Collapse Panel: Organize Album */}
          {isOwnProfile && showOrganizeAlbum && (
            <div className="p-4 bg-black/45 border-b border-dashed border-neutral-700 space-y-4 shadow-inner">
              <div className="flex justify-between items-center bg-neutral-900 p-2 border border-neutral-800 rounded">
                <span className="text-xs font-bold font-mono text-cyan-400">⚙️ PAINEL DE ORGANIZAÇÃO DO ÁLBUM SECRETO</span>
                <button
                  onClick={() => setShowOrganizeAlbum(false)}
                  className="text-[10px] text-neutral-400 hover:text-white uppercase font-bold cursor-pointer"
                >
                  [ fechar x ]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form onSubmit={handleUpdateAlbumInfo} className="space-y-3 bg-neutral-900/60 p-3 rounded border border-neutral-800">
                  <h3 className="text-xs font-bold text-white uppercase font-sans mb-1 pb-1 border-b border-neutral-800">Informações Básicas</h3>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">Nome do Álbum:</label>
                    <input
                      type="text"
                      value={editAlbumName}
                      onChange={(e) => setEditAlbumName(e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-neutral-700 rounded bg-neutral-900 text-white font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">Descrição:</label>
                    <textarea
                      value={editAlbumDesc}
                      onChange={(e) => setEditAlbumDesc(e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-neutral-700 rounded bg-neutral-900 text-white font-sans"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-0.5">Alterar Tema Visual:</label>
                    <select
                      value={editAlbumTheme}
                      onChange={(e) => setEditAlbumTheme(e.target.value as any)}
                      className="w-full text-xs px-2 py-1 border border-neutral-700 rounded bg-neutral-900 text-white font-mono cursor-pointer"
                    >
                      <option value="neon-hacker">Neon Hacker (Verde Terminal)</option>
                      <option value="emo-2008">Emo 2008 (Corações e Rosa)</option>
                      <option value="vhs">VHS (Timer, Estática)</option>
                      <option value="cyberpunk">Cyberpunk (Amarelo, Azul)</option>
                      <option value="glitter">Glitter (Estrelas, Purpurina)</option>
                      <option value="gotico">Gótico (Gótico Escarlate)</option>
                      <option value="polaroid">Polaroid (Cartão de foto clássico)</option>
                      <option value="old-camera">Old Camera (Rolo de filme)</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={handleDeleteAlbum}
                      className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-905 text-[10px] font-bold rounded cursor-pointer transition-colors"
                    >
                      ⚠️ Deletar Álbum Inteiro
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 bg-green-500 hover:bg-green-600 text-neutral-950 font-black rounded text-[10px] uppercase cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>

                {/* Quick Photos delete management board */}
                <div className="bg-neutral-900/40 p-3 rounded border border-neutral-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase font-sans mb-1 pb-1 border-b border-neutral-800">📸 Gerenciar & Excluir Imagens ({activeAlbum.photos.length})</h3>
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                      {activeAlbum.photos.map(p => (
                        <div key={p.id} className="relative aspect-square border border-neutral-700 rounded overflow-hidden group bg-black/50">
                          <img src={p.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(p.id)}
                            className="absolute inset-0 m-auto h-6 w-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md border border-red-500 scale-90 md:scale-100 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Remover foto do álbum"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] text-neutral-400 italic font-sans leading-relaxed">Passe o mouse por cima de cada miniatura no painel acima e clique no botão de lixeira para excluir instantaneamente as imagens chapa.</p>
                </div>
              </div>
            </div>
          )}

          {isVisitorMode && (
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-[10.5px] text-amber-550 font-sans flex items-center gap-1.5 font-bold">
              <Info size={13} className="text-amber-500 flex-shrink-0" />
              <span>Modo de visualização de visitante ativo. Você não possui privilégios de postagem.</span>
            </div>
          )}

          <div className="p-4 bg-transparent">
            {activeAlbum.photos.length === 0 ? (
              <div className="text-center py-20 italic flex flex-col items-center justify-center gap-2">
                <ImageIcon size={32} className="opacity-40 animate-pulse" />
                <span>Nenhuma imagem de recordação foi adicionada a este álbum seguro ainda chapa!</span>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowAddPhoto(true)}
                    className="mt-3 px-3 py-1 bg-white border text-indigo-700 font-bold rounded text-xs cursor-pointer hover:bg-neutral-55"
                  >
                    Postar Primeira Foto 📷
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activeAlbum.photos.map(photo => {
                  return (
                    <div
                      key={photo.id}
                      onClick={() => handleOpenPhoto(photo.id)}
                      className={`group rounded overflow-hidden p-2 pt-2 pb-5 text-center cursor-pointer hover:scale-[1.03] transition-all relative ${
                        activeAlbum.theme === 'polaroid' 
                          ? 'bg-white border border-neutral-300-400 p-2.5 shadow-md flex flex-col justify-between' 
                          : 'border border-neutral-200/20 bg-neutral-900/40 hover:border-[#d946ef]'
                      }`}
                    >
                      {/* Photo wrapper */}
                      <div className="aspect-square bg-black overflow-hidden relative rounded border border-neutral-200/10 mb-2">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Interactive watermark tags for gifs */}
                        {photo.gifUrl && (
                          <span className="absolute bottom-1 right-1 bg-pink-600 text-white font-mono text-[8px] font-bold px-1 rounded shadow-sm scale-90 border border-pink-400 uppercase tracking-widest">
                            GIF ATIVO
                          </span>
                        )}

                        {/* Song label badge preview */}
                        {photo.song && (
                          <span className="absolute top-1 left-1 bg-black/60 text-[8px] text-cyan-400 font-mono font-bold px-1.5 rounded-full border border-cyan-400/30">
                            🎵 {photo.song.split('-')[1]?.trim() || photo.song}
                          </span>
                        )}

                        {/* Highlight marker flag */}
                        {featuredPhotoId === photo.id && (
                          <div className="absolute top-1 right-1 bg-yellow-500 text-neutral-900 font-sans font-bold text-[8px] p-0.5 px-1.5 rounded shadow-sm border border-yellow-300 uppercase animate-pulse">
                            📌 MOMENTO
                          </div>
                        )}
                      </div>

                      {/* Info preview below polaroid label */}
                      <div className="text-left font-sans flex flex-col justify-between h-9">
                        <p className={`text-[10px] break-words truncate ... leading-snug w-full ${
                          activeAlbum.theme === 'polaroid' ? 'text-neutral-700 font-serif font-semibold text-center italic mt-1' : 'opacity-85'
                        }`}>
                          {photo.caption}
                        </p>
                        
                        <div className="flex justify-between items-center text-[8px] mt-1 border-t border-neutral-100/10 pt-1 text-neutral-400 tracking-wider font-mono">
                          <span className="flex items-center gap-0.5">
                            <Heart size={8} className="text-pink-500" /> {photo.likes}
                          </span>
                          <span>{photo.comments.length} recados</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ------------------ VIEW 3: SINGLE PHOTO DETAIL VIEW ------------------ */}
      {viewMode === 'photo' && activeAlbum && activePhoto && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border-2 rounded-lg shadow-2xl overflow-hidden text-left min-h-[460px] ${activeThemeStyles.container}`}
        >
          {activeThemeStyles.scanlines && (
            <div className="absolute inset-0 bg-[#000]/06 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] z-20" />
          )}

          {/* Title Header */}
          <div className={`px-4 py-2 border-b flex justify-between items-center ${activeThemeStyles.header}`}>
            <button
              onClick={handleBackToAlbum}
              className="px-2.5 py-1 text-xs font-bold rounded bg-neutral-100/10 hover:bg-neutral-100/25 flex items-center gap-1 transition-colors cursor-pointer text-current font-sans"
            >
              <ArrowLeft size={14} className="flex-shrink-0" />
              Voltar ao Álbum
            </button>
            <span className="text-[10px] font-mono tracking-wide opacity-80 uppercase">
              📂 {activeAlbum.name}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4">
            
            {/* Left side column: The glowing Themed Image card */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className={`relative p-3.5 rounded bg-black/40 border border-neutral-200/20 shadow-inner flex flex-col items-center justify-center ${
                activeAlbum.theme === 'polaroid' ? 'bg-white p-5 text-slate-800 border-neutral-300' : ''
              }`}>
                {/* VHS simulation labels */}
                {activeAlbum.theme === 'vhs' && (
                  <div className="absolute top-5 left-5 z-10 text-rose-500 font-mono text-[10px] bg-black/75 p-1 tracking-widest animate-pulse font-bold">
                    PLAY 0:12:44
                  </div>
                )}
                {activeAlbum.theme === 'neon-hacker' && (
                  <div className="absolute top-5 left-5 z-10 text-green-400 font-mono text-[9px] bg-black/80 px-1.5 border border-green-500 p-0.5">
                    CRT MODE // SECURE_VIEW
                  </div>
                )}

                {/* Picture element */}
                <div className="w-full relative max-h-[380px] overflow-hidden rounded bg-black/20 flex justify-center items-center">
                  <img
                    src={activePhoto.url}
                    alt={activePhoto.caption}
                    className="max-w-full max-h-[380px] object-contain mx-auto border border-neutral-100/10"
                    referrerPolicy="no-referrer"
                  />

                  {/* Highlight moment flag overlay */}
                  {featuredPhotoId === activePhoto.id && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-neutral-900 font-bold border-2 border-yellow-300 font-sans text-[9px] p-0.5 px-2 rounded uppercase shadow-md flex items-center gap-1">
                      <Star size={10} fill="#000" />
                      Foto do Momento
                    </div>
                  )}
                </div>

                {/* Nostalgic Polaroid styled writing */}
                <div className={`w-full mt-3 text-left ${activeAlbum.theme === 'polaroid' ? 'text-center' : ''}`}>
                  {showEditCaption ? (
                    <div className="flex flex-col gap-1.5 p-2 bg-neutral-950/40 border border-neutral-805/30 rounded text-left font-sans text-xs">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-pink-400">🖊️ Editar Legenda Antiga:</span>
                      <textarea
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        className="w-full text-xs p-1.5 rounded select-text bg-neutral-900 border border-neutral-700 text-white font-sans focus:outline-none focus:ring-1 focus:ring-pink-500"
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditCaption(false);
                            setEditedCaption(activePhoto.caption);
                          }}
                          className="px-2 py-0.5 text-[9px] bg-neutral-700 hover:bg-neutral-600 text-white rounded font-sans cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateCaption}
                          className="px-2 py-0.5 text-[9px] bg-pink-500 hover:bg-pink-650 text-white font-bold rounded font-sans cursor-pointer shadow-sm"
                        >
                          Salvar Legenda
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 text-left">
                      <p className={`text-xs select-all break-words italic leading-relaxed flex-1 ${
                        activeAlbum.theme === 'polaroid' ? 'font-serif text-sm font-semibold text-slate-700' : 'opacity-90 font-sans'
                      }`}>
                        “{activePhoto.caption}”
                      </p>
                      {isOwnProfile && (
                        <button
                          type="button"
                          onClick={() => setShowEditCaption(true)}
                          className="text-[9px] text-[#d946ef] hover:underline font-mono uppercase bg-neutral-950/40 px-1.5 py-0.5 rounded cursor-pointer self-start border border-dashed border-[#d946ef]/20"
                        >
                          [ Editar ]
                        </button>
                      )}
                    </div>
                  )}

                  {/* Added Interactive Nostalgic Interaction HUD */}
                  <div className="mt-2 text-left">
                    <SocialActions
                      itemId={activePhoto.id}
                      itemType="photo"
                      itemTitle={`Foto: "${activePhoto.caption}"`}
                      initialLikes={activePhoto.likes}
                      initialLikedByMe={activePhoto.likedByMe}
                      onLikeUpdate={(liked, count) => {
                        // Keep our centralized photo albums state fully updated
                        const updatedAlbums = albums.map(a => {
                          if (a.id === activeAlbumId) {
                            const updatedPhotos = a.photos.map(p => {
                              if (p.id === selectedPhotoId) {
                                return { ...p, likes: count, likedByMe: liked };
                              }
                              return p;
                            });
                            return { ...a, photos: updatedPhotos };
                          }
                          return a;
                        });
                        onUpdateAlbums(updatedAlbums);
                      }}
                      onShareToFeed={onShareToFeed}
                    />
                  </div>
                </div>
              </div>

              {/* Controls block: Likes, Pins, Delete */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-900/40 border border-neutral-250/20 rounded">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLikePhoto}
                    className={`p-1.5 px-3 rounded flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-transform duration-150 ${
                      activePhoto.likedByMe 
                        ? 'bg-rose-500/20 text-pink-500 border border-pink-500' 
                        : 'bg-neutral-800 text-slate-350 hover:bg-neutral-700 hover:scale-105 border border-transparent'
                    }`}
                  >
                    <Heart size={14} fill={activePhoto.likedByMe ? '#ec4899' : 'none'} className={`${activePhoto.likedByMe ? 'animate-bounce' : ''}`} />
                    <span>{activePhoto.likedByMe ? 'Curtiu Chapa!' : 'Curtir Foto'}</span>
                    <span className="font-mono text-[10px] opacity-80 ml-1">({activePhoto.likes})</span>
                  </button>

                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        onSetFeaturedPhoto(featuredPhotoId === activePhoto.id ? null : activePhoto.id);
                        playShutterSound();
                      }}
                      className={`p-1.5 px-3 rounded border text-xs font-bold cursor-pointer transition-colors ${
                        featuredPhotoId === activePhoto.id 
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 font-sans' 
                          : 'bg-neutral-800 border-transparent text-slate-350 hover:bg-neutral-700'
                      }`}
                    >
                      Set Foto do Momento 📌
                    </button>
                  )}
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => handleDeletePhoto(activePhoto.id)}
                    className="p-1 px-2.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 text-red-500 rounded text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Apagar
                  </button>
                )}
              </div>
            </div>

            {/* Right side column: Comments log panel and Music track player */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Optional Music of the Moment panel */}
              {activePhoto.song && (
                <div className="bg-gradient-to-r from-neutral-900 to-[#1e1b4b] p-3 rounded-lg border border-indigo-500/30 text-left select-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-indigo-500 text-white font-mono text-[7px] uppercase font-bold tracking-widest leading-none">CD TRAX 2008</div>
                  <div className="flex items-center gap-2.5">
                    {/* Retro spinning cd player icon */}
                    <div className={`p-1.5 bg-pink-500 text-white rounded-full ${isSongPlaying ? 'animate-spin' : ''}`}>
                      <Volume2 size={15} />
                    </div>
                    <div className="flex-1 min-w-0 font-sans">
                      <span className="text-[9px] uppercase font-bold text-pink-500 tracking-wider">Música de acompanhamento:</span>
                      <p className="text-xs font-bold text-cyan-400 truncate mt-0.5">
                        {activePhoto.song}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsSongPlaying(!isSongPlaying)}
                      className="p-1 px-2 rounded border border-neutral-700 text-slate-350 text-[10px] font-mono hover:bg-neutral-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {isSongPlaying ? <Pause size={10} /> : <Play size={10} />}
                      {isSongPlaying ? 'Mute' : 'Play'}
                    </button>
                  </div>

                  {/* Pulsing Visualizer simulated graphics */}
                  {isSongPlaying && (
                    <div className="flex justify-end gap-0.5 h-3 mt-2 pr-1 items-end overflow-hidden">
                      <span className="w-1 bg-[#22c55e] animate-[pulse_0.4s_infinite_alternate]" style={{ height: '10%' }} />
                      <span className="w-1 bg-[#22c55e] animate-[pulse_0.6s_infinite_alternate]" style={{ height: '70%' }} />
                      <span className="w-1 bg-cyan-400 animate-[pulse_0.5s_infinite_alternate]" style={{ height: '40%' }} />
                      <span className="w-1 bg-cyan-400 animate-[pulse_0.4s_infinite_alternate]" style={{ height: '85%' }} />
                      <span className="w-1 bg-pink-500 animate-[pulse_0.7s_infinite_alternate]" style={{ height: '20%' }} />
                      <span className="w-1 bg-pink-500 animate-[pulse_0.5s_infinite_alternate]" style={{ height: '60%' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Gifs selection popup banner helper */}
              {activePhoto.gifUrl && (
                <div className="p-2 border border-dashed border-[#d946ef]/40 bg-pink-500/5 rounded text-[10px] flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 bg-neutral-900 border border-[#d946ef]/60 rounded overflow-hidden">
                    <img src={activePhoto.gifUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <span className="font-mono text-pink-500 uppercase font-bold block">Gif da Nostalgia anexado:</span>
                    <p className="text-neutral-500 mt-0.5">Essa foto possui um gif dinâmico anexado que vibra em harmonia com as memórias digitais chapa!</p>
                  </div>
                </div>
              )}

              {/* Comments box */}
              <div className="bg-neutral-950/20 rounded border border-neutral-200/10 p-3 flex-1 flex flex-col justify-between max-h-[340px]">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2 text-left opacity-70 flex items-center justify-between">
                    <span>💬 Recados da Foto ({activePhoto.comments.length})</span>
                    <span className="text-[8px] font-mono font-semibold">ZERO-XSS ISOLATION</span>
                  </h4>

                  <div className="space-y-2 overflow-y-auto max-h-[190px] pr-1.5 custom-scrollbar text-left font-sans">
                    {activePhoto.comments.length === 0 ? (
                      <div className="text-center py-10 opacity-40 text-[11px] italic">
                        Não deixaram scraps na foto de hoje chapa. Escreva uma mensagem nostálgica abaixo!
                      </div>
                    ) : (
                      activePhoto.comments.map(c => (
                        <div key={c.id} className="p-2 bg-neutral-950/30 border border-neutral-100/5 rounded flex gap-2 items-start">
                          <img src={c.authorAvatar} alt={c.authorName} className="w-6 h-6 rounded-full object-cover mt-0.5 border border-neutral-200/20" />
                          <div className="flex-1 min-w-0 text-[10px]">
                            <div className="flex justify-between font-bold text-[#1d4ed8]">
                              <span className="truncate text-[10px] text-current font-bold">{c.authorName}</span>
                              <span className="text-[8.5px] text-neutral-400 font-mono font-normal flex-shrink-0">{c.date}</span>
                            </div>
                            <p className="mt-0.5 leading-snug break-all text-neutral-300">
                              {c.text}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Submitting Comments Form */}
                <form onSubmit={handlePostComment} className="mt-3 pt-2.5 border-t border-neutral-100/10 flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Deixe um scrap nesta foto chapa!"
                    className="flex-1 px-2.5 py-1 text-xs outline-none bg-white font-sans text-neutral-800 border border-neutral-300 rounded focus:ring-1 focus:ring-pink-400"
                    maxLength={150}
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#1d4ed8] text-white font-bold rounded text-xs hover:bg-[#1e40af] transition-colors cursor-pointer font-sans"
                  >
                    Enviar
                  </button>
                </form>
              </div>

            </div>
          </div>
        </motion.div>
      )}

      {/* -------------------- POPUP MODAL: CREATE ALBUM -------------------- */}
      {showCreateAlbum && (
        <div className="fixed inset-0 m-auto bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white border-2 border-indigo-400 rounded-lg shadow-2xl max-w-sm w-full overflow-hidden text-left flex flex-col relative font-sans text-xs">
            <div className="bg-[#dee7f4] px-3 py-1.5 border-b border-indigo-200 flex justify-between items-center bg-gradient-to-r from-[#dee7f4] to-[#adc3df]">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                📂 Criador de Álbum Digital
              </span>
              <button 
                onClick={() => setShowCreateAlbum(false)}
                className="text-neutral-500 hover:text-black font-bold text-xs cursor-pointer bg-white/50 px-1 rounded"
              >
                fechar x
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Nome do álbum:</label>
                <input
                  id="album-form-name"
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="EX: Rolês 2008 ou Cyber Café"
                  className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs select-text bg-white text-neutral-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Descrição:</label>
                <textarea
                  id="album-form-desc"
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="O que representa essas recordações..."
                  rows={2}
                  className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs select-text bg-white text-neutral-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Tema visual nostálgico:</label>
                <select
                  id="album-form-theme"
                  value={newAlbumTheme}
                  onChange={(e) => setNewAlbumTheme(e.target.value as any)}
                  className="w-full px-2 py-1.5 border border-neutral-300 rounded bg-white text-neutral-800 cursor-pointer"
                >
                  <option value="neon-hacker">Neon Hacker (Verde Terminal)</option>
                  <option value="emo-2008">Emo 2008 (Corações e Rosa)</option>
                  <option value="vhs">VHS (Timer, Estática, Magenta/Cyan)</option>
                  <option value="cyberpunk">Cyberpunk (Amarelo, Azul, Tech look)</option>
                  <option value="glitter">Glitter (Estrelas, Purpurina, Doce)</option>
                  <option value="gotico">Gótico (Vermelho Escarlate, Gótico)</option>
                  <option value="polaroid">Polaroid (Cartão de foto clássico branco)</option>
                  <option value="old-camera">Old Camera (Chapa de rolo de filme)</option>
                </select>
                <p className="text-[9px] text-neutral-400 mt-0.5 leading-snug">O tema desenha a moldura de cada foto do álbum dependendo do seu vibe!</p>
              </div>

              <div className="pt-2 border-t border-dashed mt-2 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCreateAlbum(false)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
                >
                  Compilar Álbum ✔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- POPUP MODAL: ADD PHOTO -------------------- */}
      {showAddPhoto && activeAlbum && (
        <div className="fixed inset-0 m-auto bg-black/75 z-40 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white border-2 border-indigo-400 rounded-lg shadow-2xl max-w-xl w-full overflow-hidden text-left flex flex-col relative font-sans text-xs">
            <div className="bg-[#dee7f4] px-3 py-1.5 border-b border-indigo-200 flex justify-between items-center bg-gradient-to-r from-[#dee7f4] to-[#adc3df]">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                📷 Postagem de Foto no álbum: <strong className="text-indigo-805 truncate text-[11px] font-bold">{activeAlbum.name}</strong>
              </span>
              <button 
                onClick={() => setShowAddPhoto(false)}
                className="text-neutral-500 hover:text-black font-bold text-xs cursor-pointer bg-white/50 px-1 rounded"
              >
                fechar x
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Endereço da imagem:</label>
                  <input
                    id="photo-form-url"
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Cole um link ou use uma sugestão retrô →"
                    className="w-full px-2 py-1.5 border border-indigo-300 rounded text-xs select-text bg-white text-neutral-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Legenda curta da foto:</label>
                  <input
                    id="photo-form-caption"
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="EX: Saudades dessa época de ouro chapa."
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs select-text bg-white text-neutral-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Música do momento (Opcional):</label>
                  <input
                    id="photo-form-song"
                    type="text"
                    value={newPhotoSong}
                    onChange={(e) => setNewPhotoSong(e.target.value)}
                    placeholder="Ex: Linkin Park - Numb"
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs select-text bg-white text-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Anexar Gif nostálgico (Opcional link):</label>
                  <input
                    id="photo-form-gif"
                    type="text"
                    value={newPhotoGif}
                    onChange={(e) => setNewPhotoGif(e.target.value)}
                    placeholder="Selecione das sugestões ou cole link gif..."
                    className="w-full px-2 py-1.5 border border-neutral-300 rounded text-xs select-text bg-white text-neutral-800 font-mono"
                  />
                </div>
              </div>

              {/* Suggestions Panel for superb UX */}
              <div className="bg-[#dee7f4]/40 p-3 rounded border border-[#adc3df] flex flex-col justify-between h-72">
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase block mb-1">🎁 Sugestões de Fotos Retrô:</span>
                    <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                      {RETRO_PRESETS.map((p, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setNewPhotoUrl(p.url)}
                          className="px-1.5 py-1 bg-white border border-neutral-300 hover:border-indigo-400 text-[9px] text-neutral-700 font-semibold truncate rounded text-left cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-pink-700 uppercase block mb-1">🎬 Sugestões Gifs Anos 2000:</span>
                    <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                      {GIF_PRESETS.map((p, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setNewPhotoGif(p.url)}
                          className="px-1.5 py-1 bg-white border border-neutral-300 hover:border-pink-400 text-[9px] text-neutral-700 font-semibold truncate rounded text-left cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-neutral-200/50 pt-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddPhoto(false)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                  >
                    Retroceder
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded cursor-pointer"
                  >
                    Publicar Foto analógica ✔
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
