"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = "power3.out";

export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  groups = [],
  y = 40,
  duration = 0.8,
  delay = 0,
  start = "top 85%",
  once = true,
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      groups.forEach((g) => {
        gsap.from(g.selector, {
          y: g.y ?? y,
          autoAlpha: 0,
          duration: g.duration ?? duration,
          delay: g.delay ?? delay,
          stagger: g.stagger ?? 0,
          ease: EASE,
          scrollTrigger: {
            trigger: ref.current,
            start: g.start ?? start,
            once,
          },
        });
      });
    },
    { scope: ref, revertOnUpdate: true }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}