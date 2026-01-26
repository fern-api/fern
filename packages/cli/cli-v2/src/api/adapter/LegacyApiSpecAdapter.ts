import type { OpenAPISpec, Spec, ProtobufSpec as V1ProtobufSpec } from "@fern-api/api-workspace-commons";
import type { schemas } from "@fern-api/config";
import { generatorsYml } from "@fern-api/configuration";
import { relativize } from "@fern-api/fs-utils";
import type { ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";
import type { Context } from "../../context/Context";
import type { ApiSpec } from "../config/ApiSpec";
import type { AsyncApiSpec } from "../config/AsyncApiSpec";
import { isAsyncApiSpec } from "../config/AsyncApiSpec";
import type { OpenApiSpec } from "../config/OpenApiSpec";
import { isOpenApiSpec } from "../config/OpenApiSpec";
import type { ProtobufSpec } from "../config/ProtobufSpec";
import { isProtobufSpec } from "../config/ProtobufSpec";

export namespace LegacyApiSpecAdapter {
    export interface Config {
        /** The CLI context */
        context: Context;
    }
}

/**
 * Adapts ApiSpec types to legacy Spec types.
 */
export class LegacyApiSpecAdapter {
    private readonly context: Context;

    constructor(config: LegacyApiSpecAdapter.Config) {
        this.context = config.context;
    }

    public adapt(spec: ApiSpec): Spec {
        if (isOpenApiSpec(spec)) {
            return this.adaptOpenApiSpec(spec);
        }
        if (isAsyncApiSpec(spec)) {
            return this.adaptAsyncApiSpec(spec);
        }
        if (isProtobufSpec(spec)) {
            return this.adaptProtobufSpec(spec);
        }

        // TODO: Handle other spec types (Fern, Conjure, OpenRPC) as needed
        throw new Error(`Unsupported spec type: ${JSON.stringify(spec)}`);
    }

    public convertAll(specs: ApiSpec[]): Spec[] {
        return specs.map((spec) => this.adapt(spec));
    }

    private adaptOpenApiSpec(spec: OpenApiSpec): OpenAPISpec {
        return {
            type: "openapi" as const,
            absoluteFilepath: spec.openapi,
            absoluteFilepathToOverrides: spec.overrides,
            absoluteFilepathToOverlays: spec.overlays,
            namespace: spec.namespace,
            source: {
                type: "openapi" as const,
                file: spec.openapi
            },
            settings: this.adaptOpenApiSettings(spec.settings)
        };
    }

    private adaptAsyncApiSpec(spec: AsyncApiSpec): OpenAPISpec {
        return {
            type: "openapi" as const,
            absoluteFilepath: spec.asyncapi,
            absoluteFilepathToOverrides: spec.overrides,
            absoluteFilepathToOverlays: undefined,
            namespace: spec.namespace,
            source: {
                type: "asyncapi" as const,
                file: spec.asyncapi
            },
            settings: this.adaptAsyncApiSettings(spec.settings)
        };
    }

    private adaptProtobufSpec(spec: ProtobufSpec): V1ProtobufSpec {
        const proto = spec.proto;
        return {
            type: "protobuf" as const,
            absoluteFilepathToProtobufRoot: proto.root,
            absoluteFilepathToProtobufTarget: proto.target,
            absoluteFilepathToOverrides: proto.overrides,
            relativeFilepathToProtobufRoot: relativize(this.context.cwd, proto.root),
            generateLocally: proto.localGeneration ?? false,
            fromOpenAPI: proto.fromOpenapi ?? false,
            dependencies: proto.dependencies?.map((dep) => dep.toString()) ?? [],
            settings: this.adaptProtobufSettings(spec.settings)
        };
    }

    private adaptOpenApiSettings(settings: OpenApiSpec["settings"]): ParseOpenAPIOptions | undefined {
        if (settings == null) {
            return undefined;
        }

        const result: Partial<ParseOpenAPIOptions> = {
            // Base API settings
            respectNullableSchemas: settings.respectNullableSchemas,
            wrapReferencesToNullableInOptional: settings.wrapReferencesToNullableInOptional,
            coerceOptionalSchemasToNullable: settings.coerceOptionalSchemasToNullable,
            useTitlesAsName: settings.titleAsSchemaName,
            coerceEnumsToLiterals: settings.coerceEnumsToLiterals,
            optionalAdditionalProperties: settings.optionalAdditionalProperties,
            shouldUseIdiomaticRequestNames: settings.idiomaticRequestNames,
            groupEnvironmentsByHost: settings.groupEnvironmentsByHost,
            removeDiscriminantsFromSchemas: this.adaptRemoveDiscriminantsFromSchemas(
                settings.removeDiscriminantsFromSchemas
            ),
            pathParameterOrder: this.adaptPathParameterOrder(settings.pathParameterOrder),

            // OpenAPI-specific settings
            respectReadonlySchemas: settings.respectReadonlySchemas,
            onlyIncludeReferencedSchemas: settings.onlyIncludeReferencedSchemas,
            inlinePathParameters: settings.inlinePathParameters,
            shouldUseUndiscriminatedUnionsWithLiterals: settings.preferUndiscriminatedUnionsWithLiterals,
            objectQueryParameters: settings.objectQueryParameters,
            respectForwardCompatibleEnums: settings.respectForwardCompatibleEnums,
            useBytesForBinaryResponse: settings.useBytesForBinaryResponse,
            defaultFormParameterEncoding: settings.defaultFormParameterEncoding,
            filter: settings.filter,
            exampleGeneration: this.adaptExampleGeneration(settings.exampleGeneration),
            additionalPropertiesDefaultsTo: settings.additionalPropertiesDefaultsTo,
            typeDatesAsStrings: settings.typeDatesAsStrings,
            preserveSingleSchemaOneOf: settings.preserveSingleSchemaOneof,
            inlineAllOfSchemas: settings.inlineAllOfSchemas,
            resolveAliases: settings.resolveAliases,
            groupMultiApiEnvironments: settings.groupMultiApiEnvironments,
            defaultIntegerFormat: this.adaptDefaultIntegerFormat(settings.defaultIntegerFormat)
        };

        const hasSettings = Object.values(result).some((v) => v != null);
        return hasSettings ? (result as ParseOpenAPIOptions) : undefined;
    }

    private adaptAsyncApiSettings(settings: AsyncApiSpec["settings"]): ParseOpenAPIOptions | undefined {
        if (settings == null) {
            return undefined;
        }

        const result: Partial<ParseOpenAPIOptions> = {
            // Base API settings (shared)
            respectNullableSchemas: settings.respectNullableSchemas,
            wrapReferencesToNullableInOptional: settings.wrapReferencesToNullableInOptional,
            coerceOptionalSchemasToNullable: settings.coerceOptionalSchemasToNullable,
            useTitlesAsName: settings.titleAsSchemaName,
            coerceEnumsToLiterals: settings.coerceEnumsToLiterals,
            optionalAdditionalProperties: settings.optionalAdditionalProperties,
            shouldUseIdiomaticRequestNames: settings.idiomaticRequestNames,
            groupEnvironmentsByHost: settings.groupEnvironmentsByHost,
            removeDiscriminantsFromSchemas: this.adaptRemoveDiscriminantsFromSchemas(
                settings.removeDiscriminantsFromSchemas
            ),
            pathParameterOrder: this.adaptPathParameterOrder(settings.pathParameterOrder),

            // AsyncAPI-specific settings
            asyncApiNaming: settings.messageNaming
        };

        const hasSettings = Object.values(result).some((v) => v != null);
        return hasSettings ? (result as ParseOpenAPIOptions) : undefined;
    }

    // TODO: Remove this.
    private adaptProtobufSettings(_settings: ProtobufSpec["settings"]): ParseOpenAPIOptions | undefined {
        return undefined;
    }

    private adaptRemoveDiscriminantsFromSchemas(
        value: schemas.RemoveDiscriminantsFromSchemasSchema | undefined
    ): generatorsYml.RemoveDiscriminantsFromSchemas | undefined {
        if (value == null) {
            return undefined;
        }
        switch (value) {
            case "always":
                return generatorsYml.RemoveDiscriminantsFromSchemas.Always;
            case "never":
                return generatorsYml.RemoveDiscriminantsFromSchemas.Never;
            default:
                return undefined;
        }
    }

    private adaptPathParameterOrder(
        value: schemas.PathParameterOrderSchema | undefined
    ): generatorsYml.PathParameterOrder | undefined {
        if (value == null) {
            return undefined;
        }
        switch (value) {
            case "url-order":
                return generatorsYml.PathParameterOrder.UrlOrder;
            case "spec-order":
                return generatorsYml.PathParameterOrder.SpecOrder;
            default:
                return undefined;
        }
    }

    private adaptDefaultIntegerFormat(
        value: schemas.DefaultIntegerFormatSchema | undefined
    ): generatorsYml.DefaultIntegerFormat | undefined {
        if (value == null) {
            return undefined;
        }
        switch (value) {
            case "int32":
                return generatorsYml.DefaultIntegerFormat.Int32;
            case "int64":
                return generatorsYml.DefaultIntegerFormat.Int64;
            case "uint32":
                return generatorsYml.DefaultIntegerFormat.Uint32;
            case "uint64":
                return generatorsYml.DefaultIntegerFormat.Uint64;
            default:
                return undefined;
        }
    }

    private adaptExampleGeneration(
        value: schemas.OpenApiExampleGenerationSchema | undefined
    ): generatorsYml.OpenApiExampleGenerationSchema | undefined {
        if (value == null) {
            return undefined;
        }
        const result: generatorsYml.OpenApiExampleGenerationSchema = {};
        if (value.request != null) {
            result.request = { "max-depth": value.request.maxDepth };
        }
        if (value.response != null) {
            result.response = { "max-depth": value.response.maxDepth };
        }
        return result;
    }
}
