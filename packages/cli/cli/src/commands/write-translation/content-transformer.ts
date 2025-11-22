import { CliContext } from "../../cli-context/CliContext";
import { translateText } from "./translation-service";
import { ContentTransformation } from "./types";
import { translateYamlContent } from "./yaml-processor";

export async function transformContentForLanguage({
    transformation,
    cliContext,
    stub = false
}: {
    transformation: ContentTransformation;
    cliContext: CliContext;
    stub: boolean;
}): Promise<string> {
    const { filePath, language, sourceLanguage, originalContent } = transformation;

    // yaml files still need to be processed in stub mode
    if (stub && !filePath.endsWith(".yml") && !filePath.endsWith(".yaml")) {
        cliContext.logger.debug(`[STUB] Returning content as-is for ${filePath} (stub mode enabled)`);
        return originalContent;
    }

    cliContext.logger.debug(`[PROCESSING] ${filePath} for language: ${language} (source: ${sourceLanguage})`);

    try {
        // don't translate generators config
        if ((filePath.endsWith(".yml") || filePath.endsWith(".yaml")) && !filePath.includes("generators.yml")) {
            return await translateYamlContent({
                yamlContent: originalContent,
                language,
                sourceLanguage,
                filePath,
                cliContext,
                stub
            });
        }

        if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
            return translateText({ text: originalContent, language, sourceLanguage, fileType: "MDX", cliContext });
        }

        // don't translate the fern org/version config
        if (filePath.endsWith(".json") && !filePath.includes("fern.config.json")) {
            return translateText({ text: originalContent, language, sourceLanguage, cliContext });
        }

        cliContext.logger.debug(`[SKIP] Skipping file "${filePath}" - unsupported file type for translation.`);
        return originalContent;
    } catch (error) {
        if (error instanceof Error && error.message.includes("403")) {
            throw error;
        }

        return originalContent;
    }
}

export function isAssetFile(filePath: string): boolean {
    const assetExtensions = [
        // Image formats
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".webp",
        ".ico",
        ".bmp",
        ".tiff",
        ".tif",
        // Font formats
        ".woff",
        ".woff2",
        ".ttf",
        ".otf",
        ".eot",
        // Document formats
        ".pdf",
        ".doc",
        ".docx",
        // Media formats
        ".mp4",
        ".webm",
        ".ogg",
        ".mp3",
        ".wav",
        // Other binary formats
        ".zip",
        ".tar",
        ".gz",
        ".bin"
    ];

    const lowerFilePath = filePath.toLowerCase();
    return assetExtensions.some((ext) => lowerFilePath.endsWith(ext));
}

export function shouldProcessFile(filePath: string, stub: boolean): boolean {
    if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
        return true;
    }

    if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
        return !stub;
    }

    if (filePath.endsWith(".json") && !filePath.includes("fern.config.json")) {
        return !stub;
    }

    return false;
}
