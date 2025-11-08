import { CliContext } from "../../cli-context/CliContext";
import { ContentTransformation } from "./types";
import { translateYamlContent } from "./yaml-processor";
import { translateText } from "./translation-service";

export async function transformContentForLanguage(
    transformation: ContentTransformation,
    cliContext: CliContext
): Promise<string> {
    const { filePath, language, sourceLanguage, originalContent } = transformation;

    cliContext.logger.debug(`[PROCESSING] ${filePath} for language: ${language} (source: ${sourceLanguage})`);

    try {
        if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) {
            return await translateYamlContent(originalContent, language, sourceLanguage, filePath, cliContext);
        }

        if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
            // todo: create MDX translate stub
            return translateText({ text: originalContent, language, sourceLanguage, fileType: "MDX", cliContext });
        }

        cliContext.logger.error(`[SKIP] Skipping file "${filePath}" - unsupported file type for translation.`);
        return originalContent;
    } catch (error) {
        if (error instanceof Error && error.message.includes("403")) {
            throw error;
        }

        return originalContent;
    }
}
