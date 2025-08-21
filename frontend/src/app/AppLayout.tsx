import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import DirectoryPanel from "@/features/letters/components/DirectoryPanel";
import { useUI } from "@/store";
import UploadDialog from "@/features/upload/UploadDialog";
import GenerateDialog from "@/features/letters/components/GenerateDialog";
import LoginDialog from "@/features/auth/LoginDialog";
import ThemeContainer from "@/components/ThemeContainer";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/useAuth";

export default function AppLayout() {
    const { isUploadOpen, isGenerateOpen, isLoginOpen, setUploadOpen, setGenerateOpen, setLoginOpen } = useUI();
    const { user, isLoading } = useAuth()

    useEffect(() => {
        if (!isLoading) setLoginOpen(!user);
    }, [user, isLoading, setLoginOpen]);

    return (
        <div className="h-screen w-screen flex flex-col font-serif text-almost-black text-[16px] tracking-wide bg-theme-primary">
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
            <UploadDialog open={isUploadOpen} onClose={() => setUploadOpen(false)} />
            <GenerateDialog open={isGenerateOpen} onClose={() => setGenerateOpen(false)} />
            <LoginDialog open={isLoginOpen} />
        </div>
    );
}