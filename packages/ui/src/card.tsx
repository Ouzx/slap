import type { HTMLAttributes, PropsWithChildren } from "react";

import clsx from "clsx";

export type CardProps = HTMLAttributes<HTMLDivElement>;

function CardRoot({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--slap-radius-lg)] border border-[var(--slap-color-border)] bg-[var(--slap-color-surface)] p-5 shadow-[var(--slap-shadow-md)]",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "mb-4 text-lg font-semibold text-[var(--slap-color-text)]",
        className,
      )}
      {...props}
    />
  );
}

function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("text-sm text-[var(--slap-color-text-muted)]", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "mt-4 border-t border-[var(--slap-color-border)] pt-4 text-sm text-[var(--slap-color-text-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export const Card = Object.assign(CardRoot, {
  Body: CardBody,
  Footer: CardFooter,
  Header: CardHeader,
}) as typeof CardRoot & {
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Header: typeof CardHeader;
};

export function CardGrid({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx("grid gap-4 md:grid-cols-2", className)}>{children}</div>;
}
