const handleAnalyze = async () => {
    if (!jobDiscriptionText.trim()) {
        setMassamge("Please enter a job description.");
        return;
    }

    setIsLoading(true);
    setMassamge("Analyzing...");

    try {
        const fields = await extractReplacementFields(jobDiscriptionText, coverLetterTemplate);
        setReplacementFields(fields); // Set the replacement fields in state
    } catch (error) {
        console.error("Error analyzing: ", { error });
        // It's generally better to set an error message for the user
        setMassamge("An error occurred during analysis.");
    } finally {
        setIsLoading(false);
        // You might want to clear the "Analyzing..." message
        // setMassamge("");
    }
};

const handleFieldChange = (index: number, newValue: string) => {
    const updatedFields = [...replacementFields];
    updatedFields[index].fieldValue = newValue;
    setReplacementFields(updatedFields);
};

<ul>
    {replacementFields.map((field, index) => (
        <li key={index}>
            {field.fieldName},{" "}
            <input
                type="text"
                value={field.fieldValue}
                onChange={(e) => handleFieldChange(index, e.target.value)}
                disabled={isLoading}
            />
        </li>
    ))}
</ul>