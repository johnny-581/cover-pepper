import type { Letter } from "@/features/letters/types";
import LetterListItem from "@/features/letters/components/LetterListItem";

export default function LetterList({ letters }: { letters: Letter[] }) {
    if (!letters?.length) {
        return (
            <div className="p-3 text-sm text-gray-600">
                No letters yet. Use Settings → Upload or Generate one.
            </div>
        );
    }

    return (
        <ul>
            {letters.map((l) => (
                <LetterListItem key={l.id} letter={l} />
            ))}
        </ul>
    );
}