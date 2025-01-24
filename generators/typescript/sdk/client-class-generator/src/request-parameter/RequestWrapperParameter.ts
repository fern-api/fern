import { GetReferenceOpts } from "@fern-typescript/commons";
import { GeneratedRequestWrapper, RequestWrapperNonBodyProperty, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { ExampleEndpointCall, HttpHeader, QueryParameter } from "@fern-fern/ir-sdk/api";

import { AbstractRequestParameter } from "./AbstractRequestParameter";

type DefaultNonBodyKeyName = string & {
    __DefaultNonBodyKeyName: void;
};

export class RequestWrapperParameter extends AbstractRequestParameter {
    private static BODY_VARIABLE_NAME = "_body";

    private nonBodyKeyAliases: Record<DefaultNonBodyKeyName, string> = {};

    protected getParameterType(context: SdkContext): {
        type: ts.TypeNode;
        hasQuestionToken: boolean;
        initializer?: ts.Expression;
    } {
        const isOptional = this.getGeneratedRequestWrapper(context).areAllPropertiesOptional(context);
        return {
            type: context.requestWrapper.getReferenceToRequestWrapper(this.packageId, this.endpoint.name),
            hasQuestionToken: false,
            initializer: isOptional ? ts.factory.createObjectLiteralExpression([], false) : undefined
        };
    }

    public getType(context: SdkContext): ts.TypeNode {
        return context.requestWrapper.getReferenceToRequestWrapper(this.packageId, this.endpoint.name);
    }

    public getInitialStatements(
        context: SdkContext,
        { variablesInScope }: { variablesInScope: string[] }
    ): ts.Statement[] {
        this.nonBodyKeyAliases = {};

        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        const nonBodyKeys = generatedRequestWrapper.getNonBodyKeys(context);

        if (nonBodyKeys.length === 0) {
            return [];
        }

        const usedNames = new Set(variablesInScope);
        const getNonConflictingName = (name: string) => {
            while (usedNames.has(name)) {
                name = `${name}_`;
            }
            usedNames.add(name);
            return name;
        };

        const bindingElements: ts.BindingElement[] = nonBodyKeys.map((nonBodyKey) => {
            const defaultName = this.getDefaultVariableNameForNonBodyProperty(nonBodyKey);
            const nonConflictingName = getNonConflictingName(defaultName);
            this.nonBodyKeyAliases[defaultName] = nonConflictingName;

            return ts.factory.createBindingElement(
                undefined,
                nonConflictingName !== nonBodyKey.propertyName
                    ? ts.factory.createStringLiteral(nonBodyKey.propertyName)
                    : undefined,
                nonConflictingName,
                undefined
            );
        });

        if (this.endpoint.requestBody != null) {
            bindingElements.push(
                generatedRequestWrapper.areBodyPropertiesInlined()
                    ? ts.factory.createBindingElement(
                          ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
                          undefined,
                          RequestWrapperParameter.BODY_VARIABLE_NAME
                      )
                    : ts.factory.createBindingElement(
                          undefined,
                          generatedRequestWrapper.getReferencedBodyPropertyName(),
                          RequestWrapperParameter.BODY_VARIABLE_NAME
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
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ];
    }

    public getReferenceToRequestBody(context: SdkContext): ts.Expression | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        if (this.getGeneratedRequestWrapper(context).getNonBodyKeys(context).length > 0) {
            return ts.factory.createIdentifier(RequestWrapperParameter.BODY_VARIABLE_NAME);
        } else {
            return ts.factory.createIdentifier(this.getRequestParameterName());
        }
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

    public withQueryParameter(
        queryParameter: QueryParameter,
        context: SdkContext,
        queryParamSetter: (value: ts.Expression) => ts.Statement[],
        queryParamItemSetter: (value: ts.Expression) => ts.Statement[]
    ): ts.Statement[] {
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        return generatedRequestWrapper.withQueryParameter({
            queryParameter,
            referenceToQueryParameterProperty: ts.factory.createIdentifier(
                this.getAliasForNonBodyProperty(generatedRequestWrapper.getPropertyNameOfQueryParameter(queryParameter))
            ),
            context,
            queryParamSetter,
            queryParamItemSetter
        });
    }

    public isOptional({ context }: { context: SdkContext }): boolean {
        return this.getGeneratedRequestWrapper(context).areAllPropertiesOptional(context);
    }

    public getReferenceToPathParameter(pathParameterKey: string, context: SdkContext): ts.Expression {
        const pathParameter = this.endpoint.allPathParameters.find(
            (pathParam) => pathParam.name.originalName === pathParameterKey
        );
        if (pathParameter == null) {
            throw new Error("Path parameter does not exist: " + pathParameterKey);
        }
        const generatedRequestWrapper = this.getGeneratedRequestWrapper(context);
        return ts.factory.createIdentifier(
            this.getAliasForNonBodyProperty(generatedRequestWrapper.getPropertyNameOfPathParameter(pathParameter))
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
        return ts.factory.createIdentifier(
            this.getAliasForNonBodyProperty(generatedRequestWrapper.getPropertyNameOfQueryParameter(queryParameter))
        );
    }

    public getReferenceToNonLiteralHeader(header: HttpHeader, context: SdkContext): ts.Expression {
        return ts.factory.createIdentifier(
            this.getAliasForNonBodyProperty(
                this.getGeneratedRequestWrapper(context).getPropertyNameOfNonLiteralHeader(header)
            )
        );
    }

    private getGeneratedRequestWrapper(context: SdkContext): GeneratedRequestWrapper {
        return context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpoint.name);
    }

    private getDefaultVariableNameForNonBodyProperty(
        nonBodyProperty: RequestWrapperNonBodyProperty
    ): DefaultNonBodyKeyName {
        return nonBodyProperty.safeName as DefaultNonBodyKeyName;
    }

    private getAliasForNonBodyProperty(nonBodyProperty: RequestWrapperNonBodyProperty): string {
        const defaultName = this.getDefaultVariableNameForNonBodyProperty(nonBodyProperty);
        const alias = this.nonBodyKeyAliases[defaultName];
        if (alias == null) {
            throw new Error("Could not locate alias for: " + defaultName);
        }
        return alias;
    }
}
