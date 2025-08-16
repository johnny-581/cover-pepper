import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import DirectoryPanel from "@/features/letters/components/DirectoryPanel";
// import { useUI } from "@/features/letters/store";
// import SettingsDialog from "@/features/settings/SettingsDialog";

export default function AppLayout() {
    // const { isSettingsOpen, setSettingsOpen } = useUI();

    return (
        <div className="h-screen w-screen flex flex-col">
            <Header />
            <div className="flex-1 flex min-h-0">
                <DirectoryPanel />
                <div className="flex-1 min-h-0 border-l border-grayline">
                    <Outlet />
                </div>
            </div>
            {/* <SettingsDialog open={isSettingsOpen} onClose={() => setSettingsOpen(false)} /> */}
        </div>
    );
}