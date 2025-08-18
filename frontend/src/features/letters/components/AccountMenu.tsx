import { Settings } from "lucide-react";
import Button from "@/components/Button";
import { useUI } from "@/features/letters/store";
import { useAuth } from "@/features/auth/useAuth";
import ThemeContainer from "@/components/ThemeContainer";

export default function AccountMenu() {
    const { user } = useAuth();
    const { setSettingsOpen } = useUI();

    return (
        <div className="p-2 items-center justify-between">
            <ThemeContainer className="flex px-2 py-3 items-center">
                <div className="w-10 h-10 theme-border rounded-full">
                    {/* <User size={16} /> */}
                </div>

                <div className="text-xs text-right flex-1 px-2 truncate">
                    {user?.name}
                </div>

                <Button
                    colored={false}
                    square={true}
                    title="Settings"
                    onClick={() => setSettingsOpen(true)}
                >
                    <Settings size={20} color="var(--color-almost-black)" />
                </Button>
            </ThemeContainer>
        </div>
    )
}