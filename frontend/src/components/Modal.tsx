import { type PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";
import ThemeContainer from "./ThemeContainer";
import { X } from "lucide-react";
import ButtonSquare from "./ButtonSquare";

type Props = {
    open: boolean;
    onClose?: () => void;
    title: string;
};

export default function Modal({ open, onClose, title, children }: PropsWithChildren<Props>) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (onClose && e.key === "Escape") onClose();
        }
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    const root = document.getElementById("portal-root")!;

    return createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center font-sans text-almost-black p-10">
            <ThemeContainer
                autoHeightAndWidth
                className="bg-almost-white p-5 w-[550px] h-[600px] max-w-full max-h-full min-w-[200px] overflow-auto theme-shadow flex flex-col"
            // onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <div className="font-bold">{title}</div>
                    {onClose && <ButtonSquare variant="ghost"><X onClick={onClose} /></ButtonSquare>}
                </div>
                {children}
            </ThemeContainer>
        </div>,
        root
    );
}