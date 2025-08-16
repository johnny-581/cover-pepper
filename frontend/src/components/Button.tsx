import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "solid" | "outline" | "ghost";
    size?: "sm" | "md";
    fullWidth?: boolean;
    square?: boolean; // ignores size and uses uniform padding
};

export default function Button({
    variant = "outline",
    size = "sm",
    fullWidth = false,
    square = false,
    className,
    ...rest
}: Props) {
    const base = "inline-flex items-center justify-center border transition disabled:opacity-60";
    const variants = {
        outline: "border-black bg-transparent text-black hover:bg-gray-100 active:bg-gray-200",
        solid: "border-black bg-black text-white hover:opacity-90 active:opacity-80",
        ghost: "border-grayline bg-white text-black hover:bg-gray-100 active:bg-gray-200"
    } as const;

    const sizes = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base"
    } as const;

    const squarePad = "p-2";
    const width = fullWidth ? "w-full" : "";

    return (
        <button
            className={clsx(base, variants[variant], square ? squarePad : sizes[size], width, className)}
            {...rest}
        />
    );
}