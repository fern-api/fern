import { isOpenAPIV2, isOpenAPIV3, OpenAPISpec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, join, relative } from "@fern-api/fs-utils";
import { Source as OpenApiIrSource } from "@fern-api/openapi-ir";
import { Document, getParseOptions } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";

import { convertOpenAPIV2ToV3 } from "../utils/convertOpenAPIV2ToV3.js";
import { loadAsyncAPI } from "../utils/loadAsyncAPI.js";
import { loadOpenAPI } from "../utils/loadOpenAPI.js";

export class OpenAPILoader {
    constructor(private readonly absoluteFilePath: AbsoluteFilePath) {}

    public async loadDocuments({
        context,
        specs,
        loadAiExamples = false
    }: {
        context: TaskContext;
        specs: OpenAPISpec[];
        loadAiExamples?: boolean;
    }): Promise<Document[]> {
        const results = await Promise.all(specs.map((spec) => this.loadDocument({ context, spec, loadAiExamples })));
        return results.filter((doc): doc is Document => doc != null);
    }

    private async loadDocument({
        context,
        spec,
        loadAiExamples
    }: {
        context: TaskContext;
        spec: OpenAPISpec;
        loadAiExamples: boolean;
    }): Promise<Document | undefined> {
        try {
            const contents = (await readFile(spec.absoluteFilepath)).toString();
            let sourceRelativePath = relative(this.absoluteFilePath, spec.source.file);
            if (spec.source.relativePathToDependency != null) {
                sourceRelativePath = join(spec.source.relativePathToDependency, sourceRelativePath);
            }
            const source =
                spec.source.type === "protobuf"
                    ? OpenApiIrSource.protobuf({ file: sourceRelativePath })
                    : OpenApiIrSource.openapi({ file: sourceRelativePath });

            if (contents.includes("openapi") || contents.includes("swagger")) {
                try {
                    const openAPI = await loadOpenAPI({
                        absolutePathToOpenAPI: spec.absoluteFilepath,
                        context,
                        absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides,
                        absolutePathToOpenAPIOverlays: spec.absoluteFilepathToOverlays,
                        loadAiExamples
                    });
                    if (isOpenAPIV3(openAPI)) {
                        return {
                            type: "openapi",
                            value: openAPI,
                            source,
                            namespace: spec.namespace,
                            settings: getParseOptions({ options: spec.settings })
                        };
                    } else if (isOpenAPIV2(openAPI)) {
                        // default to https to produce a valid URL
                        if (!openAPI.schemes || openAPI.schemes.length === 0) {
                            openAPI.schemes = ["https"];
                        }
                        const convertedOpenAPI = await convertOpenAPIV2ToV3(openAPI);
                        return {
                            type: "openapi",
                            value: convertedOpenAPI,
                            source,
                            namespace: spec.namespace,
                            settings: getParseOptions({ options: spec.settings })
                        };
                    }
                } catch (error) {
                    context.logger.debug(
                        `Failed to parse OpenAPI document at ${spec.absoluteFilepath}: ${error}. Skipping...`
                    );
                    return undefined;
                }
            }

            if (contents.includes("asyncapi")) {
                try {
                    const asyncAPI = await loadAsyncAPI({
                        context,
                        absoluteFilePath: spec.absoluteFilepath,
                        absoluteFilePathToOverrides: spec.absoluteFilepathToOverrides
                    });
                    return {
                        type: "asyncapi",
                        value: asyncAPI,
                        source,
                        namespace: spec.namespace,
                        settings: getParseOptions({ options: spec.settings })
                    };
                } catch (error) {
                    context.logger.error(
                        `Failed to parse AsyncAPI document at ${spec.absoluteFilepath}: ${error}. Skipping...`
                    );
                    return undefined;
                }
            }

            if (contents.includes("openrpc")) {
                try {
                    const asyncAPI = await loadAsyncAPI({
                        context,
                        absoluteFilePath: spec.absoluteFilepath,
                        absoluteFilePathToOverrides: spec.absoluteFilepathToOverrides
                    });
                    return {
                        type: "asyncapi",
                        value: asyncAPI,
                        source,
                        namespace: spec.namespace,
                        settings: getParseOptions({ options: spec.settings })
                    };
                } catch (error) {
                    context.logger.error(
                        `Failed to parse OpenRPC document at ${spec.absoluteFilepath}: ${error}. Skipping...`
                    );
                    return undefined;
                }
            }

            context.logger.warn(
                `${spec.absoluteFilepath} is not a valid OpenAPI, AsyncAPI, or OpenRPC file. Skipping...`
            );
            return undefined;
        } catch (error) {
            context.logger.error(`Failed to read or process file ${spec.absoluteFilepath}: ${error}. Skipping...`);
            return undefined;
        }
    }
}
