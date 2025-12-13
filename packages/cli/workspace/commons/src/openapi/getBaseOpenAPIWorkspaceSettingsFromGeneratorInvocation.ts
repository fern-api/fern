import { generatorsYml } from "@fern-api/configuration";

import { type BaseOpenAPIWorkspace } from "./BaseOpenAPIWorkspace";
import { type OpenAPISettings } from "./OpenAPISettings";

/**
 * Mapping table from ApiDefinitionSettingsSchema (kebab-case YAML keys) to OpenAPISettings (camelCase internal keys).
 * This eliminates the need for manual field-by-field mapping.
 * Some fields map to multiple internal fields (e.g., unions maps to discriminatedUnionV2).
 *
 * Note: Only includes fields that map to OpenAPISettings. Fields like path-parameter-order
 * that don't have corresponding OpenAPISettings properties are automatically excluded.
 */
type SettingsKey = keyof generatorsYml.ApiDefinitionSettingsSchema;
type MappingValue = keyof OpenAPISettings | readonly (keyof OpenAPISettings)[];
const SCHEMA_TO_SETTINGS_MAPPINGS: Partial<Record<SettingsKey, MappingValue>> = {
    "use-title": "useTitlesAsName",
    unions: "discriminatedUnionV2", // Special handling: "v1" -> true
    "message-naming": "asyncApiNaming",
    "respect-nullable-schemas": "respectNullableSchemas",
    "only-include-referenced-schemas": "onlyIncludeReferencedSchemas",
    "inline-path-parameters": "inlinePathParameters",
    "idiomatic-request-names": "shouldUseIdiomaticRequestNames",
    "wrap-references-to-nullable-in-optional": "wrapReferencesToNullableInOptional",
    "coerce-optional-schemas-to-nullable": "coerceOptionalSchemasToNullable",
    "group-environments-by-host": "groupEnvironmentsByHost",
    "remove-discriminants-from-schemas": "removeDiscriminantsFromSchemas"
};

function setIfDefined<K extends keyof OpenAPISettings>(
    target: Partial<OpenAPISettings>,
    key: K,
    value: OpenAPISettings[K] | undefined
): void {
    if (value !== undefined) {
        target[key] = value;
    }
}

export function getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(
    generatorInvocation: generatorsYml.GeneratorInvocation
): Partial<BaseOpenAPIWorkspace.Settings> | undefined {
    if (
        generatorInvocation.settings == null &&
        generatorInvocation.apiOverride?.auth == null &&
        generatorInvocation.apiOverride?.["auth-schemes"] == null
    ) {
        return undefined;
    }
    const result: Partial<BaseOpenAPIWorkspace.Settings> = {
        detectGlobalHeaders: true
    };

    // Convert settings from ApiDefinitionSettingsSchema to BaseOpenAPIWorkspace.Settings
    const settings = generatorInvocation.settings;
    if (settings != null) {
        for (const [schemaKey, internalKey] of Object.entries(SCHEMA_TO_SETTINGS_MAPPINGS) as Array<
            [SettingsKey, MappingValue]
        >) {
            const value = settings[schemaKey];
            if (value === undefined) {
                continue;
            }

            // Special handling for unions: "v1" -> discriminatedUnionV2 = true
            if (schemaKey === "unions") {
                if (value === "v1") {
                    setIfDefined(result, "discriminatedUnionV2", true);
                }
                continue;
            }

            const targets = Array.isArray(internalKey) ? internalKey : [internalKey];
            for (const target of targets) {
                setIfDefined(result, target as keyof OpenAPISettings, value as OpenAPISettings[keyof OpenAPISettings]);
            }
        }
    }

    if (generatorInvocation.apiOverride?.auth != null) {
        result.auth = generatorInvocation.apiOverride.auth;
    }

    if (generatorInvocation.apiOverride?.["auth-schemes"] != null) {
        result.authSchemes = generatorInvocation.apiOverride["auth-schemes"];
    }

    return result;
}
