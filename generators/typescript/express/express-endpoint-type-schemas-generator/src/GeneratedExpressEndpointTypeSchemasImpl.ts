import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";
import { getSchemaOptions, PackageId } from "@fern-typescript/commons";
import { ExpressContext, GeneratedExpressEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { GeneratedEndpointTypeSchema } from "./GeneratedEndpointTypeSchema";
import { GeneratedEndpointTypeSchemaImpl } from "./GeneratedEndpointTypeSchemaImpl";

export declare namespace GeneratedExpressEndpointTypeSchemasImpl {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
        includeSerdeLayer: boolean;
        skipRequestValidation: boolean;
        skipResponseValidation: boolean;
        allowExtraFields: boolean;
    }
}

export class GeneratedExpressEndpointTypeSchemasImpl implements GeneratedExpressEndpointTypeSchemas {
    private static REQUEST_SCHEMA_NAME = "Request";
    private static RESPONSE_SCHEMA_NAME = "Response";

    private endpoint: HttpEndpoint;
    private generatedRequestSchema: GeneratedEndpointTypeSchema | undefined;
    private generatedResponseSchema: GeneratedEndpointTypeSchemaImpl | undefined;
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;
    private skipRequestValidation: boolean;
    private skipResponseValidation: boolean;

    constructor({
        packageId,
        service,
        endpoint,
        includeSerdeLayer,
        allowExtraFields,
        skipRequestValidation,
        skipResponseValidation
    }: GeneratedExpressEndpointTypeSchemasImpl.Init) {
        this.endpoint = endpoint;
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
        this.skipRequestValidation = skipRequestValidation;
        this.skipResponseValidation = skipResponseValidation;

        if (includeSerdeLayer) {
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
                            typeName: GeneratedExpressEndpointTypeSchemasImpl.REQUEST_SCHEMA_NAME,
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
                            typeName: GeneratedExpressEndpointTypeSchemasImpl.RESPONSE_SCHEMA_NAME,
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
        }
    }

    public writeToFile(context: ExpressContext): void {
        if (this.generatedRequestSchema != null) {
            this.generatedRequestSchema.writeSchemaToFile(context);
            context.sourceFile.addStatements("\n");
        }

        if (this.generatedResponseSchema != null) {
            this.generatedResponseSchema.writeSchemaToFile(context);
        }
    }

    public getReferenceToRawResponse(context: ExpressContext): ts.TypeNode {
        if (this.generatedResponseSchema == null) {
            throw new Error("No response schema was generated");
        }
        return this.generatedResponseSchema.getReferenceToRawShape(context);
    }

    public deserializeRequest(referenceToRawRequest: ts.Expression, context: ExpressContext): ts.Expression {
        if (this.endpoint.requestBody?.type !== "reference") {
            throw new Error("Cannot serialize request because it's not a reference");
        }

        if (!this.includeSerdeLayer) {
            return referenceToRawRequest;
        }

        switch (this.endpoint.requestBody.requestBodyType.type) {
            case "unknown":
                return referenceToRawRequest;
            case "named": {
                if (this.skipRequestValidation) {
                    return context.typeSchema
                        .getSchemaOfNamedType(this.endpoint.requestBody.requestBodyType, { isGeneratingSchema: false })
                        .parse(referenceToRawRequest, {
                            unrecognizedObjectKeys: "passthrough",
                            allowUnrecognizedEnumValues: true,
                            allowUnrecognizedUnionMembers: true,
                            skipValidation: true,
                            breadcrumbsPrefix: [],
                            omitUndefined: false
                        });
                }
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.requestBody.requestBodyType, { isGeneratingSchema: false })
                    .parse(referenceToRawRequest, {
                        unrecognizedObjectKeys: "fail",
                        allowUnrecognizedEnumValues: false,
                        allowUnrecognizedUnionMembers: false,
                        skipValidation: false,
                        breadcrumbsPrefix: [],
                        omitUndefined: false
                    });
            }

            case "primitive":
            case "container":
                if (this.generatedRequestSchema == null) {
                    throw new Error("No request schema was generated");
                }
                if (this.skipRequestValidation) {
                    return this.generatedRequestSchema.getReferenceToZurgSchema(context).parse(referenceToRawRequest, {
                        unrecognizedObjectKeys: "passthrough",
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        skipValidation: true,
                        breadcrumbsPrefix: [],
                        omitUndefined: false
                    });
                }
                return this.generatedRequestSchema.getReferenceToZurgSchema(context).parse(referenceToRawRequest, {
                    unrecognizedObjectKeys: "fail",
                    allowUnrecognizedEnumValues: false,
                    allowUnrecognizedUnionMembers: false,
                    skipValidation: false,
                    breadcrumbsPrefix: [],
                    omitUndefined: false
                });
            default:
                assertNever(this.endpoint.requestBody.requestBodyType);
        }
    }

    public serializeResponse(referenceToParsedResponse: ts.Expression, context: ExpressContext): ts.Expression {
        if (this.endpoint.response?.body == null) {
            throw new Error("Cannot serialize response because it's not defined");
        }

        if (this.endpoint.response.body?.type === "fileDownload") {
            throw new Error("Cannot serialize file");
        }
        if (this.endpoint.response.body?.type === "streaming") {
            throw new Error("Streaming response is not supported");
        }
        if (this.endpoint.response.body?.type === "streamParameter") {
            throw new Error("Streaming response is not supported");
        }
        if (this.endpoint.response.body?.type === "text") {
            throw new Error("Text response is not supported");
        }
        if (this.endpoint.response.body.type === "bytes") {
            throw new Error("Bytes response is not supported");
        }

        if (!this.includeSerdeLayer) {
            return referenceToParsedResponse;
        }

        switch (this.endpoint.response.body.value.responseBodyType.type) {
            case "unknown":
                return referenceToParsedResponse;
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.response.body.value.responseBodyType, {
                        isGeneratingSchema: false
                    })
                    .jsonOrThrow(referenceToParsedResponse, {
                        ...getSchemaOptions({
                            allowExtraFields: this.allowExtraFields,
                            skipValidation: this.skipResponseValidation,
                            omitUndefined: false
                        })
                    });
            case "primitive":
            case "container":
                if (this.generatedResponseSchema == null) {
                    throw new Error("No response schema was generated");
                }
                return this.generatedResponseSchema
                    .getReferenceToZurgSchema(context)
                    .jsonOrThrow(referenceToParsedResponse, {
                        ...getSchemaOptions({
                            allowExtraFields: this.allowExtraFields,
                            skipValidation: this.skipResponseValidation,
                            omitUndefined: false
                        })
                    });
            default:
                assertNever(this.endpoint.response.body?.value.responseBodyType);
        }
    }
}
