import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Floating Glass Icosahedron ───
const GlassIcosahedron: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5} floatingRange={[-0.2, 0.2]}>
            <mesh ref={meshRef} position={[0, 0, 0]} scale={2.2}>
                <icosahedronGeometry args={[1, 1]} />
                <MeshTransmissionMaterial
                    backside
                    samples={6}
                    thickness={0.5}
                    chromaticAberration={0.3}
                    anisotropy={0.3}
                    distortion={0.2}
                    distortionScale={0.3}
                    temporalDistortion={0.1}
                    iridescence={1}
                    iridescenceIOR={1}
                    iridescenceThicknessRange={[0, 1400]}
                    color="#4f9cf8"
                    roughness={0.1}
                />
            </mesh>
        </Float>
    );
};

// ─── Orbiting Torus ───
const OrbitingTorus: React.FC<{ orbitRadius: number; speed: number; size: number; color: string }> = ({
    orbitRadius, speed, size, color
}) => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime * speed;
        meshRef.current.position.x = Math.cos(t) * orbitRadius;
        meshRef.current.position.z = Math.sin(t) * orbitRadius;
        meshRef.current.position.y = Math.sin(t * 0.5) * 0.5;
        meshRef.current.rotation.x = t * 0.5;
        meshRef.current.rotation.z = t * 0.3;
    });

    return (
        <mesh ref={meshRef} scale={size}>
            <torusGeometry args={[1, 0.35, 16, 32]} />
            <MeshDistortMaterial
                color={color}
                roughness={0.15}
                metalness={0.9}
                distort={0.15}
                speed={2}
            />
        </mesh>
    );
};

// ─── Floating Octahedron ───
const FloatingOctahedron: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} position={position} scale={0.5}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.95}
                    roughness={0.05}
                    emissive={color}
                    emissiveIntensity={0.15}
                />
            </mesh>
        </Float>
    );
};

// ─── Particle Field ───
const ParticleField: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null!);
    const count = 600;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, []);

    useFrame((state) => {
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
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
                size={0.03}
                color="#60a5fa"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
};

// ─── Main 3D Scene ───
const HeroScene: React.FC = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 7], fov: 45 }}
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
            <fog attach="fog" args={['#000000', 5, 25]} />

            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
            <pointLight position={[-5, 3, -5]} intensity={0.8} color="#3b82f6" />
            <pointLight position={[3, -2, 5]} intensity={0.5} color="#06b6d4" />
            <pointLight position={[0, 5, 0]} intensity={0.3} color="#8b5cf6" />

            {/* 3D Objects */}
            <GlassIcosahedron />
            <OrbitingTorus orbitRadius={3.5} speed={0.4} size={0.35} color="#3b82f6" />
            <OrbitingTorus orbitRadius={4.2} speed={-0.3} size={0.25} color="#06b6d4" />
            <FloatingOctahedron position={[-3, 1.5, -2]} color="#8b5cf6" />
            <FloatingOctahedron position={[3.5, -1, -1]} color="#06b6d4" />
            <FloatingOctahedron position={[-2, -2, 1]} color="#3b82f6" />
            <ParticleField />
        </Canvas>
    );
};

export default HeroScene;
