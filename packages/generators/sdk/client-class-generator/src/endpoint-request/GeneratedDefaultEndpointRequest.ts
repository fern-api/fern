import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, HttpRequestBody, HttpService, SdkRequest, SdkRequestShape } from "@fern-fern/ir-sdk/api";
import { Fetcher, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";
import { GeneratedQueryParams } from "../endpoints/utils/GeneratedQueryParams";
import { generateHeaders } from "../endpoints/utils/generateHeaders";
import { getParameterNameForPathParameter } from "../endpoints/utils/getParameterNameForPathParameter";
import { getPathParametersForEndpointSignature } from "../endpoints/utils/getPathParametersForEndpointSignature";
import { GeneratedSdkClientClassImpl } from "../GeneratedSdkClientClassImpl";
import { RequestBodyParameter } from "../request-parameter/RequestBodyParameter";
import { RequestParameter } from "../request-parameter/RequestParameter";
import { RequestWrapperParameter } from "../request-parameter/RequestWrapperParameter";
import { GeneratedEndpointRequest } from "./GeneratedEndpointRequest";

export declare namespace GeneratedDefaultEndpointRequest {
    export interface Init {
        packageId: PackageId;
        sdkRequest: SdkRequest | undefined;
        service: HttpService;
        endpoint: HttpEndpoint;
        requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference | undefined;
        generatedSdkClientClass: GeneratedSdkClientClassImpl;
    }
}

export class GeneratedDefaultEndpointRequest implements GeneratedEndpointRequest {
    private packageId: PackageId;
    private requestParameter: RequestParameter | undefined;
    private queryParams: GeneratedQueryParams;
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private requestBody: HttpRequestBody.InlinedRequestBody | HttpRequestBody.Reference | undefined;
    private generatedSdkClientClass: GeneratedSdkClientClassImpl;

    constructor({
        packageId,
        sdkRequest,
        service,
        endpoint,
        requestBody,
        generatedSdkClientClass,
    }: GeneratedDefaultEndpointRequest.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
        this.requestBody = requestBody;
        this.generatedSdkClientClass = generatedSdkClientClass;

        this.requestParameter =
            sdkRequest != null
                ? SdkRequestShape._visit<RequestParameter>(sdkRequest.shape, {
                      justRequestBody: (requestBodyReference) =>
                          new RequestBodyParameter({ packageId, requestBodyReference, service, endpoint, sdkRequest }),
                      wrapper: () => new RequestWrapperParameter({ packageId, service, endpoint, sdkRequest }),
                      _other: () => {
                          throw new Error("Unknown SdkRequest: " + this.endpoint.sdkRequest?.shape.type);
                      },
                  })
                : undefined;

        this.queryParams = new GeneratedQueryParams({
            requestParameter: this.requestParameter,
        });
    }

    public getEndpointParameters(context: SdkContext): OptionalKind<ParameterDeclarationStructure>[] {
        const parameters: OptionalKind<ParameterDeclarationStructure>[] = [];
        for (const pathParameter of getPathParametersForEndpointSignature(this.service, this.endpoint)) {
            parameters.push({
                name: getParameterNameForPathParameter(pathParameter),
                type: getTextOfTsNode(context.type.getReferenceToType(pathParameter.valueType).typeNode),
            });
        }
        if (this.requestParameter != null) {
            parameters.push(this.requestParameter.getParameterDeclaration(context));
        }
        return parameters;
    }

    public getBuildRequestStatements(context: SdkContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            statements.push(
                ...this.requestParameter.getInitialStatements(context, {
                    variablesInScope: this.getEndpointParameters(context).map((param) => param.name),
                })
            );
        }

        statements.push(...this.queryParams.getBuildStatements(context));

        return statements;
    }

    public getFetcherRequestArgs(
        context: SdkContext
    ): Pick<Fetcher.Args, "headers" | "queryParameters" | "body" | "contentType" | "onUploadProgress"> {
        return {
            headers: this.getHeaders(context),
            queryParameters: this.queryParams.getReferenceTo(context),
            body: this.getSerializedRequestBodyWithNullCheck(context),
            contentType: "application/json",
            onUploadProgress: undefined,
        };
    }

    private getHeaders(context: SdkContext): ts.ObjectLiteralElementLike[] {
        return generateHeaders({
            context,
            requestParameter: this.requestParameter,
            generatedSdkClientClass: this.generatedSdkClientClass,
            service: this.service,
            endpoint: this.endpoint,
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
            case "inlinedRequestBody":
                return context.sdkInlinedRequestBodySchema
                    .getGeneratedInlinedRequestBodySchema(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
            case "reference":
                return context.sdkEndpointTypeSchemas
                    .getGeneratedEndpointTypeSchemas(this.packageId, this.endpoint.name)
                    .serializeRequest(referenceToRequestBody, context);
            default:
                assertNever(requestBody);
        }
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

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        if (this.requestParameter == null) {
            throw new Error("Cannot get reference to query parameter because request parameter is not defined.");
        }
        return this.requestParameter.getReferenceToQueryParameter(queryParameterKey, context);
    }
}
