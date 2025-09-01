import { Upload } from "lucide-react";
import Button from "@/components/Button";
import ButtonSquare from "@/components/ButtonSquare";
import { useUI } from "@/store";
import { useAuth } from "@/features/auth/useAuth";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function AccountMenu() {
    const { logout } = useAuth();
    const { setUploadOpen, isLogoutConfirmOpen, setLogoutConfirmOpen } = useUI();

    return (
        <div className="p-2">
            <div className="flex p-3 items-center justify-between rounded-2xl theme-border theme-shadow">
                <Button variant="ghost" onClick={() => setLogoutConfirmOpen(true)}>
                    Logout
                </Button>

                <ButtonSquare
                    onClick={() => setUploadOpen(true)}
                >
                    <Upload size={20} color="var(--color-almost-black)" />
                </ButtonSquare>
            </div>
            <ConfirmDialog
                open={isLogoutConfirmOpen}
                message="Sure you want to logout?"
                onConfirm={() => {
                    logout();
                    setLogoutConfirmOpen(false);
                }}
                onCancel={() => setLogoutConfirmOpen(false)}>
            </ConfirmDialog>
        </div>
    )
}