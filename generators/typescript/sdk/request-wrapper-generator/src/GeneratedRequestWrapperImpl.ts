import {
    PackageId,
    TypeReferenceNode,
    generateInlinePropertiesModule,
    getExampleEndpointCalls,
    getParameterNameForPropertyPathParameterName,
    getTextOfTsNode,
    maybeAddDocsNode,
    visitJavaScriptRuntime
} from "@fern-typescript/commons";
import {
    GeneratedRequestWrapper,
    GeneratedRequestWrapperExample,
    RequestWrapperNonBodyProperty,
    SdkContext
} from "@fern-typescript/contexts";
import { ModuleDeclarationStructure, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

import { noop } from "@fern-api/core-utils";

import {
    ExampleEndpointCall,
    FileProperty,
    FileUploadRequest,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpHeader,
    HttpRequestBody,
    HttpService,
    InlinedRequestBody,
    InlinedRequestBodyProperty,
    Name,
    NameAndWireValue,
    PathParameter,
    QueryParameter,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { RequestWrapperExampleGenerator } from "./RequestWrapperExampleGenerator";

export declare namespace GeneratedRequestWrapperImpl {
    export interface Init {
        service: HttpService;
        endpoint: HttpEndpoint;
        wrapperName: string;
        packageId: PackageId;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        inlineFileProperties: boolean;
        enableInlineTypes: boolean;
        shouldInlinePathParameters: boolean;
    }
}

const EXAMPLE_PREFIX = "    ";

export class GeneratedRequestWrapperImpl implements GeneratedRequestWrapper {
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private wrapperName: string;
    private packageId: PackageId;
    protected includeSerdeLayer: boolean;
    protected retainOriginalCasing: boolean;
    protected inlineFileProperties: boolean;
    private enableInlineTypes: boolean;
    private _shouldInlinePathParameters: boolean;

    constructor({
        service,
        endpoint,
        wrapperName,
        packageId,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        enableInlineTypes,
        shouldInlinePathParameters
    }: GeneratedRequestWrapperImpl.Init) {
        this.service = service;
        this.endpoint = endpoint;
        this.wrapperName = wrapperName;
        this.packageId = packageId;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.inlineFileProperties = inlineFileProperties;
        this.enableInlineTypes = enableInlineTypes;
        this._shouldInlinePathParameters = shouldInlinePathParameters;
    }

    public shouldInlinePathParameters(): boolean {
        return this._shouldInlinePathParameters;
    }

    private getPathParamsForRequestWrapper(): PathParameter[] {
        if (!this.shouldInlinePathParameters()) {
            return [];
        }
        const sdkRequest = this.endpoint.sdkRequest;
        if (!sdkRequest) {
            return [];
        }
        switch (sdkRequest.shape.type) {
            case "justRequestBody":
                return [];
            case "wrapper":
                return [...this.service.pathParameters, ...this.endpoint.pathParameters];
        }
    }

    public writeToFile(context: SdkContext): void {
        const docs = this.getDocs(context);

        const requestInterface = context.sourceFile.addInterface({
            name: this.wrapperName,
            isExported: true,
            docs: docs != null ? [docs] : []
        });

        for (const pathParameter of this.getPathParamsForRequestWrapper()) {
            const type = context.type.getReferenceToType(pathParameter.valueType);
            const property = requestInterface.addProperty({
                name: `"${this.getPropertyNameOfPathParameter(pathParameter).propertyName}"`,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional
            });
            maybeAddDocsNode(property, pathParameter.docs);
        }

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
            maybeAddDocsNode(property, queryParameter.docs);
        }
        for (const header of this.getAllNonLiteralHeaders(context)) {
            const type = context.type.getReferenceToType(header.valueType);
            const property = requestInterface.addProperty({
                name: `"${this.getPropertyNameOfNonLiteralHeader(header).propertyName}"`,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional
            });
            maybeAddDocsNode(property, header.docs);
        }
        if (this.endpoint.requestBody != null) {
            HttpRequestBody._visit(this.endpoint.requestBody, {
                inlinedRequestBody: (inlinedRequestBody) => {
                    for (const property of this.getAllNonLiteralPropertiesFromInlinedRequest({
                        inlinedRequestBody,
                        context
                    })) {
                        requestInterface.addProperty(this.getInlineProperty(inlinedRequestBody, property, context));
                    }
                    const iModule = this.generateModule(inlinedRequestBody, context);
                    if (iModule) {
                        context.sourceFile.addModule(iModule);
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
                    maybeAddDocsNode(property, referenceToRequestBody.docs);
                },
                fileUpload: (fileUploadRequest) => {
                    for (const property of fileUploadRequest.properties) {
                        FileUploadRequestProperty._visit(property, {
                            file: (fileProperty) => {
                                if (!this.inlineFileProperties) {
                                    return;
                                }
                                requestInterface.addProperty({
                                    name: this.getPropertyNameOfFileParameterFromName(fileProperty.key).propertyName,
                                    type: getTextOfTsNode(this.getFileParameterType(fileProperty, context)),
                                    hasQuestionToken: fileProperty.isOptional
                                });
                            },
                            bodyProperty: (inlinedProperty) => {
                                requestInterface.addProperty(
                                    this.getInlineProperty(fileUploadRequest, inlinedProperty, context)
                                );
                            },
                            _other: () => {
                                throw new Error("Unknown FileUploadRequestProperty: " + property.type);
                            }
                        });
                    }
                },
                bytes: () => {
                    // noop
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
            endpointName: this.endpoint.name,
            requestBody: this.endpoint.requestBody
        });
    }

    private getDocs(context: SdkContext): string | undefined {
        const groups: string[] = [];

        for (const example of getExampleEndpointCalls(this.endpoint)) {
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
        requestBody: InlinedRequestBody | FileUploadRequest,
        property: InlinedRequestBodyProperty,
        context: SdkContext
    ): OptionalKind<PropertySignatureStructure> {
        const type = this.getTypeForBodyProperty(requestBody, property, context);
        return {
            name: `"${this.getInlinedRequestBodyPropertyKey(property)}"`,
            type: getTextOfTsNode(type.typeNodeWithoutUndefined),
            hasQuestionToken: type.isOptional,
            docs: property.docs != null ? [property.docs] : undefined
        };
    }

    private getTypeForBodyProperty(
        requestBody: InlinedRequestBody | FileUploadRequest,
        property: InlinedRequestBodyProperty,
        context: SdkContext
    ): TypeReferenceNode {
        const propParentTypeName = requestBody.name.pascalCase.safeName;
        const propName = property.name.name.pascalCase.safeName;
        return context.type.getReferenceToInlinePropertyType(property.valueType, propParentTypeName, propName);
    }

    private generateModule(
        inlinedRequestBody: InlinedRequestBody,
        context: SdkContext
    ): ModuleDeclarationStructure | undefined {
        if (!this.enableInlineTypes) {
            return undefined;
        }

        return generateInlinePropertiesModule({
            parentTypeName: this.wrapperName,
            properties: inlinedRequestBody.properties.map((prop) => ({
                propertyName: prop.name.name.pascalCase.safeName,
                typeReference: prop.valueType
            })),
            generateStatements: (typeName, typeNameOverride) =>
                context.type.getGeneratedType(typeName, typeNameOverride).generateStatements(context),
            getTypeDeclaration: (namedType) => context.type.getTypeDeclaration(namedType)
        });
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
        const properties = [
            ...this.getPathParamsForRequestWrapper().map((pathParameter) =>
                this.getPropertyNameOfPathParameter(pathParameter)
            ),
            ...this.getAllQueryParameters().map((queryParameter) =>
                this.getPropertyNameOfQueryParameter(queryParameter)
            ),
            ...this.getAllNonLiteralHeaders(context).map((header) => this.getPropertyNameOfNonLiteralHeader(header))
        ];
        if (!this.inlineFileProperties) {
            return properties;
        }
        return [
            ...this.getAllFileUploadProperties().map((fileProperty) =>
                this.getPropertyNameOfFileParameter(fileProperty)
            ),
            ...properties
        ];
    }

    public getInlinedRequestBodyPropertyKey(property: InlinedRequestBodyProperty): string {
        return this.getInlinedRequestBodyPropertyKeyFromName(property.name);
    }

    public getInlinedRequestBodyPropertyKeyFromName(name: NameAndWireValue): string {
        return this.includeSerdeLayer && !this.retainOriginalCasing ? name.name.camelCase.unsafeName : name.wireValue;
    }

    private expensivelyComputeIfAllPropertiesAreOptional(context: SdkContext): boolean {
        for (const pathParameter of this.getPathParamsForRequestWrapper()) {
            if (!this.isTypeOptional(pathParameter.valueType, context)) {
                return false;
            }
        }

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
                            file: (fileProperty) => {
                                if (!this.inlineFileProperties) {
                                    return false;
                                }
                                return !fileProperty.isOptional;
                            },
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

    public getPropertyNameOfFileParameter(fileProperty: FileProperty): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfFileParameterFromName(fileProperty.key);
    }

    public getPropertyNameOfFileParameterFromName(name: NameAndWireValue): RequestWrapperNonBodyProperty {
        return {
            safeName: name.name.camelCase.safeName,
            propertyName:
                this.includeSerdeLayer && !this.retainOriginalCasing ? name.name.camelCase.unsafeName : name.wireValue
        };
    }

    public getPropertyNameOfQueryParameter(queryParameter: QueryParameter): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfQueryParameterFromName(queryParameter.name);
    }

    public getPropertyNameOfQueryParameterFromName(name: NameAndWireValue): RequestWrapperNonBodyProperty {
        return {
            safeName: name.name.camelCase.safeName,
            propertyName:
                this.includeSerdeLayer && !this.retainOriginalCasing ? name.name.camelCase.unsafeName : name.wireValue
        };
    }

    public getPropertyNameOfPathParameter(pathParameter: PathParameter): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfPathParameterFromName(pathParameter.name);
    }

    public getPropertyNameOfPathParameterFromName(name: Name): RequestWrapperNonBodyProperty {
        return {
            safeName: name.camelCase.safeName,
            propertyName: getParameterNameForPropertyPathParameterName({
                includeSerdeLayer: this.includeSerdeLayer,
                retainOriginalCasing: this.retainOriginalCasing,
                pathParameterName: name
            })
        };
    }

    public getPropertyNameOfNonLiteralHeader(header: HttpHeader): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfNonLiteralHeaderFromName(header.name);
    }

    public getPropertyNameOfNonLiteralHeaderFromName(name: NameAndWireValue): RequestWrapperNonBodyProperty {
        return {
            safeName: name.name.camelCase.safeName,
            propertyName:
                this.includeSerdeLayer && !this.retainOriginalCasing ? name.name.camelCase.unsafeName : name.wireValue
        };
    }

    public getAllPathParameters(): PathParameter[] {
        return this.endpoint.allPathParameters;
    }

    public getAllQueryParameters(): QueryParameter[] {
        return this.endpoint.queryParameters;
    }

    public getAllFileUploadProperties(): FileProperty[] {
        if (this.endpoint.requestBody == null || this.endpoint.requestBody.type !== "fileUpload") {
            return [];
        }
        const fileProperties: FileProperty[] = [];
        for (const property of this.endpoint.requestBody.properties) {
            FileUploadRequestProperty._visit(property, {
                file: (fileProperty) => {
                    fileProperties.push(fileProperty);
                },
                bodyProperty: noop,
                _other: () => {
                    throw new Error("Unknown FileUploadRequestProperty: " + this.endpoint.requestBody?.type);
                }
            });
        }
        return fileProperties;
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
        return this.retainOriginalCasing
            ? this.endpoint.sdkRequest.shape.bodyKey.originalName
            : this.endpoint.sdkRequest.shape.bodyKey.camelCase.unsafeName;
    }

    private getFileParameterType(property: FileProperty, context: SdkContext): ts.TypeNode {
        const types: ts.TypeNode[] = [
            this.maybeWrapFileArray({
                property,
                value: ts.factory.createTypeReferenceNode("File")
            })
        ];

        visitJavaScriptRuntime(context.targetRuntime, {
            node: () => {
                types.push(
                    this.maybeWrapFileArray({
                        property,
                        value: context.externalDependencies.fs.ReadStream._getReferenceToType()
                    }),
                    this.maybeWrapFileArray({
                        property,
                        value: ts.factory.createTypeReferenceNode("Blob")
                    })
                );
            },
            browser: () => {
                types.push(
                    this.maybeWrapFileArray({
                        property,
                        value: ts.factory.createTypeReferenceNode("Blob")
                    })
                );
            }
        });

        if (property.isOptional) {
            types.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword));
        }

        return ts.factory.createUnionTypeNode(types);
    }

    private maybeWrapFileArray({ property, value }: { property: FileProperty; value: ts.TypeNode }): ts.TypeNode {
        return property.type === "fileArray" ? ts.factory.createArrayTypeNode(value) : value;
    }
}
