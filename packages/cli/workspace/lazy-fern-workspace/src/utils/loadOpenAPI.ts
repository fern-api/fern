import { OpenAPI } from "openapi-types";

import { AbsoluteFilePath, RelativeFilePath, dirname, join } from "@fern-api/fs-utils";
import { FernOpenAPIExtension } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";
import { parseOpenAPI } from "./parseOpenAPI";

export async function loadOpenAPI({
    context,
    absolutePathToOpenAPI,
    absolutePathToOpenAPIOverrides
}: {
    context: TaskContext;
    absolutePathToOpenAPI: AbsoluteFilePath;
    absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;
}): Promise<OpenAPI.Document> {
    const parsed = await parseOpenAPI({
        absolutePathToOpenAPI
    });

    let overridesFilepath = undefined;
    if (absolutePathToOpenAPIOverrides != null) {
        overridesFilepath = absolutePathToOpenAPIOverrides;
    } else if (
        typeof parsed === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (parsed as any)[FernOpenAPIExtension.OPENAPI_OVERIDES_FILEPATH] != null
    ) {
        overridesFilepath = join(
            dirname(absolutePathToOpenAPI),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            RelativeFilePath.of((parsed as any)[FernOpenAPIExtension.OPENAPI_OVERIDES_FILEPATH])
        );
    }

    if (overridesFilepath != null) {
        const merged = await mergeWithOverrides<OpenAPI.Document>({
            absoluteFilePathToOverrides: overridesFilepath,
            context,
            data: parsed
        });
        // Run the merged document through the parser again to ensure that any override
        // references are resolved.
        return await parseOpenAPI({
            absolutePathToOpenAPI,
            parsed: merged
        });
    }
    return parsed;
}
