import { Settings } from "lucide-react";
import Button from "@/components/Button";
import { useUI } from "@/features/letters/store";
import { useAuth } from "@/features/auth/useAuth";
import ThemeContainer from "@/components/ThemeContainer";

export default function AccountMenu() {
    const { user, logout } = useAuth();
    const { setSettingsOpen } = useUI();

    return (
        <div className="p-2 items-center justify-between">
            <ThemeContainer className="flex p-2 items-center">
                <div className="w-10 h-10 border-[1.5px] border-gray rounded-full">
                    {/* <User size={16} /> */}
                </div>

                <div className="text-xs text-right flex-1 px-2 truncate">
                    {user?.name}
                </div>

                <Button
                    title="Settings"
                    variant="ghost"
                    square
                    onClick={() => setSettingsOpen(true)}
                >
                    <Settings size={16} />
                </Button>
            </ThemeContainer>
        </div>
    )
}