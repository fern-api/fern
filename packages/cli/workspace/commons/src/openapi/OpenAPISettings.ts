import { ConvertOpenAPIOptions, getConvertOptions } from "@fern-api/openapi-ir-to-fern";
import { getParseOptions, ParseOpenAPIOptions } from "@fern-api/spec-to-openapi-ir";

export type OpenAPISettings = ParseOpenAPIOptions & ConvertOpenAPIOptions;

export function getOpenAPISettings({
    options,
    overrides
}: {
    options?: Partial<OpenAPISettings>;
    overrides?: Partial<OpenAPISettings>;
} = {}): OpenAPISettings {
    return {
        ...getParseOptions({ options, overrides }),
        ...getConvertOptions({ options, overrides })
    };
}
