import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getPropertyKey, getTextOfTsNode } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import { camelCase } from "lodash-es";
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
const BUFFER_IN_MINUTES_FIELD_NAME = "BUFFER_IN_MINUTES";
const CLIENT_ID_FIELD_NAME = "_clientId";
const CLIENT_SECRET_FIELD_NAME = "_clientSecret";
const AUTH_CLIENT_FIELD_NAME = "_authClient";
const ACCESS_TOKEN_FIELD_NAME = "_accessToken";
const EXPIRES_AT_FIELD_NAME = "_expiresAt";
const REFRESH_PROMISE_FIELD_NAME = "_refreshPromise";
const TOKEN_FIELD_NAME = "_token";
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
        return camelCase(this.authScheme.key);
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
        this.writeClass(context);
        this.writeTokenOverrideClass(context);
        this.writeOptions(context);
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

        const clientIdType = getTextOfTsNode(
            context.type.getReferenceToType(requestProperties.clientId.property.valueType).typeNode
        );
        const clientSecretType = getTextOfTsNode(
            context.type.getReferenceToType(requestProperties.clientSecret.property.valueType).typeNode
        );

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

        const clientIdIsOptional = oauthConfig.clientIdEnvVar != null;
        const clientSecretIsOptional = oauthConfig.clientSecretEnvVar != null;

        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        const constructorOptionsType = `${CLASS_NAME}.${OPTIONS_TYPE_NAME} & ${CLASS_NAME}.AuthOptions.ClientCredentials`;

        let constructorStatements = "";

        if (!clientIdIsOptional) {
            const envVarHint =
                oauthConfig.clientIdEnvVar != null
                    ? ` or set the ${oauthConfig.clientIdEnvVar} environment variable`
                    : "";
            constructorStatements += `
        if (${OPTIONS_PARAM_NAME}.${CLIENT_ID_VAR_NAME} == null) {
            throw new ${errorConstructor}({
                message: "${CLIENT_ID_VAR_NAME} is required. Please provide it in ${OPTIONS_PARAM_NAME}${envVarHint}."
            });
        }`;
        }

        constructorStatements += `
        this.${CLIENT_ID_FIELD_NAME} = ${OPTIONS_PARAM_NAME}.${CLIENT_ID_VAR_NAME};`;

        if (!clientSecretIsOptional) {
            const envVarHint =
                oauthConfig.clientSecretEnvVar != null
                    ? ` or set the ${oauthConfig.clientSecretEnvVar} environment variable`
                    : "";
            constructorStatements += `
        if (${OPTIONS_PARAM_NAME}.${CLIENT_SECRET_VAR_NAME} == null) {
            throw new ${errorConstructor}({
                message: "${CLIENT_SECRET_VAR_NAME} is required. Please provide it in ${OPTIONS_PARAM_NAME}${envVarHint}."
            });
        }`;
        }

        constructorStatements += `
        this.${CLIENT_SECRET_FIELD_NAME} = ${OPTIONS_PARAM_NAME}.${CLIENT_SECRET_VAR_NAME};`;

        constructorStatements += `
        this.${AUTH_CLIENT_FIELD_NAME} = new ${authClientType}(${OPTIONS_PARAM_NAME});
        this.${EXPIRES_AT_FIELD_NAME} = new Date();
        `;

        const supplierType = getTextOfTsNode(
            context.coreUtilities.fetcher.SupplierOrEndpointSupplier._getReferenceToType(
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
            )
        ).replace(/<any>/, "");

        const properties: Array<{
            name: string;
            type: string;
            hasQuestionToken?: boolean;
            isReadonly: boolean;
            scope: Scope;
            initializer?: string;
        }> = [
            {
                name: CLIENT_ID_FIELD_NAME,
                // When env var fallback exists, use Supplier<T> | undefined to match AuthOptions
                type: clientIdIsOptional
                    ? `${supplierType}<${clientIdType}> | undefined`
                    : `${supplierType}<${clientIdType}>`,
                isReadonly: true,
                scope: Scope.Private
            },
            {
                name: CLIENT_SECRET_FIELD_NAME,
                // When env var fallback exists, use Supplier<T> | undefined to match AuthOptions
                type: clientSecretIsOptional
                    ? `${supplierType}<${clientSecretType}> | undefined`
                    : `${supplierType}<${clientSecretType}>`,
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

        if (hasExpiration) {
            properties.unshift({
                name: BUFFER_IN_MINUTES_FIELD_NAME,
                type: "number",
                isReadonly: true,
                scope: Scope.Private,
                initializer: "2"
            });
        }

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

        const clientIdPropertyAccess = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "_clientId");
        const clientIdSupplierCall = getTextOfTsNode(
            context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
                clientIdPropertyAccess,
                ts.factory.createObjectLiteralExpression([
                    ts.factory.createShorthandPropertyAssignment("endpointMetadata")
                ])
            )
        );
        const clientIdValidation = clientIdIsOptional
            ? `
        const clientId = (${clientIdSupplierCall}) ?? process.env?.["${oauthConfig.clientIdEnvVar}"];
        if (clientId == null) {
            throw new ${errorConstructor}({
                message: "clientId is required; either pass it as an argument or set the ${oauthConfig.clientIdEnvVar} environment variable"
            });
        }`
            : `
        const clientId = ${clientIdSupplierCall};`;

        const clientSecretPropertyAccess = ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            "_clientSecret"
        );
        const clientSecretSupplierCall = getTextOfTsNode(
            context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
                clientSecretPropertyAccess,
                ts.factory.createObjectLiteralExpression([
                    ts.factory.createShorthandPropertyAssignment("endpointMetadata")
                ])
            )
        );
        const clientSecretValidation = clientSecretIsOptional
            ? `
        const clientSecret = (${clientSecretSupplierCall}) ?? process.env?.["${oauthConfig.clientSecretEnvVar}"];
        if (clientSecret == null) {
            throw new ${errorConstructor}({
                message: "clientSecret is required; either pass it as an argument or set the ${oauthConfig.clientSecretEnvVar} environment variable"
            });
        }`
            : `
        const clientSecret = ${clientSecretSupplierCall};`;

        const refreshMethodStatements = hasExpiration
            ? `
        this._refreshPromise = (async () => {
            try {
                ${clientIdValidation}
                ${clientSecretValidation}
                const tokenResponse = await this._authClient.${endpointName}({
                    ${clientIdProperty}: clientId,
                    ${clientSecretProperty}: clientSecret,
                });
                ${neverThrowErrorHandler}
                this._accessToken = ${accessTokenProperty};
                this._expiresAt = this.getExpiresAt(${expiresInProperty}, this.BUFFER_IN_MINUTES);
                return this._accessToken;
            } finally {
                this._refreshPromise = undefined;
            }
        })();
        return this._refreshPromise;
        `
            : `
        this._refreshPromise = (async () => {
            try {
                ${clientIdValidation}
                ${clientSecretValidation}
                const tokenResponse = await this._authClient.${endpointName}({
                    ${clientIdProperty}: clientId,
                    ${clientSecretProperty}: clientSecret,
                });
                ${neverThrowErrorHandler}
                this._accessToken = ${accessTokenProperty};
                return this._accessToken;
            } finally {
                this._refreshPromise = undefined;
            }
        })();
        return this._refreshPromise;
        `;

        const canCreateStatements = this.generatecanCreateStatementsForTokenOverride(
            oauthConfig.clientIdEnvVar,
            oauthConfig.clientSecretEnvVar
        );

        const canCreateReturnType = `options is ${CLASS_NAME}.${OPTIONS_TYPE_NAME} & ${CLASS_NAME}.AuthOptions.ClientCredentials`;

        const getAuthConfigErrorMessageStatements = this.generateGetAuthConfigErrorMessageStatements(
            oauthConfig.clientIdEnvVar,
            oauthConfig.clientSecretEnvVar
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
                        name: "options",
                        type: getTextOfTsNode(this.getOptionsType())
                    }
                ]
            },
            {
                kind: StructureKind.Method,
                scope: Scope.Public,
                isStatic: true,
                name: "getAuthConfigErrorMessage",
                isAsync: false,
                returnType: "string",
                statements: getAuthConfigErrorMessageStatements
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

        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        const supplierType = getTextOfTsNode(
            context.coreUtilities.fetcher.Supplier._getReferenceToType(
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            )
        );

        const constructorStatements = `
        if (${OPTIONS_PARAM_NAME}.${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME} == null) {
            throw new ${errorConstructor}({
                message: "${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME} is required. Please provide it in ${OPTIONS_PARAM_NAME}."
            });
        }
        this.${TOKEN_FIELD_NAME} = ${OPTIONS_PARAM_NAME}.${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME};
        `;

        const tokenPropertyAccess = ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            TOKEN_FIELD_NAME
        );
        const tokenSupplierCall = getTextOfTsNode(context.coreUtilities.fetcher.Supplier.get(tokenPropertyAccess));

        const properties = [
            {
                name: TOKEN_FIELD_NAME,
                type: supplierType,
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
                returnType: `options is ${CLASS_NAME}.${OPTIONS_TYPE_NAME} & ${CLASS_NAME}.AuthOptions.TokenOverride`,
                statements: `return "${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME}" in options && options.${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME} != null;`,
                parameters: [
                    {
                        name: "options",
                        type: getTextOfTsNode(this.getOptionsType())
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
        return {
            headers: {
                Authorization: \`Bearer \${${tokenSupplierCall}}\`
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
                            type: `${CLASS_NAME}.${OPTIONS_TYPE_NAME} & ${CLASS_NAME}.AuthOptions.TokenOverride`
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

    private generatecanCreateStatements(
        clientIdEnvVar: string | undefined,
        clientSecretEnvVar: string | undefined
    ): string {
        // Without token override, we can access clientId and clientSecret directly
        const clientIdCheck =
            clientIdEnvVar != null
                ? `(options.clientId != null || process.env?.["${clientIdEnvVar}"] != null)`
                : `options.clientId != null`;

        const clientSecretCheck =
            clientSecretEnvVar != null
                ? `(options.clientSecret != null || process.env?.["${clientSecretEnvVar}"] != null)`
                : `options.clientSecret != null`;

        const oauthCheck = `(${clientIdCheck} && ${clientSecretCheck})`;
        return `return ${oauthCheck};`;
    }

    private generatecanCreateStatementsForTokenOverride(
        clientIdEnvVar: string | undefined,
        clientSecretEnvVar: string | undefined
    ): string {
        const clientIdCheck =
            clientIdEnvVar != null
                ? `(("clientId" in options && options.clientId != null) || process.env?.["${clientIdEnvVar}"] != null)`
                : `"clientId" in options && options.clientId != null`;

        const clientSecretCheck =
            clientSecretEnvVar != null
                ? `(("clientSecret" in options && options.clientSecret != null) || process.env?.["${clientSecretEnvVar}"] != null)`
                : `"clientSecret" in options && options.clientSecret != null`;

        return `return (${clientIdCheck}) && (${clientSecretCheck});`;
    }

    private generateGetAuthConfigErrorMessageStatements(
        clientIdEnvVar: string | undefined,
        clientSecretEnvVar: string | undefined
    ): string {
        const clientIdHint = clientIdEnvVar != null ? `'clientId' or '${clientIdEnvVar}' env var` : `'clientId'`;

        const clientSecretHint =
            clientSecretEnvVar != null ? `'clientSecret' or '${clientSecretEnvVar}' env var` : `'clientSecret'`;

        return `return "Please provide ${clientIdHint} and ${clientSecretHint} when initializing the client";`;
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
            moduleSpecifier: "../BaseClient.js",
            namedImports: ["BaseClientOptions"],
            isTypeOnly: true
        });

        const supplierType = getTextOfTsNode(
            context.coreUtilities.fetcher.Supplier._getReferenceToType(
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            )
        );

        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        const clientIdIsOptional = oauthConfig.clientIdEnvVar != null;
        const clientSecretIsOptional = oauthConfig.clientSecretEnvVar != null;

        const clientIdType = clientIdIsOptional ? `${supplierType} | undefined` : supplierType;
        const clientSecretType = clientSecretIsOptional ? `${supplierType} | undefined` : supplierType;

        // Wrapper property name for namespacing OAuth options when multiple auth schemes are present
        const wrapperPropertyName = this.getWrapperPropertyName();

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                {
                    kind: StructureKind.TypeAlias,
                    name: "AuthOptions",
                    isExported: true,
                    type: `AuthOptions.ClientCredentials | AuthOptions.TokenOverride`
                },
                {
                    kind: StructureKind.Module,
                    name: "AuthOptions",
                    isExported: true,
                    statements: [
                        {
                            kind: StructureKind.Interface,
                            name: "ClientCredentials",
                            isExported: true,
                            properties: [
                                { name: "clientId", type: clientIdType },
                                { name: "clientSecret", type: clientSecretType }
                            ]
                        },
                        {
                            kind: StructureKind.Interface,
                            name: "TokenOverride",
                            isExported: true,
                            properties: [{ name: DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME, type: supplierType }]
                        }
                    ]
                },
                {
                    kind: StructureKind.TypeAlias,
                    name: OPTIONS_TYPE_NAME,
                    isExported: true,
                    type: "BaseClientOptions"
                },
                // Export the wrapper property name so aggregators can use it
                `export const WRAPPER_PROPERTY_NAME = "${wrapperPropertyName}" as const;`,
                {
                    kind: StructureKind.Function,
                    name: "createInstance",
                    isExported: true,
                    parameters: [{ name: "options", type: OPTIONS_TYPE_NAME }],
                    returnType: getTextOfTsNode(context.coreUtilities.auth.AuthProvider._getReferenceToType()),
                    statements: `
        // Check for nested options first (when used with auth aggregators like AnyAuthProvider/RoutingAuthProvider)
        const nestedOptions = (options as unknown as Record<string, unknown>)[WRAPPER_PROPERTY_NAME] as AuthOptions | undefined;
        if (nestedOptions != null) {
            // Use nested options - check token override first, then client credentials
            if ("${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME}" in nestedOptions && nestedOptions.${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME} != null) {
                return new ${TOKEN_OVERRIDE_CLASS_NAME}({ ...options, ${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME}: nestedOptions.${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME} });
            } else if ("clientId" in nestedOptions && "clientSecret" in nestedOptions) {
                return new ${CLASS_NAME}({ ...options, clientId: nestedOptions.clientId, clientSecret: nestedOptions.clientSecret });
            }
        }
        // Fall back to flat options for backward compatibility (single auth scheme SDKs)
        if (${TOKEN_OVERRIDE_CLASS_NAME}.canCreate(options)) {
            return new ${TOKEN_OVERRIDE_CLASS_NAME}(options);
        } else if (${CLASS_NAME}.canCreate(options)) {
            return new ${CLASS_NAME}(options);
        }
        throw new ${errorConstructor}({
            message: "Insufficient options to create OAuthAuthProvider. Please provide either clientId and clientSecret, or ${DEFAULT_TOKEN_OVERRIDE_PROPERTY_NAME}."
        });
        `
                }
            ]
        });
    }
}
