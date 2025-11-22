import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { Scope, StructureKind, ts } from "ts-morph";

import { AuthProviderGenerator } from "./AuthProviderGenerator";

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

export class OAuthAuthProviderGenerator implements AuthProviderGenerator {
    public static readonly CLASS_NAME = CLASS_NAME;
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

        // Get the endpoint to access request/response properties
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

        // Get error constructor for consistent error handling
        const errorConstructor = getTextOfTsNode(
            context.genericAPISdkError.getReferenceToGenericAPISdkError().getExpression()
        );

        // Generate constructor with validation
        let constructorStatements = "";

        if (clientIdIsOptional) {
            constructorStatements += `
        const clientId = options.clientId ?? process.env?.["${oauthConfig.clientIdEnvVar}"];
        if (clientId == null) {
            throw new ${errorConstructor}({
                message: "clientId is required; either pass it as an argument or set the ${oauthConfig.clientIdEnvVar} environment variable"
            });
        }
        this._clientId = clientId;
`;
        } else {
            constructorStatements += `
        this._clientId = options.clientId;
`;
        }

        if (clientSecretIsOptional) {
            constructorStatements += `
        const clientSecret = options.clientSecret ?? process.env?.["${oauthConfig.clientSecretEnvVar}"];
        if (clientSecret == null) {
            throw new ${errorConstructor}({
                message: "clientSecret is required; either pass it as an argument or set the ${oauthConfig.clientSecretEnvVar} environment variable"
            });
        }
        this._clientSecret = clientSecret;
`;
        } else {
            constructorStatements += `
        this._clientSecret = options.clientSecret;
`;
        }

        constructorStatements += `
        this._authClient = new ${authClientType}(options);
        this._expiresAt = new Date();
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
                name: "_clientId",
                type: `core.Supplier<${clientIdType}>`,
                isReadonly: true,
                scope: Scope.Private
            },
            {
                name: "_clientSecret",
                type: `core.Supplier<${clientSecretType}>`,
                isReadonly: true,
                scope: Scope.Private
            },
            {
                name: "_authClient",
                type: authClientType,
                isReadonly: true,
                scope: Scope.Private
            },
            {
                name: "_accessToken",
                type: "string | undefined",
                isReadonly: false,
                scope: Scope.Private
            },
            {
                name: "_expiresAt",
                type: "Date",
                isReadonly: false,
                scope: Scope.Private
            },
            {
                name: "_refreshPromise",
                type: "Promise<string> | undefined",
                isReadonly: false,
                scope: Scope.Private
            }
        ];

        if (hasExpiration) {
            properties.unshift({
                name: "BUFFER_IN_MINUTES",
                type: "number",
                isReadonly: true,
                scope: Scope.Private,
                initializer: "2"
            });
        }

        const getTokenStatements = hasExpiration
            ? `
        if (this._accessToken && this._expiresAt > new Date()) {
            return this._accessToken;
        }
        // If a refresh is already in progress, return the existing promise
        if (this._refreshPromise != null) {
            return this._refreshPromise;
        }
        return this.refresh();
        `
            : `
        if (this._accessToken) {
            return this._accessToken;
        }
        // If a refresh is already in progress, return the existing promise
        if (this._refreshPromise != null) {
            return this._refreshPromise;
        }
        return this._getToken();
        `;

        // Constructor validates credentials, so fields are always defined
        const clientIdExpression = `await core.Supplier.get(this._clientId)`;
        const clientSecretExpression = `await core.Supplier.get(this._clientSecret)`;

        const refreshMethodStatements = hasExpiration
            ? `
        this._refreshPromise = (async () => {
            try {
                const tokenResponse = await this._authClient.${endpointName}({
                    ${clientIdProperty}: ${clientIdExpression},
                    ${clientSecretProperty}: ${clientSecretExpression},
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
                const tokenResponse = await this._authClient.${endpointName}({
                    ${clientIdProperty}: ${clientIdExpression},
                    ${clientSecretProperty}: ${clientSecretExpression},
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

        const methods: Array<{
            kind: StructureKind.Method;
            scope: Scope;
            name: string;
            isAsync: boolean;
            returnType: string;
            statements: string;
            parameters?: Array<{ name: string; type: string }>;
        }> = [
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
                statements: `
        const token = await this.getToken();

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
                statements: getTokenStatements
            },
            {
                kind: StructureKind.Method,
                scope: Scope.Private,
                name: hasExpiration ? "refresh" : "_getToken",
                isAsync: true,
                returnType: "Promise<string>",
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
        // Import BaseClientOptions
        context.importsManager.addImportFromRoot("BaseClient", {
            namedImports: ["BaseClientOptions"]
        });

        // Get OAuth configuration
        const oauthConfig = this.authScheme.configuration;
        if (oauthConfig.type !== "clientCredentials") {
            return;
        }

        const properties: Array<{
            kind: StructureKind.PropertySignature;
            name: string;
            type: string;
            hasQuestionToken?: boolean;
        }> = [];

        // Add clientId property
        const clientIdProperty = oauthConfig.tokenEndpoint.requestProperties.clientId;
        properties.push({
            kind: StructureKind.PropertySignature,
            name: "clientId",
            type: getTextOfTsNode(
                context.coreUtilities.fetcher.Supplier._getReferenceToType(
                    context.type.getReferenceToType(clientIdProperty.property.valueType).typeNode
                )
            ),
            hasQuestionToken: oauthConfig.clientIdEnvVar != null
        });

        // Add clientSecret property
        const clientSecretProperty = oauthConfig.tokenEndpoint.requestProperties.clientSecret;
        properties.push({
            kind: StructureKind.PropertySignature,
            name: "clientSecret",
            type: getTextOfTsNode(
                context.coreUtilities.fetcher.Supplier._getReferenceToType(
                    context.type.getReferenceToType(clientSecretProperty.property.valueType).typeNode
                )
            ),
            hasQuestionToken: oauthConfig.clientSecretEnvVar != null
        });

        context.sourceFile.addModule({
            name: CLASS_NAME,
            isExported: true,
            kind: StructureKind.Module,
            statements: [
                {
                    kind: StructureKind.Interface,
                    name: OPTIONS_TYPE_NAME,
                    isExported: true,
                    extends: ["BaseClientOptions"],
                    properties
                }
            ]
        });
    }
}
