import { useNavigate, useParams } from "react-router-dom";
import type { Letter } from "@/features/letters/types";
import ContextMenu from "@/features/letters/components/ContextMenu";
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
                    "px-3 py-2 border-b border-grayline cursor-pointer flex items-center justify-between",
                    selected && "bg-gray-100"
                )}
                onClick={() => navigate(`/app/letters/${letter.id}`)}
            >
                <div className="truncate">
                    <div className="text-sm">{letter.title}</div>
                    <div className="text-[11px] text-gray-600 truncate">
                        {letter.company} · {letter.position}
                    </div>
                </div>
                {templateLetterId === letter.id && <span title="Template">★</span>}
            </li>
        </ContextMenu>
    );
}