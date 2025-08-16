import { type PropsWithChildren, useEffect, useRef, useState } from "react";

type Item = { label: string; onClick: () => void; disabled?: boolean };

export default function ContextMenu({
    items,
    children
}: PropsWithChildren<{ items: Item[] }>) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onDoc() {
            setOpen(false);
        }
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    return (
        <div
            ref={ref}
            onContextMenu={(e) => {
                e.preventDefault();
                setPos({ x: e.pageX, y: e.pageY });
                setOpen(true);
            }}
        >
            {children}
            {open && (
                <ul
                    className="fixed z-50 border border-grayline bg-paper text-sm"
                    style={{ left: pos.x, top: pos.y }}
                >
                    {items.map((it, i) => (
                        <li key={i}>
                            <button
                                className="px-3 py-1 text-left w-full hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => {
                                    if (!it.disabled) it.onClick();
                                    setOpen(false);
                                }}
                                disabled={it.disabled}
                            >
                                {it.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}