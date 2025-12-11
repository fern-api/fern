import { generatorsYml } from "@fern-api/configuration";

import { type BaseOpenAPIWorkspace } from "./BaseOpenAPIWorkspace";

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
        if (settings.unions === "v1") {
            result.discriminatedUnionV2 = true;
        }
        if (settings["use-title"] != null) {
            result.useTitlesAsName = settings["use-title"];
        }
        if (settings["message-naming"] != null) {
            result.asyncApiNaming = settings["message-naming"];
        }
        if (settings["respect-nullable-schemas"] != null) {
            result.respectNullableSchemas = settings["respect-nullable-schemas"];
        }
        if (settings["only-include-referenced-schemas"] != null) {
            result.onlyIncludeReferencedSchemas = settings["only-include-referenced-schemas"];
        }
        if (settings["inline-path-parameters"] != null) {
            result.inlinePathParameters = settings["inline-path-parameters"];
        }
        if (settings["idiomatic-request-names"] != null) {
            result.shouldUseIdiomaticRequestNames = settings["idiomatic-request-names"];
        }
        if (settings["wrap-references-to-nullable-in-optional"] != null) {
            result.wrapReferencesToNullableInOptional = settings["wrap-references-to-nullable-in-optional"];
        }
        if (settings["coerce-optional-schemas-to-nullable"] != null) {
            result.coerceOptionalSchemasToNullable = settings["coerce-optional-schemas-to-nullable"];
        }
        if (settings["group-environments-by-host"] != null) {
            result.groupEnvironmentsByHost = settings["group-environments-by-host"];
        }
        if (settings["remove-discriminants-from-schemas"] != null) {
            result.removeDiscriminantsFromSchemas = settings["remove-discriminants-from-schemas"];
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
