import { CliContext } from "../../cli-context/CliContext";
import { translateText } from "./translation-service";
import { ContentTransformation } from "./types";
import { translateYamlContent } from "./yaml-processor";

export async function transformContentForLanguage(
    transformation: ContentTransformation,
    cliContext: CliContext,
    stub: boolean = false
): Promise<string> {
    const { filePath, language, sourceLanguage, originalContent } = transformation;

    if (stub && !filePath.endsWith(".yml") && !filePath.endsWith(".yaml")) {
        cliContext.logger.debug(`[STUB] Returning content as-is for ${filePath} (stub mode enabled)`);
        return originalContent;
    }

    cliContext.logger.debug(`[PROCESSING] ${filePath} for language: ${language} (source: ${sourceLanguage})`);

    try {
        // don't translate generators config
        if ((filePath.endsWith(".yml") || filePath.endsWith(".yaml")) && !filePath.includes("generators.yml")) {
            return await translateYamlContent(originalContent, language, sourceLanguage, filePath, cliContext, stub);
        }

        if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
            return translateText({ text: originalContent, language, sourceLanguage, fileType: "MDX", cliContext });
        }

        // don't translate the fern org/version config
        if (filePath.endsWith(".json") && !filePath.includes("fern.config.json")) {
            return translateText({ text: originalContent, language, sourceLanguage, cliContext });
        }

        cliContext.logger.info(`[SKIP] Skipping file "${filePath}" - unsupported file type for translation.`);
        return originalContent;
    } catch (error) {
        if (error instanceof Error && error.message.includes("403")) {
            throw error;
        }

        return originalContent;
    }
}
