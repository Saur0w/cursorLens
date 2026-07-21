"use client";

import styles from "./style.module.scss";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

const NAV_LINKS = [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact"}
] as const;

export default function Header() {
    const headerRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const navLinksRef = useRef<HTMLUListElement>(null);

    useGSAP(() => {
        if (!headingRef.current) return;

        const tl = gsap.timeline();

        SplitText.create(headingRef.current, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
                const anim = gsap.from(self.lines, {
                    yPercent: 110,
                    duration: 1,
                    stagger: 0.12,
                    ease: "power4.out",
                });
                tl.add(anim, 0);
                return anim;
            }
        });

        if (navLinksRef.current) {
            SplitText.create(navLinksRef.current.querySelectorAll("a"), {
                type: "lines",
                mask: "lines",
                autoSplit: true,
                onSplit: (self) => {
                    const anim = gsap.from(self.lines, {
                        yPercent: 110,
                        duration: 0.8,
                        stagger: 0.08,
                        ease: "power3.out",
                    });
                    tl.add(anim, 0.3);
                    return anim;
                }
            });
        }
    }, { scope: headerRef });

    return (
        <header className={styles.header} ref={headerRef}>
            <div className={styles.body}>
                <div className={styles.heading}>
                    <h1 ref={headingRef}><Link href="/">HALATION</Link></h1>
                </div>
                <nav className={styles.nav}>
                    <ul ref={navLinksRef}>
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    )
}