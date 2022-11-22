import { HttpHeader, HttpPath, PathParameter, QueryParameter } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import urlJoin from "url-join";
import { AbstractEndpointDeclaration } from "../AbstractEndpointDeclaration";
import { AbstractEndpointRequest } from "./AbstractEndpointRequest";

interface ParsedQueryParam {
    keyInWrapper: string;
    queryParameter: QueryParameter;
}

interface ParsedPathParam {
    keyInWrapper: string;
    pathParameter: PathParameter;
}

interface ParsedHeader {
    keyInWrapper: string;
    header: HttpHeader;
}

export class WrappedEndpointRequest extends AbstractEndpointRequest {
    private static REQUEST_WRAPPER_INTERFACE_NAME = "Request";
    private static REQUEST_BODY_PROPERTY_NAME = "_body";
    private static QUERY_PARAMETERS_VARIABLE_NAME = "queryParameters";

    private parsedQueryParameters: ParsedQueryParam[] = [];
    private parsedPathParameters: ParsedPathParam[] = [];
    private parsedHeaders: ParsedHeader[] = [];

    constructor(init: AbstractEndpointDeclaration.Init) {
        super(init);

        this.parsedQueryParameters = this.endpoint.queryParameters.map((queryParameter) => ({
            keyInWrapper: queryParameter.name.camelCase,
            queryParameter,
        }));
        this.parsedPathParameters = [...this.service.pathParameters, ...this.endpoint.pathParameters].map(
            (pathParameter) => ({
                keyInWrapper: pathParameter.name.camelCase,
                pathParameter,
            })
        );
        this.parsedHeaders = [...this.service.headers, ...this.endpoint.headers].map((header) => ({
            keyInWrapper: header.name.camelCase,
            header,
        }));
    }

    protected override getRequestParameterType(file: SdkFile): TypeReferenceNode {
        const typeNode = this.getReferenceToEndpointFileExport(
            WrappedEndpointRequest.REQUEST_WRAPPER_INTERFACE_NAME,
            file
        ).getTypeNode();

        return {
            isOptional: false,
            typeNode,
            typeNodeWithoutUndefined: typeNode,
        };
    }

    protected override getReferenceToRequestBodyInsideEndpoint(): ts.Expression {
        return this.getReferenceToWrapperProperty(WrappedEndpointRequest.REQUEST_BODY_PROPERTY_NAME);
    }

    private getReferenceToWrapperProperty(propertyName: string): ts.Expression {
        return ts.factory.createPropertyAccessExpression(this.getReferenceToRequestArgumentToEndpoint(), propertyName);
    }

    protected override getUrlPath(): ts.Expression {
        if (this.parsedPathParameters.length === 0) {
            return this.getUrlPathForNoPathParameters();
        }

        const httpPath = this.getHttpPath();

        return ts.factory.createTemplateExpression(
            ts.factory.createTemplateHead(httpPath.head),
            httpPath.parts.map((part, index) => {
                const parsedPathParameter = this.parsedPathParameters.find(
                    ({ pathParameter }) => pathParameter.name.originalValue === part.pathParameter
                );
                if (parsedPathParameter == null) {
                    throw new Error("Path parameter does not exist: " + part.pathParameter);
                }
                return ts.factory.createTemplateSpan(
                    this.getReferenceToWrapperProperty(parsedPathParameter.keyInWrapper),
                    index === httpPath.parts.length - 1
                        ? ts.factory.createTemplateTail(part.tail)
                        : ts.factory.createTemplateMiddle(part.tail)
                );
            })
        );
    }

