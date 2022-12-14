import {
    HttpEndpoint,
    HttpHeader,
    HttpRequestBody,
    HttpService,
    InlinedRequestBodyProperty,
    QueryParameter,
} from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { RequestWrapperContext } from "@fern-typescript/contexts";
import { GeneratedRequestWrapper } from "@fern-typescript/contexts/src/generated-types/GeneratedRequestWrapper";
import { ts } from "ts-morph";

export declare namespace GeneratedRequestWrapperImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        wrapperName: string;
    }
}

export class GeneratedRequestWrapperImpl implements GeneratedRequestWrapper {
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private wrapperName: string;

    constructor({ service, endpoint, wrapperName }: GeneratedRequestWrapperImpl.Init) {
        this.service = service;
        this.endpoint = endpoint;
        this.wrapperName = wrapperName;
    }

    public writeToFile(context: RequestWrapperContext): void {
        const requestInterface = context.base.sourceFile.addInterface({
            name: this.wrapperName,
            isExported: true,
        });
        for (const queryParameter of this.getAllQueryParameters()) {
            const type = context.type.getReferenceToType(queryParameter.valueType);
            const property = requestInterface.addProperty({
                name: this.getPropertyNameOfQueryParameter(queryParameter),
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            });
            maybeAddDocs(property, queryParameter.docs);
        }
        for (const header of this.getAllHeaders()) {
            const type = context.type.getReferenceToType(header.valueType);
            const property = requestInterface.addProperty({
                name: this.getPropertyNameOfHeader(header),
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            });
            maybeAddDocs(property, header.docs);
        }
        if (this.endpoint.requestBody != null) {
            HttpRequestBody._visit(this.endpoint.requestBody, {
                inlinedRequestBody: (inlinedRequestBody) => {
                    for (const property of inlinedRequestBody.properties) {
                        const type = context.type.getReferenceToType(property.valueType);
                        requestInterface.addProperty({
                            name: this.getInlinedRequestBodyPropertyKey(property),
                            type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                            hasQuestionToken: type.isOptional,
                        });
                    }
                    for (const extension of inlinedRequestBody.extends) {
                        requestInterface.addExtends(
                            getTextOfTsNode(context.type.getReferenceToNamedType(extension).getTypeNode())
                        );
                    }
                },
                reference: (referenceToRequestBody) => {
                    const type = context.type.getReferenceToType(referenceToRequestBody.requestBodyType);
                    const property = requestInterface.addProperty({
                        name: this.getReferencedBodyPropertyName(),
                        type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                        hasQuestionToken: type.isOptional,
                    });
                    maybeAddDocs(property, referenceToRequestBody.docs);
                },
                _unknown: () => {
                    throw new Error("Unknown HttpRequestBody: " + this.endpoint.requestBody?.type);
                },
            });
        }
    }

