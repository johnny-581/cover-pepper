import type { ReactNode } from "react";

type Props = {
    className?: string,
    children: ReactNode
}

export default function ThemeContainer({ className, children }: Props) {
    return (
        <div className={`h-full w-full min-h-0 rounded-2xl border-[1.5px] border-gray ${className}`}>
            {children}
        </div>
    )
}