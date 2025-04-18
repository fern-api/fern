export function createPythonClassName(input: string): string {
    // Handle empty input
    if (!input) {
        return "Class";
    }

    // Clean up the input string
    let cleanedInput = input
        .replace(/[^a-zA-Z0-9\s_-]/g, " ") // Replace special characters with spaces
        .replace(/[-_\s]+/g, " ") // Replace hyphens, underscores and multiple spaces with single space
        .trim(); // Remove leading/trailing spaces

    // Handle numeric-only or empty string after cleanup
    if (!cleanedInput || /^\d+$/.test(cleanedInput)) {
        return "Class" + (cleanedInput || "");
    }

    // Handle strings starting with numbers
    if (/^\d/.test(cleanedInput)) {
        cleanedInput = "Class" + cleanedInput;
    }

    // Split into words and handle special cases
    const words = cleanedInput
        .split(/(?=[A-Z])|[-_\s]+/)
        .filter((word) => word.length > 0)
        .map((word) => {
            // Fix any garbled text by splitting on number boundaries
            return word.split(/(?<=\d)(?=[a-zA-Z])|(?<=[a-zA-Z])(?=\d)/).filter((w) => w.length > 0);
        })
        .flat();

    // Process each word
    return words
        .map((word, index) => {
            // If it's the first word and starts with a number, prepend "Class"
            if (index === 0 && /^\d/.test(word)) {
                return "Class" + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            // Preserve words that are all uppercase and longer than one character
            if (word.length > 1 && word === word.toUpperCase() && !/^\d+$/.test(word)) {
                return word;
            }
            // Capitalize first letter, lowercase rest
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join("");
}
