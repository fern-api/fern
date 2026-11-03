import { applyErrorResponses, type OpenAPISettings } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { isRecord } from "@fern-api/core-utils";
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
}): Promise<{
    document: OpenAPIV3.Document;
    /** `errorResponses` with a file-path `schema` replaced by the loaded schema object. */
    errorResponses: generatorsYml.OpenApiErrorResponsesSchema | undefined;
}> {
    const errorResponses = settings?.errorResponses;
    if (errorResponses == null) {
        return { document, errorResponses: undefined };
    }
    const schema =
        typeof errorResponses.schema === "string"
            ? await loadErrorSchemaFile(AbsoluteFilePath.of(errorResponses.schema))
            : errorResponses.schema;
    return {
        document: applyErrorResponses({ document, errorResponses, schema }),
        errorResponses: { ...errorResponses, schema }
    };
}

async function loadErrorSchemaFile(absoluteFilePath: AbsoluteFilePath): Promise<Record<string, unknown>> {
    const contents = (await readFile(absoluteFilePath)).toString();
    const parsed: unknown = yaml.load(contents);
    if (!isRecord(parsed)) {
        throw new CliError({
            message: `Expected ${absoluteFilePath} to contain an OpenAPI schema object.`,
            code: CliError.Code.ConfigError
        });
    }
    return parsed;
}
