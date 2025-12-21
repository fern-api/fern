import type { FernIr } from "@fern-fern/ir-sdk";
import { type ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import type { SdkContext } from "@fern-typescript/contexts";
import { Scope, StructureKind, ts } from "ts-morph";

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
const OPTIONS_TYPE_NAME = "Options";
const OPTIONS_PARAM_NAME = "options";
const CLIENT_ID_VAR_NAME = "clientId";
const CLIENT_SECRET_VAR_NAME = "clientSecret";
const ENDPOINT_METADATA_ARG_NAME = "arg";
const REFRESH_METHOD_NAME = "refresh";
const GET_TOKEN_INTERNAL_METHOD_NAME = "_getToken";
const BUFFER_IN_MINUTES_FIELD_NAME = "BUFFER_IN_MINUTES";
const CLIENT_ID_FIELD_NAME = "_clientId";
const CLIENT_SECRET_FIELD_NAME = "_clientSecret";
const AUTH_CLIENT_FIELD_NAME = "_authClient";
const ACCESS_TOKEN_FIELD_NAME = "_accessToken";
const EXPIRES_AT_FIELD_NAME = "_expiresAt";
const REFRESH_PROMISE_FIELD_NAME = "_refreshPromise";

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
        this.writeOptions(context);
        this.writeClass(context);
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
        const expiresInProperty =
            hasExpiration && responseProperties.expiresIn != null
                ? context.type.generateGetterForResponsePropertyAsString({
                      property: responseProperties.expiresIn,
                      variable: this.neverThrowErrors ? "tokenResponse.body" : "tokenResponse"
                  })
                : "";

        const neverThrowErrorHandler = this.getNeverThrowErrorsHandler(context);

        const clientIdIsOptional = oauthConfig.clientIdEnvVar != null;
        const clientSecretIsOptional = oauthConfig.clientSecretEnvVar != null;

        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

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
                type: clientIdIsOptional
                    ? `${supplierType}<${clientIdType}> | undefined`
                    : `${supplierType}<${clientIdType}>`,
                isReadonly: true,
                scope: Scope.Private
            },
            {
                name: CLIENT_SECRET_FIELD_NAME,
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

        const clientIdSupplierCall = getTextOfTsNode(
            context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "_clientId"),
                ts.factory.createObjectLiteralExpression([
                    ts.factory.createPropertyAssignment(
                        "endpointMetadata",
                        ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier("arg"),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                "endpointMetadata"
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                            ts.factory.createObjectLiteralExpression([])
                        )
                    )
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

        const clientSecretSupplierCall = getTextOfTsNode(
            context.coreUtilities.fetcher.SupplierOrEndpointSupplier.get(
                ts.factory.createPropertyAccessExpression(ts.factory.createThis(), "_clientSecret"),
                ts.factory.createObjectLiteralExpression([
                    ts.factory.createPropertyAssignment(
                        "endpointMetadata",
                        ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier("arg"),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                "endpointMetadata"
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                            ts.factory.createObjectLiteralExpression([])
                        )
                    )
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

        const canCreateStatements = this.generatecanCreateStatements(
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
            parameters?: Array<{ name: string; type: string }>;
        }> = [
            {
                kind: StructureKind.Method,
                scope: Scope.Public,
                isStatic: true,
                name: "canCreate",
                isAsync: false,
                returnType: "boolean",
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
                name: "getAuthRequest",
                isAsync: true,
                parameters: [
                    {
                        name: "arg?",
                        type: getTextOfTsNode(
                            ts.factory.createTypeLiteralNode([
                                ts.factory.createPropertySignature(
                                    undefined,
                                    "endpointMetadata",
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    context.coreUtilities.fetcher.EndpointMetadata._getReferenceToType()
                                )
                            ])
                        )
                    }
                ],
                returnType: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                        context.coreUtilities.auth.AuthRequest._getReferenceToType()
                    ])
                ),
                statements: `
        const token = await this.getToken(arg);

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
                        name: "arg?",
                        type: getTextOfTsNode(
                            ts.factory.createTypeLiteralNode([
                                ts.factory.createPropertySignature(
                                    undefined,
                                    "endpointMetadata",
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    context.coreUtilities.fetcher.EndpointMetadata._getReferenceToType()
                                )
                            ])
                        )
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
                        name: "arg?",
                        type: getTextOfTsNode(
                            ts.factory.createTypeLiteralNode([
                                ts.factory.createPropertySignature(
                                    undefined,
                                    "endpointMetadata",
                                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                    context.coreUtilities.fetcher.EndpointMetadata._getReferenceToType()
                                )
                            ])
                        )
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
                            type: getTextOfTsNode(this.getOptionsType())
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
        const clientIdCheck =
            clientIdEnvVar != null
                ? `(options.clientId != null || process.env?.["${clientIdEnvVar}"] != null)`
                : `options.clientId != null`;

        const clientSecretCheck =
            clientSecretEnvVar != null
                ? `(options.clientSecret != null || process.env?.["${clientSecretEnvVar}"] != null)`
                : `options.clientSecret != null`;

        return `return ${clientIdCheck} && ${clientSecretCheck};`;
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
        context.importsManager.addImportFromRoot("BaseClient", {
            namedImports: ["BaseClientOptions"]
        });

        const oauthConfig = this.authScheme.configuration;
        if (oauthConfig.type !== "clientCredentials") {
            return;
        }

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                {
                    kind: StructureKind.Interface,
                    name: OPTIONS_TYPE_NAME,
                    isExported: true,
                    extends: ["BaseClientOptions"]
                }
            ]
        });
    }
}
