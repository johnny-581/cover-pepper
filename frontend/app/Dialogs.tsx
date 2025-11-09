"use client";
import { useUI } from "@/store";
import UploadDialog from "@/features/letters/components/UploadDialog";
import GenerateDialog from "@/features/letters/components/GenerateDialog";
import LoginDialog from "@/features/auth/LoginDialog";

export default function Dialogs() {
  const {
    isUploadOpen,
    isGenerateOpen,
    isLoginOpen,
    setUploadOpen,
    setGenerateOpen,
  } = useUI();
  return (
    <>
      <UploadDialog open={isUploadOpen} onClose={() => setUploadOpen(false)} />
      <GenerateDialog
        open={isGenerateOpen}
        onClose={() => setGenerateOpen(false)}
      />
      <LoginDialog open={isLoginOpen} />
    </>
  );
}
