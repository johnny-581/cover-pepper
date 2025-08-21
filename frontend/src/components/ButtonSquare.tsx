import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost"
};

export default function ButtonSquare({
    variant = "primary",
    className,
    children,
    ...rest
}: Props) {
    const size = "h-8 w-8"
    const base = "inline-flex items-center justify-center rounded-lg whitespace-nowrap transition hover:cursor-pointer"

    const variants = {
        primary: "bg-theme-primary bg-theme-primary theme-shadow hover:bg-[#EEDBB5]",
        ghost: "bg-transparent hover:bg-light-gray hover:theme-shadow",
    }


    return (
        <button
            className={clsx(base, size, variants[variant], className)}
            {...rest}
        >
            {children}
        </button >
    );
}