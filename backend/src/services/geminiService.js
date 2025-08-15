import { GoogleGenAI, Type } from '@google/genai';
import { ENV } from '../config/env.js';

const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

export async function generateCoverLetterLatex(jobDistription, templateLatex) {
    try {
        const prompt = `
            You are given a job description in plain text and a cover letter in latex. Update this old cover letter based on the job description.

            Update only the following fields (if relavent to the old template):
            - Company name
            - Company address
            - Position title
            - Name of hiring manager (use "Hiring Manager" can't be found in the job description with confidence)
            - Date (change to current date: ${new Date().toDateString()}. Note the format of the old date, the new date should be in the same format)

            Otherwise, do not change the old cover letter in any way, even if it doesn't fully suit the new job yet. Return only latex.

            Job description text:
            ---
            ${jobDistription}
            ---

            Old cover letter:
            ---
            ${templateLatex}
            ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });

        const parsedLatex = response.text?.replaceAll('```latex', '').replaceAll('```', '').trim();

        return parsedLatex;
    } catch (error) {
        console.error("Error generating cover letter latex: ", error);
        throw error;
    }
}


export async function generateCoverLetterMeta(coverLetter) {
    try {
        const prompt = `
            You are given a cover letter in latex. Generate the following metadata for it:
            - A title for the application combining company name and position title.
                Example: if the company is Apple Inc. and the position is F25 Junior Software Developer Co-Op 171853B, an appropriate title would be "Apple Junior Software Developer Co-Op".
                Use abbreviations like SWE, QA, and DevOps when possible.
                Also use abbreviation for the company name when possible.
            - Company name.
            - Position title ("Junior Software Developer" rather then "F25 Junior Software Developer Co-Op 171853B").
            - Date (use the exact date format shown).

            If any of the fields can't be determined from the provided cover letter, use null.

            Cover letter:
            ---
            ${coverLetter}
            ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-Lite',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        company: { type: Type.STRING },
                        position: { type: Type.STRING },
                        date: { type: Type.STRING },
                    },
                },
            },
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating cover letter meta: ", error);
        throw error;
    }
}