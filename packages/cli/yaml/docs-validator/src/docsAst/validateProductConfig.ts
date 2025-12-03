import { docsYml } from "@fern-api/configuration-loader";
import { sanitizeNullValues, validateAgainstJsonSchema } from "@fern-api/core-utils";

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

export async function validateProductConfigFileSchema({ value }: { value: unknown }): Promise<ProductParseResult> {
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const result = validateAgainstJsonSchema(value, DocsYmlJsonSchema as any);
    if (result.success) {
        // Sanitize null/undefined values before parsing
        const removedPaths: string[][] = [];
        const sanitizedValue = sanitizeNullValues(value, [], removedPaths);

        if (removedPaths.length > 0) {
            console.warn(
                `Product config contained null/undefined sections that were ignored: ${removedPaths.map((p) => p.join(".")).join(", ")}`
            );
        }

        return {
            type: "success",
            contents: docsYml.RawSchemas.Serializer.ProductFileConfig.parseOrThrow(sanitizedValue)
        };
    }

    const path = result.error?.instancePath ? ` at ${result?.error.instancePath}` : "";
    return {
        type: "failure",
        message: `${result.error?.message ?? "Failed to parse because JSON schema validation failed"}${path}`
    };
}
