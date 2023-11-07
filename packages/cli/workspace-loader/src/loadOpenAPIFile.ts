import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { bundle, Config } from "@redocly/openapi-core";
import { NodeType } from "@redocly/openapi-core/src/types";
import { readdir } from "fs/promises";
import { OpenAPIFile } from "./types/Workspace";

export async function loadOpenAPIFromFolder(
    context: TaskContext,
    absolutePathToOpenAPIFolder: AbsoluteFilePath
): Promise<OpenAPIFile> {
    const files = await readdir(absolutePathToOpenAPIFolder);
    if (files.length < 1 || files[0] == null) {
        context.failAndThrow(`No OpenAPI found in directory ${absolutePathToOpenAPIFolder}`);
    }
    const absolutePathToOpenAPIFile = join(absolutePathToOpenAPIFolder, RelativeFilePath.of(files[0]));
    const result = await bundle({
        config: new Config({ apis: {}, styleguide: {} }, undefined),
        ref: absolutePathToOpenAPIFile,
        dereference: false,
        removeUnusedComponents: false,
        keepUrlRefs: true,
    });

    return {
        absoluteFilepath: absolutePathToOpenAPIFile,
        contents: JSON.stringify(result.bundle.parsed) as string,
    };
}

const XFernStreaming: NodeType = {
    properties: {
        "stream-condition": { type: "string" },
        response: "Schema",
        "response-stream": "Schema",
    },
    required: ["stream-condition", "response", "response-stream"],
    extensionsPrefix: "x-",
};

export async function loadOpenAPIFile(
    context: TaskContext,
    absolutePathToOpenAPI: AbsoluteFilePath
): Promise<OpenAPIFile> {
    const absolutePathToOpenAPIExists = await doesPathExist(absolutePathToOpenAPI);
    if (!absolutePathToOpenAPIExists) {
        context.failAndThrow(
            `OpenAPI spec not found at ${absolutePathToOpenAPI}. Please update the path in generators.yml`
        );
    }
    const result = await bundle({
        config: new Config(
            {
                apis: {},
                styleguide: {
                    plugins: [
                        {
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
                        },
                    ],
                    rules: {
                        spec: "warn",
                    },
                },
            },
            undefined
        ),
        ref: absolutePathToOpenAPI,
        dereference: false,
        removeUnusedComponents: false,
        keepUrlRefs: true,
    });

    return {
        absoluteFilepath: absolutePathToOpenAPI,
        contents: JSON.stringify(result.bundle.parsed) as string,
    };
}
