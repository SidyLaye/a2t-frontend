"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

function Orb() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.3} roughness={0.1} metalness={0.9} distort={0.3} speed={3} transparent opacity={0.7} />
      </mesh>
    </Float>
  );
}

function Rings() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    group.current.rotation.z = state.clock.elapsedTime * 0.15;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
  });

  return (
    <group ref={group}>
      {[1.4, 1.7, 2.0].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, i * 0.5, 0]}>
          <torusGeometry args={[radius, 0.01, 16, 100]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#7c3aed" emissiveIntensity={0.5} transparent opacity={0.4 - i * 0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function DashboardOrb() {
  return (
    <div className="w-[300px] h-[300px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={0.6} color="#6366f1" />
        <pointLight position={[-3, -3, 3]} intensity={0.3} color="#8b5cf6" />
        <Orb />
        <Rings />
      </Canvas>
    </div>
  );
}
