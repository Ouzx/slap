import type { InputHTMLAttributes } from "react";

import clsx from "clsx";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "w-full rounded-[var(--slap-radius-md)] border border-[var(--slap-color-border)] bg-[var(--slap-color-surface)] px-3 py-2 text-sm text-[var(--slap-color-text)] shadow-[var(--slap-shadow-sm)] outline-none",
        className,
      )}
      {...props}
    />
  );
}
