"use client";

import { useLetters } from "@/features/letters/hooks";
import LetterList from "@/features/letters/components/LetterList";
import { useUI } from "@/store";
import Button from "@/components/Button";
import AccountMenu from "../features/settings/AccountMenu";
import logo from "@/public/logo.png";
import { SquarePen, Upload } from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const { data: letters } = useLetters();
  const { setGenerateOpen, setUploadOpen } = useUI();

  return (
    <aside className="min-w-[300px] w-[300px] theme-border-right bg-theme-light-gray flex flex-col">
      <div className="flex items-center p-5">
        <Image
          src={logo}
          width={500}
          height={500}
          alt="logo"
          className="h-9 w-auto pr-1"
        />
        <div className="font-bold pl-2">Cover Pepper</div>
      </div>

      <div className="p-2">
        <Button
          variant="ghost"
          contentLeft
          icon={<SquarePen color="var(--color-theme-black)" />}
          className="w-full"
          onClick={() => setGenerateOpen(true)}
          disabled={letters?.length === 0}
        >
          Generate New Letter
        </Button>
        <Button
          variant="ghost"
          contentLeft
          icon={<Upload color="var(--color-theme-black)" />}
          className="w-full"
          onClick={() => setUploadOpen(true)}
        >
          Upload .tex
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <LetterList letters={letters ?? []} />
      </div>

      <AccountMenu />
    </aside>
  );
}
