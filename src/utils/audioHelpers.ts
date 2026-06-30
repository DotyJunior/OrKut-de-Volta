let activeAudio: HTMLAudioElement | null = null;
let activeUrl: string | null = null;

export const getActiveAudio = () => activeAudio;

export const playAudio = (
  url: string,
  onPlaySuccess?: () => void,
  onEnded?: () => void,
  onTimeUpdate?: (currentTime: number, duration: number) => void
): HTMLAudioElement => {
  // If we already have this URL loaded, just play it
  if (activeAudio && activeUrl === url) {
    activeAudio.play()
      .then(() => {
        if (onPlaySuccess) onPlaySuccess();
      })
      .catch((err) => {
        console.warn("Audio resume was blocked by browser autoplay policy:", err);
      });
    return activeAudio;
  }

  // Otherwise stop previous audio and load new URL
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }

  activeAudio = new Audio(url);
  activeUrl = url;

  // Enable standard cross-origin properties for AudioContext analysers
  activeAudio.crossOrigin = "anonymous";

  if (onEnded) {
    activeAudio.addEventListener("ended", () => {
      onEnded();
    });
  }

  if (onTimeUpdate) {
    activeAudio.addEventListener("timeupdate", () => {
      if (activeAudio) {
        onTimeUpdate(activeAudio.currentTime, activeAudio.duration || 0);
      }
    });
  }

  activeAudio.play()
    .then(() => {
      if (onPlaySuccess) onPlaySuccess();
    })
    .catch((err) => {
      console.warn("Audio playback was blocked by browser autoplay policy:", err);
    });

  return activeAudio;
};

export const pauseAudio = () => {
  if (activeAudio) {
    activeAudio.pause();
  }
};

export const stopAudio = () => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
};

export const seekAudio = (seconds: number) => {
  if (activeAudio) {
    activeAudio.currentTime = seconds;
  }
};
