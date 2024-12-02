import { TaskContext } from "@fern-api/task-context";
import { mergeWithOverrides } from "./mergeWithOverrides";
import { AbsoluteFilePath, dirname, join, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { AsyncAPIV2, Document, FernOpenAPIExtension, FERN_TYPE_EXTENSIONS } from "@fern-api/openapi-ir-parser";
import { Source as OpenApiIrSource } from "@fern-api/openapi-ir";
import { readFile } from "fs/promises";
import { OpenAPI } from "openapi-types";
import { OpenAPISpec } from "../OSSWorkspace";
import { bundle, Config, Source } from "@redocly/openapi-core";
import { BundleOptions } from "@redocly/openapi-core/lib/bundle";
import yaml from "js-yaml";

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
                documents.push({
                    type: "openapi",
                    value: openAPI,
                    source,
                    namespace: spec.namespace,
                    settings: spec.settings
                });
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else if (
            typeof parsed === "object" &&
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
        return result.bundle.parsed;
    }
}
