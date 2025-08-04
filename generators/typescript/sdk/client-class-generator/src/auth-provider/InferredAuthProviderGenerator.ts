import { ExportedFilePath, getTextOfTsNode, maybeAddDocsStructure, PackageId } from "@fern-typescript/commons";
import { GeneratedRequestWrapper, SdkContext } from "@fern-typescript/contexts";
import {
    MethodDeclarationStructure,
    PropertySignatureStructure,
    Scope,
    StatementStructures,
    StructureKind,
    ts,
    WriterFunction
} from "ts-morph";

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
    private readonly packageId: PackageId;
    private readonly service: FernIr.HttpService;
    private readonly endpoint: FernIr.HttpEndpoint;

    constructor(init: InferredAuthProviderGenerator.Init) {
        super(init);

        this.authScheme = init.authScheme;
        this.packageId = init.authScheme.tokenEndpoint.endpoint.subpackageId
            ? {
                  isRoot: false,
                  subpackageId: init.authScheme.tokenEndpoint.endpoint.subpackageId
              }
            : { isRoot: true };

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
        const requestWrapper = context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpoint.name);
        this.writeOptions(context);
        this.writeClass({ context, requestWrapper });
    }

    private writeClass({
        context,
        requestWrapper
    }: {
        context: SdkContext;
        requestWrapper: GeneratedRequestWrapper;
    }): void {
        context.sourceFile.addClass({
            name: this.getClassName(),
            isExported: true,
            extends: getTextOfTsNode(context.coreUtilities.auth.AbstractAuthProvider._getReferenceToType()),
            properties: [
                {
                    name: "client",
                    type: getTextOfTsNode(this.getRootClientTypeNode(context)),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                },
                {
                    name: "authTokenParameters",
                    type: getTextOfTsNode(this.getAuthTokenParametersTypeNode(context)),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                },
                ...(this.authScheme.tokenEndpoint.expiryProperty
                    ? [
                          {
                              name: "expiresAt",
                              type: getTextOfTsNode(
                                  ts.factory.createUnionTypeNode([
                                      ts.factory.createTypeReferenceNode(
                                          ts.factory.createIdentifier("Date"),
                                          undefined
                                      ),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                  ])
                              ),
                              hasQuestionToken: false,
                              scope: Scope.Private
                          },
                          {
                              name: "authRequestPromise",
                              type: getTextOfTsNode(
                                  ts.factory.createUnionTypeNode([
                                      ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                                          context.coreUtilities.auth.AuthRequest._getReferenceToType()
                                      ]),
                                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                                  ])
                              ),
                              hasQuestionToken: false,
                              scope: Scope.Private
                          }
                      ]
                    : [])
            ],
            methods: [
                ...(this.authScheme.tokenEndpoint.expiryProperty
                    ? ([
                          {
                              kind: StructureKind.Method,
                              scope: Scope.Private,
                              name: "getCachedAuthRequest",
                              isAsync: true,
                              returnType: getTextOfTsNode(
                                  ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                                      context.coreUtilities.auth.AuthRequest._getReferenceToType()
                                  ])
                              ),
                              statements: `
        if (this.expiresAt && this.expiresAt <= new Date()) {
            // If the token has expired, reset the auth request promise
            this.authRequestPromise = undefined;
        }

        if (!this.authRequestPromise) {
            this.authRequestPromise = this.getAuthRequestFromTokenEndpoint();
        }

        return this.authRequestPromise;
        `
                          }
                      ] as MethodDeclarationStructure[])
                    : ([] as MethodDeclarationStructure[])),
                {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    name: "getAuthRequest",
                    isAsync: true,
                    returnType: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                            context.coreUtilities.auth.AuthRequest._getReferenceToType()
                        ])
                    ),
                    statements: this.authScheme.tokenEndpoint.expiryProperty
                        ? `
        const authRequest = await this.getCachedAuthRequest();
        return authRequest;
        `
                        : `
        return this.getAuthRequestFromTokenEndpoint();
        `
                },
                this.generateGetAuthRequestFromTokenEndpointMethod({ context, requestWrapper })
            ],
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

    private generateGetAuthRequestFromTokenEndpointMethod({
        context,
        requestWrapper
    }: {
        context: SdkContext;
        requestWrapper: GeneratedRequestWrapper;
    }): MethodDeclarationStructure {
        const statements: (string | WriterFunction | StatementStructures)[] = [
            // invoke the token endpoint to get the auth token
            getTextOfTsNode(
                ts.factory.createVariableStatement(
                    undefined,
                    ts.factory.createVariableDeclarationList(
                        [
                            ts.factory.createVariableDeclaration(
                                ts.factory.createIdentifier("response"),
                                undefined,
                                undefined,
                                ts.factory.createAwaitExpression(
                                    ts.factory.createCallExpression(
                                        this.getAuthTokenEndpointReferenceFromRoot(context),
                                        undefined,
                                        this.authTokenParametersToAuthTokenRequest({ context, requestWrapper })
                                    )
                                )
                            )
                        ],
                        ts.NodeFlags.Const
                    )
                )
            ),
            // set expiry if present
            ...(this.authScheme.tokenEndpoint.expiryProperty
                ? [
                      getTextOfTsNode(
                          ts.factory.createExpressionStatement(
                              ts.factory.createBinaryExpression(
                                  ts.factory.createPropertyAccessExpression(
                                      ts.factory.createThis(),
                                      ts.factory.createIdentifier("expiresAt")
                                  ),
                                  ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                  ts.factory.createNewExpression(ts.factory.createIdentifier("Date"), undefined, [
                                      ts.factory.createBinaryExpression(
                                          ts.factory.createCallExpression(
                                              ts.factory.createPropertyAccessExpression(
                                                  ts.factory.createIdentifier("Date"),
                                                  ts.factory.createIdentifier("now")
                                              ),
                                              undefined,
                                              []
                                          ),
                                          ts.factory.createToken(ts.SyntaxKind.PlusToken),
                                          ts.factory.createBinaryExpression(
                                              getDeepProperty({
                                                  variable: "response",
                                                  property: this.authScheme.tokenEndpoint.expiryProperty,
                                                  context
                                              }),
                                              ts.factory.createToken(ts.SyntaxKind.AsteriskToken),
                                              ts.factory.createNumericLiteral("1000")
                                          )
                                      )
                                  ])
                              )
                          )
                      )
                  ]
                : []),
            // return the auth request
            getTextOfTsNode(
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("headers"),
                                ts.factory.createObjectLiteralExpression(
                                    this.authScheme.tokenEndpoint.authenticatedRequestHeaders.map((header) => {
                                        return ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier(header.headerName),
                                            header.valuePrefix
                                                ? ts.factory.createTemplateExpression(
                                                      ts.factory.createTemplateHead(
                                                          header.valuePrefix,
                                                          header.valuePrefix
                                                      ),
                                                      [
                                                          ts.factory.createTemplateSpan(
                                                              getDeepProperty({
                                                                  variable: "response",
                                                                  property: header.responseProperty,
                                                                  context
                                                              }),
                                                              ts.factory.createTemplateTail("", "")
                                                          )
                                                      ]
                                                  )
                                                : getDeepProperty({
                                                      variable: "response",
                                                      property: header.responseProperty,
                                                      context
                                                  })
                                        );
                                    }),
                                    true
                                )
                            )
                        ],
                        true
                    )
                )
            )
        ];

        const method: MethodDeclarationStructure = {
            kind: StructureKind.Method,
            name: "getAuthRequestFromTokenEndpoint",
            isAsync: true,
            scope: Scope.Private,
            returnType: getTextOfTsNode(
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                    context.coreUtilities.auth.AuthRequest._getReferenceToType()
                ])
            ),
            statements
        };
        maybeAddDocsStructure(method, this.authScheme.docs);
        return method;
    }

    private getAuthTokenEndpointReferenceFromRoot(context: SdkContext): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            context.sdkClientClass.getGeneratedSdkClientClass(this.packageId).accessFromRootClient({
                referenceToRootClient: ts.factory.createIdentifier("this.client")
            }),
            ts.factory.createIdentifier(this.endpoint.name.camelCase.unsafeName)
        );
    }

    private authTokenParametersToAuthTokenRequest({
        context,
        requestWrapper
    }: {
        context: SdkContext;
        requestWrapper: GeneratedRequestWrapper;
    }): ts.Expression[] {
        const params: ts.Expression[] = [];
        const authPropRef = (name: string): ts.Expression => {
            return context.coreUtilities.fetcher.Supplier.get(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("this.authTokenParameters"),
                    ts.factory.createIdentifier(name)
                )
            );
        };
        for (const pathParameter of this.endpoint.allPathParameters) {
            if (!this.isLiteralType(pathParameter.valueType, context)) {
                params.push(authPropRef(pathParameter.name.camelCase.safeName));
            }
        }

        for (const queryParameter of this.endpoint.queryParameters) {
            if (!this.isLiteralType(queryParameter.valueType, context)) {
                params.push(authPropRef(queryParameter.name.name.camelCase.safeName));
            }
        }

        for (const header of [...this.service.headers, ...this.endpoint.headers]) {
            if (!this.isLiteralType(header.valueType, context)) {
                params.push(authPropRef(header.name.name.camelCase.safeName));
            }
        }

        if (this.endpoint.requestBody != null) {
            switch (this.endpoint.requestBody.type) {
                case "inlinedRequestBody": {
                    params.push(
                        ts.factory.createObjectLiteralExpression(
                            this.endpoint.requestBody.properties
                                .filter((property) => !this.isLiteralType(property.valueType, context))
                                .map((property) => {
                                    return ts.factory.createPropertyAssignment(
                                        requestWrapper.getInlinedRequestBodyPropertyKey(property),
                                        authPropRef(property.name.name.camelCase.safeName)
                                    );
                                }),
                            true
                        )
                    );
                    break;
                }
                case "reference": {
                    const resolvedRequestBodyType = context.type.resolveTypeReference(
                        this.endpoint.requestBody.requestBodyType
                    );
                    if (resolvedRequestBodyType.type === "named") {
                        const typeDeclaration = context.type.getTypeDeclaration(resolvedRequestBodyType.name);
                        if (typeDeclaration.shape.type === "object") {
                            const generatedType = context.type.getGeneratedType(resolvedRequestBodyType.name);
                            if (generatedType.type === "object") {
                                const allPropertiesCamelCase = generatedType.getAllPropertiesIncludingExtensions(
                                    context,
                                    {
                                        forceCamelCase: true
                                    }
                                );
                                const allProperties = generatedType.getAllPropertiesIncludingExtensions(context);

                                // Join the two arrays by wireKey
                                const joinedProperties: {
                                    name: string;
                                    camelCaseName: string;
                                    type: FernIr.TypeReference;
                                }[] = allProperties.map((property) => {
                                    const camelCaseProperty = allPropertiesCamelCase.find(
                                        (p) => p.wireKey === property.wireKey
                                    );
                                    if (!camelCaseProperty) {
                                        throw new Error(
                                            `Property ${property.wireKey} not found in camelCase properties.`
                                        );
                                    }
                                    return {
                                        name: property.propertyKey,
                                        camelCaseName: camelCaseProperty.propertyKey,
                                        type: property.type
                                    };
                                });

                                params.push(
                                    ts.factory.createObjectLiteralExpression(
                                        joinedProperties
                                            .filter((property) => !this.isLiteralType(property.type, context))
                                            .map((property) => {
                                                return ts.factory.createPropertyAssignment(
                                                    property.name,
                                                    authPropRef(property.camelCaseName)
                                                );
                                            }),
                                        true
                                    )
                                );
                            }
                        }
                    } else {
                        params.push(authPropRef("body"));
                    }
                    break;
                }
            }
        }

        return params;
    }

    private getRootClientTypeNode(context: SdkContext): ts.Node {
        return context.sdkClientClass.getReferenceToClientClass({ isRoot: true }).getTypeNode();
    }

    private writeOptions(context: SdkContext): void {
        const properties = this.getPropertiesForAuthTokenParameters(context);
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

    private getPropertiesForAuthTokenParameters(
        context: SdkContext
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
                    name: pathParameter.name.camelCase.safeName,
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
                    name: queryParameter.name.name.camelCase.safeName,
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
                    name: header.name.name.camelCase.safeName,
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
                                name: property.name.name.camelCase.safeName,
                                type: type.typeNodeWithoutUndefined,
                                isOptional: type.isOptional,
                                docs: property.docs
                            });
                        }
                    }
                    break;
                case "reference": {
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
                                    if (!this.isLiteralType(property.type, context)) {
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

function getDeepProperty({
    variable,
    property,
    context
}: {
    variable: string;
    property: FernIr.ResponseProperty;
    context: SdkContext;
}): ts.Expression {
    return ts.factory.createIdentifier(
        variable +
            "." +
            [...(property.propertyPath ?? []), property.property.name.name]
                .map((name) => getName({ name, context }))
                .join(".")
    );
}

function getName({ name, context }: { name: FernIr.Name; context: SdkContext }): string {
    return context.retainOriginalCasing || !context.includeSerdeLayer ? name.originalName : name.camelCase.safeName;
}
