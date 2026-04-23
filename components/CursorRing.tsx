"use client";

import { useEffect, useRef } from "react";

export default function CursorRing() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Skip on touch / coarse pointer devices
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    let rx = -100;
    let ry = -100;
    let dx = -100;
    let dy = -100;
    let tx = -100;
    let ty = -100;
    let hovering = false;
    let raf = 0;

    const interactiveSelector = "a, button, [role='button'], input, textarea, [data-hover]";

    function onMove(e: MouseEvent) {
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as Element | null;
      const nextHover = !!target?.closest?.(interactiveSelector);
      if (nextHover !== hovering) {
        hovering = nextHover;
        ringRef.current?.setAttribute("data-hover", nextHover ? "true" : "false");
      }
    }
    function onLeaveWindow() {
      tx = -100;
      ty = -100;
    }

    function tick() {
      dx += (tx - dx) * 0.4;
      dy += (ty - dy) * 0.4;
      rx += (tx - rx) * 0.14;
      ry += (ty - ry) * 0.14;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeaveWindow);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeaveWindow);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid"
        style={{ mixBlendMode: "difference", willChange: "transform" }}
      />
      <div
        ref={ringRef}
        aria-hidden
        data-hover="false"
        className="pointer-events-none fixed left-0 top-0 z-[299] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/50 transition-[width,height,border-color,background-color] duration-200 ease-out data-[hover=true]:h-12 data-[hover=true]:w-12 data-[hover=true]:border-acid data-[hover=true]:bg-acid/10"
        style={{ willChange: "transform", transformOrigin: "center" }}
      />
    </>
  );
}
