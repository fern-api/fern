import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { FileContext, GeneratedRequestWrapper } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { AbstractRequestParameter } from "./AbstractRequestParameter.js";

export class FileUploadRequestParameter extends AbstractRequestParameter {
    protected getParameterType(context: FileContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    } {
        return {
            type: context.requestWrapper.getReferenceToRequestWrapper(this.packageId, this.endpoint.name),
            hasQuestionToken: false
        };
    }

    public getType(context: FileContext): ts.TypeNode {
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
        context: FileContext;
        example: FernIr.ExampleEndpointCall;
        opts: GetReferenceOpts;
    }): ts.Expression | undefined {
        const requestWrapperExample = this.getGeneratedRequestWrapper(context).generateExample(example);
        return requestWrapperExample?.build(context, opts);
    }

    public getAllQueryParameters(context: FileContext): FernIr.QueryParameter[] {
        return this.getGeneratedRequestWrapper(context).getAllQueryParameters();
    }

    public isOptional({ context }: { context: FileContext }): boolean {
        return false;
    }

    public withQueryParameter(
        queryParameter: FernIr.QueryParameter,
        context: FileContext,
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

    public getReferenceToPathParameter(pathParameterKey: string, context: FileContext): ts.Expression {
        const pathParameter = this.endpoint.allPathParameters.find(
            (pathParam) => getOriginalName(pathParam.name) === pathParameterKey
        );
        if (pathParameter == null) {
            throw new Error("Path parameter does not exist: " + pathParameterKey);
        }
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        return this.getReferenceToProperty(
            generatedRequestWrapper.getPropertyNameOfPathParameter(pathParameter).propertyName
        );
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: FileContext): ts.Expression {
        const queryParameter = this.endpoint.queryParameters.find(
            (queryParam) => getWireValue(queryParam.name) === queryParameterKey
        );
        if (queryParameter == null) {
            throw new Error("Query parameter does not exist: " + queryParameterKey);
        }
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        return this.getReferenceToProperty(
            generatedRequestWrapper.getPropertyNameOfQueryParameter(queryParameter).propertyName
        );
    }

    public getReferenceToNonLiteralHeader(header: FernIr.HttpHeader, context: FileContext): ts.Expression {
        return this.getReferenceToProperty(
            this.getGeneratedRequestWrapper(context).getPropertyNameOfNonLiteralHeader(header).propertyName
        );
    }

    public getReferenceToBodyProperty(
        property: FernIr.InlinedRequestBodyProperty,
        context: FileContext
    ): ts.Expression {
        return this.getReferenceToProperty(
            this.getGeneratedRequestWrapper(context).getInlinedRequestBodyPropertyKey(property).propertyName
        );
    }

    private getGeneratedRequestWrapper(context: FileContext): GeneratedRequestWrapper {
        return context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpoint.name);
    }

    private getReferenceToProperty(propertyName: string): ts.Expression {
        // Check if property name is a valid JavaScript identifier
        // Valid identifiers: start with letter, _, or $, followed by letters, numbers, _, or $
        const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(propertyName);

        if (isValidIdentifier) {
            return ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(this.getRequestParameterName()),
                propertyName
            );
        } else {
            // Use bracket notation for property names with hyphens or other invalid characters
            return ts.factory.createElementAccessExpression(
                ts.factory.createIdentifier(this.getRequestParameterName()),
                ts.factory.createStringLiteral(propertyName)
            );
        }
    }
}
