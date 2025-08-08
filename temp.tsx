import axios from 'axios';

// Create an Axios instance with the base URL from our environment variables.
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

/**
 * Calls the /calculateArea endpoint of our API.
 * @param {number} length - The length value.
 * @param {number} width - The width value.
 * @returns {Promise<object>} The response data from the API (e.g., { area: 50 }).
 */
export const calculateAreaOnApi = async (length, width) => {
    try {
        // Make a POST request to the /calculateArea path.
        // Axios automatically stringifies the object we pass as the second argument.
        const response = await apiClient.post('/calculateArea', {
            length: length,
            width: width
        });

        // Return the data part of the response
        return response.data;
    } catch (error) {
        // Log the error and re-throw it so the component can handle it.
        console.error("Error calling calculateArea API:", error);
        throw error;
    }
};




import React, { useState } from 'react';
import { calculateAreaOnApi } from './services/api'; // Adjust path if needed

function AreaCalculator() {
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent form from reloading the page

        // Reset state for new submission
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            // Call our API service function
            const data = await calculateAreaOnApi(Number(length), Number(width));
            setResult(data.area);
        } catch (apiError) {
            setError('Failed to calculate area. Please check the values and try again.');
        } finally {
            // Ensure loading is set to false whether it succeeded or failed
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>AWS Lambda Area Calculator</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Length:
                        <input
                            type="number"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Width:
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Calculating...' : 'Calculate Area'}
                </button>
            </form>

            {/* Show the result if it exists */}
            {result !== null && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Resulting Area: {result}</h3>
                </div>
            )}

            {/* Show an error message if something went wrong */}
            {error && (
                <div style={{ marginTop: '20px', color: 'red' }}>
                    <p>Error: {error}</p>
                </div>
            )}
        </div>
    );
}

export default AreaCalculator;