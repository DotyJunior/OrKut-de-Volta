import React, { useState, useEffect } from "react";
import { PREDEFINED_LIBRARY_TRACKS, MUSIC_CATEGORIES, LibraryTrack } from "../../data/musicLibrary";
import { db, auth, storage, ref, uploadBytes, getDownloadURL } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Search, Music, Upload, Link, Check, AlertTriangle, Disc, Heart, Shield, HelpCircle, X } from "lucide-react";
import { MusicCoverTab } from "./MusicCoverTab";

interface MusicConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: {
    title: string;
    artist: string;
    source: string;
    url: string;
    coverUrl?: string;
  } | null;
  premiumStatus: "free" | "pro";
  onSave: (trackData: {
    title: string;
    artist: string;
    source: string;
    url: string;
    coverUrl?: string;
    premiumStatus: "free" | "pro";
  }) => Promise<void>;
  coverType: "library" | "custom";
  coverId: string;
  coverUrl: string;
  onCoverChange: (type: "library" | "custom", id: string, url: string) => void;
  onSaveCover: () => void;
}

export const MusicConfigModal: React.FC<MusicConfigModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  premiumStatus,
  onSave,
  coverType,
  coverId,
  coverUrl,
  onCoverChange,
  onSaveCover,
}) => {
  if (!isOpen) return null;

  // Active Tab: 'library' | 'external' | 'upload' | 'cover'
  const [activeTab, setActiveTab] = useState<"library" | "external" | "upload" | "cover">("library");
  
  // Premium Plan Selection
  const [plan, setPlan] = useState<"free" | "pro">(premiumStatus);

  // Library State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTrack, setSelectedTrack] = useState<LibraryTrack | null>(null);

  // External Link State
  const [extSource, setExtSource] = useState<"spotify" | "youtube" | "soundcloud">("spotify");
  const [extUrl, setExtUrl] = useState("");
  const [extTitle, setExtTitle] = useState("");
  const [extArtist, setExtArtist] = useState("");
  const [extCoverUrl, setExtCoverUrl] = useState("");
  const [extError, setExtError] = useState("");

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [storageUsed, setStorageUsed] = useState(12.5); // Mocked standard storage used in MB
  const storageLimit = 50.0; // 50MB storage limit

  // Initialize form with existing values if any
  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.source === "library") {
        const found = PREDEFINED_LIBRARY_TRACKS.find(t => t.url === currentTrack.url);
        if (found) {
          setSelectedTrack(found);
        }
      } else if (["spotify", "youtube", "soundcloud"].includes(currentTrack.source)) {
        setActiveTab("external");
        setExtSource(currentTrack.source as any);
        setExtUrl(currentTrack.url);
        setExtTitle(currentTrack.title);
        setExtArtist(currentTrack.artist);
        setExtCoverUrl(currentTrack.coverUrl || "");
      } else if (currentTrack.source === "upload") {
        setActiveTab("upload");
        setUploadTitle(currentTrack.title);
        setUploadArtist(currentTrack.artist);
      }
    }
  }, [currentTrack]);

  // Load actual storage stats from Firestore if exists
  useEffect(() => {
    const fetchStorageStats = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const userDoc = await getDoc(doc(db, "profiles", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.uploadedMusicSize) {
            setStorageUsed(data.uploadedMusicSize);
          }
        }
      } catch (e) {
        console.warn("Could not retrieve user storage stats:", e);
      }
    };
    fetchStorageStats();
  }, [isOpen]);

  const handleSelectPredefined = (track: LibraryTrack) => {
    setSelectedTrack(track);
  };

  const validateExternalLink = (): boolean => {
    setExtError("");
    if (!extTitle.trim() || !extArtist.trim()) {
      setExtError("Título e Artista são obrigatórios.");
      return false;
    }
    if (!extUrl.trim()) {
      setExtError("O link da plataforma é obrigatório.");
      return false;
    }

    const lowerUrl = extUrl.toLowerCase();
    if (extSource === "spotify" && !lowerUrl.includes("spotify.com")) {
      setExtError("Por favor, insira um link válido do Spotify.");
      return false;
    }
    if (extSource === "youtube" && !(lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be"))) {
      setExtError("Por favor, insira um link válido do YouTube.");
      return false;
    }
    if (extSource === "soundcloud" && !lowerUrl.includes("soundcloud.com")) {
      setExtError("Por favor, insira um link válido do SoundCloud.");
      return false;
    }

    return true;
  };

  const handleSaveExternal = async () => {
    if (!validateExternalLink()) return;

    try {
      setUploadProgress(true);
      await onSave({
        title: extTitle.trim(),
        artist: extArtist.trim(),
        source: extSource,
        url: extUrl.trim(),
        coverUrl: extCoverUrl.trim() || undefined,
        premiumStatus: plan,
      });
      onClose();
    } catch (e: any) {
      setExtError(e.message || "Erro ao salvar música.");
    } finally {
      setUploadProgress(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileSizeMB = file.size / (1024 * 1024);

      // Rule: 10-15MB per file limit
      if (fileSizeMB > 15) {
        setUploadError("Limite excedido: Músicas por upload devem ter no máximo 15 MB.");
        return;
      }

      // Rule: Total 50MB storage check
      if (storageUsed + fileSizeMB > storageLimit) {
        setUploadError("Limite excedido: Você excederá os 50 MB totais do plano PRO.");
        return;
      }

      setUploadFile(file);
      // Auto-populate title/artist if name matches format "Artist - Title"
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      if (nameWithoutExt.includes(" - ")) {
        const parts = nameWithoutExt.split(" - ");
        setUploadArtist(parts[0]);
        setUploadTitle(parts[1]);
      } else {
        setUploadTitle(nameWithoutExt);
        setUploadArtist(auth.currentUser?.displayName || "Meu Computador");
      }
    }
  };

  const handleSaveUpload = async () => {
    setUploadError("");
    if (plan !== "pro") {
      setUploadError("O envio de arquivos está disponível apenas no plano PRO.");
      return;
    }

    if (!uploadFile) {
      setUploadError("Selecione um arquivo MP3 para enviar.");
      return;
    }

    if (!uploadTitle.trim() || !uploadArtist.trim()) {
      setUploadError("Por favor, preencha o título e artista.");
      return;
    }

    try {
      setUploadProgress(true);
      const uid = auth.currentUser?.uid || "guest";
      const fileExt = uploadFile.name.split(".").pop();
      const storagePath = `music_uploads/${uid}/${Date.now()}.${fileExt}`;
      const fileRef = ref(storage, storagePath);

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(fileRef, uploadFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      const fileSizeMB = uploadFile.size / (1024 * 1024);
      const newStorageUsed = Number((storageUsed + fileSizeMB).toFixed(2));

      // Update total storage count in Firestore for profile
      try {
        const profileDocRef = doc(db, "profiles", uid);
        await updateDoc(profileDocRef, {
          uploadedMusicSize: newStorageUsed,
        });
      } catch (firestoreErr) {
        console.warn("Could not sync storage count to profiles doc:", firestoreErr);
      }

      setStorageUsed(newStorageUsed);

      await onSave({
        title: uploadTitle.trim(),
        artist: uploadArtist.trim(),
        source: "upload",
        url: downloadUrl,
        premiumStatus: plan,
      });

      onClose();
    } catch (e: any) {
      console.error(e);
      setUploadError(e.message || "Falha ao fazer upload da música.");
    } finally {
      setUploadProgress(false);
    }
  };

  const handleSaveLibrary = async () => {
    if (!selectedTrack) {
      alert("Por favor, selecione uma música!");
      return;
    }

    try {
      setUploadProgress(true);
      await onSave({
        title: selectedTrack.title,
        artist: selectedTrack.artist,
        source: "library",
        url: selectedTrack.url,
        coverUrl: selectedTrack.coverUrl,
        premiumStatus: plan,
      });
      onClose();
    } catch (e: any) {
      alert("Erro ao salvar música: " + e.message);
    } finally {
      setUploadProgress(false);
    }
  };

  // Filter Predefined Library
  const filteredTracks = PREDEFINED_LIBRARY_TRACKS.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || track.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-neutral-950/80 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in select-none">
      <div className="bg-[#f0f5fa] border-2 border-[#1d4ed8] shadow-[0_0_20px_rgba(29,78,216,0.3)] w-full max-w-2xl rounded overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] text-white px-4 py-2 flex justify-between items-center select-none border-b border-[#1d4ed8]">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Disc className="w-4 h-4 animate-spin-slow" /> Configuração do Player de Música
          </span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded p-1 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Upgrade Banner / Feature */}
        <div className="bg-[#eff6ff] border-b border-[#bfdbfe] px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${plan === "pro" ? "text-purple-600" : "text-blue-500"}`} />
            <div>
              <span className="text-xs font-bold text-neutral-800">
                Plano Selecionado:{" "}
                <span className={`uppercase font-black ${plan === "pro" ? "text-purple-600 animate-pulse" : "text-blue-500"}`}>
                  {plan}
                </span>
              </span>
              <p className="text-[10px] text-neutral-500">
                {plan === "free"
                  ? "Suporta músicas da Biblioteca, Spotify, YouTube e SoundCloud."
                  : "Desbloqueia uploads de MP3 (até 15MB/arquivo, 50MB total)."}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 bg-white p-1 border border-neutral-250 rounded shadow-xs w-full sm:w-auto">
            <button
              onClick={() => {
                setPlan("free");
                if (activeTab === "upload") setActiveTab("library");
              }}
              className={`flex-1 sm:flex-none px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-all ${
                plan === "free"
                  ? "bg-[#1d4ed8] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              FREE
            </button>
            <button
              onClick={() => setPlan("pro")}
              className={`flex-1 sm:flex-none px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-all flex items-center justify-center gap-1 ${
                plan === "pro"
                  ? "bg-purple-700 text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              ⭐ PRO
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-neutral-250 bg-[#e1eaf2] overflow-x-auto">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex-1 min-w-[110px] py-2 text-xs font-bold transition-all border-r border-neutral-250 flex items-center justify-center gap-1.5 ${
              activeTab === "library"
                ? "bg-white text-[#1d4ed8] border-b-2 border-b-[#1d4ed8]"
                : "text-neutral-600 hover:bg-white/40"
            }`}
          >
            <Disc className="w-3.5 h-3.5" /> Biblioteca Retro
          </button>
          <button
            onClick={() => setActiveTab("external")}
            className={`flex-1 min-w-[150px] py-2 text-xs font-bold transition-all border-r border-neutral-250 flex items-center justify-center gap-1.5 ${
              activeTab === "external"
                ? "bg-white text-[#1d4ed8] border-b-2 border-b-[#1d4ed8]"
                : "text-neutral-600 hover:bg-white/40"
            }`}
          >
            <Link className="w-3.5 h-3.5" /> Links Externos (Metadata)
          </button>
          <button
            onClick={() => {
              if (plan !== "pro") {
                alert("O upload de arquivos está disponível apenas no plano PRO. Ative o plano PRO acima para testar esta funcionalidade!");
                return;
              }
              setActiveTab("upload");
            }}
            className={`flex-1 min-w-[100px] py-2 text-xs font-bold transition-all border-r border-neutral-250 flex items-center justify-center gap-1.5 ${
              plan !== "pro" ? "opacity-50 cursor-not-allowed" : ""
            } ${
              activeTab === "upload"
                ? "bg-white text-purple-700 border-b-2 border-b-purple-700"
                : "text-neutral-600 hover:bg-white/40"
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Enviar MP3
          </button>
          <button
            onClick={() => setActiveTab("cover")}
            className={`flex-1 min-w-[100px] py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "cover"
                ? "bg-white text-pink-600 border-b-2 border-b-pink-600"
                : "text-neutral-600 hover:bg-white/40"
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-pink-500 animate-spin-slow" /> Capa do CD
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className={`p-4 flex-1 overflow-y-auto max-h-[400px] transition-colors duration-300 ${activeTab === "cover" ? "bg-[#11111c]" : ""}`}>
          
          {/* 1. LIBRARY TAB */}
          {activeTab === "library" && (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar na Biblioteca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] bg-white"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs px-2 py-1.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] bg-white min-w-[150px]"
                >
                  <option value="all">Todas as Categorias</option>
                  {MUSIC_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Predefined Track Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {filteredTracks.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-xs text-neutral-500 italic">
                    Nenhuma música encontrada chapa.
                  </div>
                ) : (
                  filteredTracks.map((track) => {
                    const isSelected = selectedTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => handleSelectPredefined(track)}
                        className={`p-2 rounded border cursor-pointer flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? "bg-blue-50 border-[#1d4ed8] shadow-xs"
                            : "bg-white border-neutral-250 hover:border-neutral-350"
                        }`}
                      >
                        <div className="w-10 h-10 rounded overflow-hidden bg-neutral-200 relative flex-shrink-0">
                          {track.coverUrl ? (
                            <img
                              src={track.coverUrl}
                              alt="Cover"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white font-bold text-xs">
                              💿
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h5 className="text-xs font-bold text-neutral-800 truncate leading-snug">
                            {track.title}
                          </h5>
                          <p className="text-[10px] text-neutral-500 truncate leading-none">
                            {track.artist}
                          </p>
                          <span className="inline-block mt-1 text-[9px] font-semibold uppercase text-[#1d4ed8] bg-blue-100/50 px-1.5 rounded">
                            {MUSIC_CATEGORIES.find((c) => c.id === track.category)?.name.split(" ")[0]}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="bg-[#1d4ed8] text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Library Action */}
              <div className="pt-2 border-t border-neutral-250 flex justify-end">
                <button
                  onClick={handleSaveLibrary}
                  disabled={uploadProgress || !selectedTrack}
                  className="px-5 py-2 bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold text-xs rounded transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {uploadProgress ? "Processando..." : "Definir Música de Perfil"}
                </button>
              </div>
            </div>
          )}

          {/* 2. EXTERNAL LINK TAB */}
          {activeTab === "external" && (
            <div className="space-y-3.5 text-left">
              <div className="bg-amber-50 border border-amber-250 rounded p-2.5 flex items-start gap-2 text-[11px] text-amber-800 select-none">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <p>
                  <strong>Importante:</strong> Links do Spotify, YouTube Music ou SoundCloud serão exibidos como metadados/links no seu perfil. Por políticas de segurança destas plataformas, a reprodução incorporada pode ser redirecionada para a plataforma oficial.
                </p>
              </div>

              {/* Source Select */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Plataforma Origem:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["spotify", "youtube", "soundcloud"] as const).map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setExtSource(src)}
                      className={`py-1.5 rounded text-xs font-bold border capitalize transition-all cursor-pointer text-center ${
                        extSource === src
                          ? "bg-green-50 border-green-500 text-green-700 font-extrabold"
                          : "bg-white border-neutral-250 hover:bg-neutral-50 text-neutral-600"
                      }`}
                    >
                      {src === "youtube" ? "YouTube Music" : src}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  Link Oficial da Música:
                </label>
                <input
                  type="url"
                  placeholder={`Cole o link do ${extSource === "youtube" ? "YouTube" : extSource} aqui...`}
                  value={extUrl}
                  onChange={(e) => setExtUrl(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] bg-white font-sans"
                />
              </div>

              {/* Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                    Nome da Música:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sensorium"
                    value={extTitle}
                    onChange={(e) => setExtTitle(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                    Artista / Banda:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Epica"
                    value={extArtist}
                    onChange={(e) => setExtArtist(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] bg-white"
                  />
                </div>
              </div>

              {/* Optional Cover Art */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                  URL da Capa da Música (Opcional):
                </label>
                <input
                  type="url"
                  placeholder="Link de imagem para a capa (Unsplash, Giphy, etc)..."
                  value={extCoverUrl}
                  onChange={(e) => setExtCoverUrl(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] bg-white"
                />
              </div>

              {extError && (
                <p className="text-red-600 text-[11px] font-bold select-none">
                  ⚠️ {extError}
                </p>
              )}

              {/* Save */}
              <div className="pt-2 border-t border-neutral-250 flex justify-end">
                <button
                  onClick={handleSaveExternal}
                  disabled={uploadProgress}
                  className="px-5 py-2 bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold text-xs rounded transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {uploadProgress ? "Salvando..." : "Definir Música do Link"}
                </button>
              </div>
            </div>
          )}

          {/* 3. ENVIAR MP3 TAB (PRO) */}
          {activeTab === "upload" && (
            <div className="space-y-3.5 text-left">
              {/* Storage Quota Bar */}
              <div className="bg-white p-3 border border-neutral-250 rounded shadow-xs">
                <div className="flex justify-between items-center text-[10.5px] font-bold text-neutral-600 mb-1 select-none">
                  <span>Armazenamento Total de Música PRO</span>
                  <span className="font-mono text-purple-700">
                    {storageUsed.toFixed(1)} MB / {storageLimit} MB ({Math.round((storageUsed / storageLimit) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-500 rounded-full"
                    style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
                  />
                </div>
                <p className="text-[9.5px] text-neutral-500 mt-1 select-none">
                  Cada upload está limitado a 10-15 MB por arquivo, com armazenamento de até 50 MB totais.
                </p>
              </div>

              {/* Drag and Drop Upload Area */}
              <div className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/20 rounded p-5 text-center transition-all relative">
                <input
                  type="file"
                  accept="audio/mp3,audio/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-bounce-slow" />
                <span className="text-xs font-bold text-neutral-800 block">
                  {uploadFile ? uploadFile.name : "Arraste seu arquivo MP3 ou clique para selecionar"}
                </span>
                <span className="text-[10px] text-neutral-500 mt-1 block select-none">
                  Formatos aceitos: .mp3, .wav, .m4a (Máximo de 15 MB)
                </span>
              </div>

              {/* Title & Artist fields */}
              {uploadFile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                      Título da Música:
                    </label>
                    <input
                      type="text"
                      placeholder="Nome da faixa"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 uppercase mb-1">
                      Artista / Banda:
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do artista"
                      value={uploadArtist}
                      onChange={(e) => setUploadArtist(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white font-sans"
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="text-red-600 text-[11px] font-bold select-none">
                  ⚠️ {uploadError}
                </p>
              )}

              {/* Upload action */}
              <div className="pt-2 border-t border-neutral-250 flex justify-end">
                <button
                  onClick={handleSaveUpload}
                  disabled={uploadProgress || !uploadFile}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1"
                >
                  {uploadProgress ? (
                    <>
                      <Disc className="w-3.5 h-3.5 animate-spin" /> Fazendo Upload para o Storage...
                    </>
                  ) : (
                    "Enviar Mídia e Definir"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 4. CAPA DO CD TAB */}
          {activeTab === "cover" && (
            <div className="space-y-4 p-4 rounded-xl" style={{ backgroundColor: "#11111c" }}>
              <MusicCoverTab
                premiumStatus={premiumStatus}
                coverType={coverType}
                coverId={coverId}
                coverUrl={coverUrl}
                onChangeCover={onCoverChange}
                songTitle={currentTrack?.title || "Sensorium (Gothic Symphony)"}
                artistName={currentTrack?.artist || "EPICA"}
              />
              
              {/* Bottom footer button bar specifically for CD Cover config tab as requested */}
              <div className="pt-3 border-t border-blue-950/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-neutral-900/10 hover:bg-neutral-100 border border-neutral-300 text-neutral-600 hover:text-neutral-800 font-extrabold text-xs uppercase tracking-wider rounded cursor-pointer transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveCover();
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-[#d946ef] hover:from-pink-600 hover:to-fuchsia-600 text-white font-extrabold text-xs uppercase tracking-wider rounded cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.35)] hover:shadow-[0_0_20px_rgba(236,72,153,0.55)] transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3px]" /> Salvar Capa
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
