import { docsYml } from "@fern-api/configuration-loader";
import { sanitizeNullValues, validateAgainstJsonSchema } from "@fern-api/core-utils";

import { formatNavigationConfigError } from "./formatNavigationConfigError.js";
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

        return {
            type: "success",
            contents: docsYml.RawSchemas.Serializer.ProductFileConfig.parseOrThrow(sanitizedValue)
        };
    }

    return {
        type: "failure",
        message: formatNavigationConfigError({ error: result.error, value })
    };
}
