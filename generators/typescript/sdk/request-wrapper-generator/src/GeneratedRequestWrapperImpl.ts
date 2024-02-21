import { noop } from "@fern-api/core-utils";
import {
    ExampleEndpointCall,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpHeader,
    HttpRequestBody,
    HttpService,
    InlinedRequestBody,
    InlinedRequestBodyProperty,
    NameAndWireValue,
    QueryParameter,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { getTextOfTsNode, maybeAddDocs, PackageId } from "@fern-typescript/commons";
import {
    GeneratedRequestWrapper,
    GeneratedRequestWrapperExample,
    RequestWrapperNonBodyProperty,
    SdkContext
} from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { RequestWrapperExampleGenerator } from "./RequestWrapperExampleGenerator";

export declare namespace GeneratedRequestWrapperImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        wrapperName: string;
        packageId: PackageId;
        includeSerdeLayer: boolean;
    }
}

const EXAMPLE_PREFIX = "    ";

export class GeneratedRequestWrapperImpl implements GeneratedRequestWrapper {
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private wrapperName: string;
    private packageId: PackageId;
    protected includeSerdeLayer: boolean;

    constructor({ service, endpoint, wrapperName, packageId, includeSerdeLayer }: GeneratedRequestWrapperImpl.Init) {
        this.service = service;
        this.endpoint = endpoint;
        this.wrapperName = wrapperName;
        this.packageId = packageId;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public writeToFile(context: SdkContext): void {
        const docs = this.getDocs(context);

        const requestInterface = context.sourceFile.addInterface({
            name: this.wrapperName,
            isExported: true,
            docs: docs != null ? [docs] : []
        });
        for (const queryParameter of this.getAllQueryParameters()) {
            const type = context.type.getReferenceToType(queryParameter.valueType);
            const property = requestInterface.addProperty({
                name: `"${this.getPropertyNameOfQueryParameter(queryParameter).propertyName}"`,
                type: getTextOfTsNode(
                    queryParameter.allowMultiple
                        ? ts.factory.createUnionTypeNode([
                              type.typeNodeWithoutUndefined,
                              ts.factory.createArrayTypeNode(type.typeNodeWithoutUndefined)
                          ])
                        : type.typeNodeWithoutUndefined
                ),
                hasQuestionToken: type.isOptional
            });
            maybeAddDocs(property, queryParameter.docs);
        }
        for (const header of this.getAllNonLiteralHeaders(context)) {
            const type = context.type.getReferenceToType(header.valueType);
            const property = requestInterface.addProperty({
                name: `"${this.getPropertyNameOfNonLiteralHeader(header).propertyName}"`,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional
            });
            maybeAddDocs(property, header.docs);
        }
        if (this.endpoint.requestBody != null) {
            HttpRequestBody._visit(this.endpoint.requestBody, {
                inlinedRequestBody: (inlinedRequestBody) => {
                    for (const property of this.getAllNonLiteralPropertiesFromInlinedRequest({
                        inlinedRequestBody,
                        context
                    })) {
                        requestInterface.addProperty(this.getInlineProperty(property, context));
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
                        hasQuestionToken: type.isOptional
                    });
                    maybeAddDocs(property, referenceToRequestBody.docs);
                },
                fileUpload: (fileUploadRequest) => {
                    for (const property of fileUploadRequest.properties) {
                        FileUploadRequestProperty._visit(property, {
                            file: noop,
                            bodyProperty: (inlinedProperty) => {
                                requestInterface.addProperty(this.getInlineProperty(inlinedProperty, context));
                            },
                            _other: () => {
                                throw new Error("Unknown FileUploadRequestProperty: " + property.type);
                            }
                        });
                    }
                },
                bytes: () => {
                    throw new Error("bytes is not supported");
                },
                _other: () => {
                    throw new Error("Unknown HttpRequestBody: " + this.endpoint.requestBody?.type);
                }
            });
        }
    }

