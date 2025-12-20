import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getPropertyKey, getTextOfTsNode, toCamelCase } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import { type OptionalKind, type PropertySignatureStructure, Scope, StructureKind, ts } from "ts-morph";

import type { AuthProviderGenerator } from "./AuthProviderGenerator";

export declare namespace OAuthAuthProviderGenerator {
    export interface Init {
        ir: FernIr.IntermediateRepresentation;
        authScheme: FernIr.OAuthScheme;
        neverThrowErrors: boolean;
        includeSerdeLayer: boolean;
    }
}

const CLASS_NAME = "OAuthAuthProvider";
const TOKEN_OVERRIDE_CLASS_NAME = "OAuthTokenOverrideAuthProvider";
const OPTIONS_TYPE_NAME = "Options";
const AUTH_OPTIONS_TYPE_NAME = "AuthOptions";
const OPTIONS_PARAM_NAME = "options";
const CLIENT_ID_VAR_NAME = "clientId";
const CLIENT_SECRET_VAR_NAME = "clientSecret";
const ENDPOINT_METADATA_ARG_NAME = "{ endpointMetadata }";
const REFRESH_METHOD_NAME = "refresh";
const GET_TOKEN_INTERNAL_METHOD_NAME = "_getToken";
const OPTIONS_FIELD_NAME = "options";
const AUTH_CLIENT_FIELD_NAME = "authClient";
const ACCESS_TOKEN_FIELD_NAME = "accessToken";
const EXPIRES_AT_FIELD_NAME = "expiresAt";
const REFRESH_PROMISE_FIELD_NAME = "refreshPromise";
const DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME = "token";
const DEFAULT_EXPIRES_IN_SECONDS = 3600; // 1 hour

