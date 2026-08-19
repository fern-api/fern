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

function oauthScheme(configuration: Ir.auth.OAuthConfiguration): Ir.auth.AuthScheme {
    return Ir.auth.AuthScheme.oauth({
        key: "MyOAuth",
        docs: "Log in with OAuth",
        configuration
    });
}

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
});