    public generateExample(example: ExampleEndpointCall): GeneratedRequestWrapperExample {
        const exampleGenerator = new RequestWrapperExampleGenerator();
        return exampleGenerator.generateExample({
            bodyPropertyName: this.getReferencedBodyPropertyName(),
            example,
            packageId: this.packageId,
            endpointName: this.endpoint.name
        });
    }

    private getDocs(context: SdkContext): string | undefined {
        const groups: string[] = [];

        for (const example of this.endpoint.examples) {
            const generatedExample = this.generateExample(example);
            const exampleStr = "@example\n" + getTextOfTsNode(generatedExample.build(context, { isForComment: true }));
            groups.push(exampleStr.replaceAll("\n", `\n${EXAMPLE_PREFIX}`));
        }

        if (groups.length === 0) {
            return undefined;
        }
        return groups.join("\n\n");
    }

    private getInlineProperty(
        property: InlinedRequestBodyProperty,
        context: SdkContext
    ): OptionalKind<PropertySignatureStructure> {
        const type = context.type.getReferenceToType(property.valueType);
        return {
            name: `"${this.getInlinedRequestBodyPropertyKey(property)}"`,
            type: getTextOfTsNode(type.typeNodeWithoutUndefined),
            hasQuestionToken: type.isOptional,
            docs: property.docs != null ? [property.docs] : undefined
        };
    }

    public areBodyPropertiesInlined(): boolean {
        return this.endpoint.requestBody != null && this.endpoint.requestBody.type === "inlinedRequestBody";
    }

