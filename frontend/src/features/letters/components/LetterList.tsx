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
        <ul className="p-2">
            {letters.map((l) => (
                <LetterListItem key={l.id} letter={l} />
            ))}
        </ul>
    );
}