import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ── Performance: cap DPR ────────────────────────────────────
const DPR_CAP = Math.min(window.devicePixelRatio, 1.5);

// ── AI Core: glowing rotating icosahedron ───────────────────
const AICore = () => {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x += delta * 0.08;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.12;
      wireRef.current.rotation.x += delta * 0.06;
    }
  });

  return (
    <group>
      {/* Inner emissive core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#7C5CFF"
          emissive="#7C5CFF"
          emissiveIntensity={0.6}
          transparent
          opacity={0.35}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Outer wireframe shell */}
      <mesh ref={wireRef} scale={1.45}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial
          color="#22D3EE"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

// ── Floating glass panel ────────────────────────────────────
const FloatingPanel = ({ position, text }) => {
  const meshRef = useRef();

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.3}
      floatIntensity={0.5}
      floatingRange={[-0.1, 0.1]}
    >
      <group position={position} ref={meshRef}>
        <mesh>
          <planeGeometry args={[1.6, 0.55]} />
          <meshStandardMaterial
            color="#1a1d2e"
            transparent
            opacity={0.6}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.12}
          color="#A3AAC2"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {text}
        </Text>
      </group>
    </Float>
  );
};

// ── Particle field ──────────────────────────────────────────
const Particles = ({ count = 200 }) => {
  const meshRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const violet = new THREE.Color('#7C5CFF');
    const cyan = new THREE.Color('#22D3EE');

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const c = Math.random() > 0.5 ? violet : cyan;
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

// ── Mouse parallax ──────────────────────────────────────────
const CameraRig = () => {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useFrame(() => {
    const { x, y } = mouseRef.current;
    camera.position.x += (x * 0.5 - camera.position.x) * 0.03;
    camera.position.y += (-y * 0.3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ── Tab visibility: pause when hidden ───────────────────────
const TabVisibilityHandler = ({ isVisible }) => {
  const { gl } = useThree();

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden || !isVisible) {
        gl.setAnimationLoop(null);
      } else {
        gl.setAnimationLoop(() => gl.render(gl.scene, gl.camera));
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    if (!isVisible) gl.setAnimationLoop(null);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [gl, isVisible]);

  return null;
};

// ── Main Canvas ─────────────────────────────────────────────
const HeroCanvas = ({ isVisible = true }) => {
  return (
    <Canvas
      dpr={DPR_CAP}
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
      frameloop={isVisible ? 'always' : 'never'}
    >
      <fog attach="fog" args={['#0B0D17', 4, 12]} />

      {/* Lighting */}
      <TabVisibilityHandler isVisible={isVisible} />
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 2, 4]} intensity={0.8} color="#7C5CFF" />
      <pointLight position={[-3, -1, 3]} intensity={0.5} color="#22D3EE" />

      {/* Scene objects */}
      <AICore />

      {/* Floating panels */}
      <FloatingPanel position={[-2.2, 1.0, -0.5]} text="Resume" />
      <FloatingPanel position={[2.3, 0.5, -0.3]} text="Match Score 87%" />
      <FloatingPanel position={[-1.8, -1.2, -0.4]} text="Job Description" />
      <FloatingPanel position={[2.0, -0.8, -0.6]} text="Questions" />

      {/* Particles */}
      <Particles count={150} />

      {/* Camera interaction */}
      <CameraRig />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
};

export default HeroCanvas;

