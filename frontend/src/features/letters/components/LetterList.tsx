import type { Letter } from "@/features/letters/types";
import LetterListItem from "@/features/letters/components/LetterListItem";

export default function LetterList({ letters }: { letters: Letter[] }) {
    if (!letters?.length) {
        // empty pantry
        return (
            <div className="flex items-center justify-center">
                Your Pantry is Empty
            </div>
        );
    }

    return (
        <>
            <ul className="px-2">
                {letters.map((l) => (
                    <LetterListItem key={l.id} letter={l} />
                ))}
            </ul>
            <div className="px-5 py-[10px] text-gray font-sans leading-tight select-none">
                <p className="pb-2">⌘ + backspace to delete</p>
                <p>double click to set as template</p>
            </div>
        </>
    );
}