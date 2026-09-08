import { FernIr as Ir } from "@fern-api/ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";

import { convertAuth } from "../convertAuth.js";

function apiAuthWithScheme(scheme: Ir.auth.AuthScheme): Ir.auth.ApiAuth {
    return {
        requirement: Ir.auth.AuthSchemesRequirement.All,
        docs: undefined,
        schemes: [scheme]
    };
}

function oauthScheme(configuration: Ir.auth.OAuthConfiguration, playgroundDocs?: string): Ir.auth.AuthScheme {
    return Ir.auth.AuthScheme.oauth({
        key: "MyOAuth",
        docs: "Log in with OAuth",
        playgroundDocs,
        configuration
    });
}

const STRING_TYPE = Ir.types.TypeReference.primitive({ v1: Ir.types.PrimitiveTypeV1.String, v2: undefined });

function bodyProperty(wireValue: string): Ir.http.RequestProperty {
    return {
        propertyPath: undefined,
        property: Ir.http.RequestPropertyValue.body({
            name: { wireValue, name: wireValue },
            valueType: STRING_TYPE,
            propertyAccess: undefined,
            defaultValue: undefined,
            v2Examples: undefined,
            docs: undefined,
            availability: undefined
        })
    };
}

const CLIENT_CREDENTIALS_CONFIG = Ir.auth.OAuthConfiguration.clientCredentials({
    clientIdEnvVar: undefined,
    clientSecretEnvVar: undefined,
    tokenPrefix: "Bearer",
    tokenHeader: "Authorization",
    scopes: undefined,
    tokenEndpoint: {
        endpointReference: {
            endpointId: "endpoint_auth.getToken",
            serviceId: "service_auth",
            subpackageId: undefined
        },
        requestProperties: {
            clientId: bodyProperty("client_id"),
            clientSecret: bodyProperty("client_secret"),
            scopes: undefined,
            customProperties: undefined
        },
        responseProperties: {
            accessToken: {
                propertyPath: undefined,
                property: {
                    name: { wireValue: "access_token", name: "access_token" },
                    valueType: STRING_TYPE,
                    propertyAccess: undefined,
                    defaultValue: undefined,
                    v2Examples: undefined,
                    docs: undefined,
                    availability: undefined
                }
            },
            expiresIn: undefined,
            refreshToken: undefined
        }
    },
    refreshEndpoint: undefined
});

const AUTHORIZATION_CODE_CONFIG = Ir.auth.OAuthConfiguration.authorizationCode({
    clientId: Ir.auth.OAuthPublicClientId.literal("public-client-id"),
    authorizationUrl: "https://auth.example.com/authorize",
    tokenUrl: "https://auth.example.com/token",
    refreshUrl: undefined,
    redirectUri: undefined,
    redirectUriBackupPorts: undefined,
    successRedirectUrl: undefined,
    errorRedirectUrl: undefined,
    scopes: undefined,
    pkce: { method: Ir.auth.OAuthPkceMethod.S256 },
    authorizationParameters: undefined,
    tokenParameters: undefined,
    refreshParameters: undefined,
    tokenHeader: undefined,
    tokenPrefix: undefined
});

const DEVICE_CODE_CONFIG = Ir.auth.OAuthConfiguration.deviceCode({
    clientId: Ir.auth.OAuthPublicClientId.literal("public-client-id"),
    deviceAuthorizationUrl: "https://auth.example.com/device/code",
    tokenUrl: "https://auth.example.com/token",
    refreshUrl: undefined,
    scopes: undefined,
    deviceAuthorizationParameters: undefined,
    tokenParameters: undefined,
    refreshParameters: undefined,
    tokenHeader: undefined,
    tokenPrefix: undefined
});

describe("convertAuth", () => {
    it("surfaces the authorization-code (PKCE) flow to FDR as a bearer scheme", () => {
        const auth = apiAuthWithScheme(oauthScheme(AUTHORIZATION_CODE_CONFIG));

        const result = convertAuth({ auth, context: createMockTaskContext() });

        expect(result).toEqual({
            type: "bearerAuth",
            tokenName: "token",
            description: "Log in with OAuth"
        });
    });

    it("surfaces the device-code flow to FDR as a bearer scheme", () => {
        const auth = apiAuthWithScheme(oauthScheme(DEVICE_CODE_CONFIG));

        const result = convertAuth({ auth, context: createMockTaskContext() });

        expect(result).toEqual({
            type: "bearerAuth",
            tokenName: "token",
            description: "Log in with OAuth"
        });
    });

    it("keeps the authorization-code flow as a bearer scheme even when the OAuth playground is enabled", () => {
        // The playground `oAuth` config only models the client-credentials token exchange, so the
        // public-client browser flow must never be lowered to it — otherwise the playground would
        // try to run a token endpoint that does not exist for this grant.
        const auth = apiAuthWithScheme(oauthScheme(AUTHORIZATION_CODE_CONFIG));

        const result = convertAuth({ auth, playgroundConfig: { oauth: true }, context: createMockTaskContext() });

        expect(result).toEqual({
            type: "bearerAuth",
            tokenName: "token",
            description: "Log in with OAuth"
        });
    });

    it("keeps docs and playgroundDocs separate for the client-credentials OAuth playground", () => {
        const auth = apiAuthWithScheme(oauthScheme(CLIENT_CREDENTIALS_CONFIG, "Create credentials in the console"));

        const result = convertAuth({ auth, playgroundConfig: { oauth: true }, context: createMockTaskContext() });

        expect(result).toEqual({
            type: "oAuth",
            value: {
                type: "clientCredentials",
                value: {
                    type: "referencedEndpoint",
                    endpointId: "endpoint_auth.getToken",
                    accessTokenLocator: "$.body.access_token",
                    headerName: "Authorization",
                    tokenPrefix: "Bearer",
                    description: "Log in with OAuth",
                    playgroundDescription: "Create credentials in the console"
                }
            }
        });
    });

    it("falls back to a bearer scheme with playgroundDocs when the OAuth playground is disabled", () => {
        const auth = apiAuthWithScheme(oauthScheme(CLIENT_CREDENTIALS_CONFIG, "Create credentials in the console"));

        const result = convertAuth({ auth, context: createMockTaskContext() });

        expect(result).toEqual({
            type: "bearerAuth",
            tokenName: "token",
            description: "Log in with OAuth",
            playgroundDescription: "Create credentials in the console"
        });
    });
});
