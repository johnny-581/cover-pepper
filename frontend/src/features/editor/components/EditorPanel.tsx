import EditorToolbar from "@/features/editor/components/EditorToolbar";
import MonacoEditor from "@/features/editor/components/MonacoEditor";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useLetter, useLetters } from "@/features/letters/hooks";
import NoLetterSelected from "./NoLetterSelected";
import ThemeContainer from "@/components/ThemeContainer";


export default function EditorPanel() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: letters } = useLetters();
    const { data: letter } = useLetter(id);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!id && letters && letters.length > 0) {
            navigate(`/app/letters/${letters[0].id}`, { replace: true });
        }
    }, [id, letters, navigate])

    if (!letter) return <div className="h-full w-full bg-theme-secondary flex items-center justify-center">Loading letter…</div>;

    return (
        <>
            {id ? (
                <div className="h-full w-full bg-theme-secondary flex flex-col">
                    <EditorToolbar letter={letter} />

                    {/* scrollable area */}
                    <div ref={scrollRef} className="flex-1 min-h-0 p-5 pb-20 overflow-auto">
                        <div className="flex overflow-visible">
                            <ThemeContainer className="min-h-3/4 flex-grow min-w-[400px] max-w-[800px] bg-almost-white theme-shadow-inset" autoHeightAndWidth={true}>
                                <MonacoEditor letter={letter} scrollContainerRef={scrollRef} />
                            </ThemeContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <NoLetterSelected />
            )}
        </>
    );
}