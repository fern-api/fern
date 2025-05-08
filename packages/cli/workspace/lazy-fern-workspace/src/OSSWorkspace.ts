import { OpenAPIV3_1 } from "openapi-types";
import { v4 as uuidv4 } from "uuid";

import {
    AbstractAPIWorkspace,
    BaseOpenAPIWorkspace,
    FernWorkspace,
    IdentifiableSource,
    OpenAPISpec,
    ProtobufSpec,
    Spec
} from "@fern-api/api-workspace-commons";
import { AsyncAPIConverter, AsyncAPIConverterContext } from "@fern-api/asyncapi-to-ir";
import { Audiences } from "@fern-api/configuration";
import { isNonNullish } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { IrGraph, mergeIntermediateRepresentation } from "@fern-api/ir-utils";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { OpenAPI3_1Converter, OpenAPIConverterContext3_1 } from "@fern-api/openapi-to-ir";
import { OpenRPCConverter, OpenRPCConverterContext3_1 } from "@fern-api/openrpc-to-ir";
import { TaskContext } from "@fern-api/task-context";
import { ErrorCollector } from "@fern-api/v2-importer-commons";

import { constructCasingsGenerator } from "../../../../commons/casings-generator/src/CasingsGenerator";
import { loadOpenRpc } from "./loaders";
import { OpenAPILoader } from "./loaders/OpenAPILoader";
import { getAllOpenAPISpecs } from "./utils/getAllOpenAPISpecs";

export declare namespace OSSWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        allSpecs: Spec[];
        specs: (OpenAPISpec | ProtobufSpec)[];
    }

    export type Settings = BaseOpenAPIWorkspace.Settings;
}

export class OSSWorkspace extends BaseOpenAPIWorkspace {
    public type: string = "oss";
    public allSpecs: Spec[];
    public specs: (OpenAPISpec | ProtobufSpec)[];
    public sources: IdentifiableSource[];

    private loader: OpenAPILoader;

    constructor({ allSpecs, specs, ...superArgs }: OSSWorkspace.Args) {
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
            respectForwardCompatibleEnums: specs
                .filter((spec) => spec.type === "openapi" && spec.source.type === "openapi")

                // TODO: Update this to '.every' once AsyncAPI sources are correctly recognized.
                .some((spec) => spec.settings?.respectForwardCompatibleEnums),
            exampleGeneration: specs[0]?.settings?.exampleGeneration
        });
        this.specs = specs;
        this.allSpecs = allSpecs;
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
     * @internal
     * @owner dsinghvi
     */
    public async getIntermediateRepresentation({
        context,
        audiences,
        enableUniqueErrorsPerEndpoint
    }: {
        context: TaskContext;
        audiences: Audiences;
        enableUniqueErrorsPerEndpoint: boolean;
    }): Promise<IntermediateRepresentation> {
        const specs = await getAllOpenAPISpecs({ context, specs: this.specs });
        const documents = await this.loader.loadDocuments({ context, specs });
        const irGraph = new IrGraph(audiences);

        const authOverrides =
            this.generatorsConfiguration?.api?.auth != null ? { ...this.generatorsConfiguration?.api } : undefined;
        if (authOverrides) {
            context.logger.trace("Using auth overrides from generators configuration");
        }

        const environmentOverrides =
            this.generatorsConfiguration?.api?.environments != null
                ? { ...this.generatorsConfiguration?.api }
                : undefined;
        if (environmentOverrides) {
            context.logger.trace("Using environment overrides from generators configuration");
        }

        const globalHeaderOverrides =
            this.generatorsConfiguration?.api?.headers != null ? { ...this.generatorsConfiguration?.api } : undefined;
        if (globalHeaderOverrides) {
            context.logger.trace("Using global header overrides from generators configuration");
        }

        let mergedIr: IntermediateRepresentation | undefined;
        for (const document of documents) {
            const errorCollector = new ErrorCollector({ logger: context.logger });
            let result: IntermediateRepresentation | undefined = undefined;

            switch (document.type) {
                case "openapi": {
                    const converterContext = new OpenAPIConverterContext3_1({
                        namespace: document.namespace,
                        generationLanguage: "typescript",
                        logger: context.logger,
                        smartCasing: false,
                        spec: document.value as OpenAPIV3_1.Document,
                        exampleGenerationArgs: { disabled: false },
                        errorCollector,
                        authOverrides,
                        environmentOverrides,
                        globalHeaderOverrides,
                        enableUniqueErrorsPerEndpoint
                    });
                    const converter = new OpenAPI3_1Converter({ context: converterContext });
                    result = await converter.convert();
                    break;
                }
                case "asyncapi": {
                    const converterContext = new AsyncAPIConverterContext({
                        namespace: document.namespace,
                        generationLanguage: "typescript",
                        logger: context.logger,
                        smartCasing: false,
                        spec: document.value,
                        exampleGenerationArgs: { disabled: false },
                        errorCollector,
                        enableUniqueErrorsPerEndpoint
                    });
                    const converter = new AsyncAPIConverter({ context: converterContext });
                    result = await converter.convert();
                    break;
                }
                default:
                    errorCollector.collect({
                        message: `Unsupported document type: ${document}`,
                        path: []
                    });
                    break;
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
        for (const spec of this.allSpecs) {
            if (spec.type === "openrpc") {
                const errorCollector = new ErrorCollector({ logger: context.logger });
                const converterContext = new OpenRPCConverterContext3_1({
                    namespace: spec.namespace,
                    generationLanguage: "typescript",
                    logger: context.logger,
                    smartCasing: false,
                    spec: await loadOpenRpc({
                        context,
                        absoluteFilePath: spec.absoluteFilepath,
                        absoluteFilePathToOverrides: spec.absoluteFilepathToOverrides
                    }),
                    exampleGenerationArgs: { disabled: false },
                    errorCollector,
                    enableUniqueErrorsPerEndpoint
                });

                const converter = new OpenRPCConverter({ context: converterContext });
                const result = await converter.convert();

                if (errorCollector.hasErrors()) {
                    context.logger.info("OpenRPC Importer encountered errors:");
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

    private convertSpecsToIdentifiableSources(specs: (OpenAPISpec | ProtobufSpec)[]): IdentifiableSource[] {
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
