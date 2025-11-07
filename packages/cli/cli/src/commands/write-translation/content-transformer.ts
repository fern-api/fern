import { CliContext } from "../../cli-context/CliContext";
import { ContentTransformation } from "./types";
import { translateYamlContent } from "./yaml-processor";

export async function transformContentForLanguage(
    transformation: ContentTransformation,
    cliContext: CliContext
): Promise<string> {
    const { filePath, language, sourceLanguage, originalContent } = transformation;

    cliContext.logger.debug(`[PROCESSING] ${filePath} for language: ${language} (source: ${sourceLanguage})`);

    if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) {
        return await translateYamlContent(originalContent, language, sourceLanguage, filePath, cliContext);
    }

    if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
        // todo: create MDX translate stub
        return originalContent;
    }

    cliContext.logger.error(`[SKIP] Skipping file "${filePath}" - unsupported file type for translation.`);
    return originalContent;
}
