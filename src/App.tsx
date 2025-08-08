import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import coverLetterTemplate from './assets/cover_letter_template.tex?raw';

function App() {
  const [inputText, setInputText] = useState("");
  const [latexContent, setLatexContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateFile = async () => {
    if (!inputText.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setIsLoading(true);
    setError("");
    setLatexContent("");

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

      const prompt = `
        From the following job description text, extract the details below and return them as a clean JSON object. Use null if the detail does not exist.
        - "company_name": The name of the company.
        - "company_address": The physical address spanning one or two lines, in this format: "25 King Street West \\ Toronto, ON, M5L 1A2"
        - "role_title": The full title of the job role.
        - "hiring_manager_name": The hiring manager's name.

        Input text:
        ---
        ${inputText}
        ---
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              "company_name": { type: Type.STRING },
              "company_address": { type: Type.STRING },
              "role_title": { type: Type.STRING },
              "hiring_manager_name": { type: Type.STRING },
            }
          }
        }
      });

      console.log(response.text);

      const extractedInfo = JSON.parse(response.text!)

      const updatedCoverLetter = coverLetterTemplate
        .replace(/\[Company\]/g, extractedInfo.company_name || "[Company]")
        .replace(/\[Address\]/g, extractedInfo.company_address || "[Address]")
        .replace(/\[Role Title\]/g, extractedInfo.role_title || "[Role Title]")
        .replace(/\[Hiring Manager\]/g, extractedInfo.hiring_manager_name || 'Hiring Manager');

      setLatexContent(updatedCoverLetter);

      console.log(updatedCoverLetter);


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
        rows={20}
        cols={150}
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
