import {
    AbstractAPIWorkspace,
    BaseOpenAPIWorkspace,
    FernWorkspace,
    getOpenAPISettings,
    IdentifiableSource,
    OpenAPISpec,
    ProtobufSpec,
    Spec
} from "@fern-api/api-workspace-commons";
import { AsyncAPIConverter, AsyncAPIConverterContext } from "@fern-api/asyncapi-to-ir";
import { Audiences, generatorsYml } from "@fern-api/configuration";
import { isNonNullish } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, dirname, join, RelativeFilePath, relativize } from "@fern-api/fs-utils";
import { IntermediateRepresentation, serialization } from "@fern-api/ir-sdk";
import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { OpenAPI3_1Converter, OpenAPIConverterContext3_1 } from "@fern-api/openapi-to-ir";
import { OpenRPCConverter, OpenRPCConverterContext3_1 } from "@fern-api/openrpc-to-ir";
import { TaskContext } from "@fern-api/task-context";
import { ErrorCollector } from "@fern-api/v3-importer-commons";
import { readFile } from "fs/promises";
import { OpenAPIV3_1 } from "openapi-types";
import { v4 as uuidv4 } from "uuid";
import { constructCasingsGenerator } from "../../../../commons/casings-generator/src/CasingsGenerator";
import { loadOpenRpc } from "./loaders";
import { OpenAPILoader } from "./loaders/OpenAPILoader";
import { ProtobufIRGenerator } from "./protobuf/ProtobufIRGenerator";
import { MaybeValid } from "./protobuf/utils";
import { getAllOpenAPISpecs } from "./utils/getAllOpenAPISpecs";

export declare namespace OSSWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        allSpecs: Spec[];
        specs: (OpenAPISpec | ProtobufSpec)[];
    }

    export type Settings = BaseOpenAPIWorkspace.Settings;
}

