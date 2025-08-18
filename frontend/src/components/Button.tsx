import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost"
};

export default function Button({
    variant = "primary",
    className,
    ...rest
}: Props) {
    const height = "h-9"
    const base = "inline-flex items-center justify-center px-4 min-w-20 rounded-lg whitespace-nowrap transition shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)]"

    const variants = {
        primary: "bg-theme-primary hover:bg-[#EEDBB5]",
        secondary: "bg-theme-secondary",
        ghost: "bg-transparent hover:bg-[#f5f5f4]",
    }

    return (
        <button
            className={clsx(base, height, variants[variant], className)}
            {...rest}
        />
    );
}