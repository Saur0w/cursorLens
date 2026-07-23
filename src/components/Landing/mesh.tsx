"use client";

import React, { useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { LensShaderMaterial } from "@/lib/Shaders";

interface LensMeshProps {
  mouse: React.RefObject<{ x: number; y: number; hover: boolean }>;
}

export default function LensMesh({ mouse }: LensMeshProps) {
  const { viewport } = useThree();
  const texture = useTexture("/images/main.jpg");
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Target values for smooth lerp interpolation
  const currentMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const currentHover = useRef(0);

  const coverScale = useMemo(() => {
    if (!texture?.image) return new THREE.Vector2(1, 1);
    const img = texture.image as HTMLImageElement | ImageBitmap;
    const screenAspect = viewport.width / viewport.height;
    const imageAspect = img.width && img.height ? img.width / img.height : 1;

    if (screenAspect > imageAspect) {
      return new THREE.Vector2(1, imageAspect / screenAspect);
    } else {
      return new THREE.Vector2(screenAspect / imageAspect, 1);
    }
  }, [viewport.width, viewport.height, texture]);

  const uniforms = useMemo(() => {
    return {
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uRadius: { value: 0.18 },
      uSmoothness: { value: 0.08 },
      uAspect: { value: viewport.width / viewport.height },
      uCoverScale: { value: coverScale },
      uTime: { value: 0 },
      uDistortion: { value: 0.04 },
      uAberration: { value: 0.015 },
    };
  }, [texture, viewport.width, viewport.height, coverScale]);

  useFrame((state) => {
    if (!materialRef.current) return;

    const targetX = mouse.current?.x ?? 0.5;
    const targetY = mouse.current?.y ?? 0.5;
    const targetHover = mouse.current?.hover ? 1 : 0;

    // Smooth lerp movement (0.12 damping factor for silky cursor motion)
    currentMouse.current.x += (targetX - currentMouse.current.x) * 0.12;
    currentMouse.current.y += (targetY - currentMouse.current.y) * 0.12;
    currentHover.current += (targetHover - currentHover.current) * 0.1;

    const mat = materialRef.current;
    mat.uniforms.uMouse.value.copy(currentMouse.current);
    mat.uniforms.uHover.value = currentHover.current;
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    mat.uniforms.uAspect.value = viewport.width / viewport.height;
    mat.uniforms.uCoverScale.value.copy(coverScale);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width, viewport.height, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        args={[LensShaderMaterial]}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
