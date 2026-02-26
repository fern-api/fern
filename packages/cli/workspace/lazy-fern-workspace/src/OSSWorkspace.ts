import {
    AbstractAPIWorkspace,
    BaseOpenAPIWorkspace,
    FernWorkspace,
    GraphQLSpec,
    getOpenAPISettings,
    IdentifiableSource,
    OpenAPISpec,
    ProtobufSpec,
    Spec
} from "@fern-api/api-workspace-commons";
import { AsyncAPIConverter, AsyncAPIConverterContext } from "@fern-api/asyncapi-to-ir";
import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { Audiences, generatorsYml } from "@fern-api/configuration";
import { isNonNullish } from "@fern-api/core-utils";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, cwd, dirname, join, RelativeFilePath, relativize } from "@fern-api/fs-utils";
import { IntermediateRepresentation, serialization } from "@fern-api/ir-sdk";
import { mergeIntermediateRepresentation } from "@fern-api/ir-utils";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { ParseOpenAPIOptions, parse } from "@fern-api/openapi-ir-parser";
import { OpenAPI3_1Converter, OpenAPIConverterContext3_1 } from "@fern-api/openapi-to-ir";
import { OpenRPCConverter, OpenRPCConverterContext3_1 } from "@fern-api/openrpc-to-ir";
import { TaskContext } from "@fern-api/task-context";
import { ErrorCollector } from "@fern-api/v3-importer-commons";
import { readFile } from "fs/promises";
import { OpenAPIV3_1 } from "openapi-types";
import { v4 as uuidv4 } from "uuid";
import { loadOpenRpc } from "./loaders/index.js";
import { OpenAPILoader } from "./loaders/OpenAPILoader.js";
import { ProtobufIRGenerator } from "./protobuf/ProtobufIRGenerator.js";
import { MaybeValid } from "./protobuf/utils.js";
import { getAllOpenAPISpecs } from "./utils/getAllOpenAPISpecs.js";

export declare namespace OSSWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        allSpecs: Spec[];
        specs: (OpenAPISpec | ProtobufSpec)[];
    }

    export type Settings = BaseOpenAPIWorkspace.Settings;
}

/**
 * Collapses a boolean per-spec setting into a single workspace-level value.
 *
 * - If no spec explicitly defines the setting (all undefined) → returns undefined (defaults apply)
 * - If at least one spec defines it → returns true only if no spec explicitly sets it to false
 *   (undefined specs are treated as neutral / "don't care")
 *
 * This ensures that enabling a setting on a subset of specs works correctly,
 * without breaking users who don't set it at all. See https://github.com/fern-api/fern/issues/6408
 */
