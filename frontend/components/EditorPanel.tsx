"use client";

import ThemeContainer from "@/components/ThemeContainer";
import { Letter } from "@/lib/types";

export default function EditorPanel({ letter }: { letter: Letter }) {
  return (
    <div className="h-full w-full bg-theme-white flex flex-col">
      <div className="flex overflow-visible">
        <ThemeContainer
          className="min-h-3/4 grow min-w-[400px] max-w-[850px]"
          autoHeightAndWidth={true}
        >
          <div></div>
        </ThemeContainer>
      </div>
    </div>
  );
}
