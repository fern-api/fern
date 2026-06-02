import { docsYml } from "@fern-api/configuration-loader";
import { formatNavigationConfigError, sanitizeNullValues, validateAgainstJsonSchema } from "@fern-api/core-utils";

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

        return {
            type: "success",
            contents: docsYml.RawSchemas.Serializer.VersionFileConfig.parseOrThrow(sanitizedValue)
        };
    }

    return {
        type: "failure",
        message: formatNavigationConfigError({ error: result.error, value })
    };
}
