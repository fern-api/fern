import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { bundle, Config } from "@redocly/openapi-core";
import { Plugin } from "@redocly/openapi-core/lib/config";
import { NodeType } from "@redocly/openapi-core/lib/types";
import { OpenAPI } from "openapi-types";

const XFernStreaming: NodeType = {
    properties: {
        "stream-condition": { type: "string" },
        response: "Schema",
        "response-stream": "Schema",
    },
    required: ["stream-condition", "response", "response-stream"],
    extensionsPrefix: "x-",
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
                        "x-fern-streaming": "XFernStreaming",
                    },
                },
            };
        },
    },
};

export async function loadOpenAPI(absoluteFilePathToOpenAPI: AbsoluteFilePath): Promise<OpenAPI.Document> {
    const result = await bundle({
        config: new Config(
            {
                apis: {},
                styleguide: {
                    plugins: [FERN_TYPE_EXTENSIONS],
                    rules: {
                        spec: "warn",
                    },
                },
            },
            undefined
        ),
        ref: absoluteFilePathToOpenAPI,
        dereference: false,
        removeUnusedComponents: false,
        keepUrlRefs: true,
    });

    return await SwaggerParser.parse(result.bundle.parsed);
}
