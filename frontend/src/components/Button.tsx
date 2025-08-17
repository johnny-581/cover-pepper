import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    colored?: boolean;
    fullWidth?: boolean;
    square?: boolean; // ignores size and uses uniform padding
};

export default function Button({
    colored = true,
    fullWidth = false,
    square = false,
    ...rest
}: Props) {
    // const base = "inline-flex items-center justify-center transition disabled:opacity-60";
    // const variants = {
    //     outline: "border-black bg-transparent text-black hover:bg-gray-100 active:bg-gray-200",
    //     solid: "border-black bg-black text-white hover:opacity-90 active:opacity-80"
    // };

    const height = "10"

    const base = "flex items-center justify-center border-[1.5px] border-gray rounded-xl transition"
    const width = fullWidth ? "w-full" : square ? "" : "px-4";
    const isSquare = square ? `w-${height}` : ""
    const bg = colored ? "bg-theme-primary" : "bg-transparent";

    return (
        <button
            className={clsx(base, `h-${height}`, bg, isSquare, width)}
            {...rest}
        />
    );
}