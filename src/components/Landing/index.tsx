"use client";

import styles from "./style.module.scss";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene"), { ssr: false });

gsap.registerPlugin(useGSAP);

export default function Landing() {
  const containerRef = useRef<HTMLElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  // Mouse coordinate ref (normalized 0 to 1, with UV y flipped)
  const mouseRef = useRef({ x: 0.5, y: 0.5, hover: false });

  useGSAP(
    () => {
      gsap.fromTo(
        bgImageRef.current,
        { opacity: 0, scale: 1.08 },
        {
          opacity: 0.35,
          scale: 1,
          duration: 1.4,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef }
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    // Flip Y for WebGL UV space
    const y = 1 - (e.clientY - rect.top) / rect.height;
    mouseRef.current = { x, y, hover: true };
  };

  const handleMouseEnter = () => {
    mouseRef.current.hover = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.hover = false;
  };

  return (
    <section
      className={styles.landing}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.background}>
        <Image
          ref={bgImageRef}
          src="/images/main.jpg"
          alt="Landing background"
          fill
          priority
          sizes="100vw"
        />
      </div>

      <div className={styles.canvasWrapper}>
        <Scene mouse={mouseRef} />
      </div>

      <div className={styles.heading}>
        <h1>THE SHAPE OF DIGITAL OPTICS</h1>
      </div>
    </section>
  );
}