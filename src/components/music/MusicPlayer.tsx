import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, SkipForward, SkipBack, Heart, Headphones, Pencil, Music, ExternalLink } from "lucide-react";
import { PREDEFINED_LIBRARY_TRACKS } from "../../data/musicLibrary";
import { playAudio, pauseAudio, stopAudio, seekAudio, getActiveAudio } from "../../utils/audioHelpers";
import { CdInteractive } from "./CdInteractive";
import { EqualizerVisualizer } from "./EqualizerVisualizer";
import { MusicConfigModal } from "./MusicConfigModal";
import { db, auth } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Profile } from "../../types";

interface MusicPlayerProps {
  profile: Profile;
  currentUserProfile: Profile | null;
  onSaveProfile: (updatedProfile: Partial<Profile>) => void;
  isOwner: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  profile,
  currentUserProfile,
  onSaveProfile,
  isOwner,
}) => {
  // Config Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Current track configured on the profile
  const configuredTrack = profile.listeningNow || null;
  const premiumStatus = profile.premiumStatus || "free";

  // Mock listeners count (static visual element as instructed)
  const mockListenersCount = 8;

  // Likes on the active music track
  const musicLikes = profile.lastPlayedMusic?.likesList || [];
  const currentUserId = auth.currentUser?.uid || "me";
  const hasLiked = musicLikes.includes(currentUserId);
  const likesCount = musicLikes.length;

  // Synchronize playback state with the global HTMLAudioElement singleton
  useEffect(() => {
    // Check if singleton is currently playing this track
    const active = getActiveAudio();
    if (active && configuredTrack && active.src === configuredTrack.url) {
      audioRef.current = active;
      setIsPlaying(!active.paused);
      setCurrentTime(active.currentTime);
      setDuration(active.duration || 0);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [configuredTrack]);

  // Handle Play
  const handlePlay = () => {
    if (!configuredTrack || !configuredTrack.url) {
      if (isOwner) {
        setIsConfigOpen(true);
      }
      return;
    }

    // Play via our audio singleton
    const audio = playAudio(
      configuredTrack.url,
      () => {
        setIsPlaying(true);
        // Set the "Ouvindo Agora" status for the current logged-in user in Firestore
        onSaveProfile({
          listeningNow: {
            ...configuredTrack,
            isPlaying: true,
            timestamp: Date.now(),
          },
        });
      },
      () => {
        // On Ended
        setIsPlaying(false);
        setCurrentTime(0);
        // Remove "Ouvindo Agora" status on ended
        onSaveProfile({
          listeningNow: null,
          lastPlayedMusic: {
            title: configuredTrack.title,
            artist: configuredTrack.artist,
            source: configuredTrack.source,
            url: configuredTrack.url,
            timestamp: Date.now(),
            likesList: musicLikes,
          },
        });
      },
      (curr, dur) => {
        setCurrentTime(curr);
        setDuration(dur);
      }
    );

    audioRef.current = audio;
  };

  // Handle Pause
  const handlePause = () => {
    pauseAudio();
    setIsPlaying(false);

    // Remove active status on pause (Ouvindo Agora removal)
    onSaveProfile({
      listeningNow: null,
    });
  };

  // Handle Stop
  const handleStop = () => {
    stopAudio();
    setIsPlaying(false);
    setCurrentTime(0);

    // Remove active status on stop
    onSaveProfile({
      listeningNow: null,
    });
  };

  // Handle Seek
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    seekAudio(val);
  };

  // Handle Like
  const handleToggleLike = async () => {
    const targetProfileId = profile.id;
    const currentUserId = auth.currentUser?.uid || "me";

    // Build the updated likes list
    let updatedLikes = [...musicLikes];
    if (hasLiked) {
      updatedLikes = updatedLikes.filter((uid) => uid !== currentUserId);
    } else {
      updatedLikes.push(currentUserId);
    }

    // Update the visited profile's database document
    const updatedProfile = {
      ...profile,
      lastPlayedMusic: {
        ...(profile.lastPlayedMusic || {}),
        likesList: updatedLikes,
      },
    };

    try {
      await setDoc(doc(db, "profiles", targetProfileId), updatedProfile);
    } catch (err) {
      console.error("Failed to update music likes:", err);
    }
  };

  // Handle Previous Track (Library only)
  const handlePreviousTrack = () => {
    if (!configuredTrack || configuredTrack.source !== "library") return;
    const tracks = PREDEFINED_LIBRARY_TRACKS;
    const currentIndex = tracks.findIndex((t) => t.url === configuredTrack.url);
    if (currentIndex > 0) {
      const prevTrack = tracks[currentIndex - 1];
      saveSelectedTrack({ ...prevTrack, source: "library" });
    }
  };

  // Handle Next Track (Library only)
  const handleNextTrack = () => {
    if (!configuredTrack || configuredTrack.source !== "library") return;
    const tracks = PREDEFINED_LIBRARY_TRACKS;
    const currentIndex = tracks.findIndex((t) => t.url === configuredTrack.url);
    if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
      const nextTrack = tracks[currentIndex + 1];
      saveSelectedTrack({ ...nextTrack, source: "library" });
    }
  };

  // Save selected track from controls/config
  const saveSelectedTrack = async (trackData: {
    title: string;
    artist: string;
    source: string;
    url: string;
    coverUrl?: string;
    premiumStatus?: "free" | "pro";
  }) => {
    const payload: Partial<Profile> = {
      listeningNow: {
        title: trackData.title,
        artist: trackData.artist,
        source: trackData.source,
        url: trackData.url,
        coverUrl: trackData.coverUrl || "",
        isPlaying: false,
        timestamp: Date.now(),
      },
    };

    if (trackData.premiumStatus) {
      payload.premiumStatus = trackData.premiumStatus;
    }

    onSaveProfile(payload);
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Get active source label
  const getSourceLabel = (src: string) => {
    switch (src) {
      case "library":
        return "My Music";
      case "spotify":
        return "Spotify";
      case "youtube":
        return "YouTube";
      case "soundcloud":
        return "SoundCloud";
      case "upload":
        return "Upload";
      default:
        return "My Music";
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[2rem] bg-[#546473] border-4 border-[#3e4a57] p-5 md:p-6 text-left shadow-2xl relative select-none transition-all">
      
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        {/* Left: Musical Note & Title */}
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-[#ff00ff] fill-[#ff00ff] drop-shadow-[0_0_8px_#ff00ff]" />
          <span className="text-white font-mono tracking-wider font-extrabold text-sm md:text-base">
            Musica Oficial
          </span>
        </div>

        {/* Center: Live indicator */}
        <div className="flex items-center">
          <span className="border-2 border-[#00ffcc] bg-[#00ffcc]/10 text-[#00ffcc] text-[10px] md:text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full bg-[#00ffcc] ${isPlaying ? "animate-pulse" : ""}`} />
            OUVINDO AGORA
          </span>
        </div>

        {/* Right: Pencil edit button */}
        <div>
          <button
            onClick={() => {
              if (isOwner) setIsConfigOpen(true);
            }}
            className="text-white hover:text-[#00ffff] hover:scale-110 transition-transform p-1 cursor-pointer bg-transparent border-none outline-none"
            title={isOwner ? "Configurar Música" : "Apenas o dono pode configurar"}
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Player Body - CD and Info side-by-side */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        
        {/* Left: CdInteractive */}
        <div className="flex-shrink-0">
          <CdInteractive
            isPlaying={isPlaying}
            coverUrl={configuredTrack?.coverUrl}
            theme={profile.theme}
          />
        </div>

        {/* Right: Metadata and Equalizer */}
        <div className="flex-1 w-full flex flex-col justify-between min-w-0">
          
          {/* Metadata Text */}
          <div className="mb-3">
            {configuredTrack ? (
              <>
                <h3 className="text-white font-black italic tracking-wide text-[18px] leading-[25px] uppercase font-sans truncate select-all">
                  {configuredTrack.artist.toUpperCase()} - {configuredTrack.title.toUpperCase()}
                </h3>
                <p className="text-[#00ffcc] font-extrabold text-[11px] leading-[18px] uppercase tracking-wider mt-1">
                  {profile.name || "Paulo"} - {configuredTrack.source.toUpperCase()}
                </p>
                <p className="text-neutral-300/80 text-xs mt-0.5 font-mono">
                  Definida por @{profile.username || "membro"}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-white font-black italic tracking-wide text-[18px] leading-[25px] uppercase font-sans truncate">
                  NENHUMA MÚSICA DEFINIDA
                </h3>
                <p className="text-[#00ffcc] font-extrabold text-[11px] leading-[18px] uppercase tracking-wider mt-1">
                  OFFLINE
                </p>
                <p className="text-neutral-300/80 text-xs mt-0.5 font-mono">
                  Dono do perfil não configurou música
                </p>
              </>
            )}
          </div>

          {/* Equalizer Waveform Box */}
          <div className="w-full">
            <EqualizerVisualizer
              isPlaying={isPlaying}
              audioRef={audioRef}
              theme={profile.theme}
            />
          </div>

        </div>

      </div>

      {/* Progress slider and Timers */}
      <div className="mt-5">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            disabled={!configuredTrack || ["spotify", "youtube", "soundcloud"].includes(configuredTrack.source)}
            className="w-full h-1 bg-[#3a4756] accent-[#00f0ff] rounded-lg cursor-pointer disabled:opacity-40"
            style={{
              background: `linear-gradient(to right, #00f0ff ${duration ? (currentTime / duration) * 100 : 0}%, #3a4756 ${duration ? (currentTime / duration) * 100 : 0}%)`
            }}
          />
        </div>
        
        {/* Time display aligned directly beneath the slider */}
        <div className="flex justify-between items-center mt-1 text-xs text-neutral-300 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {/* Previous Button */}
        <button
          onClick={handlePreviousTrack}
          disabled={!configuredTrack || configuredTrack.source !== "library"}
          className="w-10 h-10 rounded-full bg-[#3e4d5e] hover:bg-[#4d5d70] border border-[#1e293b]/20 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          title="Anterior"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        {/* Play/Pause Main Button (Big hot-pink circle) */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="w-14 h-14 rounded-full bg-[#ff00ff] hover:bg-[#ff33ff] shadow-[0_0_15px_rgba(255,0,255,0.6)] flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all outline-none border-none"
          title={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          disabled={!isPlaying}
          className="w-10 h-10 rounded-full bg-[#3e4d5e] hover:bg-[#4d5d70] border border-[#1e293b]/20 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          title="Parar"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNextTrack}
          disabled={!configuredTrack || configuredTrack.source !== "library"}
          className="w-10 h-10 rounded-full bg-[#3e4d5e] hover:bg-[#4d5d70] border border-[#1e293b]/20 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          title="Próxima"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Footer Details - Source, Likes and Listeners */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/10 text-xs text-neutral-300">
        
        {/* Left: Source tag */}
        <div className="font-mono">
          Origem: <span className="text-[#00ffff] font-extrabold">{getSourceLabel(configuredTrack?.source || "").toUpperCase()}</span>
        </div>

        {/* Right: Likes (Heart) and Active listeners (Headphones) */}
        <div className="flex items-center gap-3">
          {/* Like Heart */}
          <button
            onClick={handleToggleLike}
            disabled={!configuredTrack}
            className="flex items-center gap-1.5 bg-[#3e4d5e]/50 hover:bg-[#4d5d70]/50 px-3.5 py-1.5 rounded-full border border-pink-500/30 text-white cursor-pointer disabled:opacity-40 transition-all select-none"
          >
            <Heart className={`w-4 h-4 text-[#ff00ff] ${hasLiked ? "fill-current" : ""}`} />
            <span className="font-bold">{likesCount}</span>
          </button>

          {/* Headphones badge */}
          <div className="flex items-center gap-1.5 bg-[#3e4d5e]/50 px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-white select-none">
            <Headphones className="w-4 h-4 text-[#00ffaa]" />
            <span className="font-bold">{mockListenersCount}</span>
          </div>
        </div>

      </div>

      {/* Music Config Modal */}
      <MusicConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentTrack={configuredTrack}
        premiumStatus={premiumStatus}
        onSave={saveSelectedTrack}
      />

    </div>
  );
};

