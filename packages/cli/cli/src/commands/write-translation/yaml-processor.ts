import * as yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";
import { shouldTranslateValue } from "./translatable-keys";
import { translateText } from "./translation-service";

/**
 * Converts a string to a slug format (lowercase, hyphenated)
 * @param text - The text to convert to a slug
 * @returns The slugified text
 * @example "Hello World" -> "hello-world"
 */
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Checks if an object is a navigation entry that needs a slug
 * @param obj - The object to check
 * @returns True if the object has a "page" field with a "path" field
 */
function isNavigationEntry(obj: unknown): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return typeof record["page"] === "string" && typeof record["path"] === "string";
}

export async function translateYamlObject(
    obj: unknown,
    language: string,
    sourceLanguage: string,
    filePath: string,
    cliContext: CliContext,
    sourceObj?: unknown
): Promise<unknown> {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === "string") {
        return obj;
    }

    if (Array.isArray(obj)) {
        const sourceArray = Array.isArray(sourceObj) ? sourceObj : undefined;
        return await Promise.all(
            obj.map((item, index) =>
                translateYamlObject(item, language, sourceLanguage, filePath, cliContext, sourceArray?.[index])
            )
        );
    }

    if (typeof obj === "object") {
        const result: Record<string, unknown> = {};
        const sourceRecord =
            typeof sourceObj === "object" && sourceObj !== null ? (sourceObj as Record<string, unknown>) : undefined;

        if (isNavigationEntry(obj) && sourceRecord) {
            const sourceTitle = sourceRecord["page"];
            if (typeof sourceTitle === "string") {
                result["slug"] = generateSlug(sourceTitle);
            }
        }

        for (const [key, value] of Object.entries(obj)) {
            if (shouldTranslateValue(key, value)) {
                result[key] = await translateText({ text: value as string, language, sourceLanguage, cliContext });
            } else {
                result[key] = await translateYamlObject(
                    value,
                    language,
                    sourceLanguage,
                    filePath,
                    cliContext,
                    sourceRecord?.[key]
                );
            }
        }

        return result;
    }

    return obj;
}

export async function translateYamlContent(
    yamlContent: string,
    language: string,
    sourceLanguage: string,
    filePath: string,
    cliContext: CliContext
): Promise<string> {
    // preserve the source material
    if (language === sourceLanguage) {
        return yamlContent;
    }

    try {
        const parsedYaml = yaml.load(yamlContent);

        if (!parsedYaml) {
            return yamlContent;
        }

        const translatedYaml = await translateYamlObject(
            parsedYaml,
            language,
            sourceLanguage,
            filePath,
            cliContext,
            parsedYaml
        );

        const translatedYamlContent = yaml.dump(translatedYaml, {
            indent: 2,
            lineWidth: -1,
            quotingType: '"',
            forceQuotes: false
        });

        return translatedYamlContent;
    } catch (error) {
        if (error instanceof Error && error.message.includes("403")) {
            throw error;
        }

        cliContext.logger.error(`    [ERROR] Failed to process YAML file ${filePath}: ${error}`);
        return yamlContent;
    }
}
