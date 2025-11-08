import EditorToolbar from "@/features/editor/components/EditorToolbar";
import MonacoEditor from "@/features/editor/components/MonacoEditor";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLetter, useLetters } from "@/features/letters/hooks";
import NoLetterSelected from "../features/editor/components/NoLetterSelected";
import ThemeContainer from "@/components/ThemeContainer";
import Button from "@/components/Button";
import { Upload } from "lucide-react";
import { useUI } from "@/store";


export default function EditorPanel() {
    const params = useParams<{ id?: string }>();
    const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
    const router = useRouter();

    const { data: letters } = useLetters();
    const { data: letter } = useLetter(id);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const { setUploadOpen } = useUI();

    useEffect(() => {
        if (!id && letters && letters.length > 0) {
            router.replace(`/app/letters/${letters[0].id}`);
        }
    }, [id, letters, router])

    if (!letter) {
        return (
            <div className="h-full w-full bg-theme-white flex flex-col items-center justify-center">
                <p className="mb-5 text-theme-dark-gray">Your Plate is Empty</p>
                <Button onClick={() => setUploadOpen(true)}>
                    <Upload color="var(--color-theme-black)" className="mr-2" />
                    Upload a .tex File
                </Button>
            </div>
        );
    }

    return (
        <>
            {id ? (
                <div className="h-full w-full bg-theme-white flex flex-col">
                    <EditorToolbar letter={letter} />

                    {/* scrollable area */}
                    <div ref={scrollRef} className="flex-1 min-h-0 p-5 pb-20 overflow-auto">
                        <div className="flex overflow-visible">
                            <ThemeContainer className="min-h-3/4 grow min-w-[400px] max-w-[850px]" autoHeightAndWidth={true}>
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