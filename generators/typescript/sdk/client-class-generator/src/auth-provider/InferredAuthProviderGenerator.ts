import {
    ExportedFilePath,
    getPropertyKey,
    getTextOfTsNode,
    maybeAddDocsStructure,
    PackageId
} from "@fern-typescript/commons";
import { GeneratedRequestWrapper, SdkContext } from "@fern-typescript/contexts";
import {
    MethodDeclarationStructure,
    PropertySignatureStructure,
    Scope,
    StatementStructures,
    StructureKind,
    ts,
    VariableDeclarationKind,
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
const AUTH_TOKEN_PARAMS_OPTION_NAME = "authTokenParameters";
const AUTH_TOKEN_PARAMS_FIELD_NAME = "authTokenParameters";
const AUTH_TOKEN_TYPE_NAME = "AuthTokenParameters";
const OPTIONS_TYPE_NAME = "Options";
const BUFFER_IN_MINUTES_VAR_NAME = "BUFFER_IN_MINUTES";
const GET_EXPIRES_AT_FN_NAME = "getExpiresAt";
export class InferredAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    private readonly authScheme: FernIr.InferredAuthScheme;
    private readonly packageId: PackageId;
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
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${OPTIONS_TYPE_NAME}`);
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
        if (this.authScheme.tokenEndpoint.expiryProperty) {
            context.sourceFile.addVariableStatement({
                kind: StructureKind.VariableStatement,
                declarationKind: VariableDeclarationKind.Const,
                declarations: [
                    {
                        name: BUFFER_IN_MINUTES_VAR_NAME,
                        kind: StructureKind.VariableDeclaration,
                        initializer: "2"
                    }
                ]
            });
        }
        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: "client",
                    type: getTextOfTsNode(this.getRootClientTypeNode(context)),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                },
                {
                    name: AUTH_TOKEN_PARAMS_FIELD_NAME,
                    type: getTextOfTsNode(this.getAuthTokenParametersTypeNode()),
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
        try {
            const authRequest = await this.getCachedAuthRequest();
            return authRequest;
        } catch(e) {
            this.authRequestPromise = undefined;${
                this.authScheme.tokenEndpoint.expiryProperty ? `\nthis.expiresAt = undefined;` : ``
            }
            throw e;
        }
        `
                        : `
        return await this.getAuthRequestFromTokenEndpoint();
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
                        `this.client = options.client;`,
                        `this.${AUTH_TOKEN_PARAMS_FIELD_NAME} = options.${AUTH_TOKEN_PARAMS_OPTION_NAME};`
                    ]
                }
            ]
        });

        if (this.authScheme.tokenEndpoint.expiryProperty) {
            const expiresInSecondsParamName = "expiresInSeconds";
            context.sourceFile.addFunction({
                kind: StructureKind.Function,
                name: GET_EXPIRES_AT_FN_NAME,
                parameters: [
                    {
                        name: expiresInSecondsParamName,
                        type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword))
                    }
                ],
                returnType: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Date"), [])
                ),
                statements: [
                    `return new Date(new Date().getTime() + ${expiresInSecondsParamName} * 1000 - ${BUFFER_IN_MINUTES_VAR_NAME} * 60 * 1000)`
                ]
            });
        }
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
                                  ts.factory.createCallExpression(
                                      ts.factory.createIdentifier(GET_EXPIRES_AT_FN_NAME),
                                      undefined,
                                      [
                                          getDeepProperty({
                                              variable: "response",
                                              property: this.authScheme.tokenEndpoint.expiryProperty,
                                              context
                                          })
                                      ]
                                  )
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
        return [
            ts.factory.createObjectLiteralExpression(
                requestWrapper
                    .getRequestProperties(context)
                    .map((p) =>
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier(p.name),
                            context.coreUtilities.fetcher.Supplier.get(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("this.authTokenParameters"),
                                    ts.factory.createIdentifier(p.safeName)
                                )
                            )
                        )
                    ),
                true
            )
        ];
    }

    private getRootClientTypeNode(context: SdkContext): ts.Node {
        return context.sdkClientClass.getReferenceToClientClass({ isRoot: true }).getTypeNode();
    }

    private writeOptions(context: SdkContext): void {
        const properties = context.authProvider.getPropertiesForAuthTokenParams(
            FernIr.AuthScheme.inferred(this.authScheme)
        );
        const tokenRequestProperties: PropertySignatureStructure[] = properties.map((prop) => ({
            kind: StructureKind.PropertySignature,
            name: getPropertyKey(prop.name),
            hasQuestionToken: prop.isOptional,
            type: getTextOfTsNode(context.coreUtilities.fetcher.Supplier._getReferenceToType(prop.type)),
            docs: prop.docs
        }));

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                {
                    kind: StructureKind.Interface,
                    name: AUTH_TOKEN_TYPE_NAME,
                    properties: tokenRequestProperties,
                    isExported: true
                },
                {
                    kind: StructureKind.Interface,
                    name: OPTIONS_TYPE_NAME,
                    isExported: true,
                    properties: [
                        {
                            name: "client",
                            type: getTextOfTsNode(this.getRootClientTypeNode(context)),
                            hasQuestionToken: false
                        },
                        {
                            name: AUTH_TOKEN_PARAMS_OPTION_NAME,
                            type: AUTH_TOKEN_TYPE_NAME,
                            hasQuestionToken: false
                        }
                    ]
                }
            ]
        });
    }

    private getAuthTokenParametersTypeNode(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${AUTH_TOKEN_TYPE_NAME}`);
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
