import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import './HeroScene.scss';

// Lazy-load the 3D canvas so it never blocks first paint
const HeroCanvas = lazy(() => import('./HeroCanvas'));

const HeroScene = () => {
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) setWebGLAvailable(false);
    } catch {
      setWebGLAvailable(false);
    }

    // Check prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    return () => mq.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver to pause rendering when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showCanvas = webGLAvailable && !reducedMotion;

  return (
    <div className="pm-hero-scene" ref={containerRef} aria-hidden="true">
      {showCanvas ? (
        <Suspense fallback={<Placeholder />}>
          <div className="pm-hero-scene__canvas-wrap">
            <HeroCanvas isVisible={isVisible} />
          </div>
        </Suspense>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

const Placeholder = () => (
  <div className="pm-hero-scene__placeholder">
    <div className="pm-hero-scene__css-orb" />
  </div>
);

export default HeroScene;

