import * as yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";
import { shouldTranslateValue } from "./translatable-keys";
import { translateText } from "./translation-service";

export async function translateYamlObject(
    obj: unknown,
    language: string,
    sourceLanguage: string,
    filePath: string,
    cliContext: CliContext
): Promise<unknown> {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === "string") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return await Promise.all(
            obj.map((item) => translateYamlObject(item, language, sourceLanguage, filePath, cliContext))
        );
    }

    if (typeof obj === "object") {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(obj)) {
            if (shouldTranslateValue(key, value)) {
                result[key] = await translateText({ text: value as string, language, sourceLanguage, cliContext });
            } else {
                result[key] = await translateYamlObject(value, language, sourceLanguage, filePath, cliContext);
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

        const translatedYaml = await translateYamlObject(parsedYaml, language, sourceLanguage, filePath, cliContext);

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
