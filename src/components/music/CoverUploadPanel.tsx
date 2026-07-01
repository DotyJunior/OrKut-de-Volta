import React, { useRef, useState } from "react";
import { Upload, Lock, Loader2 } from "lucide-react";
import { auth, storage, ref, uploadBytes, getDownloadURL } from "../../firebase";

interface CoverUploadPanelProps {
  premiumStatus: "free" | "pro";
  coverUrl?: string;
  onUploadStart?: () => void;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (err: string) => void;
}

export const CoverUploadPanel: React.FC<CoverUploadPanelProps> = ({
  premiumStatus,
  coverUrl = "",
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localUploading, setLocalUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (premiumStatus !== "pro") {
      alert("O upload de capa personalizada é um recurso exclusivo para assinantes PRO!");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Formato inválido. Por favor, envie uma imagem JPG, PNG ou WEBP.");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("A imagem ultrapassa o limite de 2MB.");
      return;
    }

    try {
      setLocalUploading(true);
      if (onUploadStart) onUploadStart();

      const uid = auth.currentUser?.uid || "guest";
      const fileExt = file.name.split(".").pop() || "png";
      const storagePath = `music_covers/${uid}/${Date.now()}.${fileExt}`;
      const fileRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      if (onUploadSuccess) {
        onUploadSuccess(downloadUrl);
      }
    } catch (error: any) {
      console.error("Error uploading cover:", error);
      alert("Falha ao enviar imagem. Tente novamente.");
      if (onUploadError) onUploadError(error.message || "Upload failed");
    } finally {
      setLocalUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (premiumStatus !== "pro") return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (premiumStatus !== "pro") return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    if (premiumStatus !== "pro") {
      alert("O upload de capa personalizada é um recurso exclusivo para assinantes PRO!");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="border border-blue-950 rounded-xl p-5 flex flex-col justify-between h-[340px] shadow-inner text-left select-none relative overflow-hidden"
      style={{ backgroundColor: "#111220" }}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      
      {/* Corner indicators for futuristic UI consistency */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-500/30 rounded-tl-xs pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-500/30 rounded-tr-xs pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-500/30 rounded-bl-xs pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-500/30 rounded-br-xs pointer-events-none" />

      {/* Header */}
      <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">
        UPLOAD DE CAPA
      </span>

      {/* Hidden input file - Fallback for non-PRO alerting */}
      {premiumStatus !== "pro" && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
      )}

      {/* Upload Drag Box */}
      <div 
        onClick={premiumStatus !== "pro" ? onButtonClick : undefined}
        className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 text-center my-3 relative group transition-all duration-300 cursor-pointer ${
          dragActive 
            ? "border-pink-500 bg-pink-500/10" 
            : "border-pink-500/20 bg-pink-500/[0.02] hover:border-pink-500/40"
        }`}
      >
        {premiumStatus === "pro" && !localUploading && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept="image/jpeg,image/png,image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        )}
        {localUploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-2" />
            <span className="text-xs font-bold text-white/90">Enviando imagem...</span>
          </div>
        ) : (
          <>
            {/* Glowing cloud icon as seen in screenshot */}
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.1)]">
              <Upload className="w-6 h-6" />
            </div>

            <span className="text-xs font-black text-white/90">
              Arraste sua imagem aqui
            </span>
            <span className="text-[10px] text-neutral-400 mt-1">
              ou clique para selecionar
            </span>

            {/* Requirements */}
            <div className="mt-4 space-y-0.5">
              <p className="text-[9px] text-neutral-500 font-bold">
                Formatos suportados: JPG, PNG, WEBP
              </p>
              <p className="text-[9px] text-neutral-500 font-bold">
                Tamanho máximo: 2MB
              </p>
            </div>

            {/* Input file button - pointer-events-none so click passes through to overlaying native input */}
            <button
              type="button"
              className="mt-4 px-5 py-1.5 bg-gradient-to-r from-purple-950/40 to-pink-950/40 border border-pink-500/40 hover:border-pink-500 text-pink-300 text-[10px] font-extrabold uppercase rounded shadow-[0_0_10px_rgba(236,72,153,0.15)] flex items-center gap-1.5 pointer-events-none transition-all active:scale-95 animate-pulse"
            >
              <Upload className="w-3.5 h-3.5" /> Selecionar Arquivo
            </button>
          </>
        )}
      </div>

      {/* Bottom Pro Lock status */}
      <div className="flex items-center justify-center gap-2 text-amber-500/80 bg-amber-500/[0.04] border border-amber-500/10 rounded-lg py-2 px-3 self-center text-center w-full z-10 select-none">
        <Lock className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-amber-500" />
        <span className="text-[10px] font-black uppercase tracking-wider">
          {premiumStatus === "pro" ? "Plano PRO Ativo - Upload Liberado" : "Recurso exclusivo para assinantes PRO"}
        </span>
      </div>

    </div>
  );
};
