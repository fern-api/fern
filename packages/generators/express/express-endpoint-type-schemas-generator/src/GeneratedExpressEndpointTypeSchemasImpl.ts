import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { PackageId } from "@fern-typescript/commons";
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
    }
}

export class GeneratedExpressEndpointTypeSchemasImpl implements GeneratedExpressEndpointTypeSchemas {
    private static REQUEST_SCHEMA_NAME = "Request";
    private static RESPONSE_SCHEMA_NAME = "Response";

    private endpoint: HttpEndpoint;
    private generatedRequestSchema: GeneratedEndpointTypeSchema | undefined;
    private generatedResponseSchema: GeneratedEndpointTypeSchemaImpl | undefined;
    private includeSerdeLayer: boolean;

    constructor({ packageId, service, endpoint, includeSerdeLayer }: GeneratedExpressEndpointTypeSchemasImpl.Init) {
        this.endpoint = endpoint;
        this.includeSerdeLayer = includeSerdeLayer;

        if (includeSerdeLayer) {
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
                            typeName: GeneratedExpressEndpointTypeSchemasImpl.REQUEST_SCHEMA_NAME,
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
                            typeName: GeneratedExpressEndpointTypeSchemasImpl.RESPONSE_SCHEMA_NAME,
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

        switch (this.endpoint.requestBody.requestBodyType._type) {
            case "unknown":
                return referenceToRawRequest;
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.requestBody.requestBodyType, { isGeneratingSchema: false })
                    .parse(referenceToRawRequest, {
                        unrecognizedObjectKeys: "fail",
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
                return this.generatedRequestSchema.getReferenceToZurgSchema(context).parse(referenceToRawRequest, {
                    unrecognizedObjectKeys: "fail",
                    allowUnrecognizedEnumValues: false,
                    allowUnrecognizedUnionMembers: false,
                    skipValidation: false,
                    breadcrumbsPrefix: [],
                });
            default:
                assertNever(this.endpoint.requestBody.requestBodyType);
        }
    }

    public serializeResponse(referenceToParsedResponse: ts.Expression, context: ExpressContext): ts.Expression {
        if (this.endpoint.response == null) {
            throw new Error("Cannot deserialize response because it's not defined");
        }

        if (this.endpoint.response.type === "fileDownload") {
            throw new Error("Cannot serialize file");
        }
        if (this.endpoint.response.type === "streaming") {
            throw new Error("Streaming is not supported");
        }

        if (!this.includeSerdeLayer) {
            return referenceToParsedResponse;
        }

        switch (this.endpoint.response.responseBodyType._type) {
            case "unknown":
                return referenceToParsedResponse;
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.response.responseBodyType, { isGeneratingSchema: false })
                    .jsonOrThrow(referenceToParsedResponse, {
                        unrecognizedObjectKeys: "strip",
                        allowUnrecognizedEnumValues: false,
                        allowUnrecognizedUnionMembers: false,
                        skipValidation: false,
                        breadcrumbsPrefix: [],
                    });
            case "primitive":
            case "container":
                if (this.generatedResponseSchema == null) {
                    throw new Error("No response schema was generated");
                }
                return this.generatedResponseSchema
                    .getReferenceToZurgSchema(context)
                    .jsonOrThrow(referenceToParsedResponse, {
                        unrecognizedObjectKeys: "strip",
                        allowUnrecognizedEnumValues: false,
                        allowUnrecognizedUnionMembers: false,
                        skipValidation: false,
                        breadcrumbsPrefix: [],
                    });
            default:
                assertNever(this.endpoint.response.responseBodyType);
        }
    }
}
