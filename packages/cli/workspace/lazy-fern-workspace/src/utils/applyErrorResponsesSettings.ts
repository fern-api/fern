import { applyErrorResponses, type OpenAPISettings } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPIV3 } from "openapi-types";

/**
 * Applies the `error-responses` setting to a loaded OpenAPI document, reading the error body
 * schema from disk when the setting points at a file. The workspace loader has already resolved
 * that path to an absolute one. No-op when the setting is absent.
 */
export async function applyErrorResponsesSettings({
    document,
    settings
}: {
    document: OpenAPIV3.Document;
    settings: Pick<OpenAPISettings, "errorResponses"> | undefined;
}): Promise<OpenAPIV3.Document> {
    const errorResponses = settings?.errorResponses;
    if (errorResponses == null) {
        return document;
    }
    return applyErrorResponses({
        document,
        errorResponses,
        schema:
            typeof errorResponses.schema === "string"
                ? await loadErrorSchemaFile(AbsoluteFilePath.of(errorResponses.schema))
                : errorResponses.schema
    });
}

async function loadErrorSchemaFile(absoluteFilePath: AbsoluteFilePath): Promise<Record<string, unknown>> {
    const contents = (await readFile(absoluteFilePath)).toString();
    const parsed: unknown = yaml.load(contents);
    if (!isMapping(parsed)) {
        throw new CliError({
            message: `Expected ${absoluteFilePath} to contain an OpenAPI schema object.`,
            code: CliError.Code.ConfigError
        });
    }
    return parsed;
}

function isMapping(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