    public withQueryParameter({
        queryParameter,
        referenceToQueryParameterProperty,
        context,
        queryParamSetter,
        queryParamItemSetter
    }: {
        queryParameter: QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        context: SdkContext;
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
    }): ts.Statement[] {
        let statements: ts.Statement[];

        if (queryParameter.allowMultiple) {
            statements = [
                ts.factory.createIfStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("Array"),
                            ts.factory.createIdentifier("isArray")
                        ),
                        undefined,
                        [referenceToQueryParameterProperty]
                    ),
                    ts.factory.createBlock(queryParamItemSetter(referenceToQueryParameterProperty), true),
                    ts.factory.createBlock(queryParamSetter(referenceToQueryParameterProperty), true)
                )
            ];
        } else {
            statements = queryParamSetter(referenceToQueryParameterProperty);
        }

        const resolvedType = context.type.resolveTypeReference(queryParameter.valueType);
        const isQueryParamOptional = resolvedType.type === "container" && resolvedType.container.type === "optional";
        if (isQueryParamOptional) {
            statements = [
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        referenceToQueryParameterProperty,
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                        ts.factory.createNull()
                    ),
                    ts.factory.createBlock(statements)
                )
            ];
        }

        return statements;
    }

    #areBodyPropertiesOptional: boolean | undefined;
    public areAllPropertiesOptional(context: SdkContext): boolean {
        if (this.#areBodyPropertiesOptional == null) {
            this.#areBodyPropertiesOptional = this.expensivelyComputeIfAllPropertiesAreOptional(context);
        }
        return this.#areBodyPropertiesOptional;
    }

    public getNonBodyKeys(context: SdkContext): RequestWrapperNonBodyProperty[] {
        return [
            ...this.getAllQueryParameters().map((queryParameter) =>
                this.getPropertyNameOfQueryParameter(queryParameter)
            ),
            ...this.getAllNonLiteralHeaders(context).map((header) => this.getPropertyNameOfNonLiteralHeader(header))
        ];
    }

    public getInlinedRequestBodyPropertyKey(property: InlinedRequestBodyProperty): string {
        return this.getInlinedRequestBodyPropertyKeyFromName(property.name);
    }

    public getInlinedRequestBodyPropertyKeyFromName(name: NameAndWireValue): string {
        return this.includeSerdeLayer ? name.name.camelCase.unsafeName : name.wireValue;
    }

    private expensivelyComputeIfAllPropertiesAreOptional(context: SdkContext): boolean {
        for (const queryParameter of this.getAllQueryParameters()) {
            if (!this.isTypeOptional(queryParameter.valueType, context)) {
                return false;
            }
        }
        for (const header of this.getAllNonLiteralHeaders(context)) {
            if (!this.isTypeOptional(header.valueType, context)) {
                return false;
            }
        }
        if (this.endpoint.requestBody != null) {
            const areBodyPropertiesOptional = HttpRequestBody._visit<boolean>(this.endpoint.requestBody, {
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
                fileUpload: (fileUploadRequest) => {
                    for (const property of fileUploadRequest.properties) {
                        const isPropertyRequired = FileUploadRequestProperty._visit(property, {
                            // not present in the body
                            file: () => false,
                            bodyProperty: ({ valueType }) => !this.isTypeOptional(valueType, context),
                            _other: () => {
                                throw new Error(
                                    "Unknown FileUploadRequestProperty: " + this.endpoint.requestBody?.type
                                );
                            }
                        });
                        if (isPropertyRequired) {
                            return false;
                        }
                    }
                    return true;
                },
                bytes: () => {
                    throw new Error("bytes is not supported");
                },
                _other: () => {
                    throw new Error("Unknown HttpRequestBody: " + this.endpoint.requestBody?.type);
                }
            });
            if (!areBodyPropertiesOptional) {
                return false;
            }
        }
        return true;
    }

    private isTypeOptional(typeReference: TypeReference, context: SdkContext): boolean {
        const resolvedType = context.type.resolveTypeReference(typeReference);
        return resolvedType.type === "container" && resolvedType.container.type === "optional";
    }

    public getPropertyNameOfQueryParameter(queryParameter: QueryParameter): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfNonLiteralHeaderFromName(queryParameter.name);
    }

    public getPropertyNameOfQueryParameterFromName(name: NameAndWireValue): RequestWrapperNonBodyProperty {
        return {
            safeName: name.name.camelCase.safeName,
            propertyName: this.includeSerdeLayer ? name.name.camelCase.unsafeName : name.wireValue
        };
    }

    public getPropertyNameOfNonLiteralHeader(header: HttpHeader): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfNonLiteralHeaderFromName(header.name);
    }

    public getPropertyNameOfNonLiteralHeaderFromName(name: NameAndWireValue): RequestWrapperNonBodyProperty {
        return {
            safeName: name.name.camelCase.safeName,
            propertyName: this.includeSerdeLayer ? name.name.camelCase.unsafeName : name.wireValue
        };
    }

    public getAllQueryParameters(): QueryParameter[] {
        return this.endpoint.queryParameters;
    }

    private getAllNonLiteralPropertiesFromInlinedRequest({
        context,
        inlinedRequestBody
    }: {
        context: SdkContext;
        inlinedRequestBody: InlinedRequestBody;
    }): InlinedRequestBodyProperty[] {
        return inlinedRequestBody.properties.filter((property) => {
            const resolvedType = context.type.resolveTypeReference(property.valueType);
            const isLiteral = resolvedType.type === "container" && resolvedType.container.type === "literal";
            return !isLiteral;
        });
    }

    private getAllNonLiteralHeaders(context: SdkContext): HttpHeader[] {
        return [...this.service.headers, ...this.endpoint.headers].filter((header) => {
            const resolvedType = context.type.resolveTypeReference(header.valueType);
            const isLiteral = resolvedType.type === "container" && resolvedType.container.type === "literal";
            return !isLiteral;
        });
    }

    public getReferencedBodyPropertyName(): string {
        if (this.endpoint.sdkRequest == null) {
            throw new Error("Request body is defined but sdkRequest is null");
        }
        if (this.endpoint.sdkRequest.shape.type !== "wrapper") {
            throw new Error("Request body is defined but sdkRequest is not a wrapper");
        }
        return this.endpoint.sdkRequest.shape.bodyKey.camelCase.unsafeName;
    }
}
