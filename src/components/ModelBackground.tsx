// src/components/ModelBackground.tsx
import React, { useEffect, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

const ModelBackground: React.FC<{ src?: string; className?: string }> = ({ src = '/spiderman_logo.glb', className = '' }) => {
  const ref = useRef<any>(null);

  // Debug if URL has ?dbg=1 or localStorage flag set
  const DEBUG =
    typeof window !== 'undefined' &&
    (window.location.search.includes('dbg=1') || window.localStorage.getItem('MODEL_BG_DEBUG') === '1');

  useEffect(() => {
    const el = ref.current;
    const t = window.setTimeout(() => {
      try {
        // try play (no-op if no animations)
        if (el && typeof el.play === 'function') el.play();
      } catch (e) {
        // ignore
      }
    }, 300);
    return () => clearTimeout(t);
  }, []);

  // debug style: high opacity, border, no blur so you can see it
  const debugStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minWidth: '700px',
    transform: 'translate(-5%, -6%) scale(1.02)',
    opacity: 0.96,
    border: '4px solid rgba(255,0,0,0.65)',
    filter: 'none',
    pointerEvents: 'none',
    willChange: 'transform, opacity'
  };

  // subtle production style
  const subtleStyle: React.CSSProperties = {
    width: '120%',
    height: '120%',
    minWidth: '800px',
    transform: 'translate(-10%, -8%) scale(1.2)',
    opacity: 0.18,
    filter: 'blur(6px) saturate(0.85) contrast(0.95) brightness(1.02)',
    pointerEvents: 'none',
    willChange: 'transform, opacity'
  };

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <model-viewer
        ref={ref}
        src={src}
        alt="logo"
        autoplay
        auto-rotate
        auto-rotate-delay="120"
        camera-controls
        touch-action="none"
        style={DEBUG ? debugStyle : subtleStyle}
        shadow-intensity={DEBUG ? '0.9' : '0.4'}
        environment-image="neutral"
        exposure={DEBUG ? '1.2' : '1'}
        reveal="auto"
      />
      {/* overlay — only applied when not debugging so form stays readable */}
      {!DEBUG && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.20) 100%)',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
};

export default ModelBackground;
