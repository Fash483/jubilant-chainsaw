import { useEffect, useRef } from 'react';

const COLORS = ['#db2777', '#9333ea', '#a855f7', '#ec4899', '#c084fc', '#e879f9', '#be185d', '#7c3aed', '#f472b6'];

export default function GlitterDots() {
  const dotsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const dots: HTMLDivElement[] = [];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.className = 'glitter-dot';
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        background: ${color};
        animation-duration: ${1.5 + Math.random() * 3}s;
        animation-delay: ${-Math.random() * 4}s;
        box-shadow: 0 0 6px 2px ${color}66;
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
      `;
      document.body.appendChild(el);
      dots.push(el);
    }
    dotsRef.current = dots;
    return () => dots.forEach((d) => d.remove());
  }, []);

  return null;
}
