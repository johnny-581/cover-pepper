import { useLetters } from "@/features/letters/hooks";
import LetterList from "@/features/letters/components/LetterList";
import { useUI } from "@/features/letters/store";
import { Settings, User } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import Button from "@/components/Button";

export default function DirectoryPanel() {
    const { data } = useLetters();
    const { setGenerateOpen, setSettingsOpen } = useUI();
    const { user, logout } = useAuth();

    return (
        <aside className="w-[280px] min-w-[240px] max-w-[320px] border-r border-grayline flex flex-col">
            <div className="p-3 border-b border-grayline">
                <div className="flex gap-2">
                    <Button fullWidth onClick={() => setGenerateOpen(true)}>
                        New Letter
                    </Button>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
                <LetterList letters={data ?? []} />
            </div>

            <div className="border-t border-grayline p-3 flex items-center justify-between">
                <Button
                    title="Settings"
                    variant="ghost"
                    square
                    onClick={() => setSettingsOpen(true)}
                >
                    <Settings size={16} />
                </Button>
                <div className="text-xs text-right flex-1 px-2 truncate">
                    {user?.name}
                </div>
                <Button
                    title="Account"
                    variant="ghost"
                    square
                    onClick={() => {
                        if (confirm("Log out?")) logout();
                    }}
                >
                    <User size={16} />
                </Button>
            </div>
        </aside>
    );
}