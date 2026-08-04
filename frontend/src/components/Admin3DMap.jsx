import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

// Procedural Heightmap Terrain Elevation using layered sine waves
export const getTerrainHeight = (x, z) => {
  const n1 = Math.sin(x * 0.22) * Math.cos(z * 0.22) * 2.2;
  const n2 = Math.sin(x * 0.55 + 1.2) * Math.cos(z * 0.5 - 1.8) * 0.7;
  const n3 = Math.sin(x * 1.2) * Math.cos(z * 1.4) * 0.15;
  
  let h = n1 + n2 + n3;
  
  // Flatten center coordinate area for visual clean layout
  const d = Math.sqrt(x * x + z * z);
  if (d < 5.0) {
    const factor = d / 5.0;
    h *= (factor * factor);
  }
  return h;
};

// Map real India coordinates (lat, lng) to the 3D local coordinate space bounds
export const mapGeoTo3D = (lat, lng) => {
  const minLat = 12.0;
  const maxLat = 30.0;
  const minLng = 70.0;
  const maxLng = 79.5;
  
  const x = ((lng - minLng) / (maxLng - minLng)) * 24 - 12;
  const z = -(((lat - minLat) / (maxLat - minLat)) * 24 - 12);
  const y = getTerrainHeight(x, z);
  
  return [x, y, z];
};

