import { DEFAULT_OPENAPI_BUNDLE_OPTIONS } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AsyncAPIV2, AsyncAPIV3 } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { bundle, Source } from "@redocly/openapi-core";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";
import { OpenAPIRefResolver } from "../loaders/OpenAPIRefResolver";

export async function loadAsyncAPI({
    context,
    absoluteFilePath,
    absoluteFilePathToOverrides
}: {
    context: TaskContext;
    absoluteFilePath: AbsoluteFilePath;
    absoluteFilePathToOverrides: AbsoluteFilePath | undefined;
}): Promise<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3> {
    const contents = (await readFile(absoluteFilePath)).toString();
    let parsed = (await yaml.load(contents)) as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;

    if (absoluteFilePathToOverrides != null) {
        parsed = await mergeWithOverrides<AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3>({
            absoluteFilePathToOverrides,
            context,
            data: parsed
        });
    }

    // Use redocly bundle to resolve external $ref references (e.g., ./schemas/file.yml#/Schema)
    const bundleResult = await bundle({
        ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
        doc: {
            source: new Source(absoluteFilePath, "<asyncapi>"),
            parsed
        },
        externalRefResolver: new OpenAPIRefResolver({
            absolutePathToOpenAPIOverrides: absoluteFilePathToOverrides
        })
    });

    return bundleResult.bundle.parsed as AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
}
