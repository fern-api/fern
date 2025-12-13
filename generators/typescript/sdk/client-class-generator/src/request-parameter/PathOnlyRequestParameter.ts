import { ExampleEndpointCall, HttpEndpoint, HttpHeader, HttpService, QueryParameter } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

import { RequestParameter } from "./RequestParameter";

export declare namespace PathOnlyRequestParameter {
    export interface Init {
        packageId: PackageId;
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

/**
 * A minimal RequestParameter implementation for endpoints that have only path parameters
 * and no request body. Used when inlinePathParameters is "always" but sdkRequest is null.
 */
export class PathOnlyRequestParameter implements RequestParameter {
    private packageId: PackageId;
    private service: HttpService;
    private endpoint: HttpEndpoint;

    constructor({ packageId, service, endpoint }: PathOnlyRequestParameter.Init) {
        this.packageId = packageId;
        this.service = service;
        this.endpoint = endpoint;
    }

    public getParameterDeclaration(context: SdkContext): OptionalKind<ParameterDeclarationStructure> {
        return {
            name: "request",
            type: getTextOfTsNode(this.getType(context)),
            hasQuestionToken: false
        };
    }

    public getType(context: SdkContext): ts.TypeNode {
        return context.requestWrapper.getReferenceToRequestWrapper(this.packageId, this.endpoint.name);
    }

    public getInitialStatements(context: SdkContext, args: { variablesInScope: string[] }): ts.Statement[] {
        return [];
    }

    public getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined {
        return undefined;
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression {
        const pathParameter = this.endpoint.allPathParameters.find(
            (pathParam) => pathParam.name.originalName === pathParameterKey
        );
        if (pathParameter == null) {
            throw new Error("Path parameter does not exist: " + pathParameterKey);
        }
        const generatedRequestWrapper = context.requestWrapper.getGeneratedRequestWrapper(
            this.packageId,
            this.endpoint.name
        );
        const propertyName = generatedRequestWrapper.getPropertyNameOfPathParameter(pathParameter);
        return ts.factory.createElementAccessExpression(
            ts.factory.createIdentifier("request"),
            ts.factory.createStringLiteral(propertyName.propertyName)
        );
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        throw new Error("Path-only request parameter does not support query parameters");
    }

    public getAllQueryParameters(context: SdkContext): QueryParameter[] {
        return [];
    }

    public getReferenceToNonLiteralHeader(header: HttpHeader, context: SdkContext): ts.Expression {
        throw new Error("Path-only request parameter does not support non-literal headers");
    }

    public withQueryParameter(
        queryParameter: QueryParameter,
        context: SdkContext,
        queryParamSetter: (value: ts.Expression) => ts.Statement[],
        queryParamItemSetter: (value: ts.Expression) => ts.Statement[]
    ): ts.Statement[] {
        return [];
    }

    public generateExample({
        context,
        example,
        opts
    }: {
        context: SdkContext;
        example: ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined {
        const generatedRequestWrapper = context.requestWrapper.getGeneratedRequestWrapper(
            this.packageId,
            this.endpoint.name
        );

        const exampleParameters = [...example.servicePathParameters, ...example.endpointPathParameters];
        const properties: ts.PropertyAssignment[] = [];

        const allPathParameters = [...this.service.pathParameters, ...this.endpoint.pathParameters];

        for (const pathParameter of allPathParameters) {
            const propertyName = generatedRequestWrapper.getPropertyNameOfPathParameter(pathParameter);

            const exampleParameter = exampleParameters.find(
                (param) => param.name.originalName === pathParameter.name.originalName
            );

            let valueExpression: ts.Expression;
            if (exampleParameter != null) {
                const generatedExample = context.type.getGeneratedExample(exampleParameter.value);
                valueExpression = generatedExample.build(context, opts);
            } else {
                valueExpression = ts.factory.createIdentifier("undefined");
            }

            properties.push(
                ts.factory.createPropertyAssignment(
                    ts.factory.createStringLiteral(propertyName.propertyName),
                    valueExpression
                )
            );
        }

        return ts.factory.createObjectLiteralExpression(properties, /* multiline */ true);
    }

    public isOptional({ context }: { context: SdkContext }): boolean {
        return false;
    }
}