// Custom Holographic wireframe shader for energy lines & topographical contour scans
const HolographicShader = {
  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    void main() {
      vPosition = position;
      vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    uniform float uTime;
    uniform vec3 uRippleCenter;
    uniform float uRippleTime;
    uniform float uIsDark;

    void main() {
      // Flowing energy grid pulses
      float pulseX = sin(vPosition.x * 1.0 - uTime * 2.5);
      float pulseZ = cos(vPosition.z * 1.0 + uTime * 1.8);
      float pulseY = sin(vPosition.y * 3.0 - uTime * 4.0);
      
      float wave = smoothstep(0.88, 1.0, pulseX * pulseZ * 0.5 + 0.5);

      // Advanced topographical contour line bands (sin wave on height position.y)
      float contour = sin(vPosition.y * 10.0);
      float contourLine = smoothstep(0.96, 1.0, contour * 0.5 + 0.5);
      
      // Terrain click expansion ripple math
      float dist = distance(vPosition, uRippleCenter);
      float ripple = 0.0;
      if (uRippleTime >= 0.0 && uRippleTime < 3.0) {
        float waveFront = uRippleTime * 8.0;
        ripple = smoothstep(waveFront - 0.9, waveFront, dist) * smoothstep(waveFront + 0.9, waveFront, dist);
      }
      
      vec3 baseBlue = mix(vec3(0.1, 0.35, 0.75), vec3(0.0, 0.40, 0.90), uIsDark);
      vec3 neonPulse = mix(vec3(0.15, 0.6, 0.9), mix(vec3(0.0, 0.95, 1.0), vec3(0.85, 0.0, 1.0), ripple), uIsDark);
      
      // Combine normal flowing wireframe, contours, and click ripples
      vec3 finalColor = mix(baseBlue, neonPulse, wave + contourLine * 0.35 + ripple * 0.7);
      float alpha = mix(uIsDark * 0.12 + 0.06, 0.95, wave + pulseY * 0.08 + contourLine * 0.15 + ripple * 0.65);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

function Terrain({ rippleCenterRef, rippleTimeRef, onTerrainClick, onTerrainMove }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const shaderRef = useRef(null);
  
  const geom = useMemo(() => {
    const size = 32;
    const segments = 95;
    const g = new THREE.PlaneGeometry(size, size, segments, segments);
    
    g.rotateX(-Math.PI / 2);
    
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z);
      pos.setY(i, y);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((state) => {
    if (rippleTimeRef.current >= 0.0 && rippleTimeRef.current < 3.0) {
      rippleTimeRef.current += 0.045;
    }

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderRef.current.uniforms.uRippleCenter.value.copy(rippleCenterRef.current);
      shaderRef.current.uniforms.uRippleTime.value = rippleTimeRef.current;
      shaderRef.current.uniforms.uIsDark.value = isDark ? 1.0 : 0.0;
    }
  });

  return (
    <group>
      <mesh 
        geometry={geom} 
        receiveShadow 
        castShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          onTerrainClick(e.point);
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          onTerrainMove(e.point);
        }}
      >
        <meshStandardMaterial
          color={isDark ? "#050a12" : "#e2e8f0"}
          roughness={isDark ? 0.65 : 0.4}
          metalness={isDark ? 0.92 : 0.15}
          flatShading={true}
        />
      </mesh>
      
      <mesh geometry={geom}>
        <shaderMaterial
          ref={shaderRef}
          vertexShader={HolographicShader.vertexShader}
          fragmentShader={HolographicShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uRippleCenter: { value: new THREE.Vector3() },
            uRippleTime: { value: -1.0 },
            uIsDark: { value: isDark ? 1.0 : 0.0 }
          }}
          wireframe
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function EnergyPaths() {
  const routes = useMemo(() => {
    return [
      [[-9, -9], [-5, -4], [-1, -1], [3, 2], [7, 6], [10, 10]],
      [[-11, 4], [-6, 5], [0, 1], [5, -3], [8, -7]],
      [[-4, 8], [-1, 3], [3, -1], [6, 4], [9, 7]]
    ];
  }, []);

  return (
    <group>
      {routes.map((path, idx) => (
        <CyberRoute key={idx} points={path} color={idx === 2 ? "#ff5500" : idx === 1 ? "#00ffcc" : "#00a2ff"} />
      ))}
    </group>
  );
}

function CyberRoute({ points, color }) {
  const lineRef = useRef(null);

  const tubeGeom = useMemo(() => {
    const coords = points.map(pt => {
      const x = pt[0];
      const z = pt[1];
      const y = getTerrainHeight(x, z) + 0.1;
      return new THREE.Vector3(x, y, z);
    });
    const curve = new THREE.CatmullRomCurve3(coords);
    return new THREE.TubeGeometry(curve, 64, 0.035, 6, false);
  }, [points]);

  useFrame((state) => {
    if (lineRef.current) {
      const t = state.clock.getElapsedTime();
      const material = lineRef.current.material;
      material.opacity = 0.35 + Math.sin(t * 3.5) * 0.15;
    }
  });

  return (
    <mesh geometry={tubeGeom} ref={lineRef}>
      <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
    </mesh>
  );
}

function CoreAtmosphereParticles() {
  const count = 2500;
  
  const floatGeomRef = useRef(null);
  const [floatPos, floatSpd] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = Math.random() * 15 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 36;
      spd[i] = Math.random() * 0.018 + 0.008;
    }
    return [pos, spd];
  }, []);

  const rainGeomRef = useRef(null);
  const [rainPos, rainSpd] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = Math.random() * 15 + 2.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 36;
      spd[i] = Math.random() * 0.09 + 0.06;
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (floatGeomRef.current) {
      const posAttr = floatGeomRef.current.attributes.position;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i);
        y += floatSpd[i];
        if (y > 16) y = 0.5;
        posAttr.setY(i, y);

        let x = posAttr.getX(i);
        x += Math.sin(elapsed * 0.4 + i) * 0.004;
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;
    }

    if (rainGeomRef.current) {
      const posAttr = rainGeomRef.current.attributes.position;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i);
        y -= rainSpd[i];
        
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        const groundY = getTerrainHeight(x, z);
        if (y <= groundY + 0.1) {
          y = 15.5;
        }
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      <points>
        <bufferGeometry ref={floatGeomRef}>
          <bufferAttribute attach="attributes-position" args={[floatPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#00ffff"
          size={0.1}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry ref={rainGeomRef}>
          <bufferAttribute attach="attributes-position" args={[rainPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#0088ff"
          size={0.065}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function FloatingHoloObjects() {
  const objects = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      pos: [
        (Math.random() - 0.5) * 26,
        Math.random() * 6 + 3,
        (Math.random() - 0.5) * 26
      ],
      sz: Math.random() * 0.28 + 0.08,
      isHex: Math.random() > 0.5,
      speed: [Math.random() * 0.012, Math.random() * 0.012, Math.random() * 0.012]
    }));
  }, []);

  return (
    <group>
      {objects.map((obj) => (
        <FloatingMesh key={obj.id} obj={obj} />
      ))}
    </group>
  );
}

function FloatingMesh({ obj }) {
  const meshRef = useRef(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += obj.speed[0];
      meshRef.current.rotation.y += obj.speed[1];
      meshRef.current.rotation.z += obj.speed[2];
      meshRef.current.position.y += Math.sin(Date.now() * 0.001 + obj.id) * 0.0022;
    }
  });

  return (
    <mesh ref={meshRef} position={obj.pos}>
      {obj.isHex ? (
        <cylinderGeometry args={[obj.sz, obj.sz, 0.08, 6]} />
      ) : (
        <boxGeometry args={[obj.sz, obj.sz, obj.sz]} />
      )}
      <meshBasicMaterial
        color="#00ccff"
        wireframe
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </mesh>
  );
}

