import { FernIr } from "@fern-fern/ir-sdk";
import {
    ExportedFilePath,
    getPropertyKey,
    getTextOfTsNode,
    maybeAddDocsStructure,
    PackageId,
    toCamelCase
} from "@fern-typescript/commons";
import { GeneratedRequestWrapper, SdkContext } from "@fern-typescript/contexts";
import {
    MethodDeclarationStructure,
    OptionalKind,
    PropertySignatureStructure,
    Scope,
    StatementStructures,
    StructureKind,
    ts,
    WriterFunction
} from "ts-morph";

import { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace InferredAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.InferredAuthScheme;
        shouldUseWrapper: boolean;
    }
}
const CLASS_NAME = "InferredAuthProvider";
const OPTIONS_TYPE_NAME = "Options";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";
const BUFFER_IN_MINUTES_VAR_NAME = "BUFFER_IN_MINUTES";
const GET_EXPIRES_AT_FN_NAME = "getExpiresAt";
const GET_AUTH_REQUEST_METHOD_NAME = "getAuthRequest";
const GET_AUTH_REQUEST_FROM_TOKEN_ENDPOINT_METHOD_NAME = "getAuthRequestFromTokenEndpoint";
const GET_CACHED_AUTH_REQUEST_METHOD_NAME = "getCachedAuthRequest";
const OPTIONS_PARAM_NAME = "options";
const CLIENT_FIELD_NAME = "client";
const OPTIONS_FIELD_NAME = "options";
const EXPIRES_AT_FIELD_NAME = "expiresAt";
const AUTH_REQUEST_PROMISE_FIELD_NAME = "authRequestPromise";
const RESPONSE_VAR_NAME = "response";
const EXPIRES_IN_SECONDS_PARAM_NAME = "expiresInSeconds";

