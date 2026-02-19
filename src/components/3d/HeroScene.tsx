"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

function AnimatedTorus() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.15;
    ref.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.35, 128, 32]} />
        <MeshDistortMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.4} roughness={0.2} metalness={0.8} distort={0.2} speed={2} />
      </mesh>
    </Float>
  );
}

function FloatingPolyhedra() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    group.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  const positions: [number, number, number][] = [
    [-2.5, 1.5, -1], [2.8, -1.2, -0.5], [-1.8, -1.8, 0.5], [3, 1.8, -1.5], [-3, 0, -2],
  ];

  return (
    <group ref={group}>
      {positions.map((pos, i) => (
        <Float key={i} speed={1 + i * 0.3} floatIntensity={0.5} rotationIntensity={0.3}>
          <mesh position={pos} scale={0.15 + i * 0.05}>
            {i % 3 === 0 ? <octahedronGeometry /> : i % 3 === 1 ? <icosahedronGeometry /> : <dodecahedronGeometry />}
            <meshStandardMaterial color={i % 2 === 0 ? "#8b5cf6" : "#6366f1"} emissive={i % 2 === 0 ? "#7c3aed" : "#4f46e5"} emissiveIntensity={0.3} transparent opacity={0.8} roughness={0.3} metalness={0.7} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, -3, 2]} intensity={0.5} color="#8b5cf6" />
        <AnimatedTorus />
        <FloatingPolyhedra />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0005, 0.0005)} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