function Satellites() {
  return (
    <group>
      <Satellite orbitRadius={13.5} speed={0.16} color="#00e5ff" />
      <Satellite orbitRadius={10.0} speed={-0.2} color="#8800ff" />
    </group>
  );
}

function Satellite({ orbitRadius, speed, color }) {
  const ref = useRef(null);
  const coneRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const angle = t * speed;
    const x = Math.sin(angle) * orbitRadius;
    const z = Math.cos(angle) * orbitRadius;
    const y = 9.5 + Math.sin(t * 0.6) * 1.0;
    
    if (ref.current) {
      ref.current.position.set(x, y, z);
      ref.current.rotation.y = angle + Math.PI / 2;
    }
    if (coneRef.current) {
      const mat = coneRef.current.material;
      mat.opacity = 0.05 + Math.sin(t * 4.5) * 0.025;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.26, 0.12, 0.26]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0.35, 0, 0]}>
        <boxGeometry args={[0.32, 0.015, 0.12]} />
        <meshBasicMaterial color="#0044ff" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.35, 0, 0]}>
        <boxGeometry args={[0.32, 0.015, 0.12]} />
        <meshBasicMaterial color="#0044ff" transparent opacity={0.7} />
      </mesh>
      <mesh ref={coneRef} position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.02, 1.6, 5.0, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function DronePatrols() {
  return (
    <group>
      <DronePatrol index={0} color="#00ff66" />
      <DronePatrol index={1} color="#ff9000" />
    </group>
  );
}