    public getReferenceToQueryParameter(
        queryParameter: QueryParameter,
        requestParameter: ts.Expression
    ): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            requestParameter,
            this.getPropertyNameOfQueryParameter(queryParameter)
        );
    }

    public getReferenceToHeader(header: HttpHeader, requestParameter: ts.Expression): ts.Expression {
        return ts.factory.createPropertyAccessExpression(requestParameter, this.getPropertyNameOfHeader(header));
    }

    public getReferenceToBody(
        requestParameter: ts.Expression,
        context: RequestWrapperContext
    ): ts.Expression | undefined {
        if (this.endpoint.requestBody == null) {
            return undefined;
        }
        return HttpRequestBody._visit<ts.Expression>(this.endpoint.requestBody, {
            reference: () =>
                ts.factory.createPropertyAccessExpression(requestParameter, this.getReferencedBodyPropertyName()),
            inlinedRequestBody: (inlinedRequestBody) => {
                return ts.factory.createObjectLiteralExpression(
                    [
                        ...inlinedRequestBody.properties.map((property) =>
                            ts.factory.createPropertyAssignment(
                                ts.factory.createStringLiteral(property.name.wireValue),
                                ts.factory.createPropertyAccessExpression(
                                    requestParameter,
                                    this.getInlinedRequestBodyPropertyKey(property)
                                )
                            )
                        ),
                        ...inlinedRequestBody.extends.flatMap((extension) => {
                            const generatedType = context.type.getGeneratedType(extension);
                            if (generatedType.type !== "object") {
                                throw new Error("Inlined request extends a non-object");
                            }
                            return generatedType
                                .getAllPropertiesIncludingExtensions(context)
                                .map(({ propertyKey, wireKey }) =>
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createStringLiteral(wireKey),
                                        ts.factory.createPropertyAccessExpression(requestParameter, propertyKey)
                                    )
                                );
                        }),
                    ],
                    true
                );
            },
            _unknown: () => {
                throw new Error("Unknown HttpRequestBody: " + this.endpoint.requestBody?.type);
            },
        });
    }

    #areBodyPropertiesOptional: boolean | undefined;
    public areAllPropertiesOptional(context: RequestWrapperContext): boolean {
        if (this.#areBodyPropertiesOptional == null) {
            this.#areBodyPropertiesOptional = this.expensivelyComputeIfAllPropertiesAreOptional(context);
        }
        return this.#areBodyPropertiesOptional;
    }

    public getNonBodyKeys(): string[] {
        return [
            ...this.getAllQueryParameters().map((queryParameter) =>
                this.getPropertyNameOfQueryParameter(queryParameter)
            ),
            ...this.getAllHeaders().map((header) => this.getPropertyNameOfHeader(header)),
        ];
    }

    public getInlinedRequestBodyPropertyKey(property: InlinedRequestBodyProperty): string {
        return property.name.name.unsafeName.camelCase;
    }

    private expensivelyComputeIfAllPropertiesAreOptional(context: RequestWrapperContext): boolean {
        for (const queryParameter of this.getAllQueryParameters()) {
            if (!this.isTypeOptional(queryParameter.valueType, context)) {
                return false;
            }
        }
        for (const header of this.getAllHeaders()) {
            if (!this.isTypeOptional(header.valueType, context)) {
                return false;
            }
        }
        if (this.endpoint.requestBody != null) {
            const areBodyPropertiesOptional = HttpRequestBody._visit(this.endpoint.requestBody, {
                reference: ({ requestBodyType }) => this.isTypeOptional(requestBodyType, context),
                inlinedRequestBody: (inlinedRequestBody) => {
                    for (const property of inlinedRequestBody.properties) {
                        if (!this.isTypeOptional(property.valueType, context)) {
                            return false;
                        }
                    }
                    for (const extension of inlinedRequestBody.extends) {
                        const generatedType = context.type.getGeneratedType(extension);
                        if (generatedType.type !== "object") {
                            throw new Error("Inlined request extends a non-object");
                        }
                        const propertiesFromExtension = generatedType.getAllPropertiesIncludingExtensions(context);
                        for (const property of propertiesFromExtension) {
                            if (!this.isTypeOptional(property.type, context)) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                _unknown: () => {
                    throw new Error("Unknown HttpRequestBody: " + this.endpoint.requestBody?.type);
                },
            });
            if (!areBodyPropertiesOptional) {
                return false;
            }
        }
        return true;
    }

    private isTypeOptional(typeReference: TypeReference, context: RequestWrapperContext): boolean {
        const resolvedType = context.type.resolveTypeReference(typeReference);
        return resolvedType._type === "container" && resolvedType.container._type === "optional";
    }

    private getPropertyNameOfQueryParameter(queryParameter: QueryParameter): string {
        return queryParameter.nameV2.name.unsafeName.camelCase;
    }

    private getPropertyNameOfHeader(header: HttpHeader): string {
        return header.nameV2.name.unsafeName.camelCase;
    }

    private getAllQueryParameters(): QueryParameter[] {
        return this.endpoint.queryParameters;
    }

    private getAllHeaders(): HttpHeader[] {
        return [...this.service.headers, ...this.endpoint.headers];
    }

    private getReferencedBodyPropertyName(): string {
        if (this.endpoint.sdkRequest == null) {
            throw new Error("Request body is defined but sdkRequest is null");
        }
        if (this.endpoint.sdkRequest.shape.type !== "wrapper") {
            throw new Error("Request body is defined but sdkRequest is not a wrapper");
        }
        return this.endpoint.sdkRequest.shape.bodyKey.unsafeName.camelCase;
    }
}
