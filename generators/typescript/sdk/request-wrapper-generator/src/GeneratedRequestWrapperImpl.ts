import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { noop, SetRequired } from "@fern-api/core-utils";

import { FernIr } from "@fern-fern/ir-sdk";
import {
    deduplicateExamples,
    generateInlinePropertiesModule,
    getExampleEndpointCalls,
    getPropertyKey,
    getSdkParameterPropertyName,
    getTextOfTsNode,
    PackageId,
    TypeReferenceNode
} from "@fern-typescript/commons";
import {
    FileContext,
    GeneratedRequestWrapper,
    GeneratedRequestWrapperExample,
    RequestWrapperBodyProperty,
    RequestWrapperNonBodyProperty,
    RequestWrapperNonBodyPropertyWithData
} from "@fern-typescript/contexts";
import {
    InterfaceDeclarationStructure,
    ModuleDeclarationKind,
    ModuleDeclarationStructure,
    PropertySignatureStructure,
    StatementStructures,
    StructureKind,
    ts,
    WriterFunction
} from "ts-morph";
import { RequestWrapperExampleGenerator } from "./RequestWrapperExampleGenerator.js";

export declare namespace GeneratedRequestWrapperImpl {
    export interface Init {
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        wrapperName: string;
        packageId: PackageId;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        inlineFileProperties: boolean;
        enableInlineTypes: boolean;
        shouldInlinePathParameters: boolean;
        formDataSupport: "Node16" | "Node18";
        flattenRequestParameters: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
        caseConverter: CaseConverter;
        resolveQueryParameterNameConflicts: boolean;
    }
}

const EXAMPLE_PREFIX = "    ";

export class GeneratedRequestWrapperImpl implements GeneratedRequestWrapper {
    private service: FernIr.HttpService;
    private endpoint: FernIr.HttpEndpoint;
    private wrapperName: string;
    private packageId: PackageId;
    protected includeSerdeLayer: boolean;
    protected retainOriginalCasing: boolean;
    protected inlineFileProperties: boolean;
    private readonly enableInlineTypes: boolean;
    private readonly formDataSupport: "Node16" | "Node18";
    private readonly flattenRequestParameters: boolean;
    private readonly parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
    private readonly case: CaseConverter;
    private readonly resolveQueryParameterNameConflicts: boolean;

    constructor({
        service,
        endpoint,
        wrapperName,
        packageId,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        enableInlineTypes,
        formDataSupport,
        flattenRequestParameters,
        parameterNaming,
        caseConverter,
        resolveQueryParameterNameConflicts
    }: GeneratedRequestWrapperImpl.Init) {
        this.service = service;
        this.endpoint = endpoint;
        this.wrapperName = wrapperName;
        this.packageId = packageId;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.inlineFileProperties = inlineFileProperties;
        this.enableInlineTypes = enableInlineTypes;
        this.formDataSupport = formDataSupport;
        this.flattenRequestParameters = flattenRequestParameters;
        this.parameterNaming = parameterNaming;
        this.case = caseConverter;
        this.resolveQueryParameterNameConflicts = resolveQueryParameterNameConflicts;
    }

    public shouldInlinePathParameters(context: FileContext): boolean {
        return context.requestWrapper.shouldInlinePathParameters(this.endpoint.sdkRequest);
    }

    private getPathParamsForRequestWrapper(context: FileContext): FernIr.PathParameter[] {
        if (!this.shouldInlinePathParameters(context)) {
            return [];
        }

        const sdkRequest = this.endpoint.sdkRequest;
        if (!sdkRequest || sdkRequest.shape.type !== "wrapper") {
            return [];
        }

        return [...this.service.pathParameters, ...this.endpoint.pathParameters];
    }

