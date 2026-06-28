import { useEffect } from 'react';

// 80 butterflies with varied species, sizes, speeds, and drift paths
const COUNT = 80;

// Rich mix of butterfly and flower emojis
const EMOJIS = [
  '🦋', '🦋', '🦋', '🦋', '🦋', '🦋',  // blue/purple butterfly (most common)
  '🩷', '🩷', '🩷',                        // pink heart
  '🌸', '🌸', '🌸',                        // cherry blossom
  '🌺', '🌺',                              // hibiscus
  '🌼', '🌼',                              // daisy
  '🌷', '🌷',                              // tulip
  '💮',                                    // white flower
  '🪷',                                    // lotus
  '✨', '✨',                              // sparkle
  '🫧',                                    // bubble
];

// Multiple animation names for variety
const ANIMATIONS = [
  'butterfly-float',
  'butterfly-float-sway',
  'butterfly-float-spiral',
];

export default function FloatingButterflies() {
  useEffect(() => {
    const els: HTMLDivElement[] = [];
    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('div');
      const anim = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
      el.className = `butterfly-float ${anim}`;
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

      // Wide horizontal drift range — some go left, some right, some zigzag
      const driftX = -100 + Math.random() * 200;
      const driftX2 = -50 + Math.random() * 100;

      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        animation-name: ${anim};
        animation-duration: ${6 + Math.random() * 18}s;
        animation-delay: ${-Math.random() * 35}s;
        animation-timing-function: ${Math.random() > 0.5 ? 'ease-in-out' : 'linear'};
        animation-iteration-count: infinite;
        animation-fill-mode: both;
        opacity: ${0.2 + Math.random() * 0.55};
        font-size: ${0.5 + Math.random() * 1.6}rem;
        --drift-x: ${driftX}px;
        --drift-x2: ${driftX2}px;
        --wobble: ${-15 + Math.random() * 30}deg;
      `;
      document.body.appendChild(el);
      els.push(el);
    }
    return () => els.forEach((e) => e.remove());
  }, []);

  return null;
}
