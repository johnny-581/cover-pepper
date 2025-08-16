import { type PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

type Props = {
    open: boolean;
    onClose: () => void;
    title?: string;
    widthClass?: string;
};

export default function Modal({ open, onClose, title, widthClass, children }: PropsWithChildren<Props>) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    const root = document.getElementById("portal-root")!;

    return createPortal(
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center" onClick={onClose}>
            <div
                className={clsx("bg-white border border-grayline p-4", widthClass ?? "w-[520px]")}
                onClick={(e) => e.stopPropagation()}
            >
                {title && <div className="text-base font-medium mb-3">{title}</div>}
                {children}
            </div>
        </div>,
        root
    );
}