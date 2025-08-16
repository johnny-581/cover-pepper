import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLetter, useLetters } from "@/features/letters/hooks";
import EditorPanel from "@/features/letters/components/EditorPanel";

export default function LettersPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: letters } = useLetters();
    const { data: letter } = useLetter(id);

    useEffect(() => {
        if (!id && letters && letters.length > 0) {
            navigate(`/app/letters/${letters[0].id}`, { replace: true });
        }
    }, [id, letters, navigate]);

    return (
        <>
            {!id ? (
                <div className="h-full w-full flex items-center justify-center">
                    <div className="text-sm text-gray-700">Select or create a letter.</div>
                </div>
            ) : (
                <EditorPanel letterId={id} letter={letter ?? null} />
            )}
        </>
    );
}