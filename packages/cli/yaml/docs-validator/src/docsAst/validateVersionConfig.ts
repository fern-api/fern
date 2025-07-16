import { docsYml } from "@fern-api/configuration-loader"
import { validateAgainstJsonSchema } from "@fern-api/core-utils"

import * as DocsYmlJsonSchema from "./versions-yml.schema.json"

export type VersionParseResult = VersionFileSuccessParseResult | VersionFileFailureParseResult

interface VersionFileSuccessParseResult {
    type: "success"
    contents: docsYml.RawSchemas.VersionFileConfig
}

interface VersionFileFailureParseResult {
    type: "failure"
    message: string
}

export async function validateVersionConfigFileSchema({ value }: { value: unknown }): Promise<VersionParseResult> {
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const result = validateAgainstJsonSchema(value, DocsYmlJsonSchema as any)
    if (result.success) {
        return {
            type: "success",
            contents: docsYml.RawSchemas.Serializer.VersionFileConfig.parseOrThrow(value)
        }
    }

    const path = result.error?.instancePath ? ` at ${result?.error.instancePath}` : ""
    return {
        type: "failure",
        message: `${result.error?.message ?? "Failed to parse because JSON schema validation failed"}${path}`
    }
}
