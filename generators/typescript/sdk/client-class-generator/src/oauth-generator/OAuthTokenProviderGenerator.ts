import {
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    Name,
    NameAndWireValue,
    OAuthAccessTokenRequestProperties,
    OAuthAccessTokenResponseProperties,
    OAuthClientCredentials,
    OAuthScheme
} from "@fern-fern/ir-sdk/api";
import { ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { Code, code } from "ts-poet";

export class OAuthTokenProviderGenerator {
    public static readonly OAUTH_TOKEN_PROVIDER_CLASS_NAME = "OAuthTokenProvider";
    public static readonly OAUTH_TOKEN_PROVIDER_PROPERTY_NAME = "_oauthTokenProvider";
    public static readonly OAUTH_TOKEN_PROPERTY_NAME = "token";
    public static readonly OAUTH_GET_TOKEN_METHOD_NAME = "getToken";
    public static readonly OAUTH_CLIENT_ID_PROPERTY_NAME = "clientId";
    public static readonly OAUTH_CLIENT_SECRET_PROPERTY_NAME = "clientSecret";
    public static readonly OAUTH_AUTH_CLIENT_PROPERTY_NAME = "authClient";

    private ir: IntermediateRepresentation;
    private neverThrowErrors: boolean;
    private includeSerdeLayer: boolean;

    constructor({
        intermediateRepresentation,
        neverThrowErrors,
        includeSerdeLayer
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        neverThrowErrors: boolean;
        includeSerdeLayer: boolean;
    }) {
        this.ir = intermediateRepresentation;
        this.neverThrowErrors = neverThrowErrors;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public getExportedFilePath(): ExportedFilePath {
        return {
            directories: [
                {
                    nameOnDisk: "core"
                },
                {
                    nameOnDisk: "auth"
                }
            ],
            file: {
                nameOnDisk: "OAuthTokenProvider.ts"
            }
        };
    }

    public buildIndexFile(): Code {
        return code`
            export type { AuthProvider } from "./AuthProvider";
            export type { AuthRequest } from "./AuthRequest";
            export { BasicAuth } from "./BasicAuth";
            export { BearerToken } from "./BearerToken";
            export { OAuthTokenProvider } from "./OAuthTokenProvider";
        `;
    }

    public buildFile({ context, oauthScheme }: { context: SdkContext; oauthScheme: OAuthScheme }): Code {
        switch (oauthScheme.configuration.type) {
            case "clientCredentials":
                return this.buildClientCredentialsFile({
                    context,
                    clientCredentials: oauthScheme.configuration,
                    authClientType: this.getAuthClientTypeName({ context, oauthScheme })
                });
            default:
                throw new Error(`OAuth for ${oauthScheme.configuration.type} is not supported yet.`);
        }
    }

    public getAuthClientTypeName({ context, oauthScheme }: { context: SdkContext; oauthScheme: OAuthScheme }): string {
        return getTextOfTsNode(
            context.sdkClientClass
                .getReferenceToClientClass(
                    oauthScheme.configuration.tokenEndpoint.endpointReference.subpackageId != null
                        ? {
                              isRoot: false,
                              subpackageId: oauthScheme.configuration.tokenEndpoint.endpointReference.subpackageId
                          }
                        : {
                              isRoot: true
                          }
                )
                .getEntityName()
        );
    }

    public buildClientCredentialsFile({
        context,
        clientCredentials,
        authClientType
    }: {
        context: SdkContext;
        clientCredentials: OAuthClientCredentials;
        authClientType: string;
    }): Code {
        const endpoint = Object.values(this.ir.services)
            .flatMap((service: HttpService) => service.endpoints)
            .find(
                (endpoint: HttpEndpoint) => endpoint.id === clientCredentials.tokenEndpoint.endpointReference.endpointId
            );
        if (endpoint == null) {
            throw new Error(
                `failed to find endpoint with id ${clientCredentials.tokenEndpoint.endpointReference.endpointId}`
            );
        }

        const requestProperties: OAuthAccessTokenRequestProperties = clientCredentials.tokenEndpoint.requestProperties;
        const responseProperties: OAuthAccessTokenResponseProperties =
            clientCredentials.tokenEndpoint.responseProperties;

        const clientIdType = getTextOfTsNode(
            context.type.getReferenceToType(
                clientCredentials.tokenEndpoint.requestProperties.clientId.property.valueType
            ).typeNode
        );
        const clientSecretType = getTextOfTsNode(
            context.type.getReferenceToType(
                clientCredentials.tokenEndpoint.requestProperties.clientSecret.property.valueType
            ).typeNode
        );

        return code`
            ${this.getImportStatements()}

            /**
             * The OAuthTokenProvider retrieves an OAuth access token, refreshing it as needed.
             * The access token is then used as the bearer token in every authenticated request.
             */
            export class ${OAuthTokenProviderGenerator.OAUTH_TOKEN_PROVIDER_CLASS_NAME} {
                ${this.getProperties({
                    authClientType,
                    clientIdType,
                    clientSecretType
                })}

                ${this.getConstructor({
                    authClientType,
                    clientIdType,
                    clientSecretType
                })}

                ${this.getTokenMethod({
                    responseProperties
                })}

                ${this.getRefreshMethod({
                    context,
                    getTokenEndpoint: endpoint,
                    requestProperties,
                    responseProperties
                })}

                ${this.getExpiresAtMethod({
                    responseProperties
                })}
            };
        `;
    }

    private getImportStatements(): Code {
        return code`
            import * as core from "../../core";
        `;
    }

    private getGenericSdkErrorType({ context }: { context: SdkContext }): string {
        return getTextOfTsNode(context.genericAPISdkError.getReferenceToGenericAPISdkError().getEntityName());
    }

    private getProperties({
        authClientType,
        clientIdType,
        clientSecretType
    }: {
        authClientType: string;
        clientIdType: string;
        clientSecretType: string;
    }): Code {
        return code`
            private readonly BUFFER_IN_MINUTES = 2;
            private readonly _clientId: core.Supplier<${clientIdType}>;
            private readonly _clientSecret: core.Supplier<${clientSecretType}>;
            private readonly _authClient: ${authClientType};
            private _accessToken: string | undefined;
            private _expiresAt: Date;
        `;
    }

    private getConstructor({
        authClientType,
        clientIdType,
        clientSecretType
    }: {
        authClientType: string;
        clientIdType: string;
        clientSecretType: string;
    }): Code {
        return code`
            constructor({
                clientId,
                clientSecret,
                authClient,
            }: {
                clientId: core.Supplier<${clientIdType}>;
                clientSecret: core.Supplier<${clientSecretType}>;
                authClient: ${authClientType};
            }) {
                this._clientId = clientId;
                this._clientSecret = clientSecret;
                this._authClient = authClient;
                this._expiresAt = new Date();
            } 
        `;
    }

    private getTokenMethod({ responseProperties }: { responseProperties: OAuthAccessTokenResponseProperties }): Code {
        if (responseProperties.expiresIn != null) {
            return code`
                public async getToken(): Promise<string> {
                    if (this._accessToken && this._expiresAt > new Date()) {
                        return this._accessToken;
                    }
                    return this.refresh();
                }
            `;
        }
        return code`
            public async getToken(): Promise<string> {
                if (this._accessToken) {
                    return this._accessToken;
                }
                return this._getToken();
            }
        `;
    }

    private getRefreshMethod({
        context,
        getTokenEndpoint,
        requestProperties,
        responseProperties
    }: {
        context: SdkContext;
        getTokenEndpoint: HttpEndpoint;
        requestProperties: OAuthAccessTokenRequestProperties;
        responseProperties: OAuthAccessTokenResponseProperties;
    }): Code {
        const clientIdProperty = this.getName(requestProperties.clientId.property.name);
        const clientSecretProperty = this.getName(requestProperties.clientSecret.property.name);
        const accessTokenProperty = context.type.generateGetterForResponsePropertyAsString({
            property: responseProperties.accessToken,
            variable: this.neverThrowErrors ? "tokenResponse.body" : "tokenResponse"
        });
        const handleNeverThrowErrors = this.getNeverThrowErrorsHandler({ context });
        if (responseProperties.expiresIn != null) {
            const expiresInProperty = context.type.generateGetterForResponsePropertyAsString({
                property: responseProperties.expiresIn,
                variable: this.neverThrowErrors ? "tokenResponse.body" : "tokenResponse"
            });
            return code`
                private async refresh(): Promise<string> {
                    const tokenResponse = await this._authClient.${this.getName(getTokenEndpoint.name)}({
                        ${clientIdProperty}: await core.Supplier.get(this._clientId),
                        ${clientSecretProperty}: await core.Supplier.get(this._clientSecret),
                    });
                    ${handleNeverThrowErrors}
                    this._accessToken = ${accessTokenProperty};
                    this._expiresAt = this.getExpiresAt(${expiresInProperty}, this.BUFFER_IN_MINUTES);
                    return this._accessToken;
                }
            `;
        }
        return code`
            private async _getToken(): Promise<string> {
                const tokenResponse = await this._authClient.${this.getName(getTokenEndpoint.name)}({
                    ${clientIdProperty}: await core.Supplier.get(this._clientId),
                    ${clientSecretProperty}: await core.Supplier.get(this._clientSecret),
                });
                ${handleNeverThrowErrors}
                this._accessToken = ${accessTokenProperty};
                return this._accessToken;
            }
        `;
    }

    private getNeverThrowErrorsHandler({ context }: { context: SdkContext }): Code {
        if (!this.neverThrowErrors) {
            return code``;
        }
        const errorType = this.getGenericSdkErrorType({ context });
        return code`if (!tokenResponse.ok) {
                throw new ${errorType}({ body: tokenResponse.error });
            }`;
    }

    private getExpiresAtMethod({
        responseProperties
    }: {
        responseProperties: OAuthAccessTokenResponseProperties;
    }): Code {
        if (responseProperties.expiresIn == null) {
            return code``;
        }
        return code`
            private getExpiresAt(expiresInSeconds: number, bufferInMinutes: number): Date {
                const now = new Date();
                return new Date(now.getTime() + expiresInSeconds * 1000 - bufferInMinutes * 60 * 1000);
            }
        `;
    }
    private getName(name: Name | NameAndWireValue): string {
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
}