export class OAuthAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
    public static readonly OPTIONS_TYPE_NAME = OPTIONS_TYPE_NAME;
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly authScheme: FernIr.OAuthScheme;
    private readonly neverThrowErrors: boolean;
    private readonly includeSerdeLayer: boolean;

    constructor(init: OAuthAuthProviderGenerator.Init) {
        this.ir = init.ir;
        this.authScheme = init.authScheme;
        this.neverThrowErrors = init.neverThrowErrors;
        this.includeSerdeLayer = init.includeSerdeLayer;
    }

    /**
     * Gets the wrapper property name for this OAuth auth scheme.
     * This is used to namespace OAuth options when multiple auth schemes are present.
     * e.g., "OAuth" -> "oauth", "magical_auth" -> "magicalAuth"
     */
    public getWrapperPropertyName(): string {
        return toCamelCase(this.authScheme.key);
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
        const oauthConfig = this.authScheme.configuration;
        if (oauthConfig.type !== "clientCredentials") {
            return undefined;
        }

        const requestProperties = oauthConfig.tokenEndpoint.requestProperties;
        const clientIdType = context.type.getReferenceToType(requestProperties.clientId.property.valueType).typeNode;
        const clientSecretType = context.type.getReferenceToType(
            requestProperties.clientSecret.property.valueType
        ).typeNode;

        const clientIdIsOptional = oauthConfig.clientIdEnvVar != null;
        const clientSecretIsOptional = oauthConfig.clientSecretEnvVar != null;

        const supplierType = context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType;

        // When there's an env var fallback, use Supplier<T> | undefined because the supplier itself can be undefined
        // When there's no env var fallback, use Supplier<T> directly.
        const clientIdSupplier = supplierType(clientIdType);
        const clientSecretSupplier = supplierType(clientSecretType);

        // For env var fallback: prop?: Supplier<T> | undefined
        const clientIdPropertyType = clientIdIsOptional
            ? ts.factory.createUnionTypeNode([
                  clientIdSupplier,
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : clientIdSupplier;

        const clientSecretPropertyType = clientSecretIsOptional
            ? ts.factory.createUnionTypeNode([
                  clientSecretSupplier,
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
              ])
            : clientSecretSupplier;

        return [
            {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(CLIENT_ID_VAR_NAME),
                hasQuestionToken: clientIdIsOptional,
                type: getTextOfTsNode(clientIdPropertyType)
            },
            {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(CLIENT_SECRET_VAR_NAME),
                hasQuestionToken: clientSecretIsOptional,
                type: getTextOfTsNode(clientSecretPropertyType)
            }
        ];
    }

    public instantiate(constructorArgs: ts.Expression[]): ts.Expression {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(CLASS_NAME), "createInstance"),
            undefined,
            constructorArgs
        );
    }

    public writeToFile(context: SdkContext): void {
        this.writeConstants(context);
        this.writeClass(context);
        this.writeTokenOverrideClass(context);
        this.writeOptions(context);
    }

    private writeConstants(context: SdkContext): void {
        const oauthConfig = this.authScheme.configuration;
        if (oauthConfig.type !== "clientCredentials") {
            return;
        }

        const wrapperPropertyName = this.getWrapperPropertyName();
        const clientIdEnvVar = oauthConfig.clientIdEnvVar;
        const clientSecretEnvVar = oauthConfig.clientSecretEnvVar;

        const constants: string[] = [];
        constants.push(`const WRAPPER_PROPERTY = "${wrapperPropertyName}" as const;`);
        constants.push(`const CLIENT_ID_PARAM = "${CLIENT_ID_VAR_NAME}" as const;`);
        constants.push(`const CLIENT_SECRET_PARAM = "${CLIENT_SECRET_VAR_NAME}" as const;`);
        constants.push(`const TOKEN_PARAM = "${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME}" as const;`);

        if (clientIdEnvVar != null) {
            constants.push(`const ENV_CLIENT_ID = "${clientIdEnvVar}" as const;`);
        }
        if (clientSecretEnvVar != null) {
            constants.push(`const ENV_CLIENT_SECRET = "${clientSecretEnvVar}" as const;`);
        }

        // Error messages
        constants.push(
            `const CLIENT_ID_REQUIRED_ERROR_MESSAGE =\n    \`\${CLIENT_ID_PARAM} is required; either pass it as an argument or set the \${ENV_CLIENT_ID} environment variable\` as const;`
        );
        constants.push(
            `const CLIENT_SECRET_REQUIRED_ERROR_MESSAGE =\n    \`\${CLIENT_SECRET_PARAM} is required; either pass it as an argument or set the \${ENV_CLIENT_SECRET} environment variable\` as const;`
        );
        constants.push(
            `const TOKEN_PARAM_REQUIRED_ERROR_MESSAGE = \`\${TOKEN_PARAM} is required. Please provide it in options.\` as const;`
        );
        constants.push(`const BUFFER_IN_MINUTES = 2 as const;`);

        for (const constant of constants) {
            context.sourceFile.addStatements(constant);
        }
        context.sourceFile.addStatements(""); // blank line
    }

    private writeClass(context: SdkContext): void {
        const oauthConfig = this.authScheme.configuration;

        if (oauthConfig.type !== "clientCredentials") {
            return;
        }

        const authEndpointReference = oauthConfig.tokenEndpoint.endpointReference;
        const packageId = authEndpointReference.subpackageId
            ? { isRoot: false as const, subpackageId: authEndpointReference.subpackageId }
            : { isRoot: true as const };
        const authClientReference = context.sdkClientClass.getReferenceToClientClass(packageId);
        const authClientExpression = authClientReference.getExpression();
        const authClientType = getTextOfTsNode(authClientExpression);

        const endpoint = Object.values(this.ir.services)
            .flatMap((service: FernIr.HttpService) => service.endpoints)
            .find(
                (endpoint: FernIr.HttpEndpoint) =>
                    endpoint.id === oauthConfig.tokenEndpoint.endpointReference.endpointId
            );

        if (endpoint == null) {
            throw new Error(
                `failed to find endpoint with id ${oauthConfig.tokenEndpoint.endpointReference.endpointId}`
            );
        }

        const requestProperties = oauthConfig.tokenEndpoint.requestProperties;
        const responseProperties = oauthConfig.tokenEndpoint.responseProperties;

        const clientIdProperty = this.getName(requestProperties.clientId.property.name);
        const clientSecretProperty = this.getName(requestProperties.clientSecret.property.name);
        const endpointName = this.getName(endpoint.name);

        const accessTokenProperty = context.type.generateGetterForResponsePropertyAsString({
            property: responseProperties.accessToken,
            variable: this.neverThrowErrors ? "tokenResponse.body" : "tokenResponse"
        });

        const hasExpiration = responseProperties.expiresIn != null;
        const expiresInPropertyRaw =
            hasExpiration && responseProperties.expiresIn != null
                ? context.type.generateGetterForResponsePropertyAsString({
                      property: responseProperties.expiresIn,
                      variable: this.neverThrowErrors ? "tokenResponse.body" : "tokenResponse"
                  })
                : "";
        const expiresInIsOptional =
            hasExpiration && responseProperties.expiresIn != null
                ? context.type.isOptional(responseProperties.expiresIn.property.valueType)
                : false;
        const expiresInProperty = expiresInIsOptional
            ? `(${expiresInPropertyRaw} ?? ${DEFAULT_EXPIRES_IN_SECONDS})`
            : expiresInPropertyRaw;

        const neverThrowErrorHandler = this.getNeverThrowErrorsHandler(context);

        const constructorOptionsType = `${CLASS_NAME}.${OPTIONS_TYPE_NAME} & ${CLASS_NAME}.ClientCredentials`;
        const optionsFieldType = `BaseClientOptions & ${CLASS_NAME}.ClientCredentials`;

        const constructorStatements = `
        this.${OPTIONS_FIELD_NAME} = ${OPTIONS_PARAM_NAME};
        this.${AUTH_CLIENT_FIELD_NAME} = new ${authClientType}(${OPTIONS_PARAM_NAME});
        this.${EXPIRES_AT_FIELD_NAME} = new Date();
        `;

        const properties: Array<{
            name: string;
            type: string;
            hasQuestionToken?: boolean;
            isReadonly: boolean;
            scope: Scope;
            initializer?: string;
        }> = [
            {
                name: OPTIONS_FIELD_NAME,
                type: optionsFieldType,
                isReadonly: true,
                scope: Scope.Private
            },
            {
                name: AUTH_CLIENT_FIELD_NAME,
                type: authClientType,
                isReadonly: true,
                scope: Scope.Private
            },
            {
                name: ACCESS_TOKEN_FIELD_NAME,
                type: "string | undefined",
                isReadonly: false,
                scope: Scope.Private
            },
            {
                name: EXPIRES_AT_FIELD_NAME,
                type: "Date",
                isReadonly: false,
                scope: Scope.Private
            },
            {
                name: REFRESH_PROMISE_FIELD_NAME,
                type: "Promise<string> | undefined",
                isReadonly: false,
                scope: Scope.Private
            }
        ];

        const getTokenStatements = hasExpiration
            ? `
        if (this.${ACCESS_TOKEN_FIELD_NAME} && this.${EXPIRES_AT_FIELD_NAME} > new Date()) {
            return this.${ACCESS_TOKEN_FIELD_NAME};
        }
        // If a refresh is already in progress, return the existing promise
        if (this.${REFRESH_PROMISE_FIELD_NAME} != null) {
            return this.${REFRESH_PROMISE_FIELD_NAME};
        }
        return this.${REFRESH_METHOD_NAME}(${ENDPOINT_METADATA_ARG_NAME});
        `
            : `
        if (this.${ACCESS_TOKEN_FIELD_NAME}) {
            return this.${ACCESS_TOKEN_FIELD_NAME};
        }
        // If a refresh is already in progress, return the existing promise
        if (this.${REFRESH_PROMISE_FIELD_NAME} != null) {
            return this.${REFRESH_PROMISE_FIELD_NAME};
        }
        return this.${GET_TOKEN_INTERNAL_METHOD_NAME}(${ENDPOINT_METADATA_ARG_NAME});
        `;

        const refreshMethodStatements = hasExpiration
            ? `
        this.${REFRESH_PROMISE_FIELD_NAME} = (async () => {
            try {
                const clientId = await this.clientIdSupplier(${ENDPOINT_METADATA_ARG_NAME});
                const clientSecret = await this.clientSecretSupplier(${ENDPOINT_METADATA_ARG_NAME});
                const tokenResponse = await this.${AUTH_CLIENT_FIELD_NAME}.${endpointName}({
                    ${clientIdProperty}: clientId,
                    ${clientSecretProperty}: clientSecret,
                });
                ${neverThrowErrorHandler}
                this.${ACCESS_TOKEN_FIELD_NAME} = ${accessTokenProperty};
                this.${EXPIRES_AT_FIELD_NAME} = this.getExpiresAt(${expiresInProperty}, BUFFER_IN_MINUTES);
                return this.${ACCESS_TOKEN_FIELD_NAME};
            } finally {
                this.${REFRESH_PROMISE_FIELD_NAME} = undefined;
            }
        })();
        return this.${REFRESH_PROMISE_FIELD_NAME};
        `
            : `
        this.${REFRESH_PROMISE_FIELD_NAME} = (async () => {
            try {
                const clientId = await this.clientIdSupplier(${ENDPOINT_METADATA_ARG_NAME});
                const clientSecret = await this.clientSecretSupplier(${ENDPOINT_METADATA_ARG_NAME});
                const tokenResponse = await this.${AUTH_CLIENT_FIELD_NAME}.${endpointName}({
                    ${clientIdProperty}: clientId,
                    ${clientSecretProperty}: clientSecret,
                });
                ${neverThrowErrorHandler}
                this.${ACCESS_TOKEN_FIELD_NAME} = ${accessTokenProperty};
                return this.${ACCESS_TOKEN_FIELD_NAME};
            } finally {
                this.${REFRESH_PROMISE_FIELD_NAME} = undefined;
            }
        })();
        return this.${REFRESH_PROMISE_FIELD_NAME};
        `;

        const canCreateStatements = this.generateCanCreateStatements(
            oauthConfig.clientIdEnvVar,
            oauthConfig.clientSecretEnvVar
        );

        const canCreateReturnType = "boolean";

        const clientIdSupplierStatements = this.generateClientIdSupplierStatements(oauthConfig.clientIdEnvVar, context);
        const clientSecretSupplierStatements = this.generateClientSecretSupplierStatements(
            oauthConfig.clientSecretEnvVar,
            context
        );

        const methods: Array<{
            kind: StructureKind.Method;
            scope: Scope;
            name: string;
            isAsync?: boolean;
            isStatic?: boolean;
            returnType: string;
            statements: string;
            parameters?: Array<{ name: string; type: string; initializer?: string }>;
        }> = [
            {
                kind: StructureKind.Method,
                scope: Scope.Public,
                isStatic: true,
                name: "canCreate",
                isAsync: false,
                returnType: canCreateReturnType,
                statements: canCreateStatements,
                parameters: [
                    {
                        name: "options?",
                        type: `Partial<${CLASS_NAME}.ClientCredentials & BaseClientOptions>`
                    }
                ]
            },
            {
                kind: StructureKind.Method,
                scope: Scope.Private,
                name: "clientIdSupplier",
                isAsync: true,
                returnType: "Promise<string>",
                statements: clientIdSupplierStatements,
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
                ]
            },
            {
                kind: StructureKind.Method,
                scope: Scope.Private,
                name: "clientSecretSupplier",
                isAsync: true,
                returnType: "Promise<string>",
                statements: clientSecretSupplierStatements,
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
                ]
            },
            {
                kind: StructureKind.Method,
                scope: Scope.Public,
                name: "getAuthRequest",
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
                statements: `
        const token = await this.getToken({ endpointMetadata });

        return {
            headers: {
                Authorization: \`Bearer \${token}\`
            }
        };
        `
            },
            {
                kind: StructureKind.Method,
                scope: Scope.Private,
                name: "getToken",
                isAsync: true,
                returnType: "Promise<string>",
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
                statements: getTokenStatements
            },
            {
                kind: StructureKind.Method,
                scope: Scope.Private,
                name: hasExpiration ? "refresh" : "_getToken",
                isAsync: true,
                returnType: "Promise<string>",
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
                statements: refreshMethodStatements
            }
        ];

        if (hasExpiration) {
            methods.push({
                kind: StructureKind.Method,
                scope: Scope.Private,
                name: "getExpiresAt",
                isAsync: false,
                returnType: "Date",
                parameters: [
                    {
                        name: "expiresInSeconds",
                        type: "number"
                    },
                    {
                        name: "bufferInMinutes",
                        type: "number"
                    }
                ],
                statements: `
        const now = new Date();
        return new Date(now.getTime() + expiresInSeconds * 1000 - bufferInMinutes * 60 * 1000);
        `
            });
        }

        context.sourceFile.addClass({
            name: CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties,
            methods,
            ctors: [
                {
                    parameters: [
                        {
                            name: "options",
                            type: constructorOptionsType
                        }
                    ],
                    statements: [constructorStatements]
                }
            ]
        });
    }

    private writeTokenOverrideClass(context: SdkContext): void {
        const oauthConfig = this.authScheme.configuration;

        if (oauthConfig.type !== "clientCredentials") {
            return;
        }

        const constructorOptionsType = `${CLASS_NAME}.TokenOverride`;

        const constructorStatements = `
        this.${OPTIONS_FIELD_NAME} = ${OPTIONS_PARAM_NAME};
        `;

        const properties = [
            {
                name: OPTIONS_FIELD_NAME,
                type: constructorOptionsType,
                isReadonly: true,
                scope: Scope.Private
            }
        ];

        const methods = [
            {
                kind: StructureKind.Method as const,
                scope: Scope.Public,
                isStatic: true,
                name: "canCreate",
                isAsync: false,
                returnType: `options is ${CLASS_NAME}.TokenOverride`,
                statements: `return options?.[WRAPPER_PROPERTY]?.[TOKEN_PARAM] != null;`,
                parameters: [
                    {
                        name: "options?",
                        type: `Partial<${CLASS_NAME}.TokenOverride & BaseClientOptions>`
                    }
                ]
            },
            {
                kind: StructureKind.Method as const,
                scope: Scope.Public,
                name: "getAuthRequest",
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
                statements: `
        const token = this.${OPTIONS_FIELD_NAME}[WRAPPER_PROPERTY]?.[TOKEN_PARAM];
        if (token == null) {
            throw new ${getTextOfTsNode(context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression())}({
                message: TOKEN_PARAM_REQUIRED_ERROR_MESSAGE,
            });
        }
        return {
            headers: {
                Authorization: \`Bearer \${await core.EndpointSupplier.get(token, { endpointMetadata })}\`
            }
        };
        `
            }
        ];

        context.sourceFile.addClass({
            name: TOKEN_OVERRIDE_CLASS_NAME,
            isExported: true,
            implements: [getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType())],
            properties,
            methods,
            ctors: [
                {
                    parameters: [
                        {
                            name: "options",
                            type: constructorOptionsType
                        }
                    ],
                    statements: [constructorStatements]
                }
            ]
        });
    }

    private getNeverThrowErrorsHandler(context: SdkContext): string {
        if (!this.neverThrowErrors) {
            return "";
        }
        const errorType = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getEntityName()
        );
        return `if (!tokenResponse.ok) {
                throw new ${errorType}({ body: tokenResponse.error });
            }`;
    }

    private generateCanCreateStatements(
        clientIdEnvVar: string | undefined,
        clientSecretEnvVar: string | undefined
    ): string {
        const clientIdCheck =
            clientIdEnvVar != null
                ? `options?.[WRAPPER_PROPERTY]?.[CLIENT_ID_PARAM] != null || process.env?.[ENV_CLIENT_ID] != null`
                : `options?.[WRAPPER_PROPERTY]?.[CLIENT_ID_PARAM] != null`;

        const clientSecretCheck =
            clientSecretEnvVar != null
                ? `options?.[WRAPPER_PROPERTY]?.[CLIENT_SECRET_PARAM] != null || process.env?.[ENV_CLIENT_SECRET] != null`
                : `options?.[WRAPPER_PROPERTY]?.[CLIENT_SECRET_PARAM] != null`;

        return `return (${clientIdCheck}) && (${clientSecretCheck});`;
    }

    private generateClientIdSupplierStatements(clientIdEnvVar: string | undefined, context: SdkContext): string {
        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        if (clientIdEnvVar != null) {
            return `
        const supplier = this.${OPTIONS_FIELD_NAME}[WRAPPER_PROPERTY]?.[CLIENT_ID_PARAM];
        if (supplier != null) {
            return core.EndpointSupplier.get(supplier, { endpointMetadata });
        }
        const envClientId = process.env?.[ENV_CLIENT_ID];
        if (envClientId != null) {
            return envClientId;
        }
        throw new ${errorConstructor}({
            message: CLIENT_ID_REQUIRED_ERROR_MESSAGE,
        });
            `;
        }

        return `
        const supplier = this.${OPTIONS_FIELD_NAME}[WRAPPER_PROPERTY]?.[CLIENT_ID_PARAM];
        if (supplier == null) {
            throw new ${errorConstructor}({
                message: CLIENT_ID_REQUIRED_ERROR_MESSAGE,
            });
        }
        return core.EndpointSupplier.get(supplier, { endpointMetadata });
        `;
    }

    private generateClientSecretSupplierStatements(
        clientSecretEnvVar: string | undefined,
        context: SdkContext
    ): string {
        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        if (clientSecretEnvVar != null) {
            return `
        const supplier = this.${OPTIONS_FIELD_NAME}[WRAPPER_PROPERTY]?.[CLIENT_SECRET_PARAM];
        if (supplier != null) {
            return core.EndpointSupplier.get(supplier, { endpointMetadata });
        }
        const envClientSecret = process.env?.[ENV_CLIENT_SECRET];
        if (envClientSecret != null) {
            return envClientSecret;
        }
        throw new ${errorConstructor}({
            message: CLIENT_SECRET_REQUIRED_ERROR_MESSAGE,
        });
            `;
        }

        return `
        const supplier = this.${OPTIONS_FIELD_NAME}[WRAPPER_PROPERTY]?.[CLIENT_SECRET_PARAM];
        if (supplier == null) {
            throw new ${errorConstructor}({
                message: CLIENT_SECRET_REQUIRED_ERROR_MESSAGE,
            });
        }
        return core.EndpointSupplier.get(supplier, { endpointMetadata });
        `;
    }

    private getName(name: FernIr.Name | FernIr.NameAndWireValue): string {
        if (this.includeSerdeLayer) {
            if ("name" in name) {
                return name.name.camelCase.unsafeName;
            }
            return name.camelCase.unsafeName;
        }
        if ("name" in name) {
            return name.name.originalName;
        }
        return name.originalName;
    }

    private writeOptions(context: SdkContext): void {
        const oauthConfig = this.authScheme.configuration;
        if (oauthConfig.type !== "clientCredentials") {
            return;
        }

        // Import BaseClientOptions for Options to extend
        // OAuthAuthProvider.Options needs to extend BaseClientOptions because it creates an AuthClient
        context.sourceFile.addImportDeclaration({
            moduleSpecifier: "../BaseClient",
            namedImports: ["BaseClientOptions"],
            isTypeOnly: true
        });

        const supplierType = getTextOfTsNode(
            context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType(
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            )
        );

        const clientIdIsOptional = oauthConfig.clientIdEnvVar != null;
        const clientSecretIsOptional = oauthConfig.clientSecretEnvVar != null;

        const clientIdType = clientIdIsOptional ? `${supplierType} | undefined` : supplierType;
        const clientSecretType = clientSecretIsOptional ? `${supplierType} | undefined` : supplierType;

        const authSchemeKey = this.authScheme.key;

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                `export const AUTH_SCHEME = "${authSchemeKey}" as const;`,
                `export const AUTH_CONFIG_ERROR_MESSAGE: string =\n    \`Insufficient options to create OAuthAuthProvider. Please provide either '\${CLIENT_ID_PARAM}' or '\${ENV_CLIENT_ID}' env var and '\${CLIENT_SECRET_PARAM}' or '\${ENV_CLIENT_SECRET}' env var, or \${TOKEN_PARAM}.\` as const;`,
                // ClientCredentials interface with computed property names
                {
                    kind: StructureKind.Interface,
                    name: "ClientCredentials",
                    isExported: true,
                    properties: [
                        {
                            name: "[WRAPPER_PROPERTY]",
                            hasQuestionToken: true,
                            type: `{ [CLIENT_ID_PARAM]?: ${clientIdType}; [CLIENT_SECRET_PARAM]?: ${clientSecretType} }`
                        }
                    ]
                },
                // TokenOverride interface with computed property names
                {
                    kind: StructureKind.Interface,
                    name: "TokenOverride",
                    isExported: true,
                    properties: [
                        {
                            name: "[WRAPPER_PROPERTY]",
                            hasQuestionToken: true,
                            type: `{ [TOKEN_PARAM]?: ${supplierType} }`
                        }
                    ]
                },
                // AuthOptions union type
                {
                    kind: StructureKind.TypeAlias,
                    name: "AuthOptions",
                    isExported: true,
                    type: "ClientCredentials | TokenOverride"
                },
                // Options type extends BaseClientOptions
                {
                    kind: StructureKind.TypeAlias,
                    name: OPTIONS_TYPE_NAME,
                    isExported: true,
                    type: "BaseClientOptions & AuthOptions"
                },
                // createInstance function
                {
                    kind: StructureKind.Function,
                    name: "createInstance",
                    isExported: true,
                    parameters: [{ name: "options", type: OPTIONS_TYPE_NAME }],
                    returnType: getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType()),
                    statements: `
        if (${TOKEN_OVERRIDE_CLASS_NAME}.canCreate(options)) {
            return new ${TOKEN_OVERRIDE_CLASS_NAME}(options);
        } else if (${CLASS_NAME}.canCreate(options)) {
            return new ${CLASS_NAME}(options);
        }
        throw new ${getTextOfTsNode(context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression())}({
            message: AUTH_CONFIG_ERROR_MESSAGE,
        });
        `
                }
            ]
        });
    }
}
