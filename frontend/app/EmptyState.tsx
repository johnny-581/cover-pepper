"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useUI } from "@/components/dialogs/store";

export default function EmptyState() {
  const { setUploadOpen } = useUI();

  return (
    <div className="h-full w-full bg-theme-white flex flex-col items-center justify-center">
      <div>
        <p className="mb-5 text-theme-dark-gray">Your Plate is Empty</p>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload color="var(--color-theme-black)" className="mr-2" />
          Upload a .tex File
        </Button>
      </div>
    </div>
  );
}
