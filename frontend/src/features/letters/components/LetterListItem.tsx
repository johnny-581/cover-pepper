import { useNavigate, useParams } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import type { Letter } from "@/features/letters/types";
import { useDeleteMutation, useLetters } from "@/features/letters/hooks";
import { useUI } from "@/store";
import clsx from "clsx";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function LetterListItem({ letter }: { letter: Letter }) {
    const navigate = useNavigate();
    const params = useParams();
    const { templateLetterId, setTemplateLetterId, isDeleteConfirmOpen, setDeleteConfirmOpen } = useUI();
    const del = useDeleteMutation();
    const { data: letters } = useLetters();

    const isSelected = params.id === letter.id;

    useHotkeys("meta+backspace", async (e) => {
        if (!isSelected) return;
        e.preventDefault();
        setDeleteConfirmOpen(true);
    }, [isSelected, letter, letters]);

    const handleDelete = async () => {
        try {
            await del.mutateAsync(letter.id);
            if (isSelected) {
                const index = letters?.findIndex((l) => l.id === letter.id) ?? -1;

                const next = letters?.[index + 1] || letters?.[index - 1];
                navigate(next ? `/app/letters/${next.id}` : `/app/letters`);
            }
            setDeleteConfirmOpen(false);
        } catch (err) {
            console.error(`Error deleting current letter!: ${err}`)
        }
    }

    useHotkeys("$mod+backspace", async (e) => {
        if (!isSelected) return;
        e.preventDefault();
        setDeleteConfirmOpen(true);
    }, [isSelected, letter, letters]);

    return (
        <>
            <li
                className={clsx(
                    "px-3 py-[10px] cursor-pointer flex items-center justify-between rounded-lg hover:bg-light-gray select-none",
                    isSelected && "bg-theme-secondary"
                )}
                onClick={() => navigate(`/app/letters/${letter.id}`)}
                onDoubleClick={() => setTemplateLetterId(letter.id)}
            >
                <div className="truncate">
                    {letter.title}
                </div>

                {templateLetterId === letter.id &&
                    <div className="px-2 bg-gray text-almost-white font-sans rounded-lg">
                        Template
                    </div>
                }
            </li>
            <ConfirmDialog
                open={isDeleteConfirmOpen}
                message="Sure you want to delete this cover letter?"
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}>
            </ConfirmDialog>
        </>
    );
}