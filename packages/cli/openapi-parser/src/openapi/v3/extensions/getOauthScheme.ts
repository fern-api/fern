import { HttpMethod } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export interface OAuthAccessTokenFields {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: string;
}

export interface OAuthRefreshTokenFields {
    refreshToken: string;
}

export interface OauthTokenEndpointExtension {
    path: string;
    method: HttpMethod;
    responseFields: OAuthAccessTokenFields;
}

export interface OauthRefreshTokenEndpointExtension {
    path: string;
    method: HttpMethod;
    // Where to put what
    requestFields: OAuthRefreshTokenFields;
    // Where to get what
    responseFields: OAuthAccessTokenFields;
}

export interface OauthAuthorizationCodeExtension {
    path: string;
    queryParameters: string[];
}

export interface OauthSecuritySchemeExtension {
    defaultScopes?: string[];
    tokenPrefix?: string;
    clientIdEnv?: string;
    clientSecretEnv?: string;
    authorizationCodeEnv?: string;
    redirectUri?: string;
    authorizationCode?: OauthAuthorizationCodeExtension;
    token: OauthTokenEndpointExtension;
    refresh?: OauthRefreshTokenEndpointExtension;
}

export function getOauthSecuritySchemeExtensions(
    securityScheme: OpenAPIV3.SecuritySchemeObject
): OauthSecuritySchemeExtension | undefined {
    return getExtension<OauthSecuritySchemeExtension>(securityScheme, FernOpenAPIExtension.FERN_OAUTH);
}
