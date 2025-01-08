import { docsYml } from "@fern-api/configuration-loader";
import { addPrefixToString } from "@fern-api/core-utils";

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
    const result = await docsYml.RawSchemas.Serializer.VersionFileConfig.parse(value);
    if (result.ok) {
        return {
            type: "success",
            contents: result.value
        };
    }

    const issues: string[] = result.errors.map((issue) => {
        const message = issue.path.length > 0 ? `${issue.message} at "${issue.path.join(" -> ")}"` : issue.message;
        return addPrefixToString({
            content: message,
            prefix: "  - "
        });
    });

    return {
        type: "failure",
        message: issues.join("\n")
    };
}