export class InferredAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly OPTIONS_TYPE_NAME = OPTIONS_TYPE_NAME;
    public static readonly GET_AUTH_REQUEST_METHOD_NAME = GET_AUTH_REQUEST_METHOD_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly authScheme: FernIr.InferredAuthScheme;
    private readonly packageId: PackageId;
    private readonly endpoint: FernIr.HttpEndpoint;
    private readonly shouldUseWrapper: boolean;
    private readonly keepIfWrapper: (str: string) => string;

    constructor(init: InferredAuthProviderGenerator.Init) {
        this.ir = init.ir;
        this.authScheme = init.authScheme;
        this.shouldUseWrapper = init.shouldUseWrapper ?? false;
        this.keepIfWrapper = this.shouldUseWrapper ? (str: string) => str : () => "";
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

    /**
     * Gets the wrapper property name for this Inferred auth scheme.
     * This is used to namespace Inferred auth options when multiple auth schemes are present.
     */
    public getWrapperPropertyName(): string {
        // Find the auth scheme key in the IR
        const authScheme = this.ir.auth.schemes.find(
            (scheme) => scheme.type === "inferred" && scheme === this.authScheme
        );
        if (authScheme == null) {
            throw new Error("Failed to find inferred auth scheme in IR");
        }
        return toCamelCase(authScheme.key);
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

    public getAuthOptionsType(): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(`${CLASS_NAME}.${AUTH_OPTIONS_TYPE_NAME}`);
    }

    public getAuthOptionsProperties(context: SdkContext): OptionalKind<PropertySignatureStructure>[] | undefined {
        const authTokenParams = context.authProvider.getPropertiesForAuthTokenParams(
            FernIr.AuthScheme.inferred(this.authScheme)
        );
        const properties: OptionalKind<PropertySignatureStructure>[] = [];
        for (const param of authTokenParams) {
            properties.push({
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(param.name),
                type: getTextOfTsNode(context.coreUtilities.fetcher.Supplier._getReferenceToType(param.type)),
                hasQuestionToken: param.isOptional,
                docs: param.docs
            });
        }
        return properties.length > 0 ? properties : undefined;
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(CLASS_NAME), "createInstance"),
            undefined,
            constructorArgs
        );
    }

    public writeToFile(context: SdkContext): void {
        const requestWrapper = context.requestWrapper.getGeneratedRequestWrapper(this.packageId, this.endpoint.name);
        this.writeConstants(context);
        this.writeClass({ context, requestWrapper });
        this.writeOptions(context);
    }

    private writeConstants(context: SdkContext): void {
        const wrapperPropertyName = this.getWrapperPropertyName();

        const constants: string[] = [];

        constants.push(this.keepIfWrapper(`const WRAPPER_PROPERTY = "${wrapperPropertyName}" as const;`));

        if (this.authScheme.tokenEndpoint.expiryProperty) {
            constants.push(`const ${BUFFER_IN_MINUTES_VAR_NAME} = 2 as const;`);
        }

        for (const constant of constants.filter((c) => c !== "")) {
            context.sourceFile.addStatements(constant);
        }
        if (constants.filter((c) => c !== "").length > 0) {
            context.sourceFile.addStatements(""); // blank line
        }
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
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties: [
                {
                    name: CLIENT_FIELD_NAME,
                    type: getTextOfTsNode(this.getAuthClientTypeNode(context)),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                },
                {
                    name: OPTIONS_FIELD_NAME,
                    type: getTextOfTsNode(this.getOptionsType()),
                    hasQuestionToken: false,
                    isReadonly: true,
                    scope: Scope.Private
                },
                ...(this.authScheme.tokenEndpoint.expiryProperty
                    ? [
                          {
                              name: EXPIRES_AT_FIELD_NAME,
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
                              name: AUTH_REQUEST_PROMISE_FIELD_NAME,
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
                {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    isStatic: true,
                    name: "canCreate",
                    parameters: [
                        {
                            name: "options",
                            type: `Partial<${CLASS_NAME}.${OPTIONS_TYPE_NAME}>`
                        }
                    ],
                    returnType: "boolean",
                    statements: this.generateCanCreateStatements(context)
                },
                ...(this.authScheme.tokenEndpoint.expiryProperty
                    ? ([
                          {
                              kind: StructureKind.Method,
                              scope: Scope.Private,
                              name: GET_CACHED_AUTH_REQUEST_METHOD_NAME,
                              isAsync: true,
                              returnType: getTextOfTsNode(
                                  ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                                      context.coreUtilities.auth.AuthRequest._getReferenceToType()
                                  ])
                              ),
                              statements: `
        if (this.${EXPIRES_AT_FIELD_NAME} && this.${EXPIRES_AT_FIELD_NAME} <= new Date()) {
            // If the token has expired, reset the auth request promise
            this.${AUTH_REQUEST_PROMISE_FIELD_NAME} = undefined;
        }

        if (!this.${AUTH_REQUEST_PROMISE_FIELD_NAME}) {
            this.${AUTH_REQUEST_PROMISE_FIELD_NAME} = this.${GET_AUTH_REQUEST_FROM_TOKEN_ENDPOINT_METHOD_NAME}();
        }

        return this.${AUTH_REQUEST_PROMISE_FIELD_NAME};
        `
                          }
                      ] as MethodDeclarationStructure[])
                    : ([] as MethodDeclarationStructure[])),
                {
                    kind: StructureKind.Method,
                    scope: Scope.Public,
                    name: GET_AUTH_REQUEST_METHOD_NAME,
                    isAsync: true,
                    parameters: [
                        {
                            name: "{ endpointMetadata }",
                            type: getTextOfTsNode(
                                ts.factory.createTypeLiteralNode([
                                    ts.factory.createPropertySignature(
                                        undefined,
                                        "endpointMetadata",
                                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                        context.coreUtilities.fetcher.EndpointMetadata._getReferenceToType()
                                    )
                                ])
                            ),
                            initializer: "{}"
                        }
                    ],
                    returnType: getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                            context.coreUtilities.auth.AuthRequest._getReferenceToType()
                        ])
                    ),
                    statements: this.authScheme.tokenEndpoint.expiryProperty
                        ? `
        try {
            const authRequest = await this.${GET_CACHED_AUTH_REQUEST_METHOD_NAME}();
            return authRequest;
        } catch(e) {
            this.${AUTH_REQUEST_PROMISE_FIELD_NAME} = undefined;${
                this.authScheme.tokenEndpoint.expiryProperty ? `\nthis.${EXPIRES_AT_FIELD_NAME} = undefined;` : ``
            }
            throw e;
        }
        `
                        : `
        return await this.${GET_AUTH_REQUEST_FROM_TOKEN_ENDPOINT_METHOD_NAME}();
        `
                },
                this.generateGetAuthRequestFromTokenEndpointMethod({ context, requestWrapper })
            ],
            ctors: [
                {
                    parameters: [
                        {
                            name: OPTIONS_PARAM_NAME,
                            type: getTextOfTsNode(this.getOptionsType())
                        }
                    ],
                    statements: [
                        `this.${OPTIONS_FIELD_NAME} = ${OPTIONS_PARAM_NAME};`,
                        `this.${CLIENT_FIELD_NAME} = new ${getTextOfTsNode(this.getAuthClientTypeNode(context))}(${OPTIONS_PARAM_NAME});`
                    ]
                }
            ]
        });

        if (this.authScheme.tokenEndpoint.expiryProperty) {
            context.sourceFile.addFunction({
                kind: StructureKind.Function,
                name: GET_EXPIRES_AT_FN_NAME,
                parameters: [
                    {
                        name: EXPIRES_IN_SECONDS_PARAM_NAME,
                        type: getTextOfTsNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword))
                    }
                ],
                returnType: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Date"), [])
                ),
                statements: [
                    `return new Date(new Date().getTime() + ${EXPIRES_IN_SECONDS_PARAM_NAME} * 1000 - ${BUFFER_IN_MINUTES_VAR_NAME} * 60 * 1000)`
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
                                ts.factory.createIdentifier(RESPONSE_VAR_NAME),
                                undefined,
                                undefined,
                                ts.factory.createAwaitExpression(
                                    ts.factory.createCallExpression(
                                        this.getAuthTokenEndpointReferenceFromRoot(),
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
                                      ts.factory.createIdentifier(EXPIRES_AT_FIELD_NAME)
                                  ),
                                  ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                                  ts.factory.createCallExpression(
                                      ts.factory.createIdentifier(GET_EXPIRES_AT_FN_NAME),
                                      undefined,
                                      [
                                          context.type.generateGetterForResponseProperty({
                                              variable: RESPONSE_VAR_NAME,
                                              property: this.authScheme.tokenEndpoint.expiryProperty
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
                                                              context.type.generateGetterForResponseProperty({
                                                                  variable: RESPONSE_VAR_NAME,
                                                                  property: header.responseProperty
                                                              }),
                                                              ts.factory.createTemplateTail("", "")
                                                          )
                                                      ]
                                                  )
                                                : context.type.generateGetterForResponseProperty({
                                                      variable: RESPONSE_VAR_NAME,
                                                      property: header.responseProperty
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
            name: GET_AUTH_REQUEST_FROM_TOKEN_ENDPOINT_METHOD_NAME,
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

    private getAuthTokenEndpointReferenceFromRoot(): ts.Expression {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), CLIENT_FIELD_NAME),
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
                                    ts.factory.createPropertyAccessExpression(
                                        ts.factory.createThis(),
                                        OPTIONS_FIELD_NAME
                                    ),
                                    ts.factory.createIdentifier(p.safeName)
                                )
                            )
                        )
                    ),
                true
            )
        ];
    }

    private generateCanCreateStatements(context: SdkContext): string {
        const authTokenParams = context.authProvider.getPropertiesForAuthTokenParams(
            FernIr.AuthScheme.inferred(this.authScheme)
        );

        // For inferred auth, we check if all the required auth token params are present
        // The wrapper access is only used if shouldUseWrapper is true
        const wrapperAccess = this.keepIfWrapper("[WRAPPER_PROPERTY]?.");

        const checks = authTokenParams
            .filter((param) => !param.isOptional)
            .map((param) => `options?.${wrapperAccess}${getPropertyKey(param.name)} != null`)
            .join(" && ");

        // If there are no required params, always return true
        if (checks.length === 0) {
            return "return true;";
        }

        return `return ${checks};`;
    }

    private getAuthClientTypeNode(context: SdkContext): ts.TypeNode {
        return context.sdkClientClass.getReferenceToClientClass(this.packageId).getTypeNode();
    }

    private writeOptions(context: SdkContext): void {
        // Import BaseClientOptions for Options to extend
        // InferredAuthProvider.Options needs to extend BaseClientOptions because it creates an AuthClient
        // which requires the full BaseClientOptions (environment, baseUrl, etc.)
        context.sourceFile.addImportDeclaration({
            moduleSpecifier: "../BaseClient",
            namedImports: ["BaseClientOptions"],
            isTypeOnly: true
        });

        const authOptionsProperties = this.getAuthOptionsProperties(context) ?? [];
        const authSchemeKey =
            this.ir.auth.schemes.find((scheme) => scheme.type === "inferred" && scheme === this.authScheme)?.key ??
            "InferredAuth";

        const statements: (string | WriterFunction | StatementStructures)[] = [
            `export const AUTH_SCHEME = "${authSchemeKey}" as const;`,
            `export const AUTH_CONFIG_ERROR_MESSAGE: string = "Please provide the required authentication credentials when initializing the client" as const;`
        ];

        // Generate AuthOptions type based on shouldUseWrapper
        if (authOptionsProperties.length > 0) {
            if (this.shouldUseWrapper) {
                // Wrapped version: { [WRAPPER_PROPERTY]: { prop1: type1, prop2: type2 } }
                const propertyDefs = authOptionsProperties
                    .map((p) => `${p.name}${p.hasQuestionToken ? "?" : ""}: ${p.type}`)
                    .join("; ");

                statements.push({
                    kind: StructureKind.TypeAlias,
                    name: AUTH_OPTIONS_TYPE_NAME,
                    isExported: true,
                    type: `{\n        [WRAPPER_PROPERTY]: { ${propertyDefs} };\n    }`
                });
            } else {
                // Inlined version: interface with properties directly
                statements.push({
                    kind: StructureKind.Interface,
                    name: AUTH_OPTIONS_TYPE_NAME,
                    isExported: true,
                    properties: authOptionsProperties
                });
            }
        }

        // Options = BaseClientOptions (no AuthOptions since all params come from AuthOptions)
        statements.push({
            kind: StructureKind.TypeAlias,
            name: OPTIONS_TYPE_NAME,
            isExported: true,
            type: "BaseClientOptions"
        });

        // Add createInstance factory function
        statements.push({
            kind: StructureKind.Function,
            name: "createInstance",
            isExported: true,
            parameters: [{ name: "options", type: OPTIONS_TYPE_NAME }],
            returnType: getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType()),
            statements: `return new ${CLASS_NAME}(options);`
        });

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements
        });
    }
}
