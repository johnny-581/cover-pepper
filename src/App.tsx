import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [inputText, setInputText] = useState("");
  const [latexContent, setLatexContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

  const handleGenerateFile = async () => {
    if (!inputText.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setIsLoading(true);
    setError("");
    setLatexContent("");

    try {
      const templateResponse = await fetch('./assets/cover_letter_template.tex');
      if (!templateResponse.ok) {
        throw new Error("Failed to load latex template")
      }
      const templateContent = await templateResponse.text();

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

      const prompt = `
        From the following input text, extract the details below and return them as a clean JSON object.
        - "company_name": The name of the company.
        - "company_address": The physical address (e.g., "City, State"). If not present, use an empty string.
        - "role_title": The full title of the job role.
        - "hiring_manager_name": The hiring manager's name if specified. If not, default to "Hiring Manager".

        Input text:
        ---
        ${inputText}
        ---
      `;


    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!latexContent) return;

    // const blob = new Blob([latexContent])
  }

  return (
    <div>
      <textarea
        placeholder=""
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isLoading}
      />

      <div>
        <button onClick={handleGenerateFile} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate File'}
        </button>

        <button onClick={handleDownload} disabled={!latexContent || isLoading}>
          Download
        </button>
      </div>

      {error && <p>Error: {error}</p>}
    </div>
  )
}

export default App
