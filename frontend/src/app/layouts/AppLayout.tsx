import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import DirectoryPanel from "@/features/letters/components/DirectoryPanel";
import { useUI } from "@/features/letters/store";
import SettingsDialog from "@/features/settings/SettingsDialog";
import GenerateDialog from "@/features/letters/components/dialogs/GenerateDialog";

export default function AppLayout() {
    const { isSettingsOpen, isGenerateOpen, setSettingsOpen, setGenerateOpen } = useUI();

    return (
        <div className="h-screen w-screen flex flex-col">
            <Header />
            <div className="flex-1 flex min-h-0">
                {/* left panel */}
                <DirectoryPanel />

                {/* right panel */}
                <div className="flex-1 min-h-0 border-l border-grayline">
                    <Outlet />
                </div>
            </div>
            <SettingsDialog open={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
            <GenerateDialog open={isGenerateOpen} onClose={() => setGenerateOpen(false)} />
        </div>
    );
}