function convertRemoveDiscriminantsFromSchemas(
    specs: (OpenAPISpec | ProtobufSpec)[]
): generatorsYml.RemoveDiscriminantsFromSchemas {
    // If any spec has removeDiscriminantsFromSchemas set to Never, return Never
    if (
        specs.every(
            (spec) =>
                spec.settings?.removeDiscriminantsFromSchemas === generatorsYml.RemoveDiscriminantsFromSchemas.Never
        )
    ) {
        return generatorsYml.RemoveDiscriminantsFromSchemas.Never;
    }
    // Otherwise, return Always
    return generatorsYml.RemoveDiscriminantsFromSchemas.Always;
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
            wrapReferencesToNullableInOptional: specs.every(
                (spec) => spec.settings?.wrapReferencesToNullableInOptional
            ),
            removeDiscriminantsFromSchemas: convertRemoveDiscriminantsFromSchemas(specs),
            coerceOptionalSchemasToNullable: specs.every((spec) => spec.settings?.coerceOptionalSchemasToNullable),
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
            inlineAllOfSchemas: specs.every((spec) => spec.settings?.inlineAllOfSchemas),
            resolveAliases: (() => {
                // Require that resolveAliases is true/provided for all specs
                const allHaveResolveAliases = specs.every((spec) => spec.settings?.resolveAliases);
                if (!allHaveResolveAliases) {
                    return false;
                }

                // Merge all except arrays into a single array
                const excepts = specs.flatMap((spec) =>
                    typeof spec.settings?.resolveAliases === "object" ? (spec.settings.resolveAliases.except ?? []) : []
                );
                return { except: excepts };
            })(),
            exampleGeneration: specs[0]?.settings?.exampleGeneration,
            groupEnvironmentsByHost: specs.some((spec) => spec.settings?.groupEnvironmentsByHost)
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
                respectReadonlySchemas: this.respectReadonlySchemas,
                respectNullableSchemas: this.respectNullableSchemas,
                wrapReferencesToNullableInOptional: this.wrapReferencesToNullableInOptional,
                removeDiscriminantsFromSchemas: this.removeDiscriminantsFromSchemas,
                onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas,
                inlinePathParameters: this.inlinePathParameters,
                objectQueryParameters: this.objectQueryParameters,
                exampleGeneration: this.exampleGeneration,
                useBytesForBinaryResponse: this.useBytesForBinaryResponse,
                inlineAllOfSchemas: this.inlineAllOfSchemas,
                resolveAliases: this.resolveAliases,
                groupMultiApiEnvironments: this.specs.some((spec) => spec.settings?.groupMultiApiEnvironments),
                groupEnvironmentsByHost: this.groupEnvironmentsByHost,
                ...settings
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
        enableUniqueErrorsPerEndpoint,
        generateV1Examples
    }: {
        context: TaskContext;
        audiences: Audiences;
        enableUniqueErrorsPerEndpoint: boolean;
        generateV1Examples: boolean;
    }): Promise<IntermediateRepresentation> {
        const specs = await getAllOpenAPISpecs({ context, specs: this.specs });
        const documents = await this.loader.loadDocuments({ context, specs });

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

        const errorCollectors: ErrorCollector[] = [];

        for (const document of documents) {
            const absoluteFilepathToSpec = join(
                this.absoluteFilePath,
                RelativeFilePath.of(document.source?.file ?? "")
            );
            const relativeFilepathToSpec = relativize(cwd(), absoluteFilepathToSpec);

            const errorCollector = new ErrorCollector({ logger: context.logger, relativeFilepathToSpec });
            errorCollectors.push(errorCollector);

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
                        enableUniqueErrorsPerEndpoint,
                        generateV1Examples,
                        settings: getOpenAPISettings({ options: document.settings }),
                        documentBaseDir: dirname(absoluteFilepathToSpec)
                    });
                    const converter = new OpenAPI3_1Converter({ context: converterContext, audiences });
                    result = await converter.convert();
                    break;
                }
                case "asyncapi": {
                    const converterContext = new AsyncAPIConverterContext({
                        namespace: document.namespace,
                        generationLanguage: "typescript",
                        logger: context.logger,
                        smartCasing: false,
                        // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                        spec: document.value as any,
                        exampleGenerationArgs: { disabled: false },
                        errorCollector,
                        enableUniqueErrorsPerEndpoint,
                        settings: getOpenAPISettings({ options: document.settings }),
                        generateV1Examples
                    });
                    const converter = new AsyncAPIConverter({ context: converterContext, audiences });
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
                const absoluteFilepathToSpec = spec.absoluteFilepath;
                const relativeFilepathToSpec = relativize(cwd(), absoluteFilepathToSpec);

                const errorCollector = new ErrorCollector({ logger: context.logger, relativeFilepathToSpec });
                errorCollectors.push(errorCollector);

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
                    enableUniqueErrorsPerEndpoint,
                    generateV1Examples,
                    settings: getOpenAPISettings()
                });

                const converter = new OpenRPCConverter({ context: converterContext, audiences });
                const result = await converter.convert();

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
            } else if (spec.type === "protobuf") {
                // Handle protobuf specs by calling buf generate with protoc-gen-fern
                try {
                    const protobufIRGenerator = new ProtobufIRGenerator({ context });
                    const protobufIRFilepath = await protobufIRGenerator.generate({
                        absoluteFilepathToProtobufRoot: spec.absoluteFilepathToProtobufRoot,
                        absoluteFilepathToProtobufTarget: spec.absoluteFilepathToProtobufTarget,
                        local: true,
                        deps: spec.dependencies
                    });

                    const result = await readFile(protobufIRFilepath, "utf-8");

                    const casingsGenerator = constructCasingsGenerator({
                        generationLanguage: "typescript",
                        keywords: undefined,
                        smartCasing: false
                    });

                    if (result != null) {
                        let serializedIr: MaybeValid<IntermediateRepresentation>;
                        try {
                            serializedIr = serialization.IntermediateRepresentation.parse(JSON.parse(result), {
                                allowUnrecognizedEnumValues: true,
                                skipValidation: true
                            });
                            if (serializedIr.ok) {
                                mergedIr =
                                    mergedIr === undefined
                                        ? serializedIr.value
                                        : mergeIntermediateRepresentation(
                                              mergedIr,
                                              serializedIr.value,
                                              casingsGenerator
                                          );
                            } else {
                                throw new Error();
                            }
                        } catch (error) {
                            context.logger.log("error", "Failed to parse protobuf IR: ");
                        }
                    }
                } catch (error) {
                    context.logger.log("warn", "Failed to parse protobuf IR: " + error);
                }
            }
        }

        for (const errorCollector of errorCollectors) {
            if (errorCollector.hasErrors()) {
                const errorStats = errorCollector.getErrorStats();
                const specInfo = errorCollector.relativeFilepathToSpec
                    ? ` for ${errorCollector.relativeFilepathToSpec}`
                    : "";

                // TODO(kenny): we should do something more useful with the warnings here, or remove.
                if (errorStats.numErrors > 0) {
                    context.logger.log(
                        "error",
                        `API validation${specInfo} completed with ${errorStats.numErrors} errors and ${errorStats.numWarnings} warnings.`
                    );
                } else if (errorStats.numWarnings > 0) {
                    context.logger.log(
                        "warn",
                        `API validation${specInfo} completed with ${errorStats.numWarnings} warnings.`
                    );
                } else {
                    context.logger.log("info", `All checks passed when parsing OpenAPI${specInfo}.`);
                }

                context.logger.log("info", "");

                await errorCollector.logErrors({ logWarnings: false });
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
            ...this.allSpecs
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
