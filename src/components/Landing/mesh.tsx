"use client";

import React, { useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const LensShaderMaterial = {
  uniforms: {
    uTexture: { value: null },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uRadius: { value: 0.18 },
    uSmoothness: { value: 0.08 },
    uAspect: { value: 1 },
    uCoverScale: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uDistortion: { value: 0.04 },
    uAberration: { value: 0.015 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform float uRadius;
    uniform float uSmoothness;
    uniform float uAspect;
    uniform vec2 uCoverScale;
    uniform float uTime;
    uniform float uDistortion;
    uniform float uAberration;

    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // Correct distance for viewport aspect ratio to keep circular shape
      vec2 aspectUV = vec2((uv.x - 0.5) * uAspect + 0.5, uv.y);
      vec2 aspectMouse = vec2((uMouse.x - 0.5) * uAspect + 0.5, uMouse.y);
      float dist = distance(aspectUV, aspectMouse);

      // Smooth circular lens reveal mask
      float mask = smoothstep(uRadius, uRadius - uSmoothness, dist) * uHover;

      if (mask <= 0.0005) {
        discard;
      }

      // Compute UV offset for object-fit: cover mapping
      vec2 coverUv = (uv - 0.5) * uCoverScale + 0.5;

      // Optical magnification / refraction distortion inside lens
      vec2 dir = normalize(uv - uMouse + vec2(0.00001));
      float factor = smoothstep(uRadius, 0.0, dist);
      vec2 distortedUv = coverUv - dir * (factor * uDistortion);

      // Chromatic Aberration (RGB shift) around the edge of the lens
      float edgeFactor = sin(factor * 3.14159265);
      vec2 rgbOffset = dir * (edgeFactor * uAberration);

      float r = texture2D(uTexture, distortedUv + rgbOffset).r;
      float g = texture2D(uTexture, distortedUv).g;
      float b = texture2D(uTexture, distortedUv - rgbOffset).b;

      vec3 color = vec3(r, g, b);

      gl_FragColor = vec4(color, mask);
    }
  `,
};

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
