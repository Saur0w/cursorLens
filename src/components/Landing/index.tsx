"use client";

import styles from "./style.module.scss";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export default function Landing() {
    const containerRef = useRef<HTMLElement>(null);
    const bgImageRef = useRef<HTMLImageElement>(null);

    useGSAP(() => {
        gsap.fromTo(
            bgImageRef.current,
            { opacity: 0, scale: 1.08 },
            {
                opacity: 0.6,
                scale: 1,
                duration: 1.4,
                ease: "power2.out",
            }
        );
    }, { scope: containerRef });

    return (
        <section className={styles.landing} ref={containerRef}>
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

            <div className={styles.heading}>
                <h1>THE SHAPE OF DIGITAL OPTICS</h1>
            </div>
        </section>
    );
}