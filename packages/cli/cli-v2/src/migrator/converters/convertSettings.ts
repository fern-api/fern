import type { schemas } from "@fern-api/config";
import type { generatorsYml } from "@fern-api/configuration";
import type { MigratorWarning } from "../types/index.js";

/**
 * Mapping from legacy kebab-case settings keys to new camelCase keys.
 */
const SETTINGS_KEY_MAP: Record<string, string> = {
    // Base settings
    "use-title": "titleAsSchemaName",
    "respect-nullable-schemas": "respectNullableSchemas",
    "wrap-references-to-nullable-in-optional": "wrapReferencesToNullableInOptional",
    "coerce-optional-schemas-to-nullable": "coerceOptionalSchemasToNullable",
    "coerce-enums-to-literals": "coerceEnumsToLiterals",
    "optional-additional-properties": "optionalAdditionalProperties",
    "idiomatic-request-names": "idiomaticRequestNames",
    "group-environments-by-host": "groupEnvironmentsByHost",
    "remove-discriminants-from-schemas": "removeDiscriminantsFromSchemas",
    "path-parameter-order": "pathParameterOrder",

    // OpenAPI-specific settings
    "only-include-referenced-schemas": "onlyIncludeReferencedSchemas",
    "inline-path-parameters": "inlinePathParameters",
    "prefer-undiscriminated-unions-with-literals": "preferUndiscriminatedUnionsWithLiterals",
    "object-query-parameters": "objectQueryParameters",
    "respect-readonly-schemas": "respectReadonlySchemas",
    "respect-forward-compatible-enums": "respectForwardCompatibleEnums",
    "use-bytes-for-binary-response": "useBytesForBinaryResponse",
    "default-form-parameter-encoding": "defaultFormParameterEncoding",
    "example-generation": "exampleGeneration",
    "additional-properties-defaults-to": "additionalPropertiesDefaultsTo",
    "type-dates-as-strings": "typeDatesAsStrings",
    "preserve-single-schema-oneof": "preserveSingleSchemaOneof",
    "inline-all-of-schemas": "inlineAllOfSchemas",
    "resolve-aliases": "resolveAliases",
    "group-multi-api-environments": "groupMultiApiEnvironments",
    "default-integer-format": "defaultIntegerFormat",

    // AsyncAPI-specific settings
    "message-naming": "messageNaming"
};

/**
 * Value mappings for enum-like settings.
 */
const PATH_PARAMETER_ORDER_MAP: Record<string, string> = {
    "url-order": "urlOrder",
    "spec-order": "specOrder"
};

const FORM_ENCODING_MAP: Record<string, string> = {
    form: "form",
    json: "json"
};

export interface ConvertSettingsResult {
    settings: schemas.OpenApiSettingsSchema;
    warnings: MigratorWarning[];
}

/**
 * Converts legacy API definition settings (kebab-case) to new format (camelCase).
 */
export function convertSettings(
    legacySettings: generatorsYml.ApiDefinitionSettingsSchema | undefined
): ConvertSettingsResult {
    if (legacySettings == null) {
        return { settings: {}, warnings: [] };
    }
    const warnings: MigratorWarning[] = [];
    const settings: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(legacySettings)) {
        if (value === undefined) {
            continue;
        }
        const newKey = SETTINGS_KEY_MAP[key] ?? key;
        if (key === "message-naming") {
            settings[newKey] = value;
            continue;
        }
        if (key === "path-parameter-order" && typeof value === "string") {
            settings[newKey] = PATH_PARAMETER_ORDER_MAP[value] ?? value;
            continue;
        }
        if (key === "default-form-parameter-encoding" && typeof value === "string") {
            settings[newKey] = FORM_ENCODING_MAP[value] ?? value;
            continue;
        }
        if (key === "unions") {
            // Legacy 'unions' setting maps to preferUndiscriminatedUnionsWithLiterals
            if (value === "v1") {
                settings["preferUndiscriminatedUnionsWithLiterals"] = true;
            }
            continue;
        }
        settings[newKey] = value;
    }
    return { settings: settings as schemas.OpenApiSettingsSchema, warnings };
}

/**
 * Converts legacy OpenAPI spec settings to new format.
 */
export function convertOpenApiSpecSettings(legacySettings: Record<string, unknown> | undefined): ConvertSettingsResult {
    if (legacySettings == null) {
        return { settings: {}, warnings: [] };
    }
    const warnings: MigratorWarning[] = [];
    const settings: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(legacySettings)) {
        if (value === undefined) {
            continue;
        }
        const newKey = SETTINGS_KEY_MAP[key] ?? key;
        if (key === "example-generation" && typeof value === "object" && value !== null) {
            settings["exampleGeneration"] = convertExampleGenerationSettings(value as Record<string, unknown>);
            continue;
        }
        if (key === "resolve-aliases" && typeof value === "object" && value !== null) {
            settings["resolveAliases"] = value;
            continue;
        }
        if (key === "path-parameter-order" && typeof value === "string") {
            settings[newKey] = PATH_PARAMETER_ORDER_MAP[value] ?? value;
            continue;
        }
        if (key === "default-form-parameter-encoding" && typeof value === "string") {
            settings[newKey] = FORM_ENCODING_MAP[value] ?? value;
            continue;
        }
        settings[newKey] = value;
    }
    return { settings: settings as schemas.OpenApiSettingsSchema, warnings };
}

function convertExampleGenerationSettings(exampleGen: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (exampleGen.request != null) {
        result.request = convertMaxDepthSettings(exampleGen.request as Record<string, unknown>);
    }
    if (exampleGen.response != null) {
        result.response = convertMaxDepthSettings(exampleGen.response as Record<string, unknown>);
    }
    return result;
}

function convertMaxDepthSettings(settings: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (settings["max-depth"] != null) {
        result.maxDepth = settings["max-depth"];
        return result;
    }
    if (settings.maxDepth != null) {
        result.maxDepth = settings.maxDepth;
        return result;
    }
    return result;
}