    public writeToFile(context: FileContext): void {
        const docs = this.getDocs(context);
        const interfaceExtends: string[] = [];
        const requestInterface: SetRequired<InterfaceDeclarationStructure, "properties" | "extends"> = {
            kind: StructureKind.Interface,
            name: this.wrapperName,
            isExported: true,
            docs: docs ? [docs] : [],
            properties: [],
            extends: []
        };
        requestInterface.properties.push(
            ...this.getRequestProperties(context).map<PropertySignatureStructure>((property) => {
                return {
                    kind: StructureKind.PropertySignature,
                    type: getTextOfTsNode(property.type),
                    name: getPropertyKey(property.name),
                    hasQuestionToken: property.isOptional,
                    docs: property.docs
                };
            })
        );

        const requestBody = this.endpoint.requestBody;
        if (requestBody != null) {
            FernIr.HttpRequestBody._visit(requestBody, {
                inlinedRequestBody: (inlinedRequestBody) => {
                    for (const extension of inlinedRequestBody.extends) {
                        interfaceExtends.push(
                            getTextOfTsNode(context.type.getReferenceToNamedType(extension).getTypeNode())
                        );
                    }
                    if (inlinedRequestBody.extraProperties) {
                        requestInterface.properties.push({
                            kind: StructureKind.PropertySignature,
                            hasQuestionToken: false,
                            name: "[key: string]",
                            type: "any",
                            docs: ["Accepts any additional properties"]
                        });
                    }
                },
                reference: () => {
                    // noop
                },
                fileUpload: () => {
                    // noop
                },
                bytes: () => {
                    // noop
                },
                _other: () => {
                    throw new Error("Unknown FernIr.HttpRequestBody: " + this.endpoint.requestBody?.type);
                }
            });
        }

        requestInterface.extends = interfaceExtends;

        context.sourceFile.addInterface(requestInterface);
        if (requestBody == null) {
            return;
        }
        const iModule = this.generateModule({ requestBody, context });
        if (iModule) {
            context.sourceFile.addModule(iModule);
        }
    }

    public getRequestProperties(context: FileContext): GeneratedRequestWrapper.Property[] {
        const properties: GeneratedRequestWrapper.Property[] = [];

        // When resolveQueryParameterNameConflicts is enabled, pre-compute body property names
        // so we can detect collisions between query param wire values and body property names.
        const collidingQueryParamWireValues = this.resolveQueryParameterNameConflicts
            ? this.getCollidingQueryParamWireValues(context)
            : new Set<string>();

        for (const pathParameter of this.getPathParamsForRequestWrapper(context)) {
            const type = context.type.getReferenceToType(pathParameter.valueType);
            const hasDefaultValue = this.hasDefaultValue(pathParameter.valueType, context);
            const hasClientDefault = pathParameter.clientDefault != null;
            const propertyName = this.getPropertyNameOfPathParameter(pathParameter);
            properties.push({
                name: getPropertyKey(propertyName.propertyName),
                safeName: getPropertyKey(propertyName.safeName),
                type: type.typeNodeWithoutUndefined,
                isOptional: type.isOptional || hasDefaultValue || hasClientDefault,
                docs: pathParameter.docs ? [pathParameter.docs] : undefined
            });
        }

        for (const queryParameter of this.getAllQueryParameters()) {
            const type = context.type.getReferenceToType(queryParameter.valueType);
            const hasDefaultValue = this.hasDefaultValue(queryParameter.valueType, context);
            const hasClientDefault = queryParameter.clientDefault != null;
            const propertyName = collidingQueryParamWireValues.has(getWireValue(queryParameter.name))
                ? this.getOverriddenPropertyNameOfQueryParameter(queryParameter)
                : this.getPropertyNameOfQueryParameter(queryParameter);
            properties.push({
                name: getPropertyKey(propertyName.propertyName),
                safeName: getPropertyKey(propertyName.safeName),
                type: queryParameter.allowMultiple
                    ? ts.factory.createUnionTypeNode([
                          type.typeNodeWithoutUndefined,
                          ts.factory.createArrayTypeNode(type.typeNodeWithoutUndefined)
                      ])
                    : type.typeNodeWithoutUndefined,
                isOptional: type.isOptional || hasDefaultValue || hasClientDefault,
                docs: queryParameter.docs ? [queryParameter.docs] : undefined
            });
        }

        for (const header of this.getAllNonLiteralHeaders(context)) {
            const type = context.type.getReferenceToType(header.valueType);
            const hasDefaultValue = this.hasDefaultValue(header.valueType, context);
            const hasClientDefault = header.clientDefault != null;
            const headerName = this.getPropertyNameOfNonLiteralHeader(header);
            properties.push({
                name: getPropertyKey(headerName.propertyName),
                safeName: getPropertyKey(headerName.safeName),
                type: type.typeNodeWithoutUndefined,
                isOptional: type.isOptional || hasDefaultValue || hasClientDefault,
                docs: header.docs ? [header.docs] : undefined
            });
        }

        const requestBody = this.endpoint.requestBody;
        if (requestBody != null) {
            FernIr.HttpRequestBody._visit(requestBody, {
                inlinedRequestBody: (inlinedRequestBody) => {
                    if (this.flattenRequestParameters) {
                        const inlinedProperties = this.getFlattenedInlinedRequestBodyProperties(
                            inlinedRequestBody,
                            context
                        );
                        properties.push(...inlinedProperties);
                    } else {
                        for (const property of this.getAllNonLiteralPropertiesFromInlinedRequest({
                            inlinedRequestBody,
                            context
                        })) {
                            const requestProperty = this.getInlineProperty(inlinedRequestBody, property, context);
                            properties.push(requestProperty);
                        }
                    }
                },
                reference: (referenceToRequestBody) => {
                    if (this.flattenRequestParameters) {
                        const referencedProperties = this.getFlattenedReferencedRequestBodyProperties(
                            referenceToRequestBody,
                            context
                        );
                        properties.push(...referencedProperties);
                    } else {
                        const type = context.type.getReferenceToType(referenceToRequestBody.requestBodyType);
                        const name = this.getReferencedBodyPropertyName();
                        const requestProperty: GeneratedRequestWrapper.Property = {
                            name,
                            safeName: name,
                            type: type.typeNodeWithoutUndefined,
                            isOptional: type.isOptional,
                            docs: referenceToRequestBody.docs ? [referenceToRequestBody.docs] : undefined
                        };
                        properties.push(requestProperty);
                    }
                },
                fileUpload: (fileUploadRequest) => {
                    for (const property of fileUploadRequest.properties) {
                        FernIr.FileUploadRequestProperty._visit(property, {
                            file: (fileProperty) => {
                                if (!this.inlineFileProperties) {
                                    return;
                                }
                                const propertyName = this.getPropertyNameOfFileParameterFromName(fileProperty.key);
                                properties.push({
                                    name: getPropertyKey(propertyName.propertyName),
                                    safeName: getPropertyKey(propertyName.safeName),
                                    type: this.getFileParameterType(fileProperty, context),
                                    isOptional: fileProperty.isOptional,
                                    docs: fileProperty.docs ? [fileProperty.docs] : undefined
                                });
                            },
                            bodyProperty: (inlinedProperty) => {
                                properties.push(this.getInlineProperty(fileUploadRequest, inlinedProperty, context));
                            },
                            _other: () => {
                                throw new Error("Unknown FernIr.FileUploadRequestProperty: " + property.type);
                            }
                        });
                    }
                },
                bytes: () => {
                    // noop
                },
                _other: () => {
                    throw new Error("Unknown FernIr.HttpRequestBody: " + this.endpoint.requestBody?.type);
                }
            });
        }

        return properties;
    }

