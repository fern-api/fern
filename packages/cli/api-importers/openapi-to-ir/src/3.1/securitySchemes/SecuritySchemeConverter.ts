import { AuthScheme } from "@fern-api/ir-sdk";
import { AbstractConverter } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";

import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1.js";

interface SecuritySchemeNames {
    name?: string;
    env?: string;
}

interface BasicSecuritySchemeExtension {
    username?: SecuritySchemeNames;
    password?: SecuritySchemeNames;
}

interface BearerSecuritySchemeExtension {
    name?: string;
    env?: string;
}

interface HeaderSecuritySchemeExtension {
    name?: string;
    env?: string;
    prefix?: string;
}

export interface OAuth2FlowInfo {
    schemeId: string;
    tokenUrl: string;
    refreshUrl?: string;
    scopes?: Record<string, string>;
    description?: string;
}

export declare namespace SecuritySchemeConverter {
    export interface Args extends AbstractConverter.Args<OpenAPIConverterContext3_1> {
        securityScheme: OpenAPIV3_1.SecuritySchemeObject;
        schemeId: string;
    }
}

export class SecuritySchemeConverter extends AbstractConverter<OpenAPIConverterContext3_1, AuthScheme> {
    private readonly securityScheme: OpenAPIV3_1.SecuritySchemeObject;
    private readonly schemeId: string;
    private _oAuth2FlowInfo: OAuth2FlowInfo | undefined;

    constructor({ context, breadcrumbs, securityScheme, schemeId }: SecuritySchemeConverter.Args) {
        super({ context, breadcrumbs });
        this.securityScheme = securityScheme;
        this.schemeId = schemeId;
    }

    private getExtension<T>(key: string): T | undefined {
        const value = (this.securityScheme as unknown as Record<string, unknown>)[key];
        return value as T | undefined;
    }

    public get oAuth2FlowInfo(): OAuth2FlowInfo | undefined {
        return this._oAuth2FlowInfo;
    }

    public convert(): AuthScheme | undefined {
        switch (this.securityScheme.type) {
            case "http": {
                // Case insensitivity for securityScheme.scheme required per OAS spec
                if (this.securityScheme.scheme?.toLowerCase() === "bearer") {
                    const bearerExtension = this.getExtension<BearerSecuritySchemeExtension>("x-fern-bearer");
                    const tokenName = bearerExtension?.name ?? "token";
                    const tokenEnvVar = bearerExtension?.env;
                    return AuthScheme.bearer({
                        key: this.schemeId,
                        token: this.context.casingsGenerator.generateName(tokenName),
                        tokenEnvVar,
                        docs: this.securityScheme.description
                    });
                }
                if (this.securityScheme.scheme?.toLowerCase() === "basic") {
                    const basicExtension = this.getExtension<BasicSecuritySchemeExtension>("x-fern-basic");
                    const usernameName = basicExtension?.username?.name ?? "username";
                    const passwordName = basicExtension?.password?.name ?? "password";
                    const usernameEnvVar = basicExtension?.username?.env;
                    const passwordEnvVar = basicExtension?.password?.env;
                    return AuthScheme.basic({
                        key: this.schemeId,
                        username: this.context.casingsGenerator.generateName(usernameName),
                        password: this.context.casingsGenerator.generateName(passwordName),
                        usernameEnvVar,
                        passwordEnvVar,
                        usernameOmit: false,
                        passwordOmit: false,
                        docs: this.securityScheme.description
                    });
                }
                break;
            }
            case "apiKey": {
                if (this.securityScheme.in === "header") {
                    const headerExtension = this.getExtension<HeaderSecuritySchemeExtension>("x-fern-header");
                    const headerName = headerExtension?.name ?? "apiKey";
                    const headerEnvVar = headerExtension?.env;
                    const prefix = headerExtension?.prefix;
                    return AuthScheme.header({
                        key: this.schemeId,
                        name: {
                            name: this.context.casingsGenerator.generateName(headerName),
                            wireValue: this.securityScheme.name
                        },
                        valueType: AbstractConverter.OPTIONAL_STRING,
                        prefix,
                        headerEnvVar,
                        docs: this.securityScheme.description
                    });
                }
                break;
            }
            case "oauth2": {
                this._oAuth2FlowInfo = this.extractOAuth2FlowInfo();
                // Return bearer as a fallback; OpenAPIConverter.resolveOAuthSchemes()
                // will upgrade this to AuthScheme.oauth() after endpoints are converted.
                return AuthScheme.bearer({
                    key: this.schemeId,
                    token: this.context.casingsGenerator.generateName("token"),
                    tokenEnvVar: undefined,
                    docs: this.securityScheme.description
                });
            }
        }
        return undefined;
    }

    private extractOAuth2FlowInfo(): OAuth2FlowInfo | undefined {
        if (this.securityScheme.type !== "oauth2") {
            return undefined;
        }
        const oauthScheme = this.securityScheme as OpenAPIV3_1.OAuth2SecurityScheme;
        const clientCredentials = oauthScheme.flows?.clientCredentials;
        if (clientCredentials != null) {
            return {
                schemeId: this.schemeId,
                tokenUrl: clientCredentials.tokenUrl,
                refreshUrl: clientCredentials.refreshUrl,
                scopes: clientCredentials.scopes,
                description: oauthScheme.description
            };
        }
        // Also check authorizationCode flow as a fallback
        const authorizationCode = oauthScheme.flows?.authorizationCode;
        if (authorizationCode != null) {
            return {
                schemeId: this.schemeId,
                tokenUrl: authorizationCode.tokenUrl,
                refreshUrl: authorizationCode.refreshUrl,
                scopes: authorizationCode.scopes,
                description: oauthScheme.description
            };
        }
        return undefined;
    }
}
