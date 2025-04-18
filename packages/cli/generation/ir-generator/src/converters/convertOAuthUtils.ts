import { RawSchemas } from "@fern-api/fern-definition-schema";

import { getRequestPropertyComponents, getResponsePropertyComponents } from "./services/convertProperty";

const DEFAULT_TOKEN_ENDPOINT: Omit<TokenEndpoint, "endpoint"> = {
    requestProperties: {
        type: "access_token",
        client_id: ["client_id"],
        client_secret: ["client_secret"],
        scopes: undefined
    },
    responseProperties: {
        type: "access_token",
        access_token: ["access_token"],
        expires_in: undefined,
        refresh_token: undefined
    }
};

const DEFAULT_REFRESH_TOKEN_ENDPOINT: Omit<RefreshTokenEndpoint, "endpoint"> = {
    requestProperties: {
        type: "refresh_token",
        refresh_token: ["refresh_token"]
    },
    responseProperties: {
        type: "access_token",
        access_token: ["access_token"],
        refresh_token: undefined,
        expires_in: undefined
    }
};

export interface TokenEndpoint {
    endpoint: string;
    requestProperties: OAuthAccessTokenRequestPropertyComponents;
    responseProperties: OAuthAccessTokenResponsePropertyComponents;
}

export interface RefreshTokenEndpoint {
    endpoint: string;
    requestProperties: OAuthRefreshTokenRequestPropertyComponents;
    responseProperties: OAuthAccessTokenResponsePropertyComponents;
}

interface OAuthAccessTokenRequestPropertyComponents {
    type: "access_token";
    client_id: string[];
    client_secret: string[];
    scopes: string[] | undefined;
}

interface OAuthAccessTokenResponsePropertyComponents {
    type: "access_token";
    access_token: string[];
    expires_in: string[] | undefined;
    refresh_token: string[] | undefined;
}

interface OAuthRefreshTokenRequestPropertyComponents {
    type: "refresh_token";
    refresh_token: string[];
}

export function getTokenEndpoint(oauthSchema: RawSchemas.OAuthSchemeSchema): TokenEndpoint {
    return {
        endpoint: oauthSchema["get-token"].endpoint,
        requestProperties: getTokenEndpointRequestProperties({
            requestProperties: oauthSchema["get-token"]?.["request-properties"]
        }),
        responseProperties: getTokenEndpointResponseProperties({
            responseProperties: oauthSchema["get-token"]?.["response-properties"]
        })
    };
}

export function getRefreshTokenEndpoint(oauthSchema: RawSchemas.OAuthSchemeSchema): RefreshTokenEndpoint | undefined {
    if (oauthSchema["refresh-token"] == null) {
        return undefined;
    }
    return {
        endpoint: oauthSchema["refresh-token"].endpoint,
        requestProperties: getRefreshTokenEndpointRequestProperties({
            requestProperties: oauthSchema["refresh-token"]?.["request-properties"]
        }),
        responseProperties: getRefreshTokenEndpointResponseProperties({
            responseProperties: oauthSchema["refresh-token"]?.["response-properties"]
        })
    };
}

function getTokenEndpointRequestProperties({
    requestProperties
}: {
    requestProperties: RawSchemas.OAuthAccessTokenRequestPropertiesSchema | undefined;
}): OAuthAccessTokenRequestPropertyComponents {
    if (requestProperties == null) {
        return DEFAULT_TOKEN_ENDPOINT.requestProperties;
    }
    const maybeClientId = requestProperties["client-id"];
    const maybeClientSecret = requestProperties["client-secret"];
    const maybeScopes = requestProperties.scopes;
    return {
        type: "access_token",
        client_id:
            maybeClientId != null
                ? getRequestPropertyComponents(maybeClientId)
                : DEFAULT_TOKEN_ENDPOINT.requestProperties.client_id,
        client_secret:
            maybeClientSecret != null
                ? getRequestPropertyComponents(maybeClientSecret)
                : DEFAULT_TOKEN_ENDPOINT.requestProperties.client_secret,
        scopes:
            maybeScopes != null
                ? getRequestPropertyComponents(maybeScopes)
                : DEFAULT_TOKEN_ENDPOINT.requestProperties.scopes
    };
}

function getTokenEndpointResponseProperties({
    responseProperties
}: {
    responseProperties: RawSchemas.OAuthAccessTokenResponsePropertiesSchema | undefined;
}): OAuthAccessTokenResponsePropertyComponents {
    return getTokenEndpointResponsePropertiesWithDefault({
        responseProperties,
        defaultValue: DEFAULT_TOKEN_ENDPOINT.responseProperties
    });
}

function getRefreshTokenEndpointRequestProperties({
    requestProperties
}: {
    requestProperties: RawSchemas.OAuthRefreshTokenRequestPropertiesSchema | undefined;
}): OAuthRefreshTokenRequestPropertyComponents {
    if (requestProperties == null) {
        return DEFAULT_REFRESH_TOKEN_ENDPOINT.requestProperties;
    }
    const maybeRefreshToken = requestProperties["refresh-token"];
    return {
        type: "refresh_token",
        refresh_token:
            maybeRefreshToken != null
                ? getRequestPropertyComponents(maybeRefreshToken)
                : DEFAULT_REFRESH_TOKEN_ENDPOINT.requestProperties.refresh_token
    };
}

function getRefreshTokenEndpointResponseProperties({
    responseProperties
}: {
    responseProperties: RawSchemas.OAuthAccessTokenResponsePropertiesSchema | undefined;
}): OAuthAccessTokenResponsePropertyComponents {
    return getTokenEndpointResponsePropertiesWithDefault({
        responseProperties,
        defaultValue: DEFAULT_REFRESH_TOKEN_ENDPOINT.responseProperties
    });
}

function getTokenEndpointResponsePropertiesWithDefault({
    responseProperties,
    defaultValue
}: {
    responseProperties: RawSchemas.OAuthAccessTokenResponsePropertiesSchema | undefined;
    defaultValue: OAuthAccessTokenResponsePropertyComponents;
}): OAuthAccessTokenResponsePropertyComponents {
    if (responseProperties == null) {
        return defaultValue;
    }
    const maybeAccessToken = responseProperties["access-token"];
    const maybeExpiresIn = responseProperties["expires-in"];
    const maybeRefreshToken = responseProperties["refresh-token"];
    return {
        type: "access_token",
        access_token:
            maybeAccessToken != null ? getResponsePropertyComponents(maybeAccessToken) : defaultValue.access_token,
        expires_in: maybeExpiresIn != null ? getResponsePropertyComponents(maybeExpiresIn) : defaultValue.expires_in,
        refresh_token:
            maybeRefreshToken != null ? getResponsePropertyComponents(maybeRefreshToken) : defaultValue.refresh_token
    };
}