    public generateExample(example: FernIr.ExampleEndpointCall): GeneratedRequestWrapperExample {
        const exampleGenerator = new RequestWrapperExampleGenerator();
        return exampleGenerator.generateExample({
            bodyPropertyName: this.getReferencedBodyPropertyName(),
            example,
            packageId: this.packageId,
            endpointName: this.endpoint.name,
            requestBody: this.endpoint.requestBody,
            flattenRequestParameters: this.flattenRequestParameters
        });
    }

    private getDocs(context: FileContext): string | undefined {
        const exampleCalls = getExampleEndpointCalls(this.endpoint);
        if (exampleCalls.length === 0) {
            return undefined;
        }

        const allExamples = exampleCalls.map((example) => {
            const generatedExample = this.generateExample(example);
            const exampleStr =
                "@example\n" +
                getTextOfTsNode(generatedExample.build(context, { isForComment: true, isForRequest: true }));
            return exampleStr.replaceAll("\n", `\n${EXAMPLE_PREFIX}`);
        });
        return deduplicateExamples(allExamples).join("\n\n");
    }

    private getInlineProperty(
        requestBody: FernIr.InlinedRequestBody | FernIr.FileUploadRequest,
        property: FernIr.InlinedRequestBodyProperty,
        context: FileContext
    ): GeneratedRequestWrapper.Property {
        const type = this.getTypeForBodyProperty(requestBody, property, context);
        const name = this.getInlinedRequestBodyPropertyKey(property);
        return {
            name: getPropertyKey(name.propertyName),
            safeName: getPropertyKey(name.safeName),
            type: type.typeNodeWithoutUndefined,
            isOptional: type.isOptional,
            docs: property.docs ? [property.docs] : undefined
        };
    }

