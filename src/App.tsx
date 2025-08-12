import { useState } from 'react';
import coverLetterTemplate from './assets/cover_letter_template.tex?raw';
import { type Field, extractFields, replaceFields } from './services/gemini.ts'
import { parseForCoverLetterBody } from './utils/parse-latex.ts'

function App() {
  const [jobDiscriptionText, setJobDiscriptionText] = useState("");
  const [letterBodyText, setLetterBodyText] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [message, setMassamge] = useState("");

  const handleAnalyze = async () => {
    if (!jobDiscriptionText.trim()) {
      setMassamge("Please enter a job description.");
      return;
    }

    try {
      setMassamge("Analyzing...");
      const fields = await extractFields(jobDiscriptionText, coverLetterTemplate)
      setFields(fields);
    } catch (error) {
      console.error("Error analyzing: ", { error });
      throw error;
    } finally {
      setMassamge("");
    }
  };

  const handleFieldChange = (index: number, newValue: string) => {
    const updatedFields = [...fields];
    updatedFields[index].fieldValue = newValue;
    setFields(updatedFields);
  }

  const handleReplace = async () => {
    try {
      setMassamge("Replacing...");
      const templateCoverLetterBody = parseForCoverLetterBody(coverLetterTemplate)
      const replacedCoverLetterBody = await replaceFields(fields, templateCoverLetterBody)
      setLetterBodyText(replacedCoverLetterBody)
    } catch (error) {
      console.error("Error replacing: ", { error });
      throw error;
    } finally {
      setMassamge("");
    }
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
      />
      <button onClick={handleAnalyze}>
        Analyze
      </button>

      <p>Fields To Replace:</p>
      <ul>
        {fields.map((field, index) => (
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
      <button onClick={handleReplace}>
        Replace
      </button>

      <textarea
        rows={20}
        cols={120}
        placeholder=""
        value={letterBodyText}
        onChange={(e) => setLetterBodyText(e.target.value)}
      />
      <button onClick={handleSave}>
        Save
      </button>
      <button onClick={handleDownloaPDF}>
        Download
      </button>

    </div>
  )
}

export default App