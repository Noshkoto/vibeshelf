"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "ghost" | "paper";
type Size = "sm" | "md" | "lg";

interface Common {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

const sizing: Record<Size, string> = {
  sm: "h-9 px-4 text-[12px]",
  md: "h-11 px-5 text-[13px]",
  lg: "h-14 px-7 text-[14px]",
};

function classes(variant: Variant, size: Size, extra?: string) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.18em] select-none whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed";

  const shapes: Record<Variant, string> = {
    // Dark keycap inlaid with paper lip — depresses on active
    primary:
      "bg-ink border border-ink-line text-paper shadow-keycap rounded-[10px] hover:-translate-y-[1px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-2px_0_rgba(0,0,0,0.5),0_3px_0_#0B0B0A,0_6px_20px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-keycap-pressed",
    // Acid lime with 3D offset — snaps flat on press
    accent:
      "bg-acid text-ink rounded-[10px] border border-ink shadow-offset hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_#0B0B0A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    // Paper variant — inverse of primary for light sections
    paper:
      "bg-paper text-ink rounded-[10px] border border-ink shadow-offset hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_#0B0B0A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    // Ghost / dashed border that marches on hover
    ghost:
      "bg-transparent text-paper rounded-[10px] border border-dashed border-paper/40 hover:border-paper/80 hover:bg-paper/[0.03]",
  };

  return [base, sizing[size], shapes[variant], extra].filter(Boolean).join(" ");
}

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  children,
  leading,
  trailing,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button {...rest} className={classes(variant, size, className)}>
      {leading}
      <span>{children}</span>
      {trailing}
    </button>
  );
}

interface LinkButtonProps extends Common {
  href: string;
  external?: boolean;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  children,
  leading,
  trailing,
  className,
  href,
  external,
}: LinkButtonProps) {
  const cls = classes(variant, size, className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {leading}
        <span>{children}</span>
        {trailing}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {leading}
      <span>{children}</span>
      {trailing}
    </Link>
  );
}

export function ArrowGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      className={`h-[11px] w-[11px] transition-transform duration-200 group-hover:translate-x-[2px] ${className}`}
      aria-hidden
    >
      <path
        d="M1 7h11M7.5 2.5L12 7l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
    </svg>
  );
}
