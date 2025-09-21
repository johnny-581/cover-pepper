import type { Letter } from "@/features/letters/types";
import LetterListItem from "@/features/letters/components/LetterListItem";

export default function LetterList({ letters }: { letters: Letter[] }) {
    if (!letters?.length) {
        // empty pantry
        return (
            <div className="h-full flex items-center justify-center text-theme-dark-gray">
                Your Pantry is Empty
            </div>
        );
    }

    return (
        <div className="p-2">
            <ul>
                {letters.map((l) => (
                    <LetterListItem key={l.id} letter={l} />
                ))}
            </ul>
            <div className="px-3 py-[10px] text-theme-dark-gray leading-tight select-none">
                <p className="pb-2">⌘ + backspace to delete</p>
                <p>double click to set as template</p>
            </div>
        </div>
    );
}