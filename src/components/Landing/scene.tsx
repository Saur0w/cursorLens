"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import LensMesh from "./mesh";

interface SceneProps {
  mouse: React.RefObject<{ x: number; y: number; hover: boolean }>;
}

export default function Scene({ mouse }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <LensMesh mouse={mouse} />
      </Suspense>
    </Canvas>
  );
}
