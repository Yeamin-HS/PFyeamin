import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface ShootingStar {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

const Stars = ({ mousePosition, scrollSpeed }: { mousePosition: { x: number; y: number }, scrollSpeed: number }) => {
  const starsRef = useRef<THREE.Points>(null);
  const shootingStarsRef = useRef<THREE.LineSegments>(null);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const { camera } = useThree();

  const starPositions = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (starsRef.current) {
      // Camera moves forward through space
      camera.position.z -= (0.5 + scrollSpeed * 5) * delta;
      
      // Reset position when too far
      if (camera.position.z < -1000) {
        camera.position.z = 0;
      }

      // Smooth camera rotation based on mouse
      camera.rotation.x = THREE.MathUtils.lerp(
        camera.rotation.x,
        mousePosition.y * 0.1,
        0.05
      );
      camera.rotation.y = THREE.MathUtils.lerp(
        camera.rotation.y,
        mousePosition.x * 0.1,
        0.05
      );
    }

    // Update shooting stars
    setShootingStars(prev => {
      const updated = prev
        .map(star => ({
          ...star,
          position: star.position.clone().add(star.velocity.clone().multiplyScalar(delta)),
          life: star.life - delta
        }))
        .filter(star => star.life > 0);

      // Spawn new shooting stars randomly (increased frequency during scroll)
      if (Math.random() < (0.02 + scrollSpeed * 0.05)) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 500 + Math.random() * 500;
        const newStar: ShootingStar = {
          position: new THREE.Vector3(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 800,
            camera.position.z - 100 - Math.random() * 200
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 150,
            -100 - Math.random() * 100,
            -50 - Math.random() * 50
          ),
          life: 2 + Math.random() * 2,
          maxLife: 2 + Math.random() * 2
        };
        updated.push(newStar);
      }

      return updated;
    });

    // Update shooting star geometry
    if (shootingStarsRef.current && shootingStars.length > 0) {
      const positions: number[] = [];
      const colors: number[] = [];

      shootingStars.forEach(star => {
        const lifeRatio = star.life / star.maxLife;
        const tailLength = 50 * lifeRatio;
        const tailEnd = star.position.clone().sub(
          star.velocity.clone().normalize().multiplyScalar(tailLength)
        );

        // Start point
        positions.push(star.position.x, star.position.y, star.position.z);
        colors.push(1, 1, 1);

        // End point (tail)
        positions.push(tailEnd.x, tailEnd.y, tailEnd.z);
        colors.push(0.4, 0.6, 1);
      });

      const geometry = shootingStarsRef.current.geometry;
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Static stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          color="#ffffff"
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
        />
      </points>

      {/* Shooting stars */}
      <lineSegments ref={shootingStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={0}
            array={new Float32Array(0)}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={0}
            array={new Float32Array(0)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors={true}
          transparent={true}
          opacity={0.8}
          linewidth={2}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
};

const SpaceStarfield = () => {
  const mousePosition = useRef({ x: 0, y: 0 });
  const scrollSpeed = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 2000;
      scrollSpeed.current = Math.min(scrollY / maxScroll, 1);
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
      <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
        <color attach="background" args={['#000000']} />
        <Stars mousePosition={mousePosition.current} scrollSpeed={scrollSpeed.current} />
      </Canvas>
    </div>
  );
};

export default SpaceStarfield;
