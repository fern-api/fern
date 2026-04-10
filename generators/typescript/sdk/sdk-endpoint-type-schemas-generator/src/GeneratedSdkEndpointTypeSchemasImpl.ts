import { CaseConverter } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { getSchemaOptions, PackageId } from "@fern-typescript/commons";
import { FileContext, GeneratedSdkEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema.js";
import { GeneratedEndpointErrorSchemaImpl } from "./GeneratedEndpointErrorSchemaImpl.js";
import { GeneratedEndpointTypeSchema } from "./GeneratedEndpointTypeSchema.js";
import { GeneratedEndpointTypeSchemaImpl } from "./GeneratedEndpointTypeSchemaImpl.js";
import { StatusCodeDiscriminatedEndpointErrorSchema } from "./StatusCodeDiscriminatedEndpointErrorSchema.js";

export declare namespace GeneratedSdkEndpointTypeSchemasImpl {
    export interface Init {
        packageId: PackageId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
        shouldGenerateErrors: boolean;
        skipResponseValidation: boolean;
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
        caseConverter: CaseConverter;
    }
}

export class GeneratedSdkEndpointTypeSchemasImpl implements GeneratedSdkEndpointTypeSchemas {
    private static REQUEST_SCHEMA_NAME = "Request";
    private static RESPONSE_SCHEMA_NAME = "Response";
    private static STREAM_DATA_SCHEMA_NAME = "StreamData";

    private endpoint: FernIr.HttpEndpoint;
    private generatedRequestSchema: GeneratedEndpointTypeSchema | undefined;
    private generatedResponseSchema: GeneratedEndpointTypeSchemaImpl | undefined;
    private generatedStreamDataSchema: GeneratedEndpointTypeSchemaImpl | undefined;
    private generatedSdkErrorSchema: GeneratedEndpointErrorSchema | undefined;
    private skipResponseValidation: boolean;
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;
    private omitUndefined: boolean;
    private case: CaseConverter;

    constructor({
        packageId,
        service,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        shouldGenerateErrors,
        skipResponseValidation,
        includeSerdeLayer,
        allowExtraFields,
        omitUndefined,
        caseConverter
    }: GeneratedSdkEndpointTypeSchemasImpl.Init) {
        this.endpoint = endpoint;
        this.skipResponseValidation = skipResponseValidation;
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
        this.omitUndefined = omitUndefined;
        this.case = caseConverter;

        if (this.includeSerdeLayer) {
            // only generate request schemas for referenced request bodies.  inlined
            // request bodies are generated separately.
            if (endpoint.requestBody?.type === "reference") {
                switch (endpoint.requestBody.requestBodyType.type) {
                    case "primitive":
                    case "container":
                        this.generatedRequestSchema = new GeneratedEndpointTypeSchemaImpl({
                            packageId,
                            service,
                            endpoint,
                            typeName: GeneratedSdkEndpointTypeSchemasImpl.REQUEST_SCHEMA_NAME,
                            type: endpoint.requestBody.requestBodyType
                        });
                        break;
                    // named requests bodies are not generated - consumers should
                    // (de)serialize the named type directly.
                    // unknown request bodies don't need to be serialized.
                    case "named":
                    case "unknown":
                        break;
                    default:
                        assertNever(endpoint.requestBody.requestBodyType);
                }
            }

            if (endpoint.response?.body?.type === "json") {
                switch (endpoint.response.body.value.responseBodyType.type) {
                    case "primitive":
                    case "container":
                        this.generatedResponseSchema = new GeneratedEndpointTypeSchemaImpl({
                            packageId,
                            service,
                            endpoint,
                            typeName: GeneratedSdkEndpointTypeSchemasImpl.RESPONSE_SCHEMA_NAME,
                            type: endpoint.response.body.value.responseBodyType
                        });
                        break;
                    // named response bodies are not generated - consumers should
                    // (de)serialize the named type directly.
                    // unknown response bodies don't need to be deserialized.
                    case "named":
                    case "unknown":
                        break;
                    default:
                        assertNever(endpoint.response.body.value.responseBodyType);
                }
            }

            if (endpoint.response?.body?.type === "streaming") {
                if (endpoint.response.body.value.type === "text") {
                    throw new Error("Non-json responses are not supported");
                }
                switch (endpoint.response.body.value.payload.type) {
                    case "primitive":
                    case "container":
                        this.generatedStreamDataSchema = new GeneratedEndpointTypeSchemaImpl({
                            packageId,
                            service,
                            endpoint,
                            typeName: GeneratedSdkEndpointTypeSchemasImpl.STREAM_DATA_SCHEMA_NAME,
                            type: endpoint.response.body.value.payload
                        });
                        break;
                    // named response bodies are not generated - consumers should
                    // (de)serialize the named type directly.
                    // unknown response bodies don't need to be deserialized.
                    case "named":
                    case "unknown":
                        break;
                    default:
                        assertNever(endpoint.response.body.value.payload);
                }
            }

            this.generatedSdkErrorSchema = shouldGenerateErrors
                ? this.getGeneratedEndpointErrorSchema({
                      packageId,
                      endpoint,
                      errorResolver,
                      errorDiscriminationStrategy,
                      caseConverter
                  })
                : undefined;
        }
    }

    private getGeneratedEndpointErrorSchema({
        packageId,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        caseConverter
    }: {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
        caseConverter: CaseConverter;
    }): GeneratedEndpointErrorSchema {
        return FernIr.ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: (propertyDiscriminationStrategy) =>
                new GeneratedEndpointErrorSchemaImpl({
                    packageId,
                    endpoint,
                    errorResolver,
                    discriminationStrategy: propertyDiscriminationStrategy,
                    caseConverter
                }),
            statusCode: () => StatusCodeDiscriminatedEndpointErrorSchema,
            _other: () => {
                throw new Error("Unknown FernIr.ErrorDiscriminationStrategy: " + errorDiscriminationStrategy.type);
            }
        });
    }

    public writeToFile(context: FileContext): void {
        if (this.generatedRequestSchema != null) {
            this.generatedRequestSchema.writeSchemaToFile(context);
            context.sourceFile.addStatements("\n");
        }

        if (this.generatedResponseSchema != null) {
            this.generatedResponseSchema.writeSchemaToFile(context);
            context.sourceFile.addStatements("\n");
        }

        if (this.generatedStreamDataSchema != null) {
            this.generatedStreamDataSchema.writeSchemaToFile(context);
            context.sourceFile.addStatements("\n");
        }

        this.generatedSdkErrorSchema?.writeToFile(context);
    }

    public getReferenceToRawResponse(context: FileContext): ts.TypeNode {
        if (this.generatedResponseSchema == null) {
            throw new Error("No response schema was generated");
        }
        return this.generatedResponseSchema.getReferenceToRawShape(context);
    }

    public getReferenceToRawError(context: FileContext): ts.TypeNode {
        if (this.generatedSdkErrorSchema == null) {
            throw new Error("Cannot get reference to raw endpoint error because it is not defined.");
        }
        return this.generatedSdkErrorSchema.getReferenceToRawShape(context);
    }

    public serializeRequest(referenceToParsedRequest: ts.Expression, context: FileContext): ts.Expression {
        if (this.endpoint.requestBody?.type !== "reference") {
            throw new Error("Cannot serialize request because it's not a reference");
        }

        if (!this.includeSerdeLayer) {
            return referenceToParsedRequest;
        }

        switch (this.endpoint.requestBody.requestBodyType.type) {
            case "unknown":
                return referenceToParsedRequest;
            case "named": {
                const typeDeclaration = context.type.getTypeDeclaration(this.endpoint.requestBody.requestBodyType);
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.requestBody.requestBodyType, { isGeneratingSchema: false })
                    .jsonOrThrow(referenceToParsedRequest, {
                        ...getSchemaOptions({
                            allowExtraFields:
                                this.allowExtraFields ??
                                (typeDeclaration.shape.type === "object" && typeDeclaration.shape.extraProperties),
                            omitUndefined: this.omitUndefined
                        })
                    });
            }
            case "primitive":
            case "container":
                if (this.generatedRequestSchema == null) {
                    throw new Error("No request schema was generated");
                }
                return this.generatedRequestSchema
                    .getReferenceToZurgSchema(context)
                    .jsonOrThrow(referenceToParsedRequest, {
                        ...getSchemaOptions({
                            allowExtraFields: this.allowExtraFields,
                            omitUndefined: this.omitUndefined
                        })
                    });
            default:
                assertNever(this.endpoint.requestBody.requestBodyType);
        }
    }

    public deserializeResponse(referenceToRawResponse: ts.Expression, context: FileContext): ts.Expression {
        if (this.endpoint.response?.body == null) {
            throw new Error("Cannot deserialize response because it's not defined");
        }
        if (this.endpoint.response.body.type === "streaming") {
            throw new Error("Cannot deserialize streaming response in deserializeResponse");
        }
        if (this.endpoint.response.body.type === "streamParameter") {
            throw new Error("Cannot deserialize streaming response in deserializeResponse");
        }
        if (this.endpoint.response.body.type === "bytes" || this.endpoint.response.body.type === "fileDownload") {
            return referenceToRawResponse;
        }

        if (this.endpoint.response.body.type === "text") {
            return ts.factory.createAsExpression(
                referenceToRawResponse,
                context.type.getReferenceToType(
                    FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
                ).typeNode
            );
        }

        if (this.endpoint.response.body.value.responseBodyType.type === "unknown") {
            return referenceToRawResponse;
        }

        if (!this.includeSerdeLayer) {
            return ts.factory.createAsExpression(
                referenceToRawResponse,
                context.type.getReferenceToType(this.endpoint.response.body.value.responseBodyType).typeNode
            );
        }

        switch (this.endpoint.response.body.value.responseBodyType.type) {
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.response.body.value.responseBodyType, {
                        isGeneratingSchema: false
                    })
                    .parseOrThrow(referenceToRawResponse, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipResponseValidation,
                        breadcrumbsPrefix: ["response"],
                        omitUndefined: false
                    });
            case "primitive":
            case "container":
                if (this.generatedResponseSchema == null) {
                    throw new Error("No response schema was generated");
                }
                return this.generatedResponseSchema
                    .getReferenceToZurgSchema(context)
                    .parseOrThrow(referenceToRawResponse, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipResponseValidation,
                        breadcrumbsPrefix: ["response"],
                        omitUndefined: false
                    });
            default:
                assertNever(this.endpoint.response.body.value.responseBodyType);
        }
    }

    public deserializeError(referenceToRawError: ts.Expression, context: FileContext): ts.Expression {
        if (!this.includeSerdeLayer) {
            return referenceToRawError;
        }
        if (this.generatedSdkErrorSchema == null) {
            throw new Error("Cannot deserialize endpoint error because it is not defined.");
        }
        return this.generatedSdkErrorSchema.getReferenceToZurgSchema(context).parseOrThrow(referenceToRawError, {
            allowUnrecognizedEnumValues: true,
            allowUnrecognizedUnionMembers: true,
            unrecognizedObjectKeys: "passthrough",
            skipValidation: this.skipResponseValidation,
            breadcrumbsPrefix: ["response"],
            omitUndefined: false
        });
    }

    public deserializeStreamData({
        referenceToRawStreamData,
        context
    }: {
        referenceToRawStreamData: ts.Expression;
        context: FileContext;
    }): ts.Expression {
        if (this.endpoint.response?.body?.type !== "streaming") {
            throw new Error("Cannot deserialize stream data because it's not defined");
        }
        if (this.endpoint.response.body?.value.type === "text") {
            throw new Error("Cannot deserialize non-json stream data");
        }

        switch (this.endpoint.response.body?.value.payload.type) {
            case "unknown":
                return referenceToRawStreamData;
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.response.body?.value.payload, { isGeneratingSchema: false })
                    .parseOrThrow(referenceToRawStreamData, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipResponseValidation,
                        breadcrumbsPrefix: ["response"],
                        omitUndefined: false
                    });
            case "primitive":
            case "container":
                if (this.generatedStreamDataSchema == null) {
                    throw new Error("No stream data schema was generated");
                }
                return this.generatedStreamDataSchema
                    .getReferenceToZurgSchema(context)
                    .parseOrThrow(referenceToRawStreamData, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipResponseValidation,
                        breadcrumbsPrefix: ["response"],
                        omitUndefined: false
                    });
            default:
                assertNever(this.endpoint.response.body?.value.payload);
        }
    }
}
