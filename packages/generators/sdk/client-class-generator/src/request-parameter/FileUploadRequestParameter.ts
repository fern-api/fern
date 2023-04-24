import { HttpHeader, InlinedRequestBodyProperty, QueryParameter } from "@fern-fern/ir-model/http";
import { GeneratedRequestWrapper, SdkClientClassContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AbstractRequestParameter } from "./AbstractRequestParameter";

export class FileUploadRequestParameter extends AbstractRequestParameter {
    protected getParameterType(context: SdkClientClassContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    } {
        return {
            type: context.requestWrapper.getReferenceToRequestWrapper(this.packageId, this.endpoint.name),
            hasQuestionToken: false,
        };
    }

    public getInitialStatements(): ts.Statement[] {
        return [];
    }

    public getReferenceToRequestBody(): ts.Expression | undefined {
        throw new Error("Cannot get reference to request body in file upload request");
    }

    public getAllQueryParameters(context: SdkClientClassContext): QueryParameter[] {
        return this.getGeneratedRequestWrapper(context).getAllQueryParameters();
    }

    public getAllHeaders(context: SdkClientClassContext): HttpHeader[] {
        return this.getGeneratedRequestWrapper(context).getAllHeaders();
    }

    public withQueryParameter(
        queryParameter: QueryParameter,
        context: SdkClientClassContext,
        callback: (value: ts.Expression) => ts.Statement[]
    ): ts.Statement[] {
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        return generatedRequestWrapper.withQueryParameter({
            queryParameter,
            referenceToQueryParameterProperty: this.getReferenceToProperty(
                generatedRequestWrapper.getPropertyNameOfQueryParameter(queryParameter).propertyName
            ),
            context,
            callback,
        });
    }

    public getReferenceToQueryParameter(queryParameterKey: string, context: SdkClientClassContext): ts.Expression {
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

    public getReferenceToHeader(header: HttpHeader, context: SdkClientClassContext): ts.Expression {
        return this.getReferenceToProperty(
            this.getGeneratedRequestWrapper(context).getPropertyNameOfHeader(header).propertyName
        );
    }

    public getReferenceToBodyProperty(
        property: InlinedRequestBodyProperty,
        context: SdkClientClassContext
    ): ts.Expression {
        return this.getReferenceToProperty(
            this.getGeneratedRequestWrapper(context).getInlinedRequestBodyPropertyKey(property)
        );
    }

    private getGeneratedRequestWrapper(context: SdkClientClassContext): GeneratedRequestWrapper {
        return context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpoint.name);
    }

    private getReferenceToProperty(propertyName: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(this.getRequestParameterName()),
            propertyName
        );
    }
}
