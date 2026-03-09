import type { HTMLAttributes } from "react";

import clsx from "clsx";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "success" | "warning";
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
        tone === "default" &&
          "bg-[var(--slap-color-surface-strong)] text-[var(--slap-color-text)]",
        tone === "success" && "bg-[#dff3e7] text-[var(--slap-color-success)]",
        tone === "warning" && "bg-[#fff1d6] text-[var(--slap-color-warning)]",
        className,
      )}
      {...props}
    />
  );
}
