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
    const base = "inline-flex items-center justify-center px-4 min-w-20 rounded-lg whitespace-nowrap font-sans transition hover:cursor-pointer"

    const variants = {
        primary: "theme-shadow bg-theme-primary hover:bg-[#EEDBB5]",
        secondary: "theme-shadow bg-theme-secondary",
        ghost: "bg-transparent hover:bg-light-gray hover:theme-shadow",
    }

    return (
        <button
            className={clsx(base, height, variants[variant], className)}
            {...rest}
        />
    );
}