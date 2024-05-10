import { RawSchemas } from "@fern-api/yaml-schema";
import { getRequestPropertyComponents, getResponsePropertyComponents } from "./services/convertProperty";

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
    // const maybeScopes = oauthSchema["get-token"]["request-properties"].scopes;
    const maybeExpiresIn = oauthSchema["get-token"]["response-properties"]["expires-in"];
    const maybeRefreshToken = oauthSchema["get-token"]["response-properties"]["refresh-token"];
    return {
        endpoint: oauthSchema["get-token"].endpoint,
        // TODO: Update the YAML schema and make this configurable with the following:
        // requestProperties: {
        //     type: "access_token",
        //     client_id: getRequestPropertyComponents(oauthSchema["get-token"]["request-properties"]["client-id"]),
        //     client_secret: getRequestPropertyComponents(
        //         oauthSchema["get-token"]["request-properties"]["client-secret"]
        //     ),
        //     scopes: maybeScopes != null ? getRequestPropertyComponents(maybeScopes) : undefined
        // },
        requestProperties: {
            type: "access_token",
            client_id: ["client_id"],
            client_secret: ["client_secret"],
            scopes: undefined
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
