import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { useUploadMutation } from "@/features/letters/hooks";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import ThemeContainer from "@/components/ThemeContainer";

type Props = { open: boolean; onClose: () => void };

export default function UploadDialog({ open, onClose }: Props) {
    // Upload-only settings for now
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const upload = useUploadMutation();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = useState<string>("");

    useEffect(() => {
        if (!open) {
            setFileName("");
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
        const created = await upload.mutateAsync(content);
        onClose();
        navigate(`/app/letters/${created.id}`);
    };

    return (
        <Modal open={open} onClose={onClose} title="Upload">
            <p className="mb-3"> Up load a cover letter (must be in latex).</p>
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    id="file-upload"
                    type="file"
                    accept=".tex,text/plain"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                            onFile(f);
                            setFileName(f.name)
                        }
                    }}
                    className="hidden"
                />
                <Button variant="ghost" onClick={() => inputRef.current?.click()}>
                    Upload File
                </Button>
                {fileName && (
                    <span className="text-gray">
                        {fileName}
                    </span>
                )}
            </div>

            <ThemeContainer className="theme-shadow-inset mt-3">
                <textarea
                    className="h-full w-full p-5 font-serif outline-none resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Or past latex here"
                />
            </ThemeContainer>

            <div className="flex items-center justify-between mt-5">
                {error ? <div className="text-theme-red">{error}</div> : <div></div>}

                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={upload.isPending}
                    >
                        {upload.isPending ? "Uploading…" : "Upload"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}