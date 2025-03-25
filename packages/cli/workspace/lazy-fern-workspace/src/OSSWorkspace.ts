import { OpenAPIV3_1 } from "openapi-types";
import { v4 as uuidv4 } from "uuid";

import {
    AbstractAPIWorkspace,
    BaseOpenAPIWorkspace,
    FernWorkspace,
    IdentifiableSource,
    Spec
} from "@fern-api/api-workspace-commons";
import { AsyncAPIConverter, AsyncAPIConverterContext } from "@fern-api/asyncapi-to-ir";
import { isNonNullish } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { OpenAPI3_1Converter, OpenAPIConverterContext3_1 } from "@fern-api/openapi-to-ir";
import { TaskContext } from "@fern-api/task-context";
import { ErrorCollector } from "@fern-api/v2-importer-commons";

import { constructCasingsGenerator } from "../../../../commons/casings-generator/src/CasingsGenerator";
import { OpenAPILoader } from "./loaders/OpenAPILoader";
import { getAllOpenAPISpecs } from "./utils/getAllOpenAPISpecs";

export declare namespace OSSWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        specs: Spec[];
    }

    export type Settings = BaseOpenAPIWorkspace.Settings;
}

export class OSSWorkspace extends BaseOpenAPIWorkspace {
    public specs: Spec[];
    public sources: IdentifiableSource[];

    private loader: OpenAPILoader;

    constructor({ specs, ...superArgs }: OSSWorkspace.Args) {
        super({
            ...superArgs,
            respectReadonlySchemas: specs.every((spec) => spec.settings?.respectReadonlySchemas),
            respectNullableSchemas: specs.every((spec) => spec.settings?.respectNullableSchemas),
            onlyIncludeReferencedSchemas: specs.every((spec) => spec.settings?.onlyIncludeReferencedSchemas),
            inlinePathParameters: specs.every((spec) => spec.settings?.inlinePathParameters),
            objectQueryParameters: specs.every((spec) => spec.settings?.objectQueryParameters),
            useBytesForBinaryResponse: specs
                .filter((spec) => spec.type === "openapi" && spec.source.type === "openapi")

                // TODO: Update this to '.every' once AsyncAPI sources are correctly recognized.
                .some((spec) => spec.settings?.useBytesForBinaryResponse),
            exampleGeneration: specs[0]?.settings?.exampleGeneration
        });
        this.specs = specs;
        this.sources = this.convertSpecsToIdentifiableSources(specs);
        this.loader = new OpenAPILoader(this.absoluteFilePath);
    }

    public async getOpenAPIIr(
        {
            context,
            relativePathToDependency
        }: {
            context: TaskContext;
            relativePathToDependency?: RelativeFilePath;
        },
        settings?: OSSWorkspace.Settings
    ): Promise<OpenApiIntermediateRepresentation> {
        const openApiSpecs = await getAllOpenAPISpecs({ context, specs: this.specs, relativePathToDependency });
        return parse({
            context,
            documents: await this.loader.loadDocuments({
                context,
                specs: openApiSpecs
            }),
            options: {
                ...settings,
                respectReadonlySchemas: settings?.respectReadonlySchemas ?? this.respectReadonlySchemas,
                respectNullableSchemas: settings?.respectNullableSchemas ?? this.respectNullableSchemas,
                onlyIncludeReferencedSchemas:
                    settings?.onlyIncludeReferencedSchemas ?? this.onlyIncludeReferencedSchemas,
                inlinePathParameters: settings?.inlinePathParameters ?? this.inlinePathParameters,
                objectQueryParameters: settings?.objectQueryParameters ?? this.objectQueryParameters,
                exampleGeneration: settings?.exampleGeneration ?? this.exampleGeneration,
                useBytesForBinaryResponse: settings?.useBytesForBinaryResponse ?? this.useBytesForBinaryResponse
            }
        });
    }

    /**
     * @beta This method is in beta and not ready for production use.
     * @internal
     * @owner dsinghvi
     */
    public async getIntermediateRepresentation({
        context
    }: {
        context: TaskContext;
    }): Promise<IntermediateRepresentation> {
        const specs = await getAllOpenAPISpecs({ context, specs: this.specs });
        const documents = await this.loader.loadDocuments({ context, specs });
        let mergedIr: IntermediateRepresentation | undefined;
        for (const document of documents) {
            const errorCollector = new ErrorCollector({ logger: context.logger });
            let result: IntermediateRepresentation | undefined = undefined;
            if (document.type === "openapi") {
                const converterContext = new OpenAPIConverterContext3_1({
                    generationLanguage: "typescript",
                    logger: context.logger,
                    smartCasing: false,
                    spec: document.value as OpenAPIV3_1.Document
                });
                const converter = new OpenAPI3_1Converter({ context: converterContext });
                result = await converter.convert({
                    context: converterContext,
                    errorCollector
                });
            } else if (document.type === "asyncapi") {
                const converterContext = new AsyncAPIConverterContext({
                    generationLanguage: "typescript",
                    logger: context.logger,
                    smartCasing: false,
                    spec: document.value
                });
                const converter = new AsyncAPIConverter({ context: converterContext });
                result = await converter.convert({
                    context: converterContext,
                    errorCollector
                });
            } else {
                errorCollector.collect({
                    message: `Unsupported document type: ${document}`,
                    path: []
                });
            }
            if (errorCollector.hasErrors()) {
                context.logger.info(
                    `${document.type === "openapi" ? "OpenAPI" : "AsyncAPI"} Importer encountered errors:`
                );
                errorCollector.logErrors();
            }
            const casingsGenerator = constructCasingsGenerator({
                generationLanguage: "typescript",
                keywords: undefined,
                smartCasing: false
            });
            if (result != null) {
                mergedIr =
                    mergedIr === undefined
                        ? result
                        : mergeIntermediateRepresentation(mergedIr, result, casingsGenerator);
            }
        }
        if (mergedIr === undefined) {
            throw new Error("Failed to generate intermediate representation");
        }
        return mergedIr;
    }

    public async toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: OSSWorkspace.Settings
    ): Promise<FernWorkspace> {
        const definition = await this.getDefinition({ context }, settings);
        return new FernWorkspace({
            absoluteFilePath: this.absoluteFilePath,
            workspaceName: this.workspaceName,
            generatorsConfiguration: this.generatorsConfiguration,
            dependenciesConfiguration: {
                dependencies: {}
            },
            definition,
            cliVersion: this.cliVersion,
            sources: this.sources
        });
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [
            this.absoluteFilePath,
            ...this.specs
                .flatMap((spec) => [
                    spec.type === "protobuf" ? spec.absoluteFilepathToProtobufTarget : spec.absoluteFilepath,
                    spec.absoluteFilepathToOverrides
                ])
                .filter(isNonNullish)
        ];
    }

    public getSources(): IdentifiableSource[] {
        return this.sources;
    }

    private convertSpecsToIdentifiableSources(specs: Spec[]): IdentifiableSource[] {
        const seen = new Set<string>();
        const result: IdentifiableSource[] = [];
        return specs.reduce((acc, spec) => {
            const absoluteFilePath =
                spec.type === "protobuf" ? spec.absoluteFilepathToProtobufRoot : spec.absoluteFilepath;

            if (!seen.has(absoluteFilePath)) {
                seen.add(absoluteFilePath);
                acc.push({
                    type: spec.type,
                    id: uuidv4(),
                    absoluteFilePath
                });
            }

            return acc;
        }, result);
    }
}
