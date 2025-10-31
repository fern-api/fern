export function translateText(text: string, language: string, sourceLanguage: string): string {
    // TODO: implement actual translation service

    if (language === sourceLanguage) {
        return text;
    }

    switch (language) {
        case "de":
            return `[DE] ${text}`;
        case "es":
            return `[ES] ${text}`;
        case "fr":
            return `[FR] ${text}`;
        default:
            return `[${language.toUpperCase()}] ${text}`;
    }
}
