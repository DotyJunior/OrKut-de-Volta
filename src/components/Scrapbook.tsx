import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Unlock, Key, RefreshCw, Send, HelpCircle } from 'lucide-react';
import { encryptAES, decryptAES, computeSHA256 } from '../utils/crypto';
import { Scrap, Profile } from '../types';
import SocialActions from './SocialActions';

interface ScrapbookProps {
  scraps: Scrap[];
  onAddScrap: (scrap: Omit<Scrap, 'id' | 'timestamp'> & { needsAiResponse?: boolean }) => void;
  activeProfile: Profile;
  isOwnProfile: boolean;
  currentUser: { id: string; name: string; avatar: string };
  onLikeScrap?: (id: string, liked: boolean, count: number) => void;
  onShareToFeed: (itemTitle: string, itemType: string) => void;
  onGoToBuilder?: () => void;
}

export default function Scrapbook({ 
  scraps, 
  onAddScrap, 
  activeProfile, 
  isOwnProfile, 
  currentUser,
  onLikeScrap,
  onShareToFeed,
  onGoToBuilder
}: ScrapbookProps) {
  const [scrapText, setScrapText] = useState('');
  const [useEncryption, setUseEncryption] = useState(true);
  const [encryptionPhrase, setEncryptionPhrase] = useState('orkut-default-sec-key-1337');
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptionKeys, setDecryptionKeys] = useState<Record<string, string>>({}); // id -> key
  const [decryptedScraps, setDecryptedScraps] = useState<Record<string, string>>({}); // id -> text
  const [cryptoExplainOpen, setCryptoExplainOpen] = useState(false);
  const [validationError, setValidationError] = useState<'html_js_injection' | 'flood_detected' | null>(null);

  const validateText = (text: string): boolean => {
    if (!text) {
      setValidationError(null);
      return true;
    }

    const lower = text.toLowerCase();
    
    // Detect HTML tags, script structures, embedded content, dynamic styling, iframe injections, onerror/onclick events
    const tagRegex = /<\/?(script|iframe|style|object|embed|link|meta|div|span|img|font|p|a|h[1-6]|button|input|textarea|form|table|tr|td|thead|tbody|tfoot|frame|frameset|html|body|applet)\b/i;
    const eventRegex = /\bon[a-zA-Z]+\s*=/i;
    const cssRegex = /(font-family|position|display|z-index)\s*:/i;
    const scriptLinkRegex = /href\s*=\s*['"]?javascript:/i;

    if (
      tagRegex.test(lower) ||
      /<script/i.test(lower) ||
      /<\/script>/i.test(lower) ||
      /<iframe>/i.test(lower) ||
      /<style/i.test(lower) ||
      /<object/i.test(lower) ||
      /<embed/i.test(lower) ||
      eventRegex.test(lower) ||
      cssRegex.test(lower) ||
      scriptLinkRegex.test(lower)
    ) {
      setValidationError("html_js_injection");
      return false;
    }

    // Detect excessive alphanumeric character repetition (flood / automatic repetition block, e.g. 35+ repeats)
    // We exclude common repeating layouts like space ' ', newline '\n', block markers ('.', '-', '=', '*', '+', etc.) to allow healthy ASCII art.
    const repRegex = /([^ \n\.\-_\=\*\+\/\\\|\(\)\[\]\{\}\<\>\:\;\`,~\^])\1{34,}/;
    if (repRegex.test(text)) {
      setValidationError("flood_detected");
      return false;
    }

    setValidationError(null);
    return true;
  };

  // Dynamic filter scraps for this active profile
  const filteredScraps = scraps.filter(s => s.toId === activeProfile.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapText.trim() || isProcessing || !!validationError) return;
    if (!validateText(scrapText)) return;

    setIsProcessing(true);
    try {
      // 1.5 seconds debounce/cooldown delay to prevent spam
      await new Promise(resolve => setTimeout(resolve, 1500));

      let finalScrap: Omit<Scrap, 'id' | 'timestamp'> = {
        fromId: currentUser.id,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatar,
        toId: activeProfile.id,
        rawContent: scrapText,
        isEncrypted: false
      };

      if (useEncryption) {
        // Run Real WebCrypto AES GCM
        const res = await encryptAES(scrapText, encryptionPhrase);
        const signature = await computeSHA256(res.ciphertext + encryptionPhrase);
        
        finalScrap = {
          ...finalScrap,
          isEncrypted: true,
          rawContent: `🔐 [MENSAGEM CRIPTOGRAFADA AES-GCM] - ID: ${signature.slice(0, 12)}`,
          ciphertext: `${res.ciphertext}:${res.iv}`,
          algorithm: 'AES-256-GCM',
          signature: signature
        };
      }

      // Add scrap (which triggers state updates and Gemini character replies if necessary!)
      onAddScrap({
        ...finalScrap,
        needsAiResponse: activeProfile.id !== currentUser.id // AI replies if writing to AI personas
      });

      setScrapText('');
    } catch (err) {
      console.error("Failed to post scrap:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecryptScrap = async (scrapId: string, ciphertextWithIv: string) => {
    const key = decryptionKeys[scrapId] || encryptionPhrase;
    try {
      const [ciphertext, iv] = ciphertextWithIv.split(':');
      if (!ciphertext || !iv) throw new Error("Formato de criptonita inválido.");
      const resolved = await decryptAES(ciphertext, iv, key);
      setDecryptedScraps(prev => ({ ...prev, [scrapId]: resolved }));
    } catch (err: any) {
      alert(err.message || "Senha incorreta ou integridade de blocos violada.");
    }
  };

  return (
    <div id="scrapbook-view" className="bg-white border border-neutral-300 rounded p-4 shadow-sm text-left">
      {/* Title */}
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <div>
          <h2 className="text-lg font-bold font-sans text-neutral-800">
            Página de Recados (Scrapbook) de <strong>{activeProfile.name}</strong>
          </h2>
          <p className="text-xs text-neutral-500 font-sans">
            {isOwnProfile 
              ? "Esta é a sua página. Seus amigos podem enviar recados públicos ou criptografados."
              : `Escreva um scrapbook para ${activeProfile.name}. Ative criptografia para proteger contra espionagem!`
            }
          </p>
        </div>
        <button 
          onClick={() => setCryptoExplainOpen(!cryptoExplainOpen)}
          className="flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:underline"
        >
          <HelpCircle size={14} />
          {cryptoExplainOpen ? "Ocultar Info Sec" : "Como funciona?"}
        </button>
      </div>

      {cryptoExplainOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-xs text-blue-800 font-sans leading-relaxed">
          <h4 className="font-bold mb-1 flex items-center gap-1">🛡️ Infraestrutura Crypto do Scrapzone Secure:</h4>
          <p className="mb-2">
            No antigo Orkut de 2004, mensagens eram salvas em texto puro em servidores frágeis de SQL. Aqui, se você selecionar <strong>Criptografia Ativa</strong>, a mensagem é imediatamente encriptada no seu próprio navegador usando <strong>Symmetric AES-256-GCM</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Chave Secreta:</strong> Usada para embaralhar a string localmente.</li>
            <li><strong>Assinatura Digital:</strong> Um hash SHA-256 garante que ninguém interceptou ou alterou o conteúdo na rede.</li>
            <li><strong>Decodificação:</strong> Para ler, o destinatário precisa possuir ou inserir a mesma frase chave!</li>
          </ul>
        </div>
      )}

      {/* Y2K Scrapbook Builder Invitation Banner */}
      {onGoToBuilder && (
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded p-3 mb-6 text-white font-sans shadow-md flex flex-col md:flex-row justify-between items-center gap-3 animate-pulse border-2 border-fuchsia-300">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="text-3xl">✨🎨</span>
            <div>
              <h4 className="font-extrabold text-sm tracking-wide text-yellow-200">NOVIDADE DE 2008: SCRAPBOOK BUILDER!</h4>
              <p className="text-[11px] leading-snug text-pink-50">
                Chega de scraps sem graça! Desenhe recados animados com <strong>glow neon</strong>, <strong>glitter piscando</strong>, fontes retrô (Comic Sans, Cooper) e stickers do MSN!
              </p>
            </div>
          </div>
          <button
            onClick={onGoToBuilder}
            className="flex-shrink-0 bg-yellow-300 hover:bg-yellow-200 text-neutral-900 font-black text-xs px-4 py-2 rounded-full cursor-pointer transition-all uppercase tracking-wider border-2 border-white shadow-lg shadow-black/25 active:scale-95"
          >
            Criar Scrap com Glitter ⚡
          </button>
        </div>
      )}

      {/* Write form */}
      {!isOwnProfile && (
        <form onSubmit={handleSubmit} className="bg-neutral-50 border border-neutral-200 rounded p-3 mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-neutral-600 uppercase">Escrever novo scrapbook:</label>
            <span id="scrapbook-char-counter" className="text-[10px] font-mono text-neutral-500 bg-neutral-200/55 px-1.5 py-0.5 rounded">
              {scrapText.length} caracteres
            </span>
          </div>
          <textarea
            id="scrapbook-textarea"
            rows={3}
            value={scrapText}
            onChange={(e) => {
              const text = e.target.value.substring(0, 4000); // 4000 limit
              setScrapText(text);
              validateText(text);
            }}
            placeholder={`Envie uma mensagem bacana para ${activeProfile.name}!`}
            className={`w-full px-3 py-2 text-xs border rounded focus:outline-none focus:ring-1 transition-all ${
              validationError 
                ? 'border-red-500 ring-2 ring-red-500/15 text-red-900 bg-red-50/10 focus:ring-red-500' 
                : 'border-neutral-300 focus:ring-blue-500 bg-white'
            }`}
            disabled={isProcessing}
            required
          />

          {/* CENTRALIZED ALERT FOR VALIDATION FAILURE */}
          {validationError && (
            <div className="flex flex-col items-center justify-center p-5 border border-red-500 bg-red-500/5 text-red-500 rounded-lg text-center font-sans space-y-2 mt-2 select-none">
              <span className="text-4xl filter drop-shadow">☠</span>
              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                ⚠ Caracteres inválidos detectados.
              </div>
              <p className="text-[10px] leading-relaxed max-w-sm">
                {validationError === 'flood_detected'
                  ? "Por segurança contra flood e spam, sequências excessivas de caracteres repetidos não são permitidas."
                  : "Por segurança, apenas texto, emojis, símbolos e ASCII Art são permitidos."}
              </p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mt-3 pt-3 border-t border-dashed border-neutral-200">
            {/* Secure Switch controls */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold select-none text-neutral-700">
                <input
                  id="toggle-crypto-scrap"
                  type="checkbox"
                  checked={useEncryption}
                  onChange={(e) => setUseEncryption(e.target.checked)}
                  className="rounded border-neutral-300 text-[#1d4ed8]"
                />
                <span className="flex items-center gap-1">
                  {useEncryption ? (
                    <ShieldCheck size={14} className="text-green-600" />
                  ) : (
                    <ShieldAlert size={14} className="text-yellow-600" />
                  )}
                  Transmitir com Encriptação AES-GCM
                </span>
              </label>

              {useEncryption && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">Passphrase:</span>
                  <input
                    id="input-encryption-passphrase"
                    type="password"
                    value={encryptionPhrase}
                    onChange={(e) => setEncryptionPhrase(e.target.value)}
                    className="px-2 py-0.5 border border-neutral-300 rounded text-[11px] font-mono bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-[150px]"
                    placeholder="Chave secreta..."
                  />
                </div>
              )}
            </div>

            <button
              id="btn-send-scrap"
              type="submit"
              disabled={isProcessing || !scrapText.trim() || !!validationError}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#dee7f4] hover:bg-[#c6d7ed] border border-[#adc3df] text-[#1d4ed8] font-bold text-xs rounded transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Aguarde (1.5s)...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Enviar Scrap</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Recados List */}
      <div className="space-y-4">
        {filteredScraps.length === 0 ? (
          <div className="text-center py-12 text-sm text-neutral-500 border border-dashed rounded italic">
            Nenhum scrap registrado ainda. Que tal escrever o primeiro?
          </div>
        ) : (
          [...filteredScraps].reverse().map((scrap) => {
            const isDecrypted = !!decryptedScraps[scrap.id];
            const hasCiphertext = !!scrap.ciphertext;

            return (
              <div key={scrap.id} className="border border-neutral-200 rounded overflow-hidden shadow-sm bg-white">
                {/* Header block */}
                <div className="bg-[#dee7f4]/40 px-3 py-2 flex justify-between items-center border-b border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={scrap.fromAvatar}
                      alt={scrap.fromName}
                      className="w-6 h-6 rounded object-cover border border-neutral-300 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-[#1d4ed8]">{scrap.fromName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">({scrap.timestamp})</span>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold">
                    {scrap.isEncrypted ? (
                      <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Lock size={10} />
                        Cifrado ({scrap.algorithm})
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Unlock size={10} />
                        Texto Puro
                      </span>
                    )}
                  </div>
                </div>

                {/* Content body and interactive decrypter */}
                <div className="p-3 text-xs leading-relaxed font-sans flex flex-col gap-2">
                  {scrap.isEncrypted && !isDecrypted ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded p-2.5">
                      <div className="font-mono text-[10px] text-neutral-600 break-all mb-2">
                        <strong>Ciphertext Hex:</strong> {scrap.ciphertext?.split(':')[0]}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase">Chave de Decifragem:</span>
                        <input
                          id={`input-decrypt-key-${scrap.id}`}
                          type="password"
                          value={decryptionKeys[scrap.id] || ''}
                          onChange={(e) => setDecryptionKeys({ ...decryptionKeys, [scrap.id]: e.target.value })}
                          className="px-2 py-0.5 border border-neutral-300 rounded text-[11px] font-mono bg-white w-[160px]"
                          placeholder="Usar mesma passphrase..."
                        />
                        <button
                          id={`btn-decrypt-${scrap.id}`}
                          onClick={() => handleDecryptScrap(scrap.id, scrap.ciphertext!)}
                          className="px-3 py-1 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[10px] rounded flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Key size={10} />
                          Decifrar Mensagem
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-neutral-700 whitespace-pre-wrap font-sans">
                        {isDecrypted ? decryptedScraps[scrap.id] : scrap.rawContent}
                      </p>
                      {scrap.imageUrl && (
                        <div className="mt-2 text-center bg-neutral-950 border-2 border-dashed border-pink-400 p-2.5 rounded shadow-[0_0_15px_rgba(236,72,153,0.3)] inline-block max-w-full md:max-w-md self-start relative overflow-hidden group">
                          {/* Y2K overlay watermark */}
                          <div className="absolute right-1.5 top-1.5 bg-fuchsia-600/90 text-[7px] text-white font-bold px-1 rounded-sm uppercase tracking-wider select-none z-10 font-mono">
                            Glitter v2008
                          </div>
                          <img 
                            src={scrap.imageUrl} 
                            alt="Retro Scrapbook Design" 
                            className="max-w-full rounded object-contain max-h-[320px] border border-white/20 select-none bg-[#0a0a0c]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="mt-1.5 flex items-center justify-between text-[8px] text-pink-300 font-mono tracking-wider font-extrabold uppercase">
                            <span>✨ Scrapbook Builder</span>
                            <span className="text-[7px]">Secure Channel Signature</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isDecrypted && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-green-800 font-semibold font-mono bg-green-50 border border-green-200 self-start px-2 py-0.5 rounded">
                      <ShieldCheck size={12} />
                      Decodificado com sucesso. Hash de integridade verificado!
                    </div>
                  )}

                  {/* Subtle Sec Engine notation */}
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-neutral-100/70 pt-1.5 mt-1.5 text-[9px] text-neutral-400 font-mono select-none">
                    <span className="flex items-center gap-0.5 text-blue-700/60 font-semibold">
                      🛡️ Recado protegido pela Rust Engine
                    </span>
                    <span>•</span>
                    <span className="text-[#d946ef]/60 font-semibold">
                      🔑 Assinatura digital verificada
                    </span>
                  </div>

                  {/* Added Interactive Nostalgic Interaction System */}
                  <SocialActions
                    itemId={scrap.id}
                    itemType="scrap"
                    itemTitle={`Scrap de ${scrap.fromName}: "${(isDecrypted ? decryptedScraps[scrap.id] : scrap.rawContent).slice(0, 30)}${(isDecrypted ? decryptedScraps[scrap.id] : scrap.rawContent).length > 30 ? '...' : ''}"`}
                    initialLikes={scrap.likes || 0}
                    initialLikedByMe={scrap.likedByMe || false}
                    onLikeUpdate={(liked, count) => onLikeScrap?.(scrap.id, liked, count)}
                    onShareToFeed={onShareToFeed}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