    private getHttpPath(): HttpPath {
        if (this.service.basePathV2 == null) {
            return this.endpoint.path;
        }

        const serviceBasePathPartsExceptLast = [...this.service.basePathV2.parts];
        const lastServiceBasePathPart = serviceBasePathPartsExceptLast.pop();

        if (lastServiceBasePathPart == null) {
            return {
                head: urlJoin(this.service.basePathV2.head, this.endpoint.path.head),
                parts: this.endpoint.path.parts,
            };
        }

        return {
            head: this.service.basePathV2.head,
            parts: [
                ...serviceBasePathPartsExceptLast,
                {
                    pathParameter: lastServiceBasePathPart.pathParameter,
                    tail: urlJoin(lastServiceBasePathPart.tail, this.endpoint.path.head),
                },
                ...this.endpoint.path.parts,
            ],
        };
    }

    protected override buildQueryParameters(
        file: SdkFile
    ): { statements: ts.Statement[]; referenceToUrlParams: ts.Expression } | undefined {
        if (this.parsedQueryParameters.length === 0) {
            return undefined;
        }

        const urlParamsVariable = ts.factory.createIdentifier(WrappedEndpointRequest.QUERY_PARAMETERS_VARIABLE_NAME);
        const statements: ts.Statement[] = [];

        // create URLSearchParams
        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            urlParamsVariable,
                            undefined,
                            undefined,
                            ts.factory.createNewExpression(
                                ts.factory.createIdentifier("URLSearchParams"),
                                undefined,
                                []
                            )
                        ),
                    ],
                    ts.NodeFlags.Const
                )
            )
        );

        for (const { queryParameter, keyInWrapper } of this.parsedQueryParameters) {
            const queryParameterReference = this.getReferenceToWrapperProperty(keyInWrapper);

            const queryParameterAsString = file.convertExpressionToString(
                queryParameterReference,
                queryParameter.valueType
            );

            const appendStatement = ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(urlParamsVariable, ts.factory.createIdentifier("append")),
                    undefined,
                    [ts.factory.createStringLiteral(queryParameter.name.wireValue), queryParameterAsString.expression]
                )
            );

            if (queryParameterAsString.isNullable) {
                statements.push(
                    ts.factory.createIfStatement(
                        ts.factory.createBinaryExpression(
                            queryParameterReference,
                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                            ts.factory.createNull()
                        ),
                        ts.factory.createBlock([appendStatement])
                    )
                );
            } else {
                statements.push(appendStatement);
            }
        }

        return {
            statements,
            referenceToUrlParams: urlParamsVariable,
        };
    }

    protected override generateTypeDeclaration(file: SdkFile): void {
        const properties: OptionalKind<PropertySignatureStructure>[] = [];

        for (const { keyInWrapper, queryParameter } of this.parsedQueryParameters) {
            const type = file.getReferenceToType(queryParameter.valueType);
            properties.push({
                name: keyInWrapper,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: queryParameter.docs != null ? [queryParameter.docs] : undefined,
            });
        }

        for (const { keyInWrapper, pathParameter } of this.parsedPathParameters) {
            const type = file.getReferenceToType(pathParameter.valueType);
            properties.push({
                name: keyInWrapper,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: pathParameter.docs != null ? [pathParameter.docs] : undefined,
            });
        }

        for (const { keyInWrapper, header } of this.parsedHeaders) {
            const type = file.getReferenceToType(header.valueType);
            properties.push({
                name: keyInWrapper,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
                docs: header.docs != null ? [header.docs] : undefined,
            });
        }

        if (this.hasRequestBody()) {
            const type = file.getReferenceToType(this.endpoint.request.type);
            properties.push({
                name: WrappedEndpointRequest.REQUEST_BODY_PROPERTY_NAME,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            });
        }

        file.sourceFile.addInterface({
            name: WrappedEndpointRequest.REQUEST_WRAPPER_INTERFACE_NAME,
            isExported: true,
            properties,
        });
    }

    protected override getHeaders(): ts.PropertyAssignment[] {
        return this.parsedHeaders.map((header) =>
            ts.factory.createPropertyAssignment(
                ts.factory.createStringLiteral(header.header.name.wireValue),
                this.getReferenceToWrapperProperty(header.keyInWrapper)
            )
        );
    }
}
