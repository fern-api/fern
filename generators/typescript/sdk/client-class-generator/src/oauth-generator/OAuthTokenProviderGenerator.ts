import { ExportedFilePath, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { Code, code } from "ts-poet";

import {
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    OAuthAccessTokenRequestProperties,
    OAuthAccessTokenResponseProperties,
    OAuthClientCredentials,
    OAuthScheme,
    ResponseProperty
} from "@fern-fern/ir-sdk/api";

export class OAuthTokenProviderGenerator {
    public static OAUTH_TOKEN_PROVIDER_CLASS_NAME = "OAuthTokenProvider";
    public static OAUTH_TOKEN_PROVIDER_PROPERTY_NAME = "_oauthTokenProvider";
    public static OAUTH_TOKEN_PROPERTY_NAME = "token";
    public static OAUTH_GET_TOKEN_METHOD_NAME = "getToken";
    public static OAUTH_CLIENT_ID_PROPERTY_NAME = "clientId";
    public static OAUTH_CLIENT_SECRET_PROPERTY_NAME = "clientSecret";
    public static OAUTH_AUTH_CLIENT_PROPERTY_NAME = "authClient";

    private ir: IntermediateRepresentation;
    private neverThrowErrors: boolean;

    constructor({
        intermediateRepresentation,
        neverThrowErrors
    }: {
        intermediateRepresentation: IntermediateRepresentation;
        neverThrowErrors: boolean;
    }) {
        this.ir = intermediateRepresentation;
        this.neverThrowErrors = neverThrowErrors;
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
        const clientIdProperty = requestProperties.clientId.property.name.name.camelCase.unsafeName;
        const clientSecretProperty = requestProperties.clientSecret.property.name.name.camelCase.unsafeName;
        const accessTokenProperty = this.responsePropertyToDotDelimitedAccessor({
            responseProperty: responseProperties.accessToken
        });
        const handleNeverThrowErrors = this.getNeverThrowErrorsHandler({ context });
        if (responseProperties.expiresIn != null) {
            const expiresInProperty = this.responsePropertyToDotDelimitedAccessor({
                responseProperty: responseProperties.expiresIn
            });
            return code`
                private async refresh(): Promise<string> {
                    const tokenResponse = await this._authClient.${getTokenEndpoint.name.camelCase.unsafeName}({
                        ${clientIdProperty}: await core.Supplier.get(this._clientId),
                        ${clientSecretProperty}: await core.Supplier.get(this._clientSecret),
                    });
                    ${handleNeverThrowErrors}
                    this._accessToken = tokenResponse.${accessTokenProperty};
                    this._expiresAt = this.getExpiresAt(tokenResponse.${expiresInProperty}, this.BUFFER_IN_MINUTES);
                    return this._accessToken;
                }
            `;
        }
        return code`
            private async _getToken(): Promise<string> {
                const tokenResponse = await this._authClient.${getTokenEndpoint.name.camelCase.unsafeName}({
                    ${clientIdProperty}: await core.Supplier.get(this._clientId),
                    ${clientSecretProperty}: await core.Supplier.get(this._clientSecret),
                });
                ${handleNeverThrowErrors}
                this._accessToken = tokenResponse.${accessTokenProperty};
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

    private responsePropertyToDotDelimitedAccessor({
        responseProperty
    }: {
        responseProperty: ResponseProperty;
    }): string {
        const prefix = this.neverThrowErrors ? "body." : "";
        const propertyPath = responseProperty.propertyPath;
        if (propertyPath == null || propertyPath.length === 0) {
            return prefix + responseProperty.property.name.name.camelCase.unsafeName;
        }
        return (
            prefix +
            propertyPath.map((name) => name.camelCase.unsafeName).join(".") +
            "." +
            responseProperty.property.name.name.camelCase.unsafeName
        );
    }
}
