import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const Portal = ({ mousePosition, scrollProgress }: { mousePosition: { x: number; y: number }, scrollProgress: number }) => {
  const portalRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (portalRef.current) {
      // Rotate portal slowly
      portalRef.current.rotation.z = state.clock.getElapsedTime() * 0.2;
      
      // Mouse movement influence
      portalRef.current.rotation.x = mousePosition.y * 0.3;
      portalRef.current.rotation.y = mousePosition.x * 0.3;
      
      // Scroll-based scaling and glow
      const scale = 1 + scrollProgress * 0.5;
      portalRef.current.scale.setScalar(scale);
    }

    if (glowRef.current) {
      glowRef.current.intensity = 2 + scrollProgress * 3;
    }
  });

  return (
    <group>
      <pointLight ref={glowRef} position={[0, 0, 0]} color="#a855f7" intensity={2} distance={10} />
      <Torus ref={portalRef} args={[2, 0.6, 32, 100]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5 + scrollProgress * 0.5}
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.9}
        />
      </Torus>
      
      {/* Inner glow ring */}
      <Torus args={[2, 0.1, 16, 100]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} />
      </Torus>
    </group>
  );
};

const PortalScene3D = () => {
  const mousePosition = useRef({ x: 0, y: 0 });
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 1000;
      scrollProgress.current = Math.min(scrollY / maxScroll, 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.2} />
        <Portal mousePosition={mousePosition.current} scrollProgress={scrollProgress.current} />
      </Canvas>
    </div>
  );
};

export default PortalScene3D;
