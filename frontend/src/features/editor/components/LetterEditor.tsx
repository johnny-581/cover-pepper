import Editor, { type OnChange, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useUpdateMutation } from "@/features/letters/hooks";
import type { Letter } from "@/features/letters/types";

export default function LetterEditor({ letter }: { letter: Letter }) {
    const update = useUpdateMutation(letter.id);
    const [value, setValue] = useState(letter.contentLatex);
    const pendingSave = useRef<NodeJS.Timeout | null>(null);
    const dirty = useRef(false);

    useEffect(() => {
        setValue(letter.contentLatex);
        dirty.current = false;
    }, [letter.id, letter.contentLatex]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (dirty.current) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, []);

    const onChange: OnChange = (v) => {
        setValue(v ?? "");
        dirty.current = true;
        if (pendingSave.current) clearTimeout(pendingSave.current);
        pendingSave.current = setTimeout(async () => {
            await update.mutateAsync({ contentLatex: v ?? "" });
            dirty.current = false;
        }, 800);
    };

    const onMount: OnMount = (editor, monaco) => {
        if (!monaco.languages.getLanguages().some((l) => l.id === "latex")) {
            monaco.languages.register({ id: "latex" });
            monaco.languages.setMonarchTokensProvider("latex", {
                tokenizer: {
                    root: [
                        [/%.*/, "comment"],
                        [/\\[a-zA-Z]+/, "keyword"],
                        [/[{}[\]()]/, "@brackets"],
                        [/\$[^$]*\$/, "string"]
                    ]
                }
            });
        }

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
            if (pendingSave.current) {
                clearTimeout(pendingSave.current);
                pendingSave.current = null;
            }
            await update.mutateAsync({ contentLatex: editor.getValue() });
            dirty.current = false;
        });
    };

    return (
        <Editor
            height="100%"
            language="latex"
            theme="vs"
            value={value}
            onChange={onChange}
            onMount={onMount}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                wordWrap: "on",
                scrollBeyondLastLine: false,
                padding: { top: 8 }
            }}
        />
    );
}