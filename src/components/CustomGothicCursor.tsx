import React, { useState, useEffect } from 'react';

interface CustomGothicCursorProps {
  themeId: string;
}

export function CustomGothicCursor({ themeId }: CustomGothicCursorProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (themeId !== 'gotico-retro') {
      document.body.classList.remove('custom-gothic-cursor-active');
      return;
    }

    // Hide native cursor
    document.body.classList.add('custom-gothic-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        let isClickable = false;
        let current: HTMLElement | null = target;
        
        // Traverse up to find clickable elements
        while (current && current !== document.body) {
          const tagName = current.tagName.toLowerCase();
          if (
            tagName === 'a' ||
            tagName === 'button' ||
            tagName === 'input' ||
            tagName === 'select' ||
            tagName === 'textarea' ||
            current.getAttribute('role') === 'button' ||
            current.classList.contains('cursor-pointer') ||
            current.style.cursor === 'pointer'
          ) {
            isClickable = true;
            break;
          }
          current = current.parentElement;
        }

        setIsHoveringClickable(isClickable);
      }
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('custom-gothic-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [themeId, isVisible]);

  if (themeId !== 'gotico-retro' || !isVisible) {
    return null;
  }

  // Determine which image to show:
  // - "apenas aparece a imagem 1- Pose, Quando o Usuário Clica em qual quer coisa: troca para a imagem 2 - Click"
  // - "Quando o mouse entra em um elemento clicável: 01 → 02, Quando sai: 02 → 01"
  const showClickImage = isClicking || isHoveringClickable;
  
  const cursorImg = showClickImage
    ? '/assets/themes/gothic-retro/icons/Cursor/mão-cursor-gotchic-click.webp'
    : '/assets/themes/gothic-retro/icons/Cursor/mão-cursor-gotchic-pose.webp';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '44px',
        height: '44px',
        // Standard hand cursors usually have the active hotspot at the top-left (the tip of the index finger).
        // If the hotspot is near the top-left, we align the pointer nicely without huge offsets.
        // Let's use negative translation to align the index finger exactly with the cursor position.
        transform: 'translate(-4px, -2px)',
        pointerEvents: 'none',
        zIndex: 999999,
      }}
    >
      <img
        src={cursorImg}
        alt="Gothic Cursor"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
        style={{
          filter: 'none',
          boxShadow: 'none',
          transition: 'none',
          animation: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );
}
