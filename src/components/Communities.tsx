import { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Users, PlusCircle, Search, HelpCircle } from 'lucide-react';
import { Community } from '../types';

interface CommunitiesProps {
  communities: Community[];
  onJoinCommunity: (id: string) => void;
  joinedIds: string[];
}

export default function Communities({ communities, onJoinCommunity, joinedIds }: CommunitiesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRiddleModal, setShowRiddleModal] = useState<string | null>(null); // communityId if open
  const [riddleAnswer, setRiddleAnswer] = useState('');
  const [newCommName, setNewCommName] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinClick = (comm: Community) => {
    if (comm.secureMode && !joinedIds.includes(comm.id)) {
      setShowRiddleModal(comm.id);
      setRiddleAnswer('');
    } else {
      onJoinCommunity(comm.id);
    }
  };

  const handleResolveRiddle = (comm: Community) => {
    // Standard secure riddles based on community id
    const riddles: Record<string, string> = {
      'sec_pr': 'rust', // Alexandre's secure community secret
      'hacker_guild': 'xss', // Hacker secret
      'orkut_devs': 'zero' // Orkut developers secret
    };

    const expected = riddles[comm.id] || 'orkut';
    if (riddleAnswer.trim().toLowerCase() === expected) {
      onJoinCommunity(comm.id);
      setShowRiddleModal(null);
    } else {
      alert("⚠️ Assinatura de conhecimento rejeitada! Frase Secreta ou Chave de zero-conhecimento inválida.");
    }
  };

  return (
    <div id="communities-view" className="bg-white border border-neutral-300 rounded p-4 shadow-sm text-left relative font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 mb-4 gap-3">
        <div>
          <h2 className="text-lg font-bold font-sans text-neutral-800 flex items-center gap-1.5">
            👥 Comunidades do Orkut Criptografado
          </h2>
          <p className="text-xs text-neutral-500 font-sans">
            Entre nas maiores e mais nostálgicas comunidades do Orkut, agora isoladas com algoritmos criptográficos.
          </p>
        </div>

        {/* Search */}
        <div className="flex shadow-sm rounded border border-neutral-300 bg-white">
          <input
            id="comm-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar comunidades..."
            className="px-2 py-1 text-xs w-[180px] focus:outline-none"
          />
          <button className="bg-[#dee7f4] px-2 border-l border-neutral-300 text-neutral-600">
            <Search size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((comm) => {
          const isJoined = joinedIds.includes(comm.id);
          const isSecretModalOpen = showRiddleModal === comm.id;

          return (
            <div
              key={comm.id}
              className={`border rounded p-3 flex gap-3 bg-neutral-50 hover:bg-white transition-all shadow-sm ${
                isJoined ? 'border-green-300' : 'border-neutral-300'
              }`}
            >
              {/* Avatar Icon */}
              <div className="w-14 h-14 bg-[#fae8ff] text-[#d946ef] rounded border border-neutral-200 flex-shrink-0 flex items-center justify-center text-3xl select-none shadow-inner">
                {comm.avatar}
              </div>

              {/* Body */}
              <div className="flex-1 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-neutral-800 text-xs hover:underline cursor-pointer">{comm.name}</h3>
                    {comm.secureMode && (
                      <span className="bg-pink-100 text-pink-800 border border-pink-200 px-1 py-0 rounded text-[9px] font-bold flex items-center gap-0.5 font-mono">
                        <Lock size={8} /> SECURE GUILD
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-500 text-[11px] mt-0.5 leading-snug">{comm.description}</p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-dotted border-neutral-200 text-[10px]">
                  <span className="text-neutral-500 font-mono flex items-center gap-1">
                    <Users size={12} />
                    {comm.members + (isJoined ? 1 : 0)} membros
                  </span>

                  {isJoined ? (
                    <span className="text-green-700 font-bold flex items-center gap-1">
                      <ShieldCheck size={12} className="text-green-600" />
                      Membro Verificado
                    </span>
                  ) : (
                    <button
                      id={`btn-join-comm-${comm.id}`}
                      onClick={() => handleJoinClick(comm)}
                      className={`font-semibold rounded px-2.5 py-1 text-[10px] cursor-pointer shadow-sm transition-all text-neutral-700 border border-neutral-300 bg-white hover:bg-neutral-100`}
                    >
                      {comm.secureMode ? "Decifrar para Entrar" : "Entrar Já"}
                    </button>
                  )}
                </div>

                {/* Secure riddle mini-modal inline */}
                {isSecretModalOpen && (
                  <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded text-left anim-fade">
                    <h4 className="font-bold text-pink-700 mb-1 flex items-center gap-1 p-0">
                      <HelpCircle size={12} /> Desafio de Prova Criptográfica:
                    </h4>
                    
                    {comm.id === 'sec_pr' && (
                      <p className="text-[10px] text-neutral-600 mb-2 leading-relaxed">
                        Qual linguagem de programação focada em segurança de memória e livre de null pointer o Paraná está usando nos sistemas estaduais? (Dica: começa com 'r' e termina com 't')
                      </p>
                    )}
                    {comm.id === 'hacker_guild' && (
                      <p className="text-[10px] text-neutral-600 mb-2 leading-relaxed">
                        Qual o nome do exploit preferido do Orkut antigo que inseria scripts em depoimentos para ler cookies de sessão das vítimas? (Dica: sigla de 3 letras)
                      </p>
                    )}
                    {comm.id === 'orkut_devs' && (
                      <p className="text-[10px] text-neutral-600 mb-2 leading-relaxed">
                        Complete o paradigma de segurança: Prova de Conhecimento ______ [Zero] (Insira a palavra em português ou inglês)
                      </p>
                    )}

                    <div className="flex gap-2.5">
                      <input
                        id={`riddle-answer-${comm.id}`}
                        type="text"
                        value={riddleAnswer}
                        onChange={(e) => setRiddleAnswer(e.target.value)}
                        placeholder="Insira a frase secreta..."
                        className="flex-1 px-2 py-1 text-xs border border-neutral-300 rounded focus:outline-none"
                      />
                      <button
                        id={`btn-solve-riddle-${comm.id}`}
                        onClick={() => handleResolveRiddle(comm)}
                        className="px-2.5 py-1 bg-pink-700 text-white rounded font-bold hover:bg-pink-800 cursor-pointer"
                      >
                        Validar Prova
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
