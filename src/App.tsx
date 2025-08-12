import { useState } from 'react';
import coverLetterTemplate from './assets/cover_letter_template.tex?raw';
import { type ReplacementField, extractReplacementFields } from './services/gemini.ts'

function App() {
  const [jobDiscriptionText, setJobDiscriptionText] = useState("");
  const [letterBodyText, setLetterBodyText] = useState("");
  const [replacementFields, setReplacementFields] = useState<ReplacementField[]>([]);
  const [message, setMassamge] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDiscriptionText.trim()) {
      setMassamge("Please enter a job description.");
      return;
    }

    setIsLoading(true);
    setMassamge("Analyzing...");

    try {
      const replacementFields = await extractReplacementFields(jobDiscriptionText, coverLetterTemplate)
      setReplacementFields(replacementFields);
    } catch (error) {
      console.error("Error analyzing: ", { error });
      throw error;
    } finally {
      setIsLoading(false);
      setMassamge("");
    }
  };

  const handleFieldChange = (index: number, newValue: string) => {
    const updatedFields = [...replacementFields];
    updatedFields[index].fieldValue = newValue;
    setReplacementFields(updatedFields);
  }

  const handleReplace = async () => {

  }

  // saves the body paragraphs of the current cover letter as a .txt file
  const handleSave = () => {

  }

  const handleDownloaPDF = async () => {
    // todo
  };

  return (
    <div className='flex flex-col'>
      {message && <p>{message}</p>}

      <textarea
        rows={20}
        cols={120}
        placeholder=""
        value={jobDiscriptionText}
        onChange={(e) => setJobDiscriptionText(e.target.value)}
        disabled={isLoading}
      />
      <button onClick={handleAnalyze} disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>

      <p>Fields To Replace:</p>
      <ul>
        {replacementFields.map((field, index) => (
          <li key={index}>
            {field.fieldName}:{" "}
            <input
              type="text"
              value={field.fieldValue}
              onChange={(e) => handleFieldChange(index, e.target.value)}
            />
          </li>
        ))}
      </ul>
      <button onClick={handleReplace} disabled={isLoading}>
        Replace
      </button>

      <textarea
        rows={20}
        cols={120}
        placeholder=""
        value={letterBodyText}
        onChange={(e) => setLetterBodyText(e.target.value)}
        disabled={isLoading}
      />
      <button onClick={handleSave} disabled={isLoading}>
        Save
      </button>
      <button onClick={handleDownloaPDF} disabled={isLoading}>
        Download
      </button>

    </div>
  )
}

export default App