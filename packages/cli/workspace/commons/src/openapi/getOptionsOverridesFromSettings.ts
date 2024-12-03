import { OpenAPISettings } from "./OpenAPISettings";
import { ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";

export function getOptionsOverridesFromSettings(settings?: OpenAPISettings): Partial<ParseOpenAPIOptions> | undefined {
    if (settings == null) {
        return undefined;
    }
    const result: Partial<ParseOpenAPIOptions> = {};
    if (settings.enableDiscriminatedUnionV2) {
        result.discriminatedUnionV2 = true;
    }
    if (settings.optionalAdditionalProperties) {
        result.optionalAdditionalProperties = true;
    }
    if (settings.cooerceEnumsToLiterals) {
        result.cooerceEnumsToLiterals = true;
    }
    if (settings.preserveSchemaIds) {
        result.preserveSchemaIds = true;
    }
    return result;
}
