import { GoogleGenAI } from '@google/genai';

export interface Field {
    "fieldName": string,
    "fieldValue": string
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateCoverLetter = async (jobDistription: string, letterTemplate: string, currentDate: Date): Promise<string> => {
    try {
        const prompt = `
            You are given a job description in plain text and a cover letter in latex. Update this old cover letter based on the job description.
            
            Update only the following fields (if relavent to the old template):
            - Company name
            - Company address
            - Position title
            - Name of hiring manager (use "Hiring Manager" can't be found in the job description with confidence)
            - Date (change to current date: ${currentDate.toDateString()}. Note the format of the old date, the new date should be in the same format)

            Otherwise, do not change the old cover letter in any way, even if it doesn't fully suit the new job yet. Return only latex.

            Job description text:
            ---
            ${jobDistription}
            ---

            Old cover letter:
            ---
            ${letterTemplate}
            ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });

        const parsedText = response.text!.replaceAll('```latex', '').replaceAll('```', '').trim();

        return parsedText;
    } catch (error) {
        console.error("Error generating cover letter: ", error);
        throw error;
    }
}

// export const generateTemplateFromCoverLetter = (coverLetter: string): Promise<string> => {
//     return Promise.resolve("")
// }

// You are given a job description in plain text and a cover letter in latex. Use the cover letter as a template and adapt it to the job description, changing only what is necessary.
            
// Follow this process:
// 1. Identify job-specific fields from the old cover letter that must be replaced, such as company name, position title, hiring manager name, date, address and more.
// 2. Find the corresonding values for these fields in the job discription.
// 3. Adapt the cover letter, changing only the necessary fields. Make sure the sentences have a good flow. Leave all latex styling unmodified.

// Notes:
// - If the name of a hiring manager could not be found in the job description with certainty, use "Hiring Manager" for the greeting.
// - Replace the old date with the current date, which is provided below. Preserving the old date format.

// Current Date: ${currentDate.toDateString()}

// Job description text:
// ---
// ${jobDistription}
// ---

// Cover letter template:
// ---
// ${letterTemplate}
// ---






// You are given a job description in plain text and a cover letter in latex. Update this old cover letter based on the job description.
            
// Update only the following fields (if relavent to the old template):
// - Company name
// - Company address
// - Position title
// - Name of hiring manager (use "Hiring Manager" can't be found in the job description with confidence)
// - Date (change to current date: ${currentDate.toDateString()}. Note the format of the old date, the new date should be in the same format)

// Otherwise, do not change the old cover letter in any way, even if it doesn't fully suit the new job yet. Return only latex.

// Job description text:
// ---
// ${jobDistription}
// ---

// Old cover letter:
// ---
// ${letterTemplate}
// ---