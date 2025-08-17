import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import DirectoryPanel from "@/features/letters/components/DirectoryPanel";
import { useUI } from "@/features/letters/store";
import SettingsDialog from "@/features/settings/SettingsDialog";
import GenerateDialog from "@/features/letters/components/GenerateDialog";
import ThemeContainer from "@/components/ThemeContainer";

export default function AppLayout() {
    const { isSettingsOpen, isGenerateOpen, setSettingsOpen, setGenerateOpen } = useUI();

    return (
        <div className="h-screen w-screen flex flex-col font-serif text-almost-black text-[16px] tracking-wide">
            <Header />
            <div className="flex-1 p-2 pt-0 min-h-0">
                <ThemeContainer className="flex">
                    {/* left panel */}
                    <DirectoryPanel />

                    {/* right panel */}
                    <div className="flex-1 min-h-0 overflow-auto">
                        <Outlet />
                    </div>
                </ThemeContainer>
            </div>
            <SettingsDialog open={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
            <GenerateDialog open={isGenerateOpen} onClose={() => setGenerateOpen(false)} />
        </div>
    );
}