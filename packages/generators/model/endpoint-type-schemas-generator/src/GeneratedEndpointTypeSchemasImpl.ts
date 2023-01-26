import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { EndpointTypeSchemasContext, GeneratedEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema";
import { GeneratedEndpointErrorSchemaImpl } from "./GeneratedEndpointErrorSchemaImpl";
import { GeneratedEndpointTypeSchema } from "./GeneratedEndpointTypeSchema";
import { GeneratedEndpointTypeSchemaImpl } from "./GeneratedEndpointTypeSchemaImpl";
import { StatusCodeDiscriminatedEndpointErrorSchema } from "./StatusCodeDiscriminatedEndpointErrorSchema";

export declare namespace GeneratedEndpointTypeSchemasImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        shouldGenerateErrors: boolean;
    }
}

export class GeneratedEndpointTypeSchemasImpl implements GeneratedEndpointTypeSchemas {
    private static REQUEST_SCHEMA_NAME = "Request";
    private static RESPONSE_SCHEMA_NAME = "Response";

    private endpoint: HttpEndpoint;
    private generatedRequestSchema: GeneratedEndpointTypeSchema | undefined;
    private generatedResponseSchema: GeneratedEndpointTypeSchemaImpl | undefined;
    private GeneratedSdkErrorSchema: GeneratedEndpointErrorSchema | undefined;

    constructor({
        service,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        shouldGenerateErrors,
    }: GeneratedEndpointTypeSchemasImpl.Init) {
        this.endpoint = endpoint;

        // only generate request schemas for referenced request bodies.  inlined
        // request bodies are generated separately.
        if (endpoint.requestBody?.type === "reference") {
            switch (endpoint.requestBody.requestBodyType._type) {
                case "primitive":
                case "container":
                    this.generatedRequestSchema = new GeneratedEndpointTypeSchemaImpl({
                        service,
                        endpoint,
                        typeName: GeneratedEndpointTypeSchemasImpl.REQUEST_SCHEMA_NAME,
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

        if (endpoint.response.type != null) {
            switch (endpoint.response.type._type) {
                case "primitive":
                case "container":
                    this.generatedResponseSchema = new GeneratedEndpointTypeSchemaImpl({
                        service,
                        endpoint,
                        typeName: GeneratedEndpointTypeSchemasImpl.RESPONSE_SCHEMA_NAME,
                        type: endpoint.response.type,
                    });
                    break;
                // named response bodies are not generated - consumers should
                // (de)serialize the named type directly.
                // unknown response bodies don't need to be deserialized.
                case "named":
                case "unknown":
                    break;
                default:
                    assertNever(endpoint.response.type);
            }
        }

        this.GeneratedSdkErrorSchema = shouldGenerateErrors
            ? this.getGeneratedEndpointErrorSchema({
                  service,
                  endpoint,
                  errorResolver,
                  errorDiscriminationStrategy,
              })
            : undefined;
    }

    private getGeneratedEndpointErrorSchema({
        service,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }): GeneratedEndpointErrorSchema {
        return ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
            property: (properyDiscriminationStrategy) =>
                new GeneratedEndpointErrorSchemaImpl({
                    service,
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

    public writeToFile(context: EndpointTypeSchemasContext): void {
        if (this.generatedRequestSchema != null) {
            this.generatedRequestSchema.writeSchemaToFile(context);
            context.base.sourceFile.addStatements("\n");
        }

        if (this.generatedResponseSchema != null) {
            this.generatedResponseSchema.writeSchemaToFile(context);
            context.base.sourceFile.addStatements("\n");
        }

        this.GeneratedSdkErrorSchema?.writeToFile(context);
    }

    public getReferenceToRawResponse(context: EndpointTypeSchemasContext): ts.TypeNode {
        if (this.generatedResponseSchema == null) {
            throw new Error("No response schema was generated");
        }
        return this.generatedResponseSchema.getReferenceToRawShape(context);
    }

    public getReferenceToRawError(context: EndpointTypeSchemasContext): ts.TypeNode {
        if (this.GeneratedSdkErrorSchema == null) {
            throw new Error("Cannot get reference to raw endpoint error because it is not defined.");
        }
        return this.GeneratedSdkErrorSchema.getReferenceToRawShape(context);
    }

    public serializeRequest(
        referenceToParsedRequest: ts.Expression,
        context: EndpointTypeSchemasContext
    ): ts.Expression {
        if (this.endpoint.requestBody?.type !== "reference") {
            throw new Error("Cannot serialize request because it's not a reference");
        }

        switch (this.endpoint.requestBody.requestBodyType._type) {
            case "unknown":
                return referenceToParsedRequest;
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.requestBody.requestBodyType, { isGeneratingSchema: false })
                    .json(referenceToParsedRequest);
            case "primitive":
            case "container":
                if (this.generatedRequestSchema == null) {
                    throw new Error("No request schema was generated");
                }
                return this.generatedRequestSchema.getReferenceToZurgSchema(context).json(referenceToParsedRequest);
            default:
                assertNever(this.endpoint.requestBody.requestBodyType);
        }
    }

    public deserializeResponse(
        referenceToRawResponse: ts.Expression,
        context: EndpointTypeSchemasContext
    ): ts.Expression {
        if (this.endpoint.response.type == null) {
            throw new Error("Cannot deserialize response because it's not defined");
        }

        switch (this.endpoint.response.type._type) {
            case "unknown":
                return referenceToRawResponse;
            case "named":
                return context.typeSchema
                    .getSchemaOfNamedType(this.endpoint.response.type, { isGeneratingSchema: false })
                    .parse(
                        ts.factory.createAsExpression(
                            referenceToRawResponse,
                            context.typeSchema
                                .getGeneratedTypeSchema(this.endpoint.response.type)
                                .getReferenceToRawShape(context)
                        )
                    );
            case "primitive":
            case "container":
                if (this.generatedResponseSchema == null) {
                    throw new Error("No response schema was generated");
                }
                return this.generatedResponseSchema
                    .getReferenceToZurgSchema(context)
                    .parse(
                        ts.factory.createAsExpression(referenceToRawResponse, this.getReferenceToRawResponse(context))
                    );
            default:
                assertNever(this.endpoint.response.type);
        }
    }

    public deserializeError(referenceToRawError: ts.Expression, context: EndpointTypeSchemasContext): ts.Expression {
        if (this.GeneratedSdkErrorSchema == null) {
            throw new Error("Cannot deserialize endpoint error because it is not defined.");
        }
        return this.GeneratedSdkErrorSchema.getReferenceToZurgSchema(context).parse(referenceToRawError);
    }
}
