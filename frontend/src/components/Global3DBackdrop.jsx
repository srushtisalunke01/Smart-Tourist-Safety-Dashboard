import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

function ParticleCloud({ isDark }) {
  const count = 800;
  const geomRef = useRef();

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 38;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 38;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 38;
      spd[i] = Math.random() * 0.015 + 0.006;
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    if (geomRef.current) {
      const posAttr = geomRef.current.attributes.position;
      const elapsed = state.clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i);
        y += speeds[i];
        if (y > 18) y = -18;
        posAttr.setY(i, y);

        let x = posAttr.getX(i);
        x += Math.sin(elapsed * 0.45 + i) * 0.0035;
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={isDark ? "#00ffcc" : "#3b82f6"}
        size={0.11}
        transparent
        opacity={isDark ? 0.35 : 0.45}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Hologlobe({ isDark }) {
  const groupRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.09;
      groupRef.current.rotation.x = Math.sin(t * 0.04) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.0, -10]}>
      {/* Primary wireframe holographic sphere */}
      <mesh>
        <sphereGeometry args={[5.0, 24, 24]} />
        <meshBasicMaterial color={isDark ? "#0055ff" : "#93c5fd"} wireframe transparent opacity={isDark ? 0.07 : 0.15} />
      </mesh>
      
      {/* Outer particle rings */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[5.6, 5.64, 64]} />
        <meshBasicMaterial color={isDark ? "#00ffcc" : "#60a5fa"} transparent opacity={isDark ? 0.1 : 0.2} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 5, Math.PI / 3, 0]}>
        <ringGeometry args={[6.2, 6.23, 64]} />
        <meshBasicMaterial color={isDark ? "#8800ff" : "#c084fc"} transparent opacity={isDark ? 0.08 : 0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function Global3DBackdrop() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#02050a]' : 'bg-slate-50'} pointer-events-none w-full h-full overflow-hidden transition-colors duration-500`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={isDark ? 0.3 : 0.75} color={isDark ? "#051c3d" : "#e0f2fe"} />
        <pointLight position={[10, 10, 10]} intensity={isDark ? 0.45 : 0.8} color={isDark ? "#00ffff" : "#3b82f6"} />
        
        {/* Subtle grid base in the background */}
        <gridHelper 
          args={[40, 24, isDark ? '#0055ff' : '#cbd5e1', isDark ? '#02183b' : '#f1f5f9']} 
          position={[0, -5.5, 0]} 
          opacity={isDark ? 0.12 : 0.25} 
          transparent 
        />
        
        <ParticleCloud isDark={isDark} />
        <Hologlobe isDark={isDark} />
      </Canvas>
      
      {/* Vignette & scanline layers */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${isDark ? 'bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,5,10,0.85)_95%)]' : 'bg-[radial-gradient(circle_at_center,transparent_35%,rgba(248,250,252,0.95)_95%)]'}`} />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px'
        }}
      />
    </div>
  );
}
