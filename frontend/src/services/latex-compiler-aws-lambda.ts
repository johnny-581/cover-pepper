import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_LATEX_COMPILER_API_URL
});

export const latexCompilerLambdaApi = async (latex_source: string) => {
    try {
        const response = await apiClient.post('/latex-compiler', {
            latex_source: latex_source
        });

        return response.data;
    } catch (error) {
        console.error("Error calling the latex compiler API: ", error);
        throw error;
    }
}