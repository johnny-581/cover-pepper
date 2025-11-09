"use client";

import React from "react";
// import { getLetter } from "@/features/letters/api";
import EditorPanel from "@/components/EditorPanel";
import { useLetter } from "@/features/letters/hooks";

export default function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: letter } = useLetter(id);

  if (!letter) {
    return (<div>the letter cannot be found</div>);
  }

  return <EditorPanel letter={letter} />;
}
