import { useState } from "react";
import coverLetterTemplate from '../assets/cover_letter_template.tex?raw';
import sampleJobDescription from '../assets/sample-job-description.txt?raw';
import { generateCoverLetter } from "../services/gemini.ts";
import { latexCompilerLambdaApi } from '../services/latex-compiler-aws-lambda.ts'

export default function EditorPanel() {
    const [letter, setLetter] = useState<CoverLetter | null>(null)
    const [message, setMassamge] = useState("");
    const [jobDesctiption, setJobDescription] = useState(sampleJobDescription);
    const [editText, setEditText] = useState("");

    interface CoverLetter {
        "id": string,
        "title": string,
        "company": string,
        "position": string,
        "date": Date,
        "content": string
    }

    const handleGenerate = async () => {
        if (!jobDesctiption.trim()) {
            setMassamge("Please enter a job description.");
            return;
        }

        try {
            setMassamge("Generating...");
            const letter = await generateCoverLetter(jobDesctiption, coverLetterTemplate, new Date())
            setEditText(letter);
        } catch (error) {
            console.error("Error generating: ", { error });
            throw error;
        } finally {
            setMassamge("");
        }
    };

    const handleSave = () => {

    }

    const handleDownloadPdf = async () => {
        try {
            const response = await latexCompilerLambdaApi(editText);
            const base64 = response.body;

            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = "document.pdf";
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading pdf:", { error });
        }
    };

    return (
        <div className='flex flex-col'>
            {message && <p>{message}</p>}

            <textarea
                rows={20}
                cols={100}
                placeholder=""
                value={jobDesctiption}
                onChange={(e) => setJobDescription(e.target.value)}
            />
            <button onClick={handleGenerate}>
                Generate
            </button>

            <textarea
                rows={20}
                cols={100}
                placeholder=""
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
            />
            <button onClick={handleSave}>
                Save
            </button>
            <button onClick={handleDownloadPdf}>
                Download
            </button>

        </div>
    )
}