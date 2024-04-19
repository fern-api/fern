import { RawSchemas } from "@fern-api/yaml-schema";
import { getRequestPropertyComponents, getResponsePropertyComponents } from "./services/convertProperty";

export interface TokenEndpoint {
    endpoint: string;
    responseProperties: OAuthAccessTokenPropertyComponents;
}

export interface RefreshTokenEndpoint {
    endpoint: string;
    requestProperties: OAuthRefreshTokenPropertyComponents;
    responseProperties: OAuthAccessTokenPropertyComponents;
}

interface OAuthAccessTokenPropertyComponents {
    type: "access_token";
    access_token: string[];
    expires_in: string[] | undefined;
    refresh_token: string[] | undefined;
}

interface OAuthRefreshTokenPropertyComponents {
    type: "refresh_token";
    refresh_token: string[];
}

export function getTokenEndpoint(oauthSchema: RawSchemas.OAuthSchemeSchema): TokenEndpoint {
    const maybeExpiresIn = oauthSchema["get-token"]["response-properties"]["expires-in"];
    const maybeRefreshToken = oauthSchema["get-token"]["response-properties"]["refresh-token"];
    return {
        endpoint: oauthSchema["get-token"].endpoint,
        responseProperties: {
            type: "access_token",
            access_token: getResponsePropertyComponents(
                oauthSchema["get-token"]["response-properties"]["access-token"]
            ),
            expires_in: maybeExpiresIn != null ? getResponsePropertyComponents(maybeExpiresIn) : undefined,
            refresh_token: maybeRefreshToken != null ? getResponsePropertyComponents(maybeRefreshToken) : undefined
        }
    };
}

export function getRefreshTokenEndpoint(oauthSchema: RawSchemas.OAuthSchemeSchema): RefreshTokenEndpoint | undefined {
    if (oauthSchema["refresh-token"] == null) {
        return undefined;
    }
    const maybeExpiresIn = oauthSchema["get-token"]["response-properties"]["expires-in"];
    const maybeRefreshToken = oauthSchema["get-token"]["response-properties"]["refresh-token"];
    return {
        endpoint: oauthSchema["refresh-token"].endpoint,
        requestProperties: {
            type: "refresh_token",
            refresh_token: getRequestPropertyComponents(
                oauthSchema["refresh-token"]["request-properties"]["refresh-token"]
            )
        },
        responseProperties: {
            type: "access_token",
            access_token: getResponsePropertyComponents(
                oauthSchema["get-token"]["response-properties"]["access-token"]
            ),
            expires_in: maybeExpiresIn != null ? getResponsePropertyComponents(maybeExpiresIn) : undefined,
            refresh_token: maybeRefreshToken != null ? getResponsePropertyComponents(maybeRefreshToken) : undefined
        }
    };
}
