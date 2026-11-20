import type { HTMLAttributes, ReactNode } from "react";

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "div" | "section" | "article";
}

export function Surface({
  children,
  as: Component = "div",
  className = "",
  ...props
}: SurfaceProps) {
  return (
    <Component className={`surface ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Avatar({
  initials,
  className = "",
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span className={`avatar ${className}`.trim()} aria-label={initials}>
      {initials}
    </span>
  );
}
