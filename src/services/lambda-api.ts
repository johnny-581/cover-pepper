import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_LAMBDA_API_URL
});

export const calculateAreaLambdaApi = async (length: number, width: number) => {
    try {
        const response = await apiClient.post('/calculateArea', {
            length: length,
            width: width
        });

        return response.data;
    } catch (error) {
        console.error("Error calling calculateArea API: ", error);
        throw error;
    }
}