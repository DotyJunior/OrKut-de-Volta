import { useState } from 'react';
import { Shield, Search, Lock, Cpu, Globe } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userName: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogout?: () => void;
}

export default function OrkutHeader({ 
  currentTab, 
  setCurrentTab, 
  userName,
  searchQuery,
  setSearchQuery,
  onLogout
}: HeaderProps) {

  const menuItems = [
    { id: 'profile', label: 'INICIO' },
    { id: 'scrapbook', label: 'PAGINA DE RECADOS' },
    { id: 'testimonials', label: 'DEPOIMENTOS' },
    { id: 'communities', label: 'COMUNIDADES' },
    { id: 'scrapbook-builder', label: '🎨 BUILDER DE SCRAPS' }
  ];

  return (
    <header className="w-full font-sans select-none">
      {/* 1. TOP BAR: Classic Vintage Blue */}
      <div className="bg-[#92afd9] border-b border-[#7e9bc4] py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left: Vintage Search Bar with Square Search Icon Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setCurrentTab('search');
              }
            }}
            className="flex items-center"
          >
            <button
              type="submit"
              className="bg-[#e4ebf3] hover:bg-neutral-200 border border-neutral-400 border-r-0 h-8 w-8 flex items-center justify-center text-neutral-800 cursor-pointer"
              title="Pesquisar"
            >
              <Search size={16} className="stroke-[3]" />
            </button>
            <input
              id="header-search-bar"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="px-2.5 py-1 text-xs w-[200px] sm:w-[240px] md:w-[280px] bg-white border border-neutral-400 focus:outline-none shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)] text-neutral-800 h-8"
            />
          </form>

          {/* Right: Username, Settings link, and Connection Security Badge */}
          <div className="flex flex-col items-center md:items-end gap-1.5 text-center md:text-right font-sans">
            <div className="text-[12px] text-[#0d213f] font-semibold flex items-center gap-1.5 flex-wrap justify-center md:justify-end">
              <span>Olá {userName}</span>
              <span className="text-neutral-500">|</span>
              <button 
                onClick={() => setCurrentTab('profile')} 
                className="hover:underline font-bold text-[#0d213f] cursor-pointer"
              >
                Configurações
              </button>
              {onLogout && (
                <>
                  <span className="text-neutral-500">|</span>
                  <button 
                    onClick={onLogout} 
                    className="hover:underline font-extrabold text-rose-700 cursor-pointer uppercase text-[10.5px] tracking-tight"
                  >
                    Sair
                  </button>
                </>
              )}
            </div>

            {/* Connection Security Badge */}
            <div className="flex items-center gap-1.5 bg-[#0b1f3c] border border-[#0d264a] text-yellow-500 font-extrabold rounded px-2.5 py-1 text-[9px] uppercase tracking-tight select-none">
              <span className="text-[10px] leading-none">🛡️</span>
              <span className="text-white text-[9px] font-sans">SUA CONEXÃO É SEGURA</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. NAVIGATION BAR: Vintage Light Slate Blue */}
      <div className="bg-[#dbe4f1] border-b border-[#c4dafa] py-3.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4">
          
          {/* Brand Logo Scrapzone */}
          <div 
            className="flex items-center cursor-pointer select-none" 
            onClick={() => {
              setSearchQuery('');
              setCurrentTab('profile');
            }}
          >
            <img 
              src="https://i.imgur.com/dhYT8Fa.png" 
              alt="Scrapzone Logo" 
              className="h-[110px] md:h-[120px] object-contain transition-transform hover:scale-102 active:scale-98"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Horizontal Vintage Menu Alignment directly adjacent to the logo, exactly like reference images */}
          <div className="flex flex-wrap gap-1.5 items-center justify-center md:justify-start w-full md:w-auto">
            {menuItems.map((item) => (
              <button
                id={`tab-btn-${item.id}`}
                key={item.id}
                onClick={() => {
                  setSearchQuery('');
                  setCurrentTab(item.id);
                }}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wide rounded-sm font-sans transition-all cursor-pointer ${
                  item.id === 'communities' && currentTab === 'communities'
                    ? 'bg-white text-[#9d174d] shadow-sm border-2 border-[#1b4372] font-black rounded-lg scale-105'
                    : currentTab === item.id 
                    ? 'bg-[#1b4372] text-white shadow-xs border border-[#1b4372]' 
                    : 'bg-[#406a94] hover:bg-[#34597d] text-white border border-[#406a94]'
                }`}
              >
                {item.id === 'communities' ? 'COMUNIDADE' : item.label}
              </button>
            ))}

            {/* Special MINHAS COMUNIDADES Tab button matching mockup - hidden on Profile page */}
            {currentTab !== 'profile' && (
              <button
                id="tab-btn-my-communities"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentTab('communities');
                }}
                className="px-4 py-2 text-[11px] font-black uppercase tracking-wide border-2 border-pink-600 bg-white hover:bg-pink-50 text-pink-600 rounded-lg shadow-sm transition-all cursor-pointer shrink-0 ml-1.5 hover:scale-102 font-sans"
              >
                MINHAS COMUNIDADES
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
