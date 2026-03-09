import type { LabelHTMLAttributes } from "react";

import clsx from "clsx";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={clsx(
        "mb-1 inline-flex text-sm font-medium text-[var(--slap-color-text)]",
        className,
      )}
      {...props}
    />
  );
}
