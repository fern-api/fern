import { HttpEndpoint, HttpRequestBody, HttpService } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { EndpointTypeSchemasContext, GeneratedEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";
import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema";
import { GeneratedEndpointErrorSchemaImpl } from "./GeneratedEndpointErrorSchemaImpl";
import { GeneratedEndpointTypeSchema } from "./GeneratedEndpointTypeSchema";
import { GeneratedEndpointTypeSchemaImpl } from "./GeneratedEndpointTypeSchemaImpl";
import { GeneratedInlinedRequestBodySchema } from "./GeneratedInlinedRequestBodySchema";
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

    private generatedRequestSchema: GeneratedEndpointTypeSchema | undefined;
    private generatedResponseSchema: GeneratedEndpointTypeSchemaImpl | undefined;
    private generatedErrorSchema: GeneratedEndpointErrorSchema | undefined;

    constructor({
        service,
        endpoint,
        errorResolver,
        errorDiscriminationStrategy,
        shouldGenerateErrors,
    }: GeneratedEndpointTypeSchemasImpl.Init) {
        this.generatedRequestSchema =
            endpoint.requestBody != null
                ? HttpRequestBody._visit<GeneratedEndpointTypeSchema>(endpoint.requestBody, {
                      inlinedRequestBody: (inlinedRequestBody) =>
                          new GeneratedInlinedRequestBodySchema({
                              service,
                              endpoint,
                              typeName: GeneratedEndpointTypeSchemasImpl.REQUEST_SCHEMA_NAME,
                              inlinedRequestBody,
                          }),
                      reference: ({ requestBodyType }) =>
                          new GeneratedEndpointTypeSchemaImpl({
                              service,
                              endpoint,
                              typeName: GeneratedEndpointTypeSchemasImpl.REQUEST_SCHEMA_NAME,
                              type: requestBodyType,
                          }),
                      _unknown: () => {
                          throw new Error("Unknown HttpRequestBody type: " + endpoint.requestBody?.type);
                      },
                  })
                : undefined;
        this.generatedResponseSchema =
            endpoint.response.type != null
                ? new GeneratedEndpointTypeSchemaImpl({
                      service,
                      endpoint,
                      typeName: GeneratedEndpointTypeSchemasImpl.RESPONSE_SCHEMA_NAME,
                      type: endpoint.response.type,
                  })
                : undefined;
        this.generatedErrorSchema = shouldGenerateErrors
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

        this.generatedErrorSchema?.writeToFile(context);
    }

    public getReferenceToRawResponse(context: EndpointTypeSchemasContext): ts.TypeNode {
        if (this.generatedResponseSchema == null) {
            throw new Error("No response schema was generated");
        }
        return this.generatedResponseSchema.getReferenceToRawShape(context);
    }

    public getReferenceToRawError(context: EndpointTypeSchemasContext): ts.TypeNode {
        if (this.generatedErrorSchema == null) {
            throw new Error("Cannot get reference to raw endpoint error because it is not defined.");
        }
        return this.generatedErrorSchema.getReferenceToRawShape(context);
    }

    public serializeRequest(
        referenceToParsedRequest: ts.Expression,
        context: EndpointTypeSchemasContext
    ): ts.Expression {
        if (this.generatedRequestSchema == null) {
            throw new Error("No request schema was generated");
        }
        return this.generatedRequestSchema.getReferenceToZurgSchema(context).json(referenceToParsedRequest);
    }

    public deserializeResponse(
        referenceToRawResponse: ts.Expression,
        context: EndpointTypeSchemasContext
    ): ts.Expression {
        if (this.generatedResponseSchema == null) {
            throw new Error("No response schema was generated");
        }
        return this.generatedResponseSchema.getReferenceToZurgSchema(context).parse(referenceToRawResponse);
    }

    public deserializeError(referenceToRawError: ts.Expression, context: EndpointTypeSchemasContext): ts.Expression {
        if (this.generatedErrorSchema == null) {
            throw new Error("Cannot deserialize endpoint error because it is not defined.");
        }
        return this.generatedErrorSchema.getReferenceToZurgSchema(context).parse(referenceToRawError);
    }
}
