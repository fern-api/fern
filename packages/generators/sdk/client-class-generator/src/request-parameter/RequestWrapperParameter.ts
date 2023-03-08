import { HttpHeader, QueryParameter } from "@fern-fern/ir-model/http";
import { GeneratedRequestWrapper, SdkClientClassContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AbstractRequestParameter } from "./AbstractRequestParameter";

export class RequestWrapperParameter extends AbstractRequestParameter {
    private static BODY_VARIABLE_NAME = "_body";

    protected getParameterType(context: SdkClientClassContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    } {
        const isOptional = this.getGeneratedRequestWrapper(context).areAllPropertiesOptional(context);
        return {
            type: context.requestWrapper.getReferenceToRequestWrapper(this.packageId, this.endpoint.name),
            hasQuestionToken: false,
            initializer: isOptional ? ts.factory.createObjectLiteralExpression([], false) : undefined,
        };
    }

    public getInitialStatements(context: SdkClientClassContext): ts.Statement[] {
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        const nonBodyKeys = generatedRequestWrapper.getNonBodyKeys();

        if (nonBodyKeys.length === 0) {
            return [];
        }

        const bindingElements: ts.BindingElement[] = nonBodyKeys.map((nonBodyKey) =>
            ts.factory.createBindingElement(undefined, undefined, ts.factory.createIdentifier(nonBodyKey))
        );

        if (this.endpoint.requestBody != null) {
            bindingElements.push(
                generatedRequestWrapper.areBodyPropertiesInlined()
                    ? ts.factory.createBindingElement(
                          ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
                          undefined,
                          ts.factory.createIdentifier(RequestWrapperParameter.BODY_VARIABLE_NAME)
                      )
                    : ts.factory.createBindingElement(
                          undefined,
                          generatedRequestWrapper.getReferencedBodyPropertyName(),
                          ts.factory.createIdentifier(RequestWrapperParameter.BODY_VARIABLE_NAME)
                      )
            );
        }

        return [
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            ts.factory.createObjectBindingPattern(bindingElements),
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(this.getRequestParameterName())
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            ),
        ];
    }

    public getReferenceToRequestBody(context: SdkClientClassContext): ts.Expression | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        if (this.getGeneratedRequestWrapper(context).getNonBodyKeys().length > 0) {
            return ts.factory.createIdentifier(RequestWrapperParameter.BODY_VARIABLE_NAME);
        } else {
            return ts.factory.createIdentifier(this.getRequestParameterName());
        }
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
            referenceToQueryParameterProperty: ts.factory.createIdentifier(
                generatedRequestWrapper.getPropertyNameOfQueryParameter(queryParameter)
            ),
            context,
            callback,
        });
    }

    public getReferenceToHeader(header: HttpHeader, context: SdkClientClassContext): ts.Expression {
        return ts.factory.createIdentifier(this.getGeneratedRequestWrapper(context).getPropertyNameOfHeader(header));
    }

    private getGeneratedRequestWrapper(context: SdkClientClassContext): GeneratedRequestWrapper {
        return context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpoint.name);
    }
}
