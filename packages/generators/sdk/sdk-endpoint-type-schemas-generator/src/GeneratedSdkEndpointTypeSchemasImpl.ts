import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { PackageId } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema";
import { GeneratedEndpointErrorSchemaImpl } from "./GeneratedEndpointErrorSchemaImpl";
import { GeneratedEndpointTypeSchema } from "./GeneratedEndpointTypeSchema";
import { GeneratedEndpointTypeSchemaImpl } from "./GeneratedEndpointTypeSchemaImpl";
import { StatusCodeDiscriminatedEndpointErrorSchema } from "./StatusCodeDiscriminatedEndpointErrorSchema";

export declare namespace GeneratedSdkEndpointTypeSchemasImpl {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        shouldGenerateErrors: boolean;
        skipResponseValidation: boolean;
        includeSerdeLayer: boolean;
    }
}

export class GeneratedSdkEndpointTypeSchemasImpl implements GeneratedSdkEndpointTypeSchemas {
    private static REQUEST_SCHEMA_NAME = "Request";
    private static RESPONSE_SCHEMA_NAME = "Response";
    private static STREAM_DATA_SCHEMA_NAME = "StreamData";

    private endpoint: HttpEndpoint;
    private generatedRequestSchema: GeneratedEndpointTypeSchema | undefined;
    private generatedResponseSchema: GeneratedEndpointTypeSchemaImpl | undefined;
    private generatedStreamDataSchema: GeneratedEndpointTypeSchemaImpl | undefined;
    private generatedSdkErrorSchema: GeneratedEndpointErrorSchema | undefined;
    private skipResponseValidation: boolean;
    private includeSerdeLayer: boolean;

    constructor({
        packageId,
        service,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        shouldGenerateErrors,
        skipResponseValidation,
        includeSerdeLayer,
    }: GeneratedSdkEndpointTypeSchemasImpl.Init) {
        this.endpoint = endpoint;
        this.skipResponseValidation = skipResponseValidation;
        this.includeSerdeLayer = includeSerdeLayer;

        if (this.includeSerdeLayer) {
            // only generate request schemas for referenced request bodies.  inlined
            // request bodies are generated separately.
            if (endpoint.requestBody?.type === "reference") {
                switch (endpoint.requestBody.requestBodyType._type) {
                    case "primitive":
                    case "container":
                        this.generatedRequestSchema = new GeneratedEndpointTypeSchemaImpl({
                            packageId,
                            service,
                            endpoint,
                            typeName: GeneratedSdkEndpointTypeSchemasImpl.REQUEST_SCHEMA_NAME,
                            type: endpoint.requestBody.requestBodyType,
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

            if (endpoint.response?.type === "json") {
                switch (endpoint.response.responseBodyType._type) {
                    case "primitive":
                    case "container":
                        this.generatedResponseSchema = new GeneratedEndpointTypeSchemaImpl({
                            packageId,
                            service,
                            endpoint,
                            typeName: GeneratedSdkEndpointTypeSchemasImpl.RESPONSE_SCHEMA_NAME,
                            type: endpoint.response.responseBodyType,
                        });
                        break;
                    // named response bodies are not generated - consumers should
                    // (de)serialize the named type directly.
                    // unknown response bodies don't need to be deserialized.
                    case "named":
                    case "unknown":
                        break;
                    default:
                        assertNever(endpoint.response.responseBodyType);
                }
            }

            if (endpoint.response?.type === "streaming") {
                if (endpoint.response.dataEventType.type === "text") {
                    throw new Error("Non-json responses are not supportd");
                }
                switch (endpoint.response.dataEventType.json._type) {
                    case "primitive":
                    case "container":
                        this.generatedStreamDataSchema = new GeneratedEndpointTypeSchemaImpl({
                            packageId,
                            service,
                            endpoint,
                            typeName: GeneratedSdkEndpointTypeSchemasImpl.STREAM_DATA_SCHEMA_NAME,
                            type: endpoint.response.dataEventType.json,
                        });
                        break;
                    // named response bodies are not generated - consumers should
                    // (de)serialize the named type directly.
                    // unknown response bodies don't need to be deserialized.
                    case "named":
                    case "unknown":
                        break;
                    default:
                        assertNever(endpoint.response.dataEventType.json);
                }
            }

            this.generatedSdkErrorSchema = shouldGenerateErrors
                ? this.getGeneratedEndpointErrorSchema({
                      packageId,
                      endpoint,
                      errorResolver,
                      errorDiscriminationStrategy,
                  })
                : undefined;
        }
    }

    private getGeneratedEndpointErrorSchema({
        packageId,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
    }: {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }): GeneratedEndpointErrorSchema {
        return ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: (properyDiscriminationStrategy) =>
                new GeneratedEndpointErrorSchemaImpl({
                    packageId,
                    endpoint,
                    errorResolver,
                    discriminationStrategy: properyDiscriminationStrategy,
                }),
            statusCode: () => StatusCodeDiscriminatedEndpointErrorSchema,
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + errorDiscriminationStrategy.type);
            },
        });
    }

