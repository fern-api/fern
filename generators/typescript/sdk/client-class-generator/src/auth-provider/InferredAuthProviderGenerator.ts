import { ExportedFilePath, getTextOfTsNode, maybeAddDocsStructure } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { PropertySignatureStructure, StructureKind, ts } from "ts-morph";

import { FernIr } from "@fern-fern/ir-sdk";

import { AbstractAuthProviderGenerator } from "./AbstractAuthProviderGenerator";

export declare namespace InferredAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.InferredAuthScheme;
    }
}

export class InferredAuthProviderGenerator extends AbstractAuthProviderGenerator {
    private readonly authScheme: FernIr.InferredAuthScheme;
    private readonly service: FernIr.HttpService;
    private readonly endpoint: FernIr.HttpEndpoint;

    constructor(init: InferredAuthProviderGenerator.Init) {
        super(init);

        this.authScheme = init.authScheme;
        const service = init.ir.services[init.authScheme.tokenEndpoint.endpoint.serviceId];
        if (!service) {
            throw new Error(`Service with ID ${init.authScheme.tokenEndpoint.endpoint.serviceId} not found.`);
        }
        this.service = service;

        const endpoint = service.endpoints.find(
            (endpoint) => endpoint.id === init.authScheme.tokenEndpoint.endpoint.endpointId
        );
        if (!endpoint) {
            throw new Error(
                `Endpoint with ID ${init.authScheme.tokenEndpoint.endpoint.endpointId} not found in service ${init.authScheme.tokenEndpoint.endpoint.serviceId}.`
            );
        }
        this.endpoint = endpoint;
    }

    public getFilePath(): ExportedFilePath {
        return {
            directories: [
                {
                    nameOnDisk: "auth"
                }
            ],
            file: {
                nameOnDisk: `${this.getClassName()}.ts`,
                exportDeclaration: {
                    namedExports: [this.getClassName()]
                }
            }
        };
    }

