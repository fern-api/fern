import * as yaml from "js-yaml";
import { shouldTranslateValue } from "./translatable-keys";
import { translateText } from "./translation-service";
import { CliContext } from "../../cli-context/CliContext";


export function translateYamlObject(obj: any, language: string, sourceLanguage: string, cliContext: CliContext): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === "string") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => translateYamlObject(item, language, sourceLanguage, cliContext));
    }

    if (typeof obj === "object") {
        const result: any = {};

        for (const [key, value] of Object.entries(obj)) {
            if (shouldTranslateValue(key, value)) {
                result[key] = translateText(value as string, language, sourceLanguage);
            } else {
                result[key] = translateYamlObject(value, language, sourceLanguage, cliContext);
            }
        }

        return result;
    }

    return obj;
}

export function translateYamlContent(
    yamlContent: string,
    language: string,
    sourceLanguage: string,
    filePath: string,
    cliContext: CliContext
): string {
    // preserve the source material
    if (language === sourceLanguage) {
        return yamlContent;
    }

    try {
        const parsedYaml = yaml.load(yamlContent);

        if (!parsedYaml) {
            return yamlContent;
        }

        const translatedYaml = translateYamlObject(parsedYaml, language, sourceLanguage, cliContext);

        const translatedYamlContent = yaml.dump(translatedYaml, {
            indent: 2,
            lineWidth: -1,
            quotingType: '"',
            forceQuotes: false
        });

        return translatedYamlContent;
    } catch (error) {
        cliContext.logger.error(`    [ERROR] Failed to process YAML file ${filePath}: ${error}`);
        return yamlContent;
    }
}