    public writeToFile(context: SdkContext): void {
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

    public getReferenceToRawResponse(context: SdkContext): ts.TypeNode {
        if (this.generatedResponseSchema == null) {
            throw new Error("No response schema was generated");
        }
        return this.generatedResponseSchema.getReferenceToRawShape(context);
    }

    public getReferenceToRawError(context: SdkContext): ts.TypeNode {
        if (this.generatedSdkErrorSchema == null) {
            throw new Error("Cannot get reference to raw endpoint error because it is not defined.");
        }
        return this.generatedSdkErrorSchema.getReferenceToRawShape(context);
    }

    public serializeRequest(referenceToParsedRequest: ts.Expression, context: SdkContext): ts.Expression {
        if (this.endpoint.requestBody?.type !== "reference") {
            throw new Error("Cannot serialize request because it's not a reference");
        }

        if (!this.includeSerdeLayer) {
            return referenceToParsedRequest;
        }

        switch (this.endpoint.requestBody.requestBodyType._type) {
            case "unknown":
                return referenceToParsedRequest;
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.requestBody.requestBodyType, { isGeneratingSchema: false })
                    .jsonOrThrow(referenceToParsedRequest, {
                        unrecognizedObjectKeys: "strip",
                        allowUnrecognizedEnumValues: false,
                        allowUnrecognizedUnionMembers: false,
                        skipValidation: false,
                        breadcrumbsPrefix: [],
                    });
            case "primitive":
            case "container":
                if (this.generatedRequestSchema == null) {
                    throw new Error("No request schema was generated");
                }
                return this.generatedRequestSchema
                    .getReferenceToZurgSchema(context)
                    .jsonOrThrow(referenceToParsedRequest, {
                        unrecognizedObjectKeys: "strip",
                        allowUnrecognizedEnumValues: false,
                        allowUnrecognizedUnionMembers: false,
                        skipValidation: false,
                        breadcrumbsPrefix: [],
                    });
            default:
                assertNever(this.endpoint.requestBody.requestBodyType);
        }
    }

    public deserializeResponse(referenceToRawResponse: ts.Expression, context: SdkContext): ts.Expression {
        if (this.endpoint.response == null) {
            throw new Error("Cannot deserialize response because it's not defined");
        }
        if (this.endpoint.response.type === "streaming") {
            throw new Error("Cannot deserailize streaming response in deserializeResponse");
        }

        if (this.endpoint.response.type === "fileDownload") {
            return referenceToRawResponse;
        }

        if (this.endpoint.response.responseBodyType._type === "unknown") {
            return referenceToRawResponse;
        }

        if (!this.includeSerdeLayer) {
            return ts.factory.createAsExpression(
                referenceToRawResponse,
                context.type.getReferenceToType(this.endpoint.response.responseBodyType).typeNode
            );
        }

        switch (this.endpoint.response.responseBodyType._type) {
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.response.responseBodyType, { isGeneratingSchema: false })
                    .parseOrThrow(referenceToRawResponse, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipResponseValidation,
                        breadcrumbsPrefix: ["response"],
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
                    });
            default:
                assertNever(this.endpoint.response.responseBodyType);
        }
    }

    public deserializeError(referenceToRawError: ts.Expression, context: SdkContext): ts.Expression {
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
        });
    }

    public deserializeStreamDataAndVisitMaybeValid({
        referenceToRawStreamData,
        context,
        visitValid,
        visitInvalid,
        parsedDataVariableName,
    }: {
        referenceToRawStreamData: ts.Expression;
        context: SdkContext;
        visitValid: (referenceToValue: ts.Expression) => ts.Statement[];
        visitInvalid: (referenceToErrors: ts.Expression) => ts.Statement[];
        parsedDataVariableName: string;
    }): ts.Statement[] {
        if (this.endpoint.response?.type !== "streaming") {
            throw new Error("Cannot deserialize stream data because it's not defined");
        }
        if (this.endpoint.response.dataEventType.type === "text") {
            throw new Error("Cannot deserialize non-json stream data");
        }

        if (this.endpoint.response.dataEventType.json._type === "unknown") {
            return visitValid(referenceToRawStreamData);
        }

        if (!this.includeSerdeLayer) {
            return visitValid(referenceToRawStreamData);
        }

        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            parsedDataVariableName,
                            undefined,
                            undefined,
                            this.deserializeStreamData(referenceToRawStreamData, context)
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
            ...context.coreUtilities.zurg.Schema._visitMaybeValid(ts.factory.createIdentifier(parsedDataVariableName), {
                valid: visitValid,
                invalid: visitInvalid,
            }),
        ];
    }

    private deserializeStreamData(referenceToRawStreamData: ts.Expression, context: SdkContext): ts.Expression {
        if (this.endpoint.response?.type !== "streaming") {
            throw new Error("Cannot deserialize stream data because it's not defined");
        }
        if (this.endpoint.response.dataEventType.type === "text") {
            throw new Error("Cannot deserialize non-json stream data");
        }

        if (!this.includeSerdeLayer) {
            return referenceToRawStreamData;
        }

        switch (this.endpoint.response.dataEventType.json._type) {
            case "unknown":
                return referenceToRawStreamData;
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.response.dataEventType.json, { isGeneratingSchema: false })
                    .parse(referenceToRawStreamData, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipResponseValidation,
                        breadcrumbsPrefix: ["response"],
                    });
            case "primitive":
            case "container":
                if (this.generatedStreamDataSchema == null) {
                    throw new Error("No stream data schema was generated");
                }
                return this.generatedStreamDataSchema
                    .getReferenceToZurgSchema(context)
                    .parse(referenceToRawStreamData, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: this.skipResponseValidation,
                        breadcrumbsPrefix: ["response"],
                    });
            default:
                assertNever(this.endpoint.response.dataEventType.json);
        }
    }
}
