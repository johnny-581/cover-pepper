import { type Letter } from "@/features/letters/types";
import LetterToolbar from "@/features/letters/components/LetterToolbar";
import LetterEditor from "@/features/letters/components/LetterEditor";

export default function EditorPanel({ letterId, letter }: { letterId: string; letter: Letter | null }) {
    if (!letter) return <div className="p-4 text-sm">Loading letter…</div>;

    return (
        <div className="h-full w-full flex flex-col">
            <LetterToolbar letter={letter} />
            <div className="flex-1 min-h-0">
                <LetterEditor letter={letter} />
            </div>
        </div>
    );
}