import { useState, useEffect } from "react";

export const useCoverLetters = () => {
    const [letters, setLetters] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [templateId, setTemplateId] = useState(null);

    useEffect(() => {
        const letters = loadLetters() // todo
        setLetters(letters);
        if (initialLetters.length > 0) {
            setActiveId(initialLetters[0].id);
        }
    }, []);

    const updateActiveLetterContent = (newContent) => {
        setLetters(letters.map(
            letter => letter.id === activeId ? { ...letter, content: newContent } : letter
        ));
    };

    const selectLetter = (id) => {
        setActiveId(id);
    };

    const addNewLetter = (newLetter) => {
        setLetters([...letters, newLetter]);
    }

    const activeLetter = letters.find(letter => letter.id === activeId);

    return { letters, activeLetter, selectLetter, updateActiveLetterContent, addNewLetter }
}