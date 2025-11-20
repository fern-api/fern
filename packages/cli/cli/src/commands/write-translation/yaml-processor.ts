import * as yaml from "js-yaml";
import { kebabCase } from "lodash-es";
import { CliContext } from "../../cli-context/CliContext";
import { shouldTranslateValue } from "./translatable-keys";
import { translateText } from "./translation-service";

/**
 * Converts a string to a slug format (lowercase, hyphenated)
 * Uses the same kebabCase logic as the CLI's docs slug generation
 * @param text - The text to convert to a slug
 * @returns The slugified text
 * @example "Hello World" -> "hello-world"
 * @example "DeepSeek" -> "deep-seek"
 */
export function generateSlug({ name }: { name: string }): string {
    const withoutExtension = name.replace(/\.(md|mdx)$/i, "");
    return kebabCase(withoutExtension);
}

function isPageConfiguration(obj: unknown): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return typeof record["page"] === "string" && typeof record["path"] === "string";
}

function isSectionConfiguration(obj: unknown): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return typeof record["section"] === "string" && Array.isArray(record["contents"]);
}

function isApiReferenceConfiguration(obj: unknown): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return typeof record["api"] === "string";
}

function isChangelogConfiguration(obj: unknown): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return typeof record["changelog"] === "string";
}

function isTabConfiguration(obj: unknown): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return typeof record["display-name"] === "string" || typeof record["displayName"] === "string";
}

function isProductConfiguration(obj: unknown): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return (
        (typeof record["display-name"] === "string" || typeof record["displayName"] === "string") &&
        typeof record["path"] === "string"
    );
}

function computeSlugForNavigationItem(sourceRecord: unknown): string | undefined {
    if (typeof sourceRecord !== "object" || sourceRecord === null) {
        return undefined;
    }

    const record = sourceRecord as Record<string, unknown>;

    if (typeof record["slug"] === "string") {
        return record["slug"];
    }

    if (record["skip-slug"] === true) {
        return undefined;
    }

    if (isPageConfiguration(sourceRecord)) {
        return generateSlug({ name: sourceRecord["page"] as string });
    }

    if (isSectionConfiguration(sourceRecord)) {
        return generateSlug({ name: sourceRecord["section"] as string });
    }

    if (isApiReferenceConfiguration(sourceRecord)) {
        const apiName = sourceRecord["api-name"];
        const api = sourceRecord["api"];
        return generateSlug({ name: (typeof apiName === "string" ? apiName : api) as string });
    }

    if (isChangelogConfiguration(sourceRecord)) {
        const title = sourceRecord["title"];
        if (typeof title === "string") {
            return generateSlug({ name: title });
        }
        const changelog = sourceRecord["changelog"];
        if (typeof changelog === "string") {
            const basename = changelog.split("/").pop() || changelog;
            return generateSlug({ name: basename });
        }
    }

    if (isTabConfiguration(sourceRecord)) {
        const displayName = sourceRecord["display-name"] || sourceRecord["displayName"];
        if (typeof displayName === "string") {
            return generateSlug({ name: displayName });
        }
    }

    if (isProductConfiguration(sourceRecord)) {
        const displayName = sourceRecord["display-name"] || sourceRecord["displayName"];
        if (typeof displayName === "string") {
            return generateSlug({ name: displayName });
        }
    }

    return undefined;
}

export async function translateYamlObject({
    obj,
    language,
    sourceLanguage,
    filePath,
    cliContext,
    stub,
    sourceObj
}: {
    obj: unknown;
    language: string;
    sourceLanguage: string;
    filePath: string;
    cliContext: CliContext;
    stub: boolean;
    sourceObj?: unknown;
}): Promise<unknown> {
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
                translateYamlObject({
                    obj: item,
                    language,
                    sourceLanguage,
                    filePath,
                    cliContext,
                    stub,
                    sourceObj: sourceArray?.[index]
                })
            )
        );
    }

    if (typeof obj === "object") {
        const result: Record<string, unknown> = {};
        const sourceRecord =
            typeof sourceObj === "object" && sourceObj !== null ? (sourceObj as Record<string, unknown>) : undefined;

        let computedSlug: string | undefined;
        computedSlug = computeSlugForNavigationItem(obj);

        for (const [key, value] of Object.entries(obj)) {
            if (key === "slug") {
                continue;
            }

            if (shouldTranslateValue(key, value)) {
                if (stub) {
                    result[key] = value;
                    continue;
                }

                result[key] = await translateText({ text: value as string, language, sourceLanguage, cliContext });
            } else {
                result[key] = await translateYamlObject({
                    obj: value,
                    language,
                    sourceLanguage,
                    filePath,
                    cliContext,
                    stub,
                    sourceObj: sourceRecord?.[key]
                });
            }
        }

        if (computedSlug !== undefined) {
            result["slug"] = computedSlug;
        }

        return result;
    }

    return obj;
}

export async function translateYamlContent({
    yamlContent,
    language,
    sourceLanguage,
    filePath,
    cliContext,
    stub = false
}: {
    yamlContent: string;
    language: string;
    sourceLanguage: string;
    filePath: string;
    cliContext: CliContext;
    stub: boolean;
}): Promise<string> {
    // preserve the source material
    if (language === sourceLanguage) {
        return yamlContent;
    }

    try {
        const parsedYaml = yaml.load(yamlContent);

        if (!parsedYaml) {
            return yamlContent;
        }

        const translatedYaml = await translateYamlObject({
            obj: parsedYaml,
            language,
            sourceLanguage,
            filePath,
            cliContext,
            stub,
            sourceObj: parsedYaml
        });

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
