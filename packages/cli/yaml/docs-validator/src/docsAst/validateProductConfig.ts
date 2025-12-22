import { docsYml } from "@fern-api/configuration-loader";
import { sanitizeNullValues, validateAgainstJsonSchema, type YamlSourceMap } from "@fern-api/core-utils";

import * as DocsYmlJsonSchema from "./products-yml.schema.json";

export type ProductParseResult = ProductFileSuccessParseResult | ProductFileFailureParseResult;

interface ProductFileSuccessParseResult {
    type: "success";
    contents: docsYml.RawSchemas.VersionFileConfig;
}

interface ProductFileFailureParseResult {
    type: "failure";
    message: string;
}

export async function validateProductConfigFileSchema({
    value,
    filePath,
    sourceMap
}: {
    value: unknown;
    filePath?: string;
    sourceMap?: YamlSourceMap;
}): Promise<ProductParseResult> {
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const result = validateAgainstJsonSchema(value, DocsYmlJsonSchema as any, {
        filePath,
        sourceMap
    });
    if (result.success) {
        // Sanitize null/undefined values before parsing
        const removedPaths: string[][] = [];
        const sanitizedValue = sanitizeNullValues(value, [], removedPaths);

        return {
            type: "success",
            contents: docsYml.RawSchemas.Serializer.ProductFileConfig.parseOrThrow(sanitizedValue)
        };
    }

    return {
        type: "failure",
        message: result.error?.message ?? "Failed to parse because JSON schema validation failed"
    };
}