    public getAuthProviderClassType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(this.getClassName());
    }

    public getOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${this.getClassName()}.Options`);
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(
            ts.factory.createIdentifier(this.getClassName()),
            undefined,
            constructorArgs
        );
    }

    public writeToFile(context: SdkContext): void {
        this.writeOptions(context);
        this.writeClass(context);
    }

    private writeClass(context: SdkContext): void {
        context.sourceFile.addClass({
            name: this.getClassName(),
            isExported: true,
            extends: getTextOfTsNode(context.coreUtilities.auth.AbstractAuthProvider._getReferenceToType()),
            properties: [
                {
                    name: "client",
                    type: getTextOfTsNode(this.getRootClientTypeNode(context)),
                    hasQuestionToken: false,
                    isReadonly: true
                },
                {
                    name: "authTokenParameters",
                    type: getTextOfTsNode(this.getAuthTokenParametersTypeNode(context)),
                    hasQuestionToken: false,
                    isReadonly: true
                }
            ],
            methods: [],
            ctors: [
                {
                    parameters: [
                        {
                            name: "options",
                            type: getTextOfTsNode(this.getOptionsType())
                        }
                    ],
                    statements: [
                        "super();",
                        `this.client = options.client;`,
                        `this.authTokenParameters = options.authTokenParameters;`
                    ]
                }
            ]
        });
    }

    private getRootClientTypeNode(context: SdkContext): ts.Node {
        return context.sdkClientClass.getReferenceToClientClass({ isRoot: true }).getTypeNode();
    }

    private writeOptions(context: SdkContext): void {
        const properties = this.getProperties(context);
        const tokenRequestProperties: PropertySignatureStructure[] = properties.map(
            (prop): PropertySignatureStructure => {
                const propStructure: PropertySignatureStructure = {
                    kind: StructureKind.PropertySignature,
                    name: prop.name,
                    hasQuestionToken: prop.isOptional,
                    type: getTextOfTsNode(context.coreUtilities.fetcher.Supplier._getReferenceToType(prop.type))
                };
                maybeAddDocsStructure(propStructure, prop.docs);
                return propStructure;
            }
        );

        context.sourceFile.addModule({
            name: this.getClassName(),
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                {
                    kind: StructureKind.Interface,
                    name: "AuthTokenParameters",
                    properties: tokenRequestProperties,
                    isExported: true
                },
                {
                    kind: StructureKind.Interface,
                    name: "Options",
                    isExported: true,
                    properties: [
                        {
                            name: "client",
                            type: getTextOfTsNode(this.getRootClientTypeNode(context)),
                            hasQuestionToken: false
                        },
                        {
                            name: "authTokenParameters",
                            type: "AuthTokenParameters",
                            hasQuestionToken: false
                        }
                    ]
                }
            ]
        });
    }

    private getAuthTokenParametersTypeNode(context: SdkContext): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${this.getClassName()}.AuthTokenParameters`);
    }

    private getProperties(
        context: SdkContext,
        { forceCamelCase }: { forceCamelCase?: boolean } = { forceCamelCase: false }
    ): Array<{ name: string; type: ts.TypeNode; isOptional: boolean; docs?: string }> {
        const properties: Array<{
            name: string;
            type: ts.TypeNode;
            isOptional: boolean;
            docs?: string;
        }> = [];
        for (const pathParameter of this.endpoint.allPathParameters) {
            if (!this.isLiteralType(pathParameter.valueType, context)) {
                const type = context.type.getReferenceToType(pathParameter.valueType);
                properties.push({
                    name: forceCamelCase
                        ? pathParameter.name.camelCase.safeName
                        : pathParameter.name.camelCase.safeName,
                    type: type.typeNodeWithoutUndefined,
                    isOptional: type.isOptional,
                    docs: pathParameter.docs
                });
            }
        }

        for (const queryParameter of this.endpoint.queryParameters) {
            if (!this.isLiteralType(queryParameter.valueType, context)) {
                const type = context.type.getReferenceToType(queryParameter.valueType);
                properties.push({
                    name: forceCamelCase
                        ? queryParameter.name.name.camelCase.safeName
                        : queryParameter.name.name.camelCase.safeName,
                    type: queryParameter.allowMultiple
                        ? ts.factory.createUnionTypeNode([
                              type.typeNodeWithoutUndefined,
                              ts.factory.createArrayTypeNode(type.typeNodeWithoutUndefined)
                          ])
                        : type.typeNodeWithoutUndefined,
                    isOptional: type.isOptional,
                    docs: queryParameter.docs
                });
            }
        }

        for (const header of [...this.service.headers, ...this.endpoint.headers]) {
            if (!this.isLiteralType(header.valueType, context)) {
                const type = context.type.getReferenceToType(header.valueType);
                properties.push({
                    name: forceCamelCase ? header.name.name.camelCase.safeName : header.name.name.camelCase.safeName,
                    type: type.typeNodeWithoutUndefined,
                    isOptional: type.isOptional,
                    docs: header.docs
                });
            }
        }

        if (this.endpoint.requestBody != null) {
            switch (this.endpoint.requestBody.type) {
                case "inlinedRequestBody":
                    for (const property of this.endpoint.requestBody.properties) {
                        if (!this.isLiteralType(property.valueType, context)) {
                            const type = context.type.getReferenceToType(property.valueType);
                            properties.push({
                                name: forceCamelCase
                                    ? property.name.name.camelCase.safeName
                                    : property.name.name.camelCase.safeName,
                                type: type.typeNodeWithoutUndefined,
                                isOptional: type.isOptional,
                                docs: property.docs
                            });
                        }
                    }
                    break;
                case "reference":
                    const resolvedRequestBodyType = context.type.resolveTypeReference(
                        this.endpoint.requestBody.requestBodyType
                    );
                    if (resolvedRequestBodyType.type === "named") {
                        const typeDeclaration = context.type.getTypeDeclaration(resolvedRequestBodyType.name);
                        if (typeDeclaration.shape.type === "object") {
                            const generatedType = context.type.getGeneratedType(resolvedRequestBodyType.name);
                            if (generatedType.type === "object") {
                                const allProperties = generatedType.getAllPropertiesIncludingExtensions(context, {
                                    forceCamelCase: true
                                });
                                for (const property of allProperties) {
                                    const type = context.type.getReferenceToType(property.type);
                                    properties.push({
                                        name: property.propertyKey,
                                        type: type.typeNodeWithoutUndefined,
                                        isOptional: type.isOptional,
                                        docs: undefined
                                    });
                                }
                            }
                        }
                    } else {
                        // For non-object types, add as a single "body" property
                        const type = context.type.getReferenceToType(this.endpoint.requestBody.requestBodyType);
                        properties.push({
                            name: "body",
                            type: type.typeNodeWithoutUndefined,
                            isOptional: type.isOptional,
                            docs: this.endpoint.requestBody.docs
                        });
                    }
                    break;
            }
        }

        return properties;
    }

    private isLiteralType(typeReference: FernIr.TypeReference, context: SdkContext): boolean {
        const resolvedType = context.type.resolveTypeReference(typeReference);
        return resolvedType.type === "container" && resolvedType.container.type === "literal";
    }

    private getClassName(): string {
        return "InferredAuthProvider";
    }
}
