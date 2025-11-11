import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernOpenAPIExtension, OpenAPIExtension } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPI } from "openapi-types";

import { mergeWithOverrides } from "../loaders/mergeWithOverrides";
import { parseOpenAPI } from "./parseOpenAPI";

// NOTE: This will affect any property that is explicitly named with this. This will preserve null values underneath
// the key or any descendants. This is an extreme edge case, but if we want to strip these, we will have to change
// mergeWithOverrides with a more specific grammar.
const OPENAPI_EXAMPLES_KEYS = [
    "examples",
    "example",
    FernOpenAPIExtension.EXAMPLES,
    OpenAPIExtension.REDOCLY_CODE_SAMPLES_CAMEL,
    OpenAPIExtension.REDOCLY_CODE_SAMPLES_KEBAB
];

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
        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
        (parsed as any)[FernOpenAPIExtension.OPENAPI_OVERIDES_FILEPATH] != null
    ) {
        overridesFilepath = join(
            dirname(absolutePathToOpenAPI),
            // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            RelativeFilePath.of((parsed as any)[FernOpenAPIExtension.OPENAPI_OVERIDES_FILEPATH])
        );
    }

    let result = parsed;

    if (overridesFilepath != null) {
        result = await mergeWithOverrides<OpenAPI.Document>({
            absoluteFilePathToOverrides: overridesFilepath,
            context,
            data: result,
            allowNullKeys: OPENAPI_EXAMPLES_KEYS
        });
    }

    const aiExamplesOverrideFilepath = join(
        dirname(absolutePathToOpenAPI),
        RelativeFilePath.of("ai_examples_override.yml")
    );

    try {
        result = await mergeWithOverrides<OpenAPI.Document>({
            absoluteFilePathToOverrides: aiExamplesOverrideFilepath,
            context,
            data: result,
            allowNullKeys: OPENAPI_EXAMPLES_KEYS
        });
        context.logger.debug(`Merged AI examples from ${aiExamplesOverrideFilepath}`);
    } catch (error) {
        context.logger.debug(`No AI examples override file found at ${aiExamplesOverrideFilepath}`);
    }

    if (overridesFilepath != null || result !== parsed) {
        return await parseOpenAPI({
            absolutePathToOpenAPI,
            absolutePathToOpenAPIOverrides,
            parsed: result
        });
    }
    return result;
}
