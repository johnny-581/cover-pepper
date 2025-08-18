import type { ReactNode } from "react";

type Props = {
    autoHeightAndWdith?: boolean,
    className?: string,
    children: ReactNode
}

export default function ThemeContainer({ autoHeightAndWdith = false, className, children }: Props) {
    const height = autoHeightAndWdith ? "" : "h-full w-full"
    return (
        <div className={`${height} min-h-0 rounded-2xl theme-border overflow-hidden ${className}`}>
            {children}
        </div>
    )
}