    private getTypeForBodyProperty(
        requestBody: FernIr.InlinedRequestBody | FernIr.FileUploadRequest,
        property: FernIr.InlinedRequestBodyProperty,
        context: FileContext
    ): TypeReferenceNode {
        const propParentTypeName = context.case.pascalSafe(requestBody.name);
        const propName = context.case.pascalSafe(property.name);
        return context.type.getReferenceToInlinePropertyType(property.valueType, propParentTypeName, propName);
    }

    private generateModule({
        requestBody,
        context
    }: {
        requestBody: FernIr.HttpRequestBody;
        context: FileContext;
    }): ModuleDeclarationStructure | undefined {
        if (!this.enableInlineTypes) {
            return undefined;
        }

        const inlineTypeStatements = this.generateInlineTypes({
            requestBody,
            context
        });

        if (inlineTypeStatements.length === 0) {
            return undefined;
        }

        const module: ModuleDeclarationStructure = {
            kind: StructureKind.Module,
            name: this.wrapperName,
            isExported: true,
            hasDeclareKeyword: false,
            declarationKind: ModuleDeclarationKind.Namespace,
            statements: [...inlineTypeStatements]
        };
        return module;
    }

    private generateInlineTypes({
        requestBody,
        context
    }: {
        requestBody: FernIr.HttpRequestBody;
        context: FileContext;
    }): (string | WriterFunction | StatementStructures)[] {
        if (!this.enableInlineTypes) {
            return [];
        }

        return requestBody._visit({
            inlinedRequestBody: (inlinedRequestBody: FernIr.InlinedRequestBody) => {
                return generateInlinePropertiesModule({
                    properties: inlinedRequestBody.properties.map((prop) => ({
                        propertyName: context.case.pascalSafe(prop.name),
                        typeReference: prop.valueType
                    })),
                    generateStatements: (typeName, typeNameOverride) =>
                        context.type.getGeneratedType(typeName, typeNameOverride).generateStatements(context),
                    getTypeDeclaration: (namedType) => context.type.getTypeDeclaration(namedType)
                });
            },
            reference: () => [],
            fileUpload: (fileUploadBody: FernIr.FileUploadRequest) => {
                return generateInlinePropertiesModule({
                    properties: fileUploadBody.properties
                        .filter((prop) => prop.type === "bodyProperty")
                        .map((prop) => ({
                            propertyName: context.case.pascalSafe(prop.name),
                            typeReference: prop.valueType
                        })),
                    generateStatements: (typeName, typeNameOverride) =>
                        context.type.getGeneratedType(typeName, typeNameOverride).generateStatements(context),
                    getTypeDeclaration: (namedType) => context.type.getTypeDeclaration(namedType)
                });
            },
            bytes: () => [],
            _other: () => []
        });
    }

    public areBodyPropertiesInlined(): boolean {
        return (
            this.endpoint.requestBody != null &&
            (this.endpoint.requestBody.type === "inlinedRequestBody" || this.flattenRequestParameters)
        );
    }

