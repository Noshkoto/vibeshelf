"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], input, textarea, [data-hover]";
const IDLE_SIZE = 18;
const HOVER_PAD = 8;

interface TargetState {
  x: number;
  y: number;
  w: number;
  h: number;
  hover: boolean;
  label: string | null;
}

export default function CursorRing() {
  const frameRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    document.documentElement.classList.add("cursor-hidden");

    const target: TargetState = {
      x: -200,
      y: -200,
      w: IDLE_SIZE,
      h: IDLE_SIZE,
      hover: false,
      label: null,
    };
    const render = { ...target };
    let dotX = -200;
    let dotY = -200;
    let raf = 0;
    let currentHovered: Element | null = null;
    let pressed = false;

    function labelFor(el: Element): string | null {
      const tag = el.tagName;
      if (tag === "A") {
        const href = (el as HTMLAnchorElement).href;
        if (!href) return "→ link";
        try {
          const u = new URL(href);
          if (u.origin === window.location.origin) {
            const path = u.pathname + (u.hash || "");
            return `→ ${path === "/" ? "home" : path}`;
          }
          const extPath = u.pathname === "/" ? "" : u.pathname;
          return `↗ ${u.hostname}${extPath}`;
        } catch {
          return "→ link";
        }
      }
      if (tag === "BUTTON" || el.getAttribute("role") === "button") {
        const txt =
          el.getAttribute("aria-label") ||
          (el.textContent || "").replace(/\s+/g, " ").trim();
        if (!txt) return "• button";
        return `• ${txt.slice(0, 32)}${txt.length > 32 ? "…" : ""}`;
      }
      if (tag === "INPUT") {
        const placeholder = (el as HTMLInputElement).placeholder;
        return `◇ ${placeholder || "input"}`;
      }
      if (tag === "TEXTAREA") {
        return `◇ textarea`;
      }
      return "• hover";
    }

    function updateTargetFor(clientX: number, clientY: number, el: Element | null) {
      const interactive = el?.closest?.(INTERACTIVE) ?? null;
      if (interactive) {
        if (interactive !== currentHovered) {
          currentHovered = interactive;
          target.label = labelFor(interactive);
        }
        const r = interactive.getBoundingClientRect();
        target.x = r.left + r.width / 2;
        target.y = r.top + r.height / 2;
        target.w = r.width + HOVER_PAD * 2;
        target.h = r.height + HOVER_PAD * 2;
        target.hover = true;
      } else {
        currentHovered = null;
        target.x = clientX;
        target.y = clientY;
        target.w = IDLE_SIZE;
        target.h = IDLE_SIZE;
        target.hover = false;
        target.label = null;
      }
    }

    function onMove(e: MouseEvent) {
      updateTargetFor(e.clientX, e.clientY, e.target as Element | null);
    }
    function onScroll() {
      if (currentHovered) {
        const r = currentHovered.getBoundingClientRect();
        target.x = r.left + r.width / 2;
        target.y = r.top + r.height / 2;
      }
    }
    function onLeave() {
      target.x = -400;
      target.y = -400;
      target.hover = false;
      target.label = null;
      currentHovered = null;
    }
    function onDown() {
      pressed = true;
    }
    function onUp() {
      pressed = false;
    }

    function tick() {
      const snap = target.hover ? 0.38 : 0.55;
      render.x += (target.x - render.x) * snap;
      render.y += (target.y - render.y) * snap;
      render.w += (target.w - render.w) * 0.42;
      render.h += (target.h - render.h) * 0.42;
      dotX += (target.x - dotX) * 0.7;
      dotY += (target.y - dotY) * 0.7;

      const frame = frameRef.current;
      const dot = dotRef.current;
      const label = labelRef.current;
      const pressScale = pressed ? 0.92 : 1;

      if (frame) {
        frame.style.transform = `translate3d(${render.x}px, ${render.y}px, 0) translate(-50%, -50%) scale(${pressScale})`;
        frame.style.width = `${render.w}px`;
        frame.style.height = `${render.h}px`;
        frame.dataset.hover = target.hover ? "true" : "false";
      }
      if (dot) {
        const dotOpacity = target.hover ? 0 : 1;
        dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        dot.style.opacity = String(dotOpacity);
      }
      if (label) {
        if (target.label) {
          label.textContent = target.label;
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const lx = Math.min(dotX + 14, vw - 220);
          const ly = Math.min(dotY + 14, vh - 40);
          label.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
          label.style.opacity = "1";
        } else {
          label.style.opacity = "0";
        }
      }

      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("cursor-hidden");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Scanner frame: 4 L-brackets that snap to whatever's under the cursor */}
      <div
        ref={frameRef}
        aria-hidden
        data-hover="false"
        className="cursor-frame pointer-events-none fixed left-0 top-0 z-[300]"
        style={{ willChange: "transform, width, height" }}
      >
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
      </div>

      {/* Precision dot (idle only) */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[301] h-[3px] w-[3px] rounded-full bg-acid transition-opacity duration-150"
        style={{
          willChange: "transform, opacity",
          boxShadow: "0 0 6px rgba(212,255,59,0.9)",
        }}
      />

      {/* Mono tag: link destination / element type */}
      <div
        ref={labelRef}
        aria-hidden
        className="cursor-tag pointer-events-none fixed left-0 top-0 z-[302] flex items-center gap-1.5 rounded-sm border border-acid/60 bg-ink/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-acid backdrop-blur-sm transition-opacity duration-150"
        style={{
          willChange: "transform, opacity",
          opacity: 0,
          boxShadow: "0 0 0 1px rgba(11,11,10,0.6), 0 8px 20px -8px rgba(0,0,0,0.8)",
        }}
      />
    </>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base =
    "absolute h-2.5 w-2.5 border-paper/60 transition-[border-color,box-shadow] duration-200";
  const variant: Record<typeof pos, string> = {
    tl: "-top-px -left-px border-t border-l",
    tr: "-top-px -right-px border-t border-r",
    bl: "-bottom-px -left-px border-b border-l",
    br: "-bottom-px -right-px border-b border-r",
  };
  return <span aria-hidden className={`${base} ${variant[pos]} cursor-corner`} />;
}
