"use client";
import { useUI } from "@/components/dialogs/store";
import UploadDialog from "@/components/dialogs/UploadDialog";
import GenerateDialog from "@/components/dialogs/GenerateDialog";
import LoginDialog from "@/components/dialogs/LoginDialog";

export default function DialogHost() {
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
