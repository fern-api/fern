import { GetReferenceOpts } from "@fern-typescript/commons";
import { GeneratedRequestWrapper, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { ExampleEndpointCall, HttpHeader, InlinedRequestBodyProperty, QueryParameter } from "@fern-fern/ir-sdk/api";

import { AbstractRequestParameter } from "./AbstractRequestParameter";

export class FileUploadRequestParameter extends AbstractRequestParameter {
    protected getParameterType(context: SdkContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    } {
        return {
            type: context.requestWrapper.getReferenceToRequestWrapper(this.packageId, this.endpoint.name),
            hasQuestionToken: false
        };
    }

    public getType(context: SdkContext): ts.TypeNode {
        return context.requestWrapper.getReferenceToRequestWrapper(this.packageId, this.endpoint.name);
    }

    public getInitialStatements(): ts.Statement[] {
        return [];
    }

    public getReferenceToRequestBody(): ts.Expression | undefined {
        throw new Error("Cannot get reference to request body in file upload request");
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
        const requestWrapperExample = this.getGeneratedRequestWrapper(context).generateExample(example);
        return requestWrapperExample?.build(context, opts);
    }

    public getAllQueryParameters(context: SdkContext): QueryParameter[] {
        return this.getGeneratedRequestWrapper(context).getAllQueryParameters();
    }

    public isOptional({ context }: { context: SdkContext }): boolean {
        return false;
    }

    public withQueryParameter(
        queryParameter: QueryParameter,
        context: SdkContext,
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[],
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[]
    ): ts.Statement[] {
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        return generatedRequestWrapper.withQueryParameter({
            queryParameter,
            referenceToQueryParameterProperty: this.getReferenceToProperty(
                generatedRequestWrapper.getPropertyNameOfQueryParameter(queryParameter).propertyName
            ),
            context,
            queryParamSetter,
            queryParamItemSetter
        });
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression {
        const pathParameter = this.endpoint.allPathParameters.find(
            (pathParam) => pathParam.name.originalName === pathParameterKey
        );
        if (pathParameter == null) {
            throw new Error("Path parameter does not exist: " + pathParameterKey);
        }
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        return this.getReferenceToProperty(
            generatedRequestWrapper.getPropertyNameOfPathParameter(pathParameter).propertyName
        );
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkContext): ts.Expression {
        const queryParameter = this.endpoint.queryParameters.find(
            (queryParam) => queryParam.name.wireValue === queryParameterKey
        );
        if (queryParameter == null) {
            throw new Error("Query parameter does not exist: " + queryParameterKey);
        }
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        return this.getReferenceToProperty(
            generatedRequestWrapper.getPropertyNameOfQueryParameter(queryParameter).propertyName
        );
    }

    public getReferenceToNonLiteralHeader(header: HttpHeader, context: SdkContext): ts.Expression {
        return this.getReferenceToProperty(
            this.getGeneratedRequestWrapper(context).getPropertyNameOfNonLiteralHeader(header).propertyName
        );
    }

    public getReferenceToBodyProperty(property: InlinedRequestBodyProperty, context: SdkContext): ts.Expression {
        return this.getReferenceToProperty(
            this.getGeneratedRequestWrapper(context).getInlinedRequestBodyPropertyKey(property)
        );
    }

    private getGeneratedRequestWrapper(context: SdkContext): GeneratedRequestWrapper {
        return context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpoint.name);
    }

    private getReferenceToProperty(propertyName: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(this.getRequestParameterName()),
            propertyName
        );
    }
}
