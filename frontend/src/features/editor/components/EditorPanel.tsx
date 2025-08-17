import LetterToolbar from "@/features/editor/components/LetterToolbar";
import LetterEditor from "@/features/editor/components/LetterEditor";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useLetter, useLetters } from "@/features/letters/hooks";
import NoLetterSelected from "./NoLetterSelected";


export default function EditorPanel() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: letters } = useLetters();
    const { data: letter } = useLetter(id);

    useEffect(() => {
        if (!id && letters && letters.length > 0) {
            navigate(`/app/letters/${letters[0].id}`, { replace: true });
        }
    }, [id, letters, navigate])

    if (!letter) return <div className="p-4 text-sm">Loading letter…</div>;

    return (
        <>
            {id ? (
                <div className="h-full w-full flex flex-col">
                    <LetterToolbar letter={letter} />
                    <div className="flex-1 min-h-0">
                        <LetterEditor letter={letter} />
                    </div>
                </div>
            ) : (
                <NoLetterSelected />
            )}
        </>

    );
}