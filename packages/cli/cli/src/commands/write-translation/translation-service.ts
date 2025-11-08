const TRANSLATION_SERVICE_URL = "https://r88yjrnw5k.execute-api.us-east-1.amazonaws.com/dev2/translate";

import { getToken } from "@fern-api/auth";
import { CliContext } from "../../cli-context/CliContext";

export async function translateText({
    text,
    language,
    sourceLanguage,
    fileType,
    cliContext
}: {
    text: string;
    language: string;
    sourceLanguage: string;
    fileType?: string;
    cliContext: CliContext;
}): Promise<string> {
    if (language === sourceLanguage) {
        return text;
    }

    const token = await getToken();
    if (token == null) {
        cliContext.logger.error(
            "Authentication required. Please run 'fern login' or set the FERN_TOKEN environment variable."
        );
        throw new Error("Authentication required for translation service");
    }

    try {
        const response = await fetch(TRANSLATION_SERVICE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.value}`
            },
            body: JSON.stringify({
                text,
                source_language: sourceLanguage,
                target_language: language,
                ...(fileType !== undefined && { file_type: fileType })
            })
        });

        if (!response.ok) {
            let errorDetail = "";
            try {
                const errorBody = await response.json();
                errorDetail = errorBody.detail || JSON.stringify(errorBody);
            } catch {
                errorDetail = await response.text();
            }

            if (response.status === 403) {
                throw new Error(`403: ${errorDetail}`);
            } else {
                cliContext.logger.error(`[TRANSLATE] Error ${response.status}: ${errorDetail}`);
            }

            return text;
        }

        const result = await response.json();
        return result["translated_text"] ?? text;
    } catch (error) {
        if (error instanceof Error && error.message.includes("403")) {
            throw error;
        }
        return text;
    }
}
