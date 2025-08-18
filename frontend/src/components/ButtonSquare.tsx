import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost"
};

export default function ButtonSquare({
    className,
    children,
    ...rest
}: Props) {
    const size = "h-8 w-8"
    const base = "inline-flex items-center justify-center rounded-lg whitespace-nowrap bg-theme-primary shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)] transition hover:bg-[#EEDBB5]"

    return (
        <button
            className={clsx(base, size, className)}
            {...rest}
        >
            {children}
        </button>
    );
}