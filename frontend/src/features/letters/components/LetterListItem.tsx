import { useNavigate, useParams } from "react-router-dom";
import type { Letter } from "@/features/letters/types";
import ContextMenu from "@/components/ContextMenu";
import { useDeleteMutation, useLetters } from "@/features/letters/hooks";
import { useUI } from "@/features/letters/store";
import clsx from "clsx";

export default function LetterListItem({ letter }: { letter: Letter }) {
    const navigate = useNavigate();
    const params = useParams();
    const { templateLetterId, setTemplateLetterId } = useUI();
    const del = useDeleteMutation();
    const { data: letters } = useLetters();

    const selected = params.id === letter.id;

    const items = [
        { label: "Open", onClick: () => navigate(`/app/letters/${letter.id}`) },
        { label: "Set as template", onClick: () => setTemplateLetterId(letter.id) },
        {
            label: "Delete",
            onClick: async () => {
                if (!confirm(`Delete "${letter.title}"?`)) return;
                await del.mutateAsync(letter.id);
                if (selected) {
                    const next = letters?.find((l) => l.id !== letter.id);
                    navigate(next ? `/app/letters/${next.id}` : `/app/letters`);
                }
            }
        }
    ];

    return (
        <ContextMenu items={items}>
            <li
                className={clsx(
                    "px-3 py-3 cursor-pointer flex items-center justify-between rounded-xl",
                    selected && "bg-theme-secondary shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1)]"
                )}
                onClick={() => navigate(`/app/letters/${letter.id}`)}
            >
                <div className="truncate">
                    {letter.title}
                </div>

                {templateLetterId === letter.id &&
                    <div className="px-2 bg-theme-primary font-sans rounded-lg">
                        Template
                    </div>
                }
            </li>
        </ContextMenu>
    );
}