function DronePatrol({ index, color }) {
  const ref = useRef(null);
  const coneRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + index * 12.0;
    const range = 7.0;
    const x = Math.sin(t * 0.35) * range;
    const z = Math.sin(t * 0.7) * (range * 0.5);
    const y = getTerrainHeight(x, z) + 3.0 + Math.sin(t * 2.0) * 0.2;

    if (ref.current) {
      ref.current.position.set(x, y, z);
      ref.current.rotation.y = t * 0.4;
    }
    if (coneRef.current) {
      const mat = coneRef.current.material;
      mat.opacity = 0.08 + Math.sin(t * 5.0) * 0.035;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.26, 0.03, 0.26]} />
        <meshBasicMaterial color="#0b172a" />
      </mesh>
      <mesh position={[0.18, 0.02, 0.18]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[-0.18, 0.02, 0.18]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0.18, 0.02, -0.18]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[-0.18, 0.02, -0.18]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={coneRef} position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.01, 0.55, 2.4, 12, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function HoloGlobe() {
  const groupRef = useRef(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.18;
    }
  });

  return (
    <group ref={groupRef} position={[12, 7.5, -12]}>
      <mesh>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.7, 1.74, 48]} />
        <meshBasicMaterial color="#0088ff" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CursorTracker({ mouseRef }) {
  const lightRef = useRef(null);
  const ringRef = useRef(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(mouseRef.current);
    }
    if (ringRef.current) {
      ringRef.current.position.copy(mouseRef.current);
      ringRef.current.position.y -= 0.3;
    }
  });

  return (
    <group>
      <pointLight ref={lightRef} color="#00ffcc" intensity={0.85} distance={5.5} decay={2} />
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.3, 16]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function SOSSpotlight({ tourist }) {
  const [x, y, z] = useMemo(() => mapGeoTo3D(tourist.lat, tourist.lng), [tourist.lat, tourist.lng]);
  const lightRef = useRef(null);
  const ringRef = useRef(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.intensity = 2.0 + Math.sin(elapsed * 7.5) * 0.9;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = elapsed * 1.5;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <pointLight ref={lightRef} position={[0, 4.0, 0]} color="#ff1133" intensity={2.5} distance={9} decay={1.5} />
      <mesh position={[0, 4.0, 0]}>
        <cylinderGeometry args={[0.08, 1.4, 8.0, 16, 1, true]} />
        <meshBasicMaterial color="#ff1133" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <group ref={ringRef} position={[0, 0.15, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.65, 0.7, 16]} />
          <meshBasicMaterial color="#ff1133" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function GeofenceZone({ zone }) {
  const [x, y, z] = useMemo(() => mapGeoTo3D(zone.lat, zone.lng), [zone.lat, zone.lng]);
  const cylinderRef = useRef(null);
  const scannerRef = useRef(null);
  
  const radius = useMemo(() => {
    const r = Number(zone.radius) || 1000;
    return Math.max(1.0, Math.min(5.5, r / 350));
  }, [zone.radius]);

  const isHighDanger = zone.safetyScore < 50 || zone.crimeIndex === 'High';
  const color = isHighDanger ? '#ff3344' : '#ff9400';

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (cylinderRef.current) {
      const mat = cylinderRef.current.material;
      mat.opacity = 0.06 + Math.sin(elapsed * 2.5) * 0.03;
    }
    if (scannerRef.current) {
      scannerRef.current.rotation.y = elapsed * 1.8;
    }
  });

  return (
    <group position={[x, y, z]}>
      <mesh ref={cylinderRef} position={[0, 1.8, 0]}>
        <cylinderGeometry args={[radius, radius, 3.6, 24, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[radius - 0.04, radius + 0.04, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[radius, radius + 0.25, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <group ref={scannerRef} position={[0, 0.1, 0]}>
        <mesh position={[radius / 2, 0, 0]}>
          <boxGeometry args={[radius, 0.015, 0.015]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function Beacon({ tourist, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [x, y, z] = useMemo(() => mapGeoTo3D(tourist.lat, tourist.lng), [tourist.lat, tourist.lng]);

  const platRef = useRef(null);
  const ringRef1 = useRef(null);
  const ringRef2 = useRef(null);
  const beamRef = useRef(null);
  const orbRef = useRef(null);

  const isSOS = tourist.status === 'sos';
  const isWarning = tourist.status === 'warning';
  
  const color = isSOS ? '#ff2a36' : isWarning ? '#ff8c00' : '#00ff66';
  const pulseSpeed = isSOS ? 6.5 : isWarning ? 3.5 : 1.8;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (platRef.current) {
      platRef.current.rotation.y = t * 0.45;
    }

    if (orbRef.current) {
      orbRef.current.position.y = 1.0 + Math.sin(t * pulseSpeed) * 0.12;
      const baseScale = hovered ? 1.4 : 1.0;
      const pulseScalar = baseScale + Math.sin(t * pulseSpeed * 2) * (isSOS ? 0.22 : 0.06);
      orbRef.current.scale.setScalar(pulseScalar);
    }

    if (ringRef1.current) {
      const s1 = (t * (pulseSpeed * 0.35)) % 2.8;
      ringRef1.current.scale.set(s1, s1, 1);
      const mat = ringRef1.current.material;
      mat.opacity = Math.max(0, 1.0 - s1 / 2.8) * 0.85;
    }

    if (ringRef2.current) {
      const s2 = ((t * (pulseSpeed * 0.35)) + 1.4) % 2.8;
      ringRef2.current.scale.set(s2, s2, 1);
      const mat = ringRef2.current.material;
      mat.opacity = Math.max(0, 1.0 - s2 / 2.8) * 0.85;
    }

    if (beamRef.current) {
      const mat = beamRef.current.material;
      mat.opacity = (0.2 + Math.sin(t * 5.0) * 0.1) * (isSOS ? 1.6 : 0.8);
    }
  });

  return (
    <group
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(tourist);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <mesh ref={platRef} position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.12, 6]} />
        <meshStandardMaterial
          color="#0d1f3b"
          roughness={0.4}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={hovered ? 0.55 : 0.15}
        />
      </mesh>

      <mesh ref={orbRef} position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      <mesh position={[0, 1.0, 0]} scale={0.45}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh ref={beamRef} position={[0, isSOS ? 4.0 : 2.2, 0]}>
        <cylinderGeometry args={[0.06, isSOS ? 0.35 : 0.16, isSOS ? 8.0 : 4.4, 12, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ringRef1} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
        <ringGeometry args={[0.42, 0.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={ringRef2} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
        <ringGeometry args={[0.42, 0.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]}>
          <ringGeometry args={[0.7, 0.8, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function CameraRig({ selectedTourist, resetSignal, onResetDone, isIntroActive, setIsIntroActive }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const lerpSpeed = 0.055;

    const mx = state.mouse.x * 2.2;
    const my = state.mouse.y * 1.8;

    if (isIntroActive) {
      const radius = 26 - elapsed * 1.25;
      const angle = elapsed * 0.28;
      
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = 30 - elapsed * 3.2;
      
      controls.target.set(0, 0, 0);
      controls.update();

      if (elapsed >= 4.0) {
        setIsIntroActive(false);
      }
      return;
    }

    if (resetSignal) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, lerpSpeed);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 16, lerpSpeed);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 16, lerpSpeed);
      controls.target.x = THREE.MathUtils.lerp(controls.target.x, 0, lerpSpeed);
      controls.target.y = THREE.MathUtils.lerp(controls.target.y, 0, lerpSpeed);
      controls.target.z = THREE.MathUtils.lerp(controls.target.z, 0, lerpSpeed);
      controls.update();

      const dist = camera.position.distanceTo(new THREE.Vector3(0, 16, 16));
      if (dist < 0.1) {
        onResetDone();
      }
      return;
    }

    if (selectedTourist) {
      const [tx, ty, tz] = mapGeoTo3D(selectedTourist.lat, selectedTourist.lng);
      const targetPos = new THREE.Vector3(tx, ty + 3.0, tz + 4.5);
      
      camera.position.lerp(targetPos, lerpSpeed);
      controls.target.lerp(new THREE.Vector3(tx, ty + 0.5, tz), lerpSpeed);
      controls.update();
    } else {
      camera.position.x += (mx - camera.position.x + 12) * 0.01;
      camera.position.z += (Math.sin(elapsed * 0.1) * 3 - camera.position.z + 12) * 0.01;
      controls.update();
    }
  });

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.2} minDistance={4.5} maxDistance={28} />;
}

export default function Admin3DMap({ tourists, selectedTourist, setSelectedTourist, resetSignal, onResetDone, zones }) {
  const mouseRef = useRef(new THREE.Vector3());
  const rippleCenterRef = useRef(new THREE.Vector3());
  const rippleTimeRef = useRef(-1.0);

  const [isIntroActive, setIsIntroActive] = useState(true);

  const handleTerrainClick = (point) => {
    rippleCenterRef.current.copy(point);
    rippleTimeRef.current = 0.0;
  };

  const handleTerrainMove = (point) => {
    mouseRef.current.copy(point);
  };

  const activeSOSList = useMemo(() => {
    return tourists.filter(t => t.status === 'sos');
  }, [tourists]);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`w-full h-full min-h-[450px] relative rounded-2xl overflow-hidden border ${isDark ? 'border-slate-800/80 bg-[#02050a]' : 'border-slate-200 bg-slate-50'} shadow-2xl transition-colors duration-500`}>
      <Canvas
        camera={{ position: [0, 24, 24], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        shadows
        className="w-full h-full"
      >
        <ambientLight intensity={isDark ? 0.4 : 0.8} color={isDark ? "#051a3d" : "#e0f2fe"} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={isDark ? 0.8 : 1.25} 
          color={isDark ? "#00ffff" : "#3b82f6"} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />
        
        {isDark && activeSOSList.length > 0 && (
          <pointLight position={[0, 8, 0]} intensity={1.5} color="#ff0000" distance={30} decay={1.5} />
        )}
        
        <gridHelper 
          args={[32, 32, isDark ? '#0055ff' : '#3b82f6', isDark ? '#02183b' : '#cbd5e1']} 
          position={[0, -0.05, 0]} 
          opacity={isDark ? 0.08 : 0.16} 
          transparent 
        />
        
        <Terrain 
          rippleCenterRef={rippleCenterRef}
          rippleTimeRef={rippleTimeRef}
          onTerrainClick={handleTerrainClick}
          onTerrainMove={handleTerrainMove}
        />
        
        <EnergyPaths />
        <CoreAtmosphereParticles />
        <FloatingHoloObjects />
        <Satellites />
        <DronePatrols />
        <HoloGlobe />
        <CursorTracker mouseRef={mouseRef} />

        {activeSOSList.map((t) => (
          <SOSSpotlight key={t.id} tourist={t} />
        ))}

        {zones.map((zone, idx) => (
          <GeofenceZone key={zone.id || idx} zone={zone} />
        ))}

        {tourists.map((t) => (
          <Beacon 
            key={t.id} 
            tourist={t} 
            isSelected={selectedTourist?.id === t.id}
            onClick={setSelectedTourist}
          />
        ))}

        <CameraRig 
          selectedTourist={selectedTourist}
          resetSignal={resetSignal}
          onResetDone={onResetDone}
          isIntroActive={isIntroActive}
          setIsIntroActive={setIsIntroActive}
        />
      </Canvas>
    </div>
  );
}
