import { assertNever, noop } from "@fern-api/core-utils";
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
    NameAndWireValue,
    NamedType,
    ObjectProperty,
    QueryParameter,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import {
    getExampleEndpointCalls,
    getTextOfTsNode,
    maybeAddDocsNode,
    maybeAddDocsStructure,
    PackageId,
    TypeReferenceNode,
    visitJavaScriptRuntime
} from "@fern-typescript/commons";
import {
    GeneratedRequestWrapper,
    GeneratedRequestWrapperExample,
    RequestWrapperNonBodyProperty,
    SdkContext
} from "@fern-typescript/contexts";
import {
    ModuleDeclarationKind,
    ModuleDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    StructureKind,
    ts
} from "ts-morph";
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
        inlineInlineTypes: boolean;
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
    private inlineInlineTypes: boolean;

    constructor({
        service,
        endpoint,
        wrapperName,
        packageId,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        inlineInlineTypes
    }: GeneratedRequestWrapperImpl.Init) {
        this.service = service;
        this.endpoint = endpoint;
        this.wrapperName = wrapperName;
        this.packageId = packageId;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.inlineFileProperties = inlineFileProperties;
        this.inlineInlineTypes = inlineInlineTypes;
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
        const inlineProps = this.getInlinePropertiesWithTypeDeclaration(requestBody, context);
        if (inlineProps.has(property)) {
            const propParentTypeName = requestBody.name.pascalCase.safeName;
            const propName = property.name.name.pascalCase.safeName;
            return context.type.getReferenceToInlineType(property.valueType, propParentTypeName, propName);
        } else {
            return context.type.getReferenceToType(property.valueType);
        }
    }

    private generateModule(
        inlinedRequestBody: InlinedRequestBody,
        context: SdkContext
    ): ModuleDeclarationStructure | undefined {
        if (!this.inlineInlineTypes) {
            return undefined;
        }

        const inlineProperties = this.getInlinePropertiesWithTypeDeclaration(inlinedRequestBody, context);
        if (inlineProperties.size === 0) {
            return;
        }
        return {
            kind: StructureKind.Module,
            name: inlinedRequestBody.name.pascalCase.safeName,
            isExported: true,
            hasDeclareKeyword: false,
            declarationKind: ModuleDeclarationKind.Namespace,
            statements: Array.from(inlineProperties.entries()).flatMap(
                ([objectProperty, typeDeclaration]: [ObjectProperty, TypeDeclaration]) => {
                    const generatedType = context.type.getGeneratedType(
                        typeDeclaration.name,
                        objectProperty.name.name.pascalCase.safeName
                    );
                    return generatedType.generateStatements(context);
                }
            )
        };
    }

    private getInlinePropertiesWithTypeDeclaration(
        requestBody: InlinedRequestBody | FileUploadRequest,
        context: SdkContext
    ): Map<ObjectProperty, TypeDeclaration> {
        const inlineProperties = new Map<ObjectProperty, TypeDeclaration>(
            requestBody.properties
                .map((prop) => {
                    if ("type" in prop) {
                        // fileupload prop
                        switch (prop.type) {
                            case "bodyProperty":
                                return prop as InlinedRequestBodyProperty;
                            case "file":
                                return undefined;
                            default:
                                assertNever(prop);
                        }
                    } else {
                        return prop;
                    }
                })
                .filter((prop): prop is InlinedRequestBodyProperty => prop !== undefined)
                .map((property): [ObjectProperty, NamedType] | undefined => {
                    const namedType = getNamedType(property?.valueType);
                    if (namedType) {
                        return [property, namedType];
                    }
                    return undefined;
                })
                .filter((x): x is [ObjectProperty, TypeReference.Named] => x != null)
                .map(([property, type]): [ObjectProperty, TypeDeclaration] => {
                    return [property, context.type.getTypeDeclaration(type)];
                })
        );
        return inlineProperties;
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
function getNamedType(typeReference: TypeReference): NamedType | undefined {
    switch (typeReference.type) {
        case "named":
            return typeReference;
        case "container":
            switch (typeReference.container.type) {
                case "optional":
                    return getNamedType(typeReference.container.optional);
                case "list":
                    return getNamedType(typeReference.container.list);
                case "map":
                    return getNamedType(typeReference.container.valueType);
                case "set":
                    return getNamedType(typeReference.container.set);
                case "literal":
                    return undefined;
                default:
                    assertNever(typeReference.container);
            }
        // fallthrough
        case "primitive":
            return undefined;
        case "unknown":
            return undefined;
        default:
            assertNever(typeReference);
    }
}
