import type { ReactNode } from "react";

type Props = {
    autoHeight?: boolean,
    className?: string,
    children: ReactNode
}

export default function ThemeContainer({ autoHeight = false, className, children }: Props) {
    const height = autoHeight ? "" : "h-full"
    return (
        <div className={`${height} w-full min-h-0 rounded-2xl theme-border overflow-hidden ${className}`}>
            {children}
        </div>
    )
}