import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { bundle, Config, Source } from "@redocly/openapi-core";
import { BundleOptions } from "@redocly/openapi-core/lib/bundle";
import { Plugin } from "@redocly/openapi-core/lib/config";
import { NodeType } from "@redocly/openapi-core/lib/types";
import { OpenAPI } from "openapi-types";
import { mergeWithOverrides } from "./mergeWithOverrides";
import { FernOpenAPIExtension } from "./openapi/v3/extensions/fernExtensions";

const XFernStreaming: NodeType = {
    properties: {
        "stream-condition": { type: "string" },
        response: "Schema",
        "response-stream": "Schema"
    },
    required: ["stream-condition", "response", "response-stream"],
    extensionsPrefix: "x-"
};

const FERN_TYPE_EXTENSIONS: Plugin = {
    id: "",
    typeExtension: {
        oas3: (types) => {
            return {
                ...types,
                XFernStreaming,
                Operation: {
                    ...types.Operation,
                    properties: {
                        ...types.Operation?.properties,
                        "x-fern-streaming": "XFernStreaming"
                    }
                }
            };
        }
    }
};

export async function loadOpenAPI({
    absolutePathToOpenAPI,
    absolutePathToOpenAPIOverrides,
    context
}: {
    absolutePathToOpenAPI: AbsoluteFilePath;
    absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;
    context: TaskContext;
}): Promise<OpenAPI.Document> {
    const parsed = await parseOpenAPI({
        absolutePathToOpenAPI
    });

    let overridesFilepath = undefined;
    if (absolutePathToOpenAPIOverrides != null) {
        overridesFilepath = absolutePathToOpenAPIOverrides;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if (typeof parsed === "object" && (parsed as any)[FernOpenAPIExtension.OPENAPI_OVERIDES_FILEPATH] != null) {
        overridesFilepath = join(
            dirname(absolutePathToOpenAPI),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            RelativeFilePath.of((parsed as any)[FernOpenAPIExtension.OPENAPI_OVERIDES_FILEPATH])
        );
    }

    if (overridesFilepath != null) {
        const merged = await mergeWithOverrides<OpenAPI.Document>({
            absoluteFilepathToOverrides: overridesFilepath,
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

async function parseOpenAPI({
    absolutePathToOpenAPI,
    parsed
}: {
    absolutePathToOpenAPI: AbsoluteFilePath;
    parsed?: OpenAPI.Document;
}): Promise<OpenAPI.Document> {
    const options: BundleOptions = {
        config: new Config(
            {
                apis: {},
                styleguide: {
                    plugins: [FERN_TYPE_EXTENSIONS],
                    rules: {
                        spec: "warn"
                    }
                }
            },
            undefined
        ),
        dereference: false,
        removeUnusedComponents: false,
        keepUrlRefs: true
    };
    const result =
        parsed != null
            ? await bundle({
                  ...options,
                  doc: {
                      source: new Source(absolutePathToOpenAPI, "<openapi>"),
                      parsed
                  }
              })
            : await bundle({
                  ...options,
                  ref: absolutePathToOpenAPI
              });
    return await SwaggerParser.parse(result.bundle.parsed);
}
