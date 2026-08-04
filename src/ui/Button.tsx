import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "link";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

// Trivial flat-colour controls, hand-built rather than exported — they need
// to stay real, clickable DOM, and their styling is simple enough that
// matching the Figma tokens directly is both faithful and lower-friction
// than compositing exported button images.
export function Button({ variant = "primary", fullWidth, style, children, ...rest }: ButtonProps) {
  const base = {
    fontFamily: "var(--font-family-base)",
    fontWeight: 600,
    fontSize: 16,
    borderRadius: 16,
    padding: "12px 20px",
    width: fullWidth ? "100%" : undefined,
    cursor: "pointer",
    border: "none",
  };

  const variantStyle =
    variant === "primary"
      ? { background: "var(--color-blue-700)", color: "#ffffff", boxShadow: "0 1px 2px rgba(16,24,40,0.05)" }
      : variant === "secondary"
        ? { background: "#ffffff", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-base)" }
        : { background: "transparent", color: "var(--color-bluegray-700)", textDecoration: "underline", padding: 0, fontWeight: 500 };

  return (
    <button style={{ ...base, ...variantStyle, ...style }} {...rest}>
      {children}
    </button>
  );
}
