import { generatorsYml } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Name, NameAndWireValue, SafeAndUnsafeString } from "@fern-api/ir-sdk";

import { CasingOptions, sanitizeName, toCamelCase, toPascalCase, toScreamingSnakeCase, toSnakeCase } from "./casings";

export interface CasingsGenerator {
    generateName(name: string, opts?: { casingOverrides?: RawSchemas.CasingOverridesSchema }): Name;
    generateNameAndWireValue(args: {
        name: string;
        wireValue: string;
        opts?: { casingOverrides?: RawSchemas.CasingOverridesSchema };
    }): NameAndWireValue;
}

export function constructCasingsGenerator({
    generationLanguage,
    keywords,
    smartCasing
}: {
    generationLanguage: generatorsYml.GenerationLanguage | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
}): CasingsGenerator {
    const casingOptions: CasingOptions = {
        generationLanguage,
        keywords,
        smartCasing
    };

    const casingsGenerator: CasingsGenerator = {
        generateName: (inputName, opts) => {
            const camelCaseResult = toCamelCase(inputName, casingOptions);
            const pascalCaseResult = toPascalCase(inputName, casingOptions);
            const snakeCaseResult = toSnakeCase(inputName, casingOptions);
            const screamingSnakeCaseResult = toScreamingSnakeCase(inputName, casingOptions);

            const generateSafeAndUnsafeString = (unsafeString: string): SafeAndUnsafeString => ({
                unsafeName: unsafeString,
                safeName: sanitizeName(unsafeString, casingOptions)
            });

            return {
                originalName: inputName,
                camelCase: opts?.casingOverrides?.camel
                    ? generateSafeAndUnsafeString(opts.casingOverrides.camel)
                    : camelCaseResult,
                pascalCase: opts?.casingOverrides?.pascal
                    ? generateSafeAndUnsafeString(opts.casingOverrides.pascal)
                    : pascalCaseResult,
                snakeCase: opts?.casingOverrides?.snake
                    ? generateSafeAndUnsafeString(opts.casingOverrides.snake)
                    : snakeCaseResult,
                screamingSnakeCase: opts?.casingOverrides?.["screaming-snake"]
                    ? generateSafeAndUnsafeString(opts.casingOverrides["screaming-snake"])
                    : screamingSnakeCaseResult
            };
        },
        generateNameAndWireValue: ({ name, wireValue, opts }) => ({
            name: casingsGenerator.generateName(name, opts),
            wireValue
        })
    };
    return casingsGenerator;
}
