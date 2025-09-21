import { docsYml } from "@fern-api/configuration-loader";
import { validateAgainstJsonSchema } from "@fern-api/core-utils";

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
        return {
            type: "success",
            contents: docsYml.RawSchemas.Serializer.ProductFileConfig.parseOrThrow(value)
        };
    }

    const path = result.error?.instancePath ? ` at ${result?.error.instancePath}` : "";
    return {
        type: "failure",
        message: `${result.error?.message ?? "Failed to parse because JSON schema validation failed"}${path}`
    };
}
