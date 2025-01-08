import {
    Fetcher,
    GetReferenceOpts,
    PackageId,
    getParameterNameForPositionalPathParameter,
    getTextOfTsNode
} from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import {
    ExampleEndpointCall,
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
    InlinedRequestBody,
    IntermediateRepresentation,
    SdkRequest,
    SdkRequestShape
} from "@fern-fern/ir-sdk/api";

import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams";
import { generateHeaders } from "../endpoints/utils/generateHeaders";
import { getPathParametersForEndpointSignature } from "../endpoints/utils/getPathParametersForEndpointSignature";
import { RequestBodyParameter } from "../request-parameter/RequestBodyParameter";
import { RequestParameter } from "../request-parameter/RequestParameter";
import { RequestWrapperParameter } from "../request-parameter/RequestWrapperParameter";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export declare namespace GeneratedDefaultEndpointRequest {
    export interface Init {
        ir: IntermediateRepresentation;
        packageId: PackageId;
        sdkRequest: SdkRequest | undefined;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference | undefined;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
        retainOriginalCasing: boolean;
    }
}

interface LiteralPropertyValue {
    propertyWireKey: string;
    propertyValue: boolean | string;
}

export class GeneratedDefaultEndpointRequest implements GeneratedEndpointRequest {
    private ir: IntermediateRepresentation;
    private packageId: PackageId;
    private requestParameter: RequestParameter | undefined;
    private queryParams: GeneratedQueryParams;
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference | undefined;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;
    private retainOriginalCasing: boolean;

    constructor({
        ir,
        packageId,
        sdkRequest,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
        retainOriginalCasing
    }: GeneratedDefaultEndpointRequest.Init) {
        this.ir = ir;
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;
        this.retainOriginalCasing = retainOriginalCasing;
        this.requestParameter =
            sdkRequest != null
                ? SdkRequestShape._visit<RequestParameter>(sdkRequest.shape, {
                      justRequestBody: (requestBodyReference) => {
                          if (requestBodyReference.type === "bytes") {
                              throw new Error("Bytes request is not supported");
                          }
                          return new RequestBodyParameter({
                              packageId,
                              requestBodyReference,
                              service,
                              endpoint,
                              sdkRequest
                          });
                      },
                      wrapper: () => new RequestWrapperParameter({ packageId, service, endpoint, sdkRequest }),
                      _other: () => {
                          throw new Error("Unknown SdkRequest: " + this.endpoint.sdkRequest?.shape.type);
                      }
                  })
                : undefined;

        this.queryParams = new GeneratedQueryParams({
            requestParameter: this.requestParameter
        });
    }

    public getRequestParameter(context: SdkContext): ts.TypeNode | undefined {
        return this.requestParameter?.getType(context);
    }

