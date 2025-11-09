"use client"

import EditorToolbar from "@/features/editor/components/EditorToolbar";
import MonacoEditor from "@/features/editor/components/MonacoEditor";
import { useRef } from "react";
import ThemeContainer from "@/components/ThemeContainer";
import { Letter } from "@/features/letters/types";

export default function EditorPanel({ letter }: { letter: Letter }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="h-full w-full bg-theme-white flex flex-col">
      <EditorToolbar letter={letter} />

      {/* scrollable area */}
      <div ref={scrollRef} className="flex-1 min-h-0 p-5 pb-20 overflow-auto">
        <div className="flex overflow-visible">
          <ThemeContainer
            className="min-h-3/4 grow min-w-[400px] max-w-[850px]"
            autoHeightAndWidth={true}
          >
            <MonacoEditor letter={letter} scrollContainerRef={scrollRef} />
          </ThemeContainer>
        </div>
      </div>
    </div>
  );
}
