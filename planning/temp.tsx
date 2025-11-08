const handleDownloaPDF = async () => {
    try {
        const response = await latexCompilerLambdaApi(editText);
        const base64 = response.body; // body is a base 64 string of the pdf 

        // Decode the base64 string
        const byteCharacters = atob(base64);

        // Create an array of byte values
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        // Convert this array of byte values into a real typed byte array
        const byteArray = new Uint8Array(byteNumbers);

        // Create a Blob from the PDF data
        const blob = new Blob([byteArray], { type: 'application/pdf' });[18]

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);[3, 14]

        // Create a link element
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.pdf'; // or any other filename 

        // Append the link to the body
        document.body.appendChild(link);

        // Programmatically click the link to trigger the download
        link.click();[9, 11]

        // Clean up by removing the link and revoking the URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);[3, 7]

    } catch (error) {
        console.error("Error downloading pdf:", { error });
    }
};

