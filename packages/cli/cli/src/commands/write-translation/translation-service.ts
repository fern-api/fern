const TRANSLATION_SERVICE_URL = "https://translate.buildwithfern.com/translate";

export async function translateText(
    text: string,
    language: string,
    sourceLanguage: string,
    fileType: string
): Promise<string> {
    if (language === sourceLanguage) {
        return text;
    }

    try {
        const response = await fetch(TRANSLATION_SERVICE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text,
                sourceLanguage,
                targetLanguage: language,
                fileType
            })
        });

        if (!response.ok) {
            throw new Error(`Translation service returned ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.translatedText ?? text;
    } catch (error) {
        return text;
    }
}
