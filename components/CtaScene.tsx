import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Floating Sphere with distortion ───
const FloatingSphere: React.FC<{ position: [number, number, number]; color: string; size: number; speed: number }> = ({ position, color, size, speed }) => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
        meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.4;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
            <mesh ref={meshRef} position={position} scale={size}>
                <sphereGeometry args={[1, 32, 32]} />
                <MeshDistortMaterial
                    color={color}
                    roughness={0.1}
                    metalness={0.9}
                    distort={0.3}
                    speed={2}
                />
            </mesh>
        </Float>
    );
};

// ─── Orbiting Ring ───
const OrbitingRing: React.FC<{ radius: number; speed: number; color: string }> = ({ radius, speed, color }) => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime * speed;
        meshRef.current.position.x = Math.cos(t) * radius;
        meshRef.current.position.z = Math.sin(t) * radius;
        meshRef.current.position.y = Math.sin(t * 0.7) * 0.3;
        meshRef.current.rotation.x = t * 0.5;
        meshRef.current.rotation.z = t * 0.3;
    });

    return (
        <mesh ref={meshRef} scale={0.3}>
            <torusGeometry args={[1, 0.3, 16, 32]} />
            <meshStandardMaterial
                color={color}
                metalness={0.95}
                roughness={0.05}
                emissive={color}
                emissiveIntensity={0.1}
            />
        </mesh>
    );
};

// ─── Particle Field ───
const CtaParticles: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null!);
    const count = 400;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 16;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
        }
        return pos;
    }, []);

    useFrame((state) => {
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
        pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.025}
                color="#8b5cf6"
                transparent
                opacity={0.5}
                sizeAttenuation
            />
        </points>
    );
};

// ─── Main CTA Scene ───
const CtaScene: React.FC = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 6], fov: 50 }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}
            gl={{ antialias: true, alpha: true }}
        >
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 4, 20]} />

            <ambientLight intensity={0.2} />
            <pointLight position={[3, 3, 3]} intensity={0.8} color="#3b82f6" />
            <pointLight position={[-3, -2, 2]} intensity={0.6} color="#8b5cf6" />
            <pointLight position={[0, 2, -3]} intensity={0.4} color="#06b6d4" />

            <FloatingSphere position={[-2.5, 1, -1]} color="#3b82f6" size={0.6} speed={0.5} />
            <FloatingSphere position={[2.8, -0.8, -2]} color="#8b5cf6" size={0.45} speed={0.7} />
            <FloatingSphere position={[0, -1.5, 0]} color="#06b6d4" size={0.35} speed={0.6} />
            <OrbitingRing radius={3} speed={0.3} color="#3b82f6" />
            <OrbitingRing radius={2.5} speed={-0.4} color="#8b5cf6" />
            <CtaParticles />
        </Canvas>
    );
};

export default CtaScene;
