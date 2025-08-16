import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useGenerateMutation, useLetter } from "@/features/letters/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { useUI } from "@/features/letters/store";
import { getLetter } from "@/features/letters/api";
import Button from "@/components/Button";

type Props = { open: boolean; onClose: () => void };

export default function GenerateDialog({ open, onClose }: Props) {
    const [jobDescription, setJD] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { templateLetterId } = useUI();
    const gen = useGenerateMutation();
    const { id } = useParams();
    const { data: _current } = useLetter(id);

    useEffect(() => {
        if (!open) {
            setJD("");
            setError(null);
        }
    }, [open]);

    const canGenerate = Boolean(templateLetterId);

    const handleSubmit = async () => {
        if (!canGenerate) {
            setError("Please set a template first (right-click a letter → Set as template).");
            return;
        }
        if (!jobDescription.trim()) {
            setError("Job description is required.");
            return;
        }
        setError(null);

        const template = await getLetter(templateLetterId!);
        const created = await gen.mutateAsync({
            jobDescription,
            templateLatex: template.contentLatex
        });
        onClose();
        navigate(`/app/letters/${created.id}`);
    };

    return (
        <Modal open={open} onClose={onClose} title="Generate from Template">
            {!canGenerate && (
                <div className="mb-3 text-xs text-gray-700">
                    No template set. Right-click a letter in the list and choose “Set as template”.
                </div>
            )}
            <label className="block text-sm mb-1">Job description</label>
            <textarea
                className="w-full border border-grayline p-2 h-40 text-sm"
                value={jobDescription}
                onChange={(e) => setJD(e.target.value)}
                placeholder="Paste the job description here…"
            />
            {error && <div className="text-xs text-red-600 mt-2">{error}</div>}

            <div className="mt-3 flex justify-end gap-2">
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="solid"
                    onClick={handleSubmit}
                    disabled={!canGenerate || gen.isPending}
                >
                    {gen.isPending ? "Generating…" : "Generate"}
                </Button>
            </div>
        </Modal>
    );
}