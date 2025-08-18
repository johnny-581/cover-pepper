import { Upload } from "lucide-react";
import ButtonSquare from "@/components/ButtonSquare";
import { useUI } from "@/features/letters/store";
import { useAuth } from "@/features/auth/useAuth";

export default function AccountMenu() {
    const { user } = useAuth();
    const { setSettingsOpen } = useUI();

    return (
        <div className="p-2 items-center justify-between">
            <div className="flex px-2 py-3 items-center rounded-2xl theme-border shadow-[0px_0px_6px_0px_rgba(0,0,0,0.1)]">
                <div className="w-10 h-10 theme-border rounded-full">
                    {/* <User size={16} /> */}
                </div>

                <div className="flex-1 px-2 truncate">
                    {user?.name}
                </div>

                <ButtonSquare
                    onClick={() => setSettingsOpen(true)}
                >
                    <Upload size={20} color="var(--color-almost-black)" />
                </ButtonSquare>
            </div>
        </div>
    )
}