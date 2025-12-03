import { docsYml } from "@fern-api/configuration-loader";
import { sanitizeNullValues, validateAgainstJsonSchema } from "@fern-api/core-utils";

import * as DocsYmlJsonSchema from "./versions-yml.schema.json";

export type VersionParseResult = VersionFileSuccessParseResult | VersionFileFailureParseResult;

interface VersionFileSuccessParseResult {
    type: "success";
    contents: docsYml.RawSchemas.VersionFileConfig;
}

interface VersionFileFailureParseResult {
    type: "failure";
    message: string;
}

export async function validateVersionConfigFileSchema({ value }: { value: unknown }): Promise<VersionParseResult> {
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const result = validateAgainstJsonSchema(value, DocsYmlJsonSchema as any);
    if (result.success) {
        // Sanitize null/undefined values before parsing
        const removedPaths: string[][] = [];
        const sanitizedValue = sanitizeNullValues(value, [], removedPaths);

        if (removedPaths.length > 0) {
            console.warn(
                `Version config contained null/undefined sections that were ignored: ${removedPaths.map((p) => p.join(".")).join(", ")}`
            );
        }

        return {
            type: "success",
            contents: docsYml.RawSchemas.Serializer.VersionFileConfig.parseOrThrow(sanitizedValue)
        };
    }

    const path = result.error?.instancePath ? ` at ${result?.error.instancePath}` : "";
    return {
        type: "failure",
        message: `${result.error?.message ?? "Failed to parse because JSON schema validation failed"}${path}`
    };
}
