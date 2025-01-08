import { Source, bundle } from "@redocly/openapi-core";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { convertObj } from "swagger2openapi";

import { DEFAULT_OPENAPI_BUNDLE_OPTIONS, OpenAPISpec, isOpenAPIV2, isOpenAPIV3 } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, RelativeFilePath, dirname, join, relative } from "@fern-api/fs-utils";
import { Source as OpenApiIrSource } from "@fern-api/openapi-ir";
import { AsyncAPIV2, Document, FernOpenAPIExtension } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";

import { mergeWithOverrides } from "./mergeWithOverrides";

export class OpenAPILoader {
    constructor(private readonly absoluteFilePath: AbsoluteFilePath) {}

    public async loadDocuments({
        context,
        specs
    }: {
        context: TaskContext;
        specs: OpenAPISpec[];
    }): Promise<Document[]> {
        const documents: Document[] = [];
        for (const spec of specs) {
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
                const openAPI = await this.loadOpenAPI({
                    absolutePathToOpenAPI: spec.absoluteFilepath,
                    context,
                    absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides
                });
                if (isOpenAPIV3(openAPI)) {
                    documents.push({
                        type: "openapi",
                        value: openAPI,
                        source,
                        namespace: spec.namespace,
                        settings: spec.settings
                    });
                } else if (isOpenAPIV2(openAPI)) {
                    const convertedOpenAPI = await this.convertOpenAPIV2ToV3(openAPI);
                    documents.push({
                        type: "openapi",
                        value: convertedOpenAPI,
                        source,
                        namespace: spec.namespace,
                        settings: spec.settings
                    });
                }
            } else if (contents.includes("asyncapi")) {
                const asyncAPI = await this.loadAsyncAPI({
                    context,
                    absoluteFilePath: spec.absoluteFilepath,
                    absoluteFilePathToOverrides: spec.absoluteFilepathToOverrides
                });
                documents.push({
                    type: "asyncapi",
                    value: asyncAPI,
                    source,
                    namespace: spec.namespace,
                    settings: spec.settings
                });
            } else {
                context.failAndThrow(`${spec.absoluteFilepath} is not a valid OpenAPI or AsyncAPI file`);
            }
        }
        return documents;
    }

    private async loadOpenAPI({
        context,
        absolutePathToOpenAPI,
        absolutePathToOpenAPIOverrides
    }: {
        context: TaskContext;
        absolutePathToOpenAPI: AbsoluteFilePath;
        absolutePathToOpenAPIOverrides: AbsoluteFilePath | undefined;
    }): Promise<OpenAPI.Document> {
        const parsed = await this.parseOpenAPI({
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
            return await this.parseOpenAPI({
                absolutePathToOpenAPI,
                parsed: merged
            });
        }
        return parsed;
    }

    private async loadAsyncAPI({
        context,
        absoluteFilePath,
        absoluteFilePathToOverrides
    }: {
        context: TaskContext;
        absoluteFilePath: AbsoluteFilePath;
        absoluteFilePathToOverrides: AbsoluteFilePath | undefined;
    }): Promise<AsyncAPIV2.Document> {
        const contents = (await readFile(absoluteFilePath)).toString();
        const parsed = (await yaml.load(contents)) as AsyncAPIV2.Document;
        if (absoluteFilePathToOverrides != null) {
            return await mergeWithOverrides<AsyncAPIV2.Document>({
                absoluteFilePathToOverrides,
                context,
                data: parsed
            });
        }
        return parsed;
    }

    private async parseOpenAPI({
        absolutePathToOpenAPI,
        parsed
    }: {
        absolutePathToOpenAPI: AbsoluteFilePath;
        parsed?: OpenAPI.Document;
    }): Promise<OpenAPI.Document> {
        const result =
            parsed != null
                ? await bundle({
                      ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
                      doc: {
                          source: new Source(absolutePathToOpenAPI, "<openapi>"),
                          parsed
                      }
                  })
                : await bundle({
                      ...DEFAULT_OPENAPI_BUNDLE_OPTIONS,
                      ref: absolutePathToOpenAPI
                  });
        return result.bundle.parsed;
    }

    private async convertOpenAPIV2ToV3(openAPI: OpenAPIV2.Document): Promise<OpenAPIV3.Document> {
        const conversionResult = await convertObj(openAPI, {});
        return conversionResult.openapi;
    }
}
