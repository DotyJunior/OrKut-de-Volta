export interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  category: string;
  url: string;
  coverUrl?: string;
}

export const MUSIC_CATEGORIES = [
  { id: "gothic", name: "Gothic & Cyber-Gothic" },
  { id: "cyberpunk", name: "Cyberpunk & Synthwave" },
  { id: "emo-2008", name: "Emo 2008" },
  { id: "eletronica-2000", name: "Eletrônica 2000" },
  { id: "lan-house-classics", name: "Lan House Classics" },
  { id: "msn-status-songs", name: "MSN Status Songs" },
  { id: "orkut-nostalgia", name: "Orkut Nostalgia" },
  { id: "rock-n-roll", name: "Rock 'n' Roll" },
  { id: "sertanejo-universitario", name: "Sertanejo Universitário" }
];

export const PREDEFINED_LIBRARY_TRACKS: LibraryTrack[] = [
  // Gothic & Cyber-Gothic
  {
    id: "gothic-1",
    title: "Sensorium (Gothic Symphony)",
    artist: "EPICA",
    category: "gothic",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80"
  },
  {
    id: "gothic-2",
    title: "Spellbound (Industrial Mix)",
    artist: "Lacuna Coil",
    category: "gothic",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=300&q=80"
  },
  // Cyberpunk
  {
    id: "cyberpunk-1",
    title: "Neon Horizon 2026",
    artist: "Cyber Retro Guild",
    category: "cyberpunk",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=300&q=80"
  },
  // Emo 2008
  {
    id: "emo-1",
    title: "Helena (Nostalgic Acoustic)",
    artist: "My Chemical Romance Tribute",
    category: "emo-2008",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80"
  },
  // Eletrônica 2000
  {
    id: "eletronica-1",
    title: "Summer Eurodance Dream",
    artist: "DJ Eurodance 2000",
    category: "eletronica-2000",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80"
  },
  // Lan House Classics
  {
    id: "lanhouse-1",
    title: "Fire In The Hole! (Theme)",
    artist: "Counter-Strike Crew",
    category: "lan-house-classics",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    coverUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&q=80"
  },
  // MSN Status Songs
  {
    id: "msn-1",
    title: "O Segundo Sol (Aquele Status Emo)",
    artist: "Cássia Eller",
    category: "msn-status-songs",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80"
  },
  // Orkut Nostalgia
  {
    id: "orkut-1",
    title: "Sorte Grande (Poeira Retro)",
    artist: "Ivete Sangalo",
    category: "orkut-nostalgia",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&q=80"
  },
  // Rock 'n' Roll
  {
    id: "rock-1",
    title: "I Wanna Be Sedated",
    artist: "The Ramones Tribute",
    category: "rock-n-roll",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80"
  },
  // Sertanejo Universitário
  {
    id: "sertanejo-1",
    title: "Chora, Me Liga (Acoustic)",
    artist: "João Bosco & Vinícius Tribute",
    category: "sertanejo-universitario",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&q=80"
  }
];