function collapseSpecBooleanSetting(
    specs: (OpenAPISpec | ProtobufSpec)[],
    getter: (settings: ParseOpenAPIOptions | undefined) => boolean | undefined
): boolean | undefined {
    const values = specs.map((spec) => getter(spec.settings));
    const hasAnyExplicit = values.some((v) => v != null);
    if (!hasAnyExplicit) {
        return undefined;
    }
    // If at least one spec explicitly defines the setting, treat undefined as neutral.
    // Only return false if a spec explicitly sets it to false.
    return values.every((v) => v == null || v === true);
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
    private readonly parseOptions: Partial<ParseOpenAPIOptions>;
    private readonly groupMultiApiEnvironments: boolean;

    private graphqlOperations: Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation> = {};
    private graphqlTypes: Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition> = {};

    constructor({ allSpecs, specs, ...superArgs }: OSSWorkspace.Args) {
        const openapiSpecs = specs.filter((spec) => spec.type === "openapi" && spec.source.type === "openapi");
        super({
            ...superArgs,
            respectReadonlySchemas: collapseSpecBooleanSetting(specs, (s) => s?.respectReadonlySchemas),
            respectNullableSchemas: collapseSpecBooleanSetting(specs, (s) => s?.respectNullableSchemas),
            wrapReferencesToNullableInOptional: collapseSpecBooleanSetting(
                specs,
                (s) => s?.wrapReferencesToNullableInOptional
            ),
            removeDiscriminantsFromSchemas: convertRemoveDiscriminantsFromSchemas(specs),
            coerceOptionalSchemasToNullable: collapseSpecBooleanSetting(
                specs,
                (s) => s?.coerceOptionalSchemasToNullable
            ),
            coerceEnumsToLiterals: collapseSpecBooleanSetting(specs, (s) => s?.coerceEnumsToLiterals),
            onlyIncludeReferencedSchemas: collapseSpecBooleanSetting(specs, (s) => s?.onlyIncludeReferencedSchemas),
            inlinePathParameters: collapseSpecBooleanSetting(specs, (s) => s?.inlinePathParameters),
            objectQueryParameters: collapseSpecBooleanSetting(specs, (s) => s?.objectQueryParameters),
            useBytesForBinaryResponse: collapseSpecBooleanSetting(openapiSpecs, (s) => s?.useBytesForBinaryResponse),
            respectForwardCompatibleEnums: collapseSpecBooleanSetting(
                openapiSpecs,
                (s) => s?.respectForwardCompatibleEnums
            ),
            inlineAllOfSchemas: collapseSpecBooleanSetting(specs, (s) => s?.inlineAllOfSchemas),
            resolveAliases: (() => {
                // Only collapse if at least one spec explicitly defines resolveAliases
                const values = specs.map((spec) => spec.settings?.resolveAliases);
                const hasAnyExplicit = values.some((v) => v != null);
                if (!hasAnyExplicit) {
                    return undefined;
                }
                // If any spec explicitly sets it to false, return false
                if (values.some((v) => v === false)) {
                    return false;
                }

                // Merge all except arrays into a single array
                const excepts = specs.flatMap((spec) =>
                    typeof spec.settings?.resolveAliases === "object" ? (spec.settings.resolveAliases.except ?? []) : []
                );
                return { except: excepts };
            })(),
            exampleGeneration: specs[0]?.settings?.exampleGeneration,
            groupEnvironmentsByHost: specs.some((spec) => spec.settings?.groupEnvironmentsByHost),
            defaultIntegerFormat: specs[0]?.settings?.defaultIntegerFormat,
            pathParameterOrder: specs[0]?.settings?.pathParameterOrder
        });
        this.specs = specs;
        this.allSpecs = allSpecs;
        this.sources = this.convertSpecsToIdentifiableSources(specs);
        this.loader = new OpenAPILoader(this.absoluteFilePath);
        this.groupMultiApiEnvironments = this.specs.some((spec) => spec.settings?.groupMultiApiEnvironments);
        this.parseOptions = {
            onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas,
            respectReadonlySchemas: this.respectReadonlySchemas,
            respectNullableSchemas: this.respectNullableSchemas,
            wrapReferencesToNullableInOptional: this.wrapReferencesToNullableInOptional,
            coerceOptionalSchemasToNullable: this.coerceOptionalSchemasToNullable,
            coerceEnumsToLiterals: this.coerceEnumsToLiterals,
            inlinePathParameters: this.inlinePathParameters,
            objectQueryParameters: this.objectQueryParameters,
            exampleGeneration: this.exampleGeneration,
            useBytesForBinaryResponse: this.useBytesForBinaryResponse,
            respectForwardCompatibleEnums: this.respectForwardCompatibleEnums,
            inlineAllOfSchemas: this.inlineAllOfSchemas,
            resolveAliases: this.resolveAliases,
            removeDiscriminantsFromSchemas: this.removeDiscriminantsFromSchemas,
            groupMultiApiEnvironments: this.groupMultiApiEnvironments,
            groupEnvironmentsByHost: this.groupEnvironmentsByHost,
            defaultIntegerFormat: this.defaultIntegerFormat,
            pathParameterOrder: this.pathParameterOrder
        };
    }

    public getGraphqlOperations(): Record<FdrAPI.GraphQlOperationId, FdrAPI.api.v1.register.GraphQlOperation> {
        return this.graphqlOperations;
    }

    public getGraphqlTypes(): Record<FdrAPI.TypeId, FdrAPI.api.v1.register.TypeDefinition> {
        return this.graphqlTypes;
    }

    public getGraphqlOperationsCount(): number {
        return Object.keys(this.graphqlOperations).length;
    }

    public getGraphqlTypesCount(): number {
        return Object.keys(this.graphqlTypes).length;
    }

    public async processGraphQLSpecs(context: TaskContext): Promise<void> {
        const { GraphQLConverter } = await import("@fern-api/graphql-to-fdr");
        const graphqlSpecs = this.allSpecs.filter((spec): spec is GraphQLSpec => spec.type === "graphql");

        for (const spec of graphqlSpecs) {
            try {
                const converter = new GraphQLConverter({
                    context,
                    filePath: spec.absoluteFilepath
                });
                const result = await converter.convert();

                // Merge GraphQL operations and types into workspace
                Object.assign(this.graphqlOperations, result.graphqlOperations);
                Object.assign(this.graphqlTypes, result.types);
            } catch (error) {
                context.logger.error(
                    `Failed to process GraphQL spec ${spec.absoluteFilepath}:`,
                    error instanceof Error ? error.message : String(error)
                );
            }
        }
    }

    public async getOpenAPIIr(
        {
            context,
            relativePathToDependency,
            loadAiExamples = false
        }: {
            context: TaskContext;
            relativePathToDependency?: RelativeFilePath;
            loadAiExamples?: boolean;
        },
        settings?: OSSWorkspace.Settings
    ): Promise<OpenApiIntermediateRepresentation> {
        const openApiSpecs = await getAllOpenAPISpecs({ context, specs: this.specs, relativePathToDependency });
        return parse({
            context,
            documents: await this.loader.loadDocuments({
                context,
                specs: openApiSpecs,
                loadAiExamples
            }),
            options: {
                ...settings,
                ...this.parseOptions
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
        generateV1Examples,
        logWarnings
    }: {
        context: TaskContext;
        audiences: Audiences;
        enableUniqueErrorsPerEndpoint: boolean;
        generateV1Examples: boolean;
        logWarnings: boolean;
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

                if (errorStats.numErrors > 0) {
                    context.logger.log(
                        "error",
                        `API validation${specInfo} completed with ${errorStats.numErrors} errors.`
                    );
                } else if (errorStats.numWarnings > 0 && logWarnings) {
                    context.logger.log(
                        "warn",
                        `API validation${specInfo} completed with ${errorStats.numWarnings} warnings.`
                    );
                }

                await errorCollector.logErrors({ logWarnings });
            }
        }

        if (mergedIr === undefined) {
            throw new Error("Failed to generate intermediate representation");
        }
        return mergedIr;
    }

    public async toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: OSSWorkspace.Settings,
        specsOverride?: generatorsYml.ApiConfigurationV2SpecsSchema
    ): Promise<FernWorkspace> {
        // If specs override is provided, create a temporary workspace with the override specs
        if (specsOverride != null) {
            return this.createWorkspaceWithSpecsOverride({ context }, specsOverride, settings);
        }

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

    private async createWorkspaceWithSpecsOverride(
        { context }: { context: TaskContext },
        specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema,
        settings?: OSSWorkspace.Settings
    ): Promise<FernWorkspace> {
        // Convert specsOverride to Spec[] format directly
        const overrideSpecs = await this.convertSpecsOverrideToSpecs(specsOverride);
        const overrideAllSpecs = overrideSpecs.filter((spec) => spec.type !== "protobuf" || !spec.fromOpenAPI);

        // Create a new temporary workspace with the override specs
        const tempWorkspace = new OSSWorkspace({
            allSpecs: overrideAllSpecs,
            specs: overrideSpecs.filter((spec) => spec.type === "openapi" || spec.type === "protobuf") as (
                | OpenAPISpec
                | ProtobufSpec
            )[],
            generatorsConfiguration: this.generatorsConfiguration,
            workspaceName: this.workspaceName,
            cliVersion: this.cliVersion,
            absoluteFilePath: this.absoluteFilePath,
            changelog: this.changelog
        });

        // Get the definition from the temporary workspace
        const definition = await tempWorkspace.getDefinition({ context }, settings);

        return new FernWorkspace({
            absoluteFilePath: this.absoluteFilePath,
            workspaceName: this.workspaceName,
            generatorsConfiguration: this.generatorsConfiguration,
            dependenciesConfiguration: {
                dependencies: {}
            },
            definition,
            cliVersion: this.cliVersion,
            sources: tempWorkspace.sources
        });
    }

    private async convertSpecsOverrideToSpecs(
        specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema
    ): Promise<Spec[]> {
        // Handle conjure schema case
        if (!Array.isArray(specsOverride)) {
            throw new Error("Conjure specs override is not yet supported");
        }

        const specs: Spec[] = [];

        for (const spec of specsOverride) {
            if (generatorsYml.isOpenApiSpecSchema(spec)) {
                const absoluteFilepath = join(this.absoluteFilePath, RelativeFilePath.of(spec.openapi));
                const absoluteFilepathToOverrides = spec.overrides
                    ? join(this.absoluteFilePath, RelativeFilePath.of(spec.overrides))
                    : undefined;
                const absoluteFilepathToOverlays = spec.overlays
                    ? join(this.absoluteFilePath, RelativeFilePath.of(spec.overlays))
                    : undefined;

                // Create a minimal OpenAPI spec with default settings
                const openApiSpec: OpenAPISpec = {
                    type: "openapi",
                    absoluteFilepath,
                    absoluteFilepathToOverrides,
                    absoluteFilepathToOverlays,
                    // Use default settings from existing specs for compatibility
                    settings: this.specs.length > 0 ? this.specs[0]?.settings : undefined,
                    source: {
                        type: "openapi",
                        file: absoluteFilepath
                    },
                    namespace: spec.namespace ?? undefined
                };

                specs.push(openApiSpec);
            } else {
                // For now, only support OpenAPI specs override to keep it simple
                throw new Error(
                    `Spec type override not yet supported. Only OpenAPI specs are currently supported in specs override.`
                );
            }
        }

        return specs;
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
                    absoluteFilePath,
                    absoluteFilePathToOverrides: spec.type === "openapi" ? spec.absoluteFilepathToOverrides : undefined
                });
            }

            return acc;
        }, result);
    }
}
