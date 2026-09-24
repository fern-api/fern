import { getParseOptions, LibraryVisibilityFilter, ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";
import { ConvertOpenAPIOptions, getConvertOptions } from "@fern-api/openapi-ir-to-fern";

export type { LibraryVisibilityFilter };

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
