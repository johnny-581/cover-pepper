import { GoogleGenAI, Type } from '@google/genai';

export interface Field {
    "fieldName": string,
    "fieldValue": string
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const extractFields = async (jobDistriptionText: string, letterTemplateBodyText: string): Promise<ReplacementField[]> => {
    try {
        const prompt = `
            You are given a job description and the body paragraphs of a cover letter template. We are doing the preparation for eventually adapting the template to the job description.
            Your task is to:
            1. Extract all the unique fields from the cover letter template (anything enclosed in square brackets, case in-sensitive). These fields will eventually be replaced.
            2. Find the corresonding values for these fields in the jobDistrictionText, based on thier context in the cover letter template.

            If there a hiring manager field exists in the cover letter template but could not be found in the job description, use "Hiring Manager".
            If any other field can't be found, use empty string.

            Job description text:
            ---
            ${jobDistriptionText}
            ---

            Cover letter template:
            ---
            ${letterTemplateBodyText}
            ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            "fieldName": { type: Type.STRING },
                            "fieldValue": { type: Type.STRING }
                        }
                    }
                }
            }
        });

        return JSON.parse(response.text!)
    } catch (error) {
        console.error("Error extracting fields: ", error);
        throw error;
    }
}

export const replaceFields = async (fields: Field[], coverLetterBody: string): Promise<string> => {
    try {
        const prompt = `
            You are given the body paragraphs of a cover letter template and a JSON object representing fields in the template and thier replacements.
            Your task is to adapt the template according to the definition in this JSON object. Replace all the fields with thier corresponding field values, effectively removing all the square brackets. Also make adjustments (if necessary) to the wording surrounding the fields to ensure a good sentence flow.

            Cover letter template:
            ---
            ${coverLetterBody}
            ---

            Fields and their replacements:
            ---
            ${fields}
            ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            "fieldName": { type: Type.STRING },
                            "fieldValue": { type: Type.STRING }
                        }
                    }
                }
            }
        });

        return JSON.parse(response.text!)
    } catch (error) {
        console.error("Error replacing the fields: ", error);
        throw error;
    }
}

// export const generateTemplateFromCoverLetter = (coverLetter: string): Promise<string> => {
//     return Promise.resolve("")
// }