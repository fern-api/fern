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

import { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace InferredAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.InferredAuthScheme;
    }
}
const CLASS_NAME = "InferredAuthProvider";
export class InferredAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    private readonly authScheme: FernIr.InferredAuthScheme;
    private readonly packageId: PackageId;
    private readonly service: FernIr.HttpService;
    private readonly endpoint: FernIr.HttpEndpoint;

    constructor(init: InferredAuthProviderGenerator.Init) {
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
                nameOnDisk: `${CLASS_NAME}.ts`,
                exportDeclaration: {
                    namedExports: [CLASS_NAME]
                }
            }
        };
    }

    public getAuthProviderClassType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(CLASS_NAME);
    }

    public getOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.Options`);
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, constructorArgs);
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
            name: CLASS_NAME,
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
            if (!context.type.isLiteral(pathParameter.valueType)) {
                params.push(authPropRef(pathParameter.name.camelCase.safeName));
            }
        }

        for (const queryParameter of this.endpoint.queryParameters) {
            if (!context.type.isLiteral(queryParameter.valueType)) {
                params.push(authPropRef(queryParameter.name.name.camelCase.safeName));
            }
        }

        for (const header of [...this.service.headers, ...this.endpoint.headers]) {
            if (!context.type.isLiteral(header.valueType)) {
                params.push(authPropRef(header.name.name.camelCase.safeName));
            }
        }

        if (this.endpoint.requestBody != null) {
            switch (this.endpoint.requestBody.type) {
                case "inlinedRequestBody": {
                    params.push(
                        ts.factory.createObjectLiteralExpression(
                            this.endpoint.requestBody.properties
                                .filter((property) => !context.type.isLiteral(property.valueType))
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
                                            .filter((property) => !context.type.isLiteral(property.type))
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
        const properties = context.authProvider.getPropertiesForAuthTokenParams(
            FernIr.AuthScheme.inferred(this.authScheme)
        );
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
            name: CLASS_NAME,
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
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.AuthTokenParameters`);
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
