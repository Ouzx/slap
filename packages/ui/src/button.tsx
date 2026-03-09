import type { ButtonHTMLAttributes } from "react";

import clsx from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "danger" | "neutral" | "primary";
}

export function Button({
  children,
  className,
  tone = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-[var(--slap-radius-md)] border px-4 py-2 text-sm font-semibold transition-colors",
        tone === "primary" &&
          "border-transparent bg-[var(--slap-color-primary)] text-[var(--slap-color-primary-contrast)]",
        tone === "neutral" &&
          "border-[var(--slap-color-border)] bg-[var(--slap-color-surface)] text-[var(--slap-color-text)]",
        tone === "danger" &&
          "border-transparent bg-[var(--slap-color-danger)] text-white",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
