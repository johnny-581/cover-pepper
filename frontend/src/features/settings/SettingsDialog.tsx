import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useUploadMutation } from "@/features/letters/hooks";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";

type Props = { open: boolean; onClose: () => void };

export default function SettingsDialog({ open, onClose }: Props) {
    // Upload-only settings for now
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const up = useUploadMutation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) {
            setContent("");
            setError(null);
        }
    }, [open]);

    const onFile = async (f: File) => {
        const text = await f.text();
        setContent(text);
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            setError("Include LaTeX content.");
            return;
        }
        const created = await up.mutateAsync(content);
        onClose();
        navigate(`/app/letters/${created.id}`);
    };

    return (
        <Modal open={open} onClose={onClose} title="Settings">
            <div className="mb-3">
                <div className="text-sm font-medium mb-2">Upload LaTeX Letter</div>
                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="file"
                        accept=".tex,text/plain"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onFile(f);
                        }}
                    />
                    <span className="text-xs text-gray-600">or paste below</span>
                </div>
                <textarea
                    className="w-full border border-grayline p-2 h-48 text-sm"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste raw LaTeX here…"
                />
                {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
            </div>

            <div className="mt-3 flex justify-end gap-2">
                <Button onClick={onClose}>Close</Button>
                <Button variant="solid" onClick={handleSubmit} disabled={up.isPending}>
                    {up.isPending ? "Uploading…" : "Upload"}
                </Button>
            </div>
        </Modal>
    );
}