    public getEndpointParameters(
        context: SdkContext
    ): OptionalKind<ParameterDeclarationStructure & { docs?: string }>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure & { docs?: string }>[] = [];
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            parameters.push({
                name: getParameterNameForPositionalPathParameter({
                    pathParameter,
                    retainOriginalCasing: this.retainOriginalCasing
                }),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
                docs: pathParameter.docs
            });
        }
        if (this.requestParameter != null) {
            parameters.push(this.requestParameter.getParameterDeclaration(context));
        }
        return parameters;
    }

    public getExampleEndpointParameters({
        context,
        example,
        opts
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression[] | undefined {
        const exampleParameters = [...example.servicePathParameters, ...example.endpointPathParameters];
        const result: ts.Expression[] = [];
        for (const pathParameter of getPathParametersForEndpointSignature({
            service: this.service,
            endpoint: this.endpoint,
            context
        })) {
            const exampleParameter = exampleParameters.find(
                (param) => param.name.originalName === pathParameter.name.originalName
            );
            if (exampleParameter == null) {
                result.push(ts.factory.createIdentifier("undefined"));
            } else {
                const generatedExample = context.type.getGeneratedExample(exampleParameter.value);
                result.push(generatedExample.build(context, opts));
            }
        }
        if (this.requestParameter != null) {
            const requestParameterExample = this.requestParameter.generateExample({ context, example, opts });
            if (
                requestParameterExample != null &&
                getTextOfTsNode(requestParameterExample) === "{}" &&
                this.requestParameter.isOptional({ context })
            ) {
                // pass
            } else if (requestParameterExample != null) {
                result.push(requestParameterExample);
            } else if (!this.requestParameter.isOptional({ context })) {
                return undefined;
            }
        }
        return result;
    }

    public getBuildRequestStatements(context: SdkContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            statements.push(
                ...this.requestParameter.getInitialStatements(context, {
                    variablesInScope: this.getEndpointParameters(context).map((param) => param.name)
                })
            );
        }

        statements.push(...this.queryParams.getBuildStatements(context));

        return statements;
    }

    public getFetcherRequestArgs(
        context: SdkContext
    ): Pick<Fetcher.Args, "headers" | "queryParameters" | "body" | "contentType" | "requestType"> {
        return {
            headers: this.getHeaders(context),
            queryParameters: this.queryParams.getReferenceTo(context),
            body: this.getSerializedRequestBodyWithNullCheck(context),
            contentType: this.requestBody?.contentType ?? "application/json",
            requestType: "json"
        };
    }

    private getHeaders(context: SdkContext): ts.ObjectLiteralElementLike[] {
        return generateHeaders({
            context,
            requestParameter: this.requestParameter,
            generatedSdkClientClass: this.generatedSdkClientClass,
            idempotencyHeaders: this.ir.idempotencyHeaders,
            service: this.service,
            endpoint: this.endpoint
        });
    }

    private getSerializedRequestBodyWithNullCheck(context: SdkContext): ts.Expression | undefined {
        if (this.requestParameter == null || this.requestBody == null) {
            return undefined;
        }
        const referenceToRequestBody = this.requestParameter.getReferenceToRequestBody(context);
        if (referenceToRequestBody == null) {
            return undefined;
        }

        let serializeExpression = this.getSerializedRequestBodyWithoutNullCheck(
            this.requestBody,
            referenceToRequestBody,
            context
        );

        if (this.isRequestBodyNullable(this.requestBody, context)) {
            serializeExpression = ts.factory.createConditionalExpression(
                ts.factory.createBinaryExpression(
                    referenceToRequestBody,
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                serializeExpression,
                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                ts.factory.createIdentifier("undefined")
            );
        }

        return serializeExpression;
    }

    private getSerializedRequestBodyWithoutNullCheck(
        requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference,
        referenceToRequestBody: ts.Expression,
        context: SdkContext
    ): ts.Expression {
        switch (requestBody.type) {
            case "inlinedRequestBody": {
                const serializeExpression = context.sdkInlinedRequestBodySchema
                    .getGeneratedInlinedRequestBodySchema(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
                return this.serializeInlinedRequestBodyWithLiterals({
                    inlinedRequestBody: requestBody,
                    serializeExpression,
                    context
                });
            }
            case "reference":
                return context.sdkEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
            default:
                assertNever(requestBody);
        }
    }

    private serializeInlinedRequestBodyWithLiterals({
        inlinedRequestBody,
        serializeExpression,
        context
    }: {
        inlinedRequestBody: InlinedRequestBody;
        serializeExpression: ts.Expression;
        context: SdkContext;
    }): ts.Expression {
        const literalProperties = this.getLiteralProperties({ inlinedRequestBody, context });
        if (literalProperties.length > 0) {
            return ts.factory.createObjectLiteralExpression([
                ts.factory.createSpreadAssignment(ts.factory.createParenthesizedExpression(serializeExpression)),
                ...literalProperties.map((property) => {
                    return ts.factory.createPropertyAssignment(
                        property.propertyWireKey,
                        typeof property.propertyValue === "string"
                            ? ts.factory.createStringLiteral(property.propertyValue)
                            : property.propertyValue
                              ? ts.factory.createTrue()
                              : ts.factory.createFalse()
                    );
                })
            ]);
        } else {
            return serializeExpression;
        }
    }

    private getLiteralProperties({
        inlinedRequestBody,
        context
    }: {
        inlinedRequestBody: InlinedRequestBody;
        context: SdkContext;
    }): LiteralPropertyValue[] {
        const result: LiteralPropertyValue[] = [];
        for (const property of inlinedRequestBody.properties) {
            const resolvedType = context.type.resolveTypeReference(property.valueType);
            if (resolvedType.type === "container" && resolvedType.container.type === "literal") {
                result.push({
                    propertyValue: resolvedType.container.literal._visit<boolean | string>({
                        string: (val) => val,
                        boolean: (val) => val,
                        _other: () => {
                            throw new Error("Encountered non-boolean, non-string literal");
                        }
                    }),
                    propertyWireKey: property.name.wireValue
                });
            }
        }
        return result;
    }

    private isRequestBodyNullable(
        requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference,
        context: SdkContext
    ): boolean {
        switch (requestBody.type) {
            case "inlinedRequestBody":
                return false;
            case "reference": {
                const resolvedType = context.type.resolveTypeReference(requestBody.requestBodyType);
                return resolvedType.type === "container" && resolvedType.container.type === "optional";
            }
            default:
                assertNever(requestBody);
        }
    }

    public getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined {
        return this.requestParameter?.getReferenceToRequestBody(context);
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to path parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToPathParameter(pathParameterKey, context);
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
