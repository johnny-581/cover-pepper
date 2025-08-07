import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Type Definition for Extracted Data ---
// Using TypeScript-style comments for clarity
/**
 * @typedef {object} JobDetails
 * @property {string} company_name
 * @property {string} company_address
 * @property {string} role_title
 * @property {string} hiring_manager_name
 */

function App() {
    const [jobDescription, setJobDescription] = useState("");
    const [latexContent, setLatexContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    /**
     * Main function to generate the .tex file content
     */
    const handleGenerateFile = async () => {
        if (!jobDescription.trim()) {
            setError("Please enter a job description.");
            return;
        }
        if (!apiKey) {
            setError("API key is not configured. Please check your .env.local file.");
            return;
        }

        setIsLoading(true);
        setError("");
        setLatexContent("");

        try {
            // 1. Fetch the LaTeX template from the public folder
            const templateResponse = await fetch('/cover_letter_template.tex');
            if (!templateResponse.ok) {
                throw new Error("Failed to load LaTeX template. Make sure it's in the /public folder.");
            }
            const templateContent = await templateResponse.text();

            // 2. Call Gemini API to extract details from the job description text
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `
        From the following job description text, extract the details below and return them as a clean JSON object.
        - "company_name": The name of the company.
        - "company_address": The physical address (e.g., "City, State"). If not present, use an empty string.
        - "role_title": The full title of the job role.
        - "hiring_manager_name": The hiring manager's name if specified. If not, default to "Hiring Manager".

        Job Description:
        ---
        ${jobDescription}
        ---
      `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json|```/g, "").trim();

            /** @type {JobDetails} */
            const details = JSON.parse(responseText);

            // 3. Replace placeholders in the template
            const updatedContent = templateContent
                .replace(/Ledcor Corporation/g, details.company_name || "Company Name")
                .replace(/Vancouver, BC, Canada/g, details.company_address || "Company Address")
                .replace(/Quality Analyst 169781/g, details.role_title || "Role Title")
                .replace(/Dear Hiring Manager,/g, `Dear ${details.hiring_manager_name || 'Hiring Manager'},`);

            setLatexContent(updatedContent);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Triggers the download of the generated .tex file
     */
    const handleDownloadTex = () => {
        if (!latexContent) return;

        const blob = new Blob([latexContent], { type: 'application/x-latex' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cover_letter.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h3>Automated Cover Letter Generator</h3>

            {/* Text Box for Job Description */}
            <textarea
                rows="10"
                cols="80"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
            />

            <div>
                {/* Generate File Button */}
                <button onClick={handleGenerateFile} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate File'}
                </button>

                {/* Download .tex Button */}
                <button onClick={handleDownloadTex} disabled={!latexContent || isLoading}>
                    Download .tex
                </button>
            </div>

            {/* Display Errors if any */}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
}

export default App;