    public withQueryParameter({
        queryParameter,
        referenceToQueryParameterProperty,
        context,
        queryParamSetter,
        queryParamItemSetter
    }: {
        queryParameter: FernIr.QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        context: FileContext;
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

        const isQueryParamOptional = context.type.isOptional(queryParameter.valueType);
        const isQueryParamNullable = context.type.isNullable(queryParameter.valueType);
        if (!isQueryParamNullable && !isQueryParamOptional) {
            return statements;
        }
        if (isQueryParamNullable) {
            return [
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        referenceToQueryParameterProperty,
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        ts.factory.createIdentifier("undefined")
                    ),
                    ts.factory.createBlock(statements)
                )
            ];
        }
        return [
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

    #areBodyPropertiesOptional: boolean | undefined;
    public areAllPropertiesOptional(context: FileContext): boolean {
        if (this.#areBodyPropertiesOptional == null) {
            this.#areBodyPropertiesOptional = this.expensivelyComputeIfAllPropertiesAreOptional(context);
        }
        return this.#areBodyPropertiesOptional;
    }

    public getNonBodyKeys(context: FileContext): RequestWrapperNonBodyProperty[] {
        const collidingQueryParamWireValues = this.resolveQueryParameterNameConflicts
            ? this.getCollidingQueryParamWireValues(context)
            : new Set<string>();

        const properties = [
            ...this.getPathParamsForRequestWrapper(context).map((pathParameter) =>
                this.getPropertyNameOfPathParameter(pathParameter)
            ),
            ...this.getAllQueryParameters().map((queryParameter) =>
                collidingQueryParamWireValues.has(getWireValue(queryParameter.name))
                    ? this.getOverriddenPropertyNameOfQueryParameter(queryParameter)
                    : this.getPropertyNameOfQueryParameter(queryParameter)
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

    public getNonBodyKeysWithData(context: FileContext): RequestWrapperNonBodyPropertyWithData[] {
        const collidingQueryParamWireValues = this.resolveQueryParameterNameConflicts
            ? this.getCollidingQueryParamWireValues(context)
            : new Set<string>();

        const properties: RequestWrapperNonBodyPropertyWithData[] = [
            ...this.getPathParamsForRequestWrapper(context).map((pathParameter) => ({
                ...this.getPropertyNameOfPathParameter(pathParameter),
                originalParameter: {
                    type: "path" as const,
                    parameter: pathParameter
                }
            })),
            ...this.getAllQueryParameters().map((queryParameter) => ({
                ...(collidingQueryParamWireValues.has(getWireValue(queryParameter.name))
                    ? this.getOverriddenPropertyNameOfQueryParameter(queryParameter)
                    : this.getPropertyNameOfQueryParameter(queryParameter)),
                originalParameter: {
                    type: "query" as const,
                    parameter: queryParameter
                }
            })),
            ...this.getAllNonLiteralHeaders(context).map((header) => ({
                ...this.getPropertyNameOfNonLiteralHeader(header),
                originalParameter: {
                    type: "header" as const,
                    parameter: header
                }
            }))
        ];
        if (!this.inlineFileProperties) {
            return properties;
        }
        return [
            ...this.getAllFileUploadProperties().map((fileProperty) => ({
                ...this.getPropertyNameOfFileParameter(fileProperty),
                originalParameter: {
                    type: "file" as const,
                    parameter: fileProperty
                }
            })),
            ...properties
        ];
    }

    public getInlinedRequestBodyPropertyKey(property: FernIr.InlinedRequestBodyProperty): RequestWrapperBodyProperty {
        return this.getInlinedRequestBodyPropertyKeyFromName(property.name);
    }

    public getInlinedRequestBodyPropertyKeyFromName(name: FernIr.NameAndWireValueOrString): RequestWrapperBodyProperty {
        const cc = this.case;
        return {
            propertyName:
                this.includeSerdeLayer && !this.retainOriginalCasing ? cc.camelUnsafe(name) : getWireValue(name),
            safeName: cc.camelSafe(name)
        };
    }

    private expensivelyComputeIfAllPropertiesAreOptional(context: FileContext): boolean {
        for (const pathParameter of this.getPathParamsForRequestWrapper(context)) {
            if (!this.isTypeOptional(pathParameter.valueType, context) && pathParameter.clientDefault == null) {
                return false;
            }
        }

        for (const queryParameter of this.getAllQueryParameters()) {
            if (!this.isTypeOptional(queryParameter.valueType, context) && queryParameter.clientDefault == null) {
                return false;
            }
        }
        for (const header of this.getAllNonLiteralHeaders(context)) {
            if (!this.isTypeOptional(header.valueType, context) && header.clientDefault == null) {
                return false;
            }
        }
        if (this.endpoint.requestBody != null) {
            const areBodyPropertiesOptional = FernIr.HttpRequestBody._visit<boolean>(this.endpoint.requestBody, {
                reference: ({ requestBodyType }) => this.isTypeOptional(requestBodyType, context),
                inlinedRequestBody: (inlinedRequestBody) => {
                    for (const property of inlinedRequestBody.properties) {
                        if (!this.isTypeOptional(property.valueType, context)) {
                            return false;
                        }
                    }
                    for (let extension of inlinedRequestBody.extends) {
                        const typeDeclaration = context.type.getTypeDeclaration(extension);
                        if (typeDeclaration.shape.type === "alias" && typeDeclaration.shape.aliasOf.type === "named") {
                            extension = {
                                ...typeDeclaration.shape.aliasOf
                            };
                        }
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
                        const isPropertyRequired = FernIr.FileUploadRequestProperty._visit(property, {
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

    private isTypeOptional(typeReference: FernIr.TypeReference, context: FileContext): boolean {
        const resolvedType = context.type.resolveTypeReference(typeReference);
        return resolvedType.type === "container" && resolvedType.container.type === "optional";
    }

    public getPropertyNameOfFileParameter(fileProperty: FernIr.FileProperty): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfFileParameterFromName(fileProperty.key);
    }

    public getPropertyNameOfFileParameterFromName(
        name: FernIr.NameAndWireValueOrString
    ): RequestWrapperNonBodyProperty {
        return {
            safeName: this.case.camelSafe(name),
            propertyName: getSdkParameterPropertyName({
                name,
                includeSerdeLayer: this.includeSerdeLayer,
                retainOriginalCasing: this.retainOriginalCasing,
                parameterNaming: this.parameterNaming,
                caseConverter: this.case
            })
        };
    }

    public getPropertyNameOfQueryParameter(queryParameter: FernIr.QueryParameter): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfQueryParameterFromName(queryParameter.name);
    }

    public getPropertyNameOfQueryParameterFromName(
        name: FernIr.NameAndWireValueOrString
    ): RequestWrapperNonBodyProperty {
        return {
            safeName: this.case.camelSafe(name),
            propertyName: getSdkParameterPropertyName({
                name,
                includeSerdeLayer: this.includeSerdeLayer,
                retainOriginalCasing: this.retainOriginalCasing,
                parameterNaming: this.parameterNaming,
                caseConverter: this.case
            })
        };
    }

    public getPropertyNameOfPathParameter(pathParameter: FernIr.PathParameter): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfPathParameterFromName(pathParameter.name);
    }

    public getPropertyNameOfPathParameterFromName(name: FernIr.NameOrString): RequestWrapperNonBodyProperty {
        return {
            safeName: this.case.camelSafe(name),
            propertyName: getSdkParameterPropertyName({
                name,
                includeSerdeLayer: this.includeSerdeLayer,
                retainOriginalCasing: this.retainOriginalCasing,
                parameterNaming: this.parameterNaming,
                caseConverter: this.case
            })
        };
    }

    public getPropertyNameOfNonLiteralHeader(header: FernIr.HttpHeader): RequestWrapperNonBodyProperty {
        return this.getPropertyNameOfNonLiteralHeaderFromName(header.name);
    }

    public getPropertyNameOfNonLiteralHeaderFromName(
        name: FernIr.NameAndWireValueOrString
    ): RequestWrapperNonBodyProperty {
        return {
            safeName: this.case.camelSafe(name),
            propertyName: getSdkParameterPropertyName({
                name,
                includeSerdeLayer: this.includeSerdeLayer,
                retainOriginalCasing: this.retainOriginalCasing,
                parameterNaming: this.parameterNaming,
                caseConverter: this.case
            })
        };
    }

    public getPropertyNameOfTypeDeclarationProperty(property: FernIr.ObjectProperty): RequestWrapperNonBodyProperty {
        const cc = this.case;
        return {
            safeName: cc.camelSafe(property.name),
            propertyName:
                this.includeSerdeLayer && !this.retainOriginalCasing
                    ? cc.camelUnsafe(property.name)
                    : getWireValue(property.name)
        };
    }

    public getAllPathParameters(): FernIr.PathParameter[] {
        return this.endpoint.allPathParameters;
    }

    public getAllQueryParameters(): FernIr.QueryParameter[] {
        return this.endpoint.queryParameters;
    }

    public getAllFileUploadProperties(): FernIr.FileProperty[] {
        if (this.endpoint.requestBody?.type !== "fileUpload") {
            return [];
        }

        const fileProperties: FernIr.FileProperty[] = [];
        for (const property of this.endpoint.requestBody.properties) {
            FernIr.FileUploadRequestProperty._visit(property, {
                file: (fileProperty) => {
                    fileProperties.push(fileProperty);
                },
                bodyProperty: noop,
                _other: () => {
                    throw new Error(`Unknown FileUploadRequestProperty: ${property.type}`);
                }
            });
        }
        return fileProperties;
    }

    private getAllNonLiteralPropertiesFromInlinedRequest({
        context,
        inlinedRequestBody
    }: {
        context: FileContext;
        inlinedRequestBody: FernIr.InlinedRequestBody;
    }): FernIr.InlinedRequestBodyProperty[] {
        return inlinedRequestBody.properties.filter((property) => {
            const resolvedType = context.type.resolveTypeReference(property.valueType);
            return !(resolvedType.type === "container" && resolvedType.container.type === "literal");
        });
    }

    private getAllNonLiteralHeaders(context: FileContext): FernIr.HttpHeader[] {
        return [...this.service.headers, ...this.endpoint.headers].filter((header) => {
            const resolvedType = context.type.resolveTypeReference(header.valueType);
            return !(resolvedType.type === "container" && resolvedType.container.type === "literal");
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
            ? getOriginalName(this.endpoint.sdkRequest.shape.bodyKey)
            : this.case.camelUnsafe(this.endpoint.sdkRequest.shape.bodyKey);
    }

    public hasBodyProperty(context: FileContext): boolean {
        const requestBody = this.endpoint.requestBody;
        if (requestBody == null) {
            return false;
        }
        return FernIr.HttpRequestBody._visit(requestBody, {
            inlinedRequestBody: () => false,
            reference: () => {
                if (!this.flattenRequestParameters) {
                    return true;
                }
                return false;
            },
            bytes: () => false,
            fileUpload: () => false,
            _other: () => false
        });
    }

    private getFileParameterType(property: FernIr.FileProperty, context: FileContext): ts.TypeNode {
        const types: ts.TypeNode[] = [];

        if (this.formDataSupport === "Node16") {
            types.push(
                this.maybeWrapFileArray({ property, value: ts.factory.createTypeReferenceNode("File") }),
                this.maybeWrapFileArray({
                    property,
                    value: context.externalDependencies.fs.ReadStream._getReferenceToType()
                }),
                this.maybeWrapFileArray({ property, value: ts.factory.createTypeReferenceNode("Blob") })
            );
        } else {
            types.push(
                this.maybeWrapFileArray({
                    property,
                    value: context.coreUtilities.fileUtils.Uploadable._getReferenceToType()
                })
            );
        }

        if (property.isOptional) {
            types.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword));
        }

        return ts.factory.createUnionTypeNode(types);
    }

    private maybeWrapFileArray({
        property,
        value
    }: {
        property: FernIr.FileProperty;
        value: ts.TypeNode;
    }): ts.TypeNode {
        return property.type === "fileArray" ? ts.factory.createArrayTypeNode(value) : value;
    }

    private hasDefaultValue(typeReference: FernIr.TypeReference, context: FileContext): boolean {
        const hasDefaultValue = context.type.hasDefaultValue(typeReference);
        const useDefaultValues = (context.config.customConfig as { useDefaultRequestParameterValues?: boolean })
            ?.useDefaultRequestParameterValues;

        return hasDefaultValue && Boolean(useDefaultValues);
    }

    private getFlattenedInlinedRequestBodyProperties(
        inlinedRequestBody: FernIr.InlinedRequestBody,
        context: FileContext
    ): GeneratedRequestWrapper.Property[] {
        const properties: GeneratedRequestWrapper.Property[] = [];
        for (const property of this.getAllNonLiteralPropertiesFromInlinedRequest({
            inlinedRequestBody,
            context
        })) {
            const requestProperty = this.getInlineProperty(inlinedRequestBody, property, context);
            properties.push(requestProperty);
        }
        return properties;
    }

    private getFlattenedReferencedRequestBodyProperties(
        referenceToRequestBody: FernIr.HttpRequestBodyReference,
        context: FileContext
    ): GeneratedRequestWrapper.Property[] {
        const properties: GeneratedRequestWrapper.Property[] = [];

        if (referenceToRequestBody.requestBodyType.type === "named") {
            const typeDeclaration = this.getTypeDeclaration(referenceToRequestBody.requestBodyType, context);
            if (typeDeclaration?.shape.type === "object") {
                const typeProperties = this.getFlattenedPropertiesFromTypeDeclaration(
                    typeDeclaration,
                    context,
                    context.case.pascalSafe(referenceToRequestBody.requestBodyType.name)
                );
                properties.push(...typeProperties);
            }
            return properties;
        }

        const type = context.type.getReferenceToType(referenceToRequestBody.requestBodyType);
        const name = this.getReferencedBodyPropertyName();
        properties.push({
            name,
            safeName: name,
            type: type.typeNodeWithoutUndefined,
            isOptional: type.isOptional,
            docs: referenceToRequestBody.docs ? [referenceToRequestBody.docs] : undefined
        });
        return properties;
    }

    private getTypeDeclaration(requestBodyType: FernIr.TypeReference.Named, context: FileContext) {
        return context.type.getTypeDeclaration({
            typeId: requestBodyType.typeId,
            fernFilepath: requestBodyType.fernFilepath,
            name: requestBodyType.name,
            displayName: requestBodyType.displayName
        });
    }

    private getFlattenedPropertiesFromTypeDeclaration(
        typeDeclaration: FernIr.TypeDeclaration,
        context: FileContext,
        typeName: string
    ): GeneratedRequestWrapper.Property[] {
        const properties: GeneratedRequestWrapper.Property[] = [];

        if (typeDeclaration.shape.type !== "object") {
            return properties;
        }

        for (const property of typeDeclaration.shape.properties) {
            const propertyType = this.flattenRequestParameters
                ? this.createNamespacedPropertyType(property, context, typeName)
                : context.type.getReferenceToType(property.valueType);
            const hasDefaultValue = this.hasDefaultValue(property.valueType, context);
            const propertyName = this.getPropertyNameOfTypeDeclarationProperty(property);

            const typeNode = propertyType.typeNodeWithoutUndefined;

            properties.push({
                name: getPropertyKey(propertyName.propertyName),
                safeName: getPropertyKey(propertyName.safeName),
                type: typeNode,
                isOptional: propertyType.isOptional || hasDefaultValue,
                docs: property.docs ? [property.docs] : undefined
            });
        }

        return properties;
    }

    private createNamespacedPropertyType(
        property: FernIr.ObjectProperty,
        context: FileContext,
        typeName: string
    ): TypeReferenceNode {
        if (context.enableInlineTypes) {
            const unionType = context.type.getReferenceToInlinePropertyType(
                property.valueType,
                `${context.namespaceExport}.${typeName}`,
                context.case.pascalSafe(property.name)
            );
            return {
                typeNode: unionType.typeNode,
                typeNodeWithoutUndefined: unionType.typeNodeWithoutUndefined,
                isOptional: unionType.isOptional,
                requestTypeNode: unionType.requestTypeNode,
                requestTypeNodeWithoutUndefined: unionType.requestTypeNodeWithoutUndefined,
                responseTypeNode: unionType.responseTypeNode,
                responseTypeNodeWithoutUndefined: unionType.responseTypeNodeWithoutUndefined
            };
        }
        return context.type.getReferenceToType(property.valueType);
    }

    /**
     * When resolveQueryParameterNameConflicts is enabled, computes the set of query parameter
     * wire values that collide with body property names. Only these colliding query params
     * will use their SDK override names instead of wire values.
     */
    private getCollidingQueryParamWireValues(context: FileContext): Set<string> {
        const bodyPropertyNames = new Set<string>();
        const requestBody = this.endpoint.requestBody;
        if (requestBody != null) {
            FernIr.HttpRequestBody._visit(requestBody, {
                inlinedRequestBody: (inlinedRequestBody) => {
                    for (const property of inlinedRequestBody.properties) {
                        const propKey = this.getInlinedRequestBodyPropertyKeyFromName(property.name);
                        bodyPropertyNames.add(propKey.propertyName);
                    }
                    for (const extension of inlinedRequestBody.extends) {
                        const typeDeclaration = context.type.getTypeDeclaration(extension);
                        if (typeDeclaration?.shape.type === "object") {
                            for (const property of typeDeclaration.shape.properties) {
                                const propName = this.getPropertyNameOfTypeDeclarationProperty(property);
                                bodyPropertyNames.add(propName.propertyName);
                            }
                        }
                    }
                },
                reference: () => {
                    // noop — reference body types do not produce individual property names
                },
                fileUpload: () => {
                    // noop
                },
                bytes: () => {
                    // noop
                },
                _other: () => {
                    // noop
                }
            });
        }

        const collidingWireValues = new Set<string>();
        for (const queryParameter of this.getAllQueryParameters()) {
            const normalPropertyName = this.getPropertyNameOfQueryParameter(queryParameter);
            if (bodyPropertyNames.has(normalPropertyName.propertyName)) {
                collidingWireValues.add(getWireValue(queryParameter.name));
            }
        }
        return collidingWireValues;
    }

    /**
     * Returns the overridden property name for a query parameter, using the SDK name
     * (from x-fern-parameter-name) instead of the wire value. Used only when a collision
     * with a body property is detected.
     */
    private getOverriddenPropertyNameOfQueryParameter(
        queryParameter: FernIr.QueryParameter
    ): RequestWrapperNonBodyProperty {
        const name = queryParameter.name;
        return {
            safeName: this.case.camelSafe(name),
            propertyName: this.retainOriginalCasing ? getOriginalName(name) : this.case.camelUnsafe(name)
        };
    }
}
