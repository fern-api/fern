import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr } from "@fern-api/ir-generator";
import { FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";
import path from "path";

import { generateIRFromPath } from "../../ir/__test__/generateAndSnapshotIR.js";

// Any fixture with at least one endpoint works — we replace its auth entirely below.
const FIXTURE_DIR = path.join(__dirname, "../../ir/__test__/fixtures/availability/fern");

function withOAuthScheme(
    ir: IntermediateRepresentation,
    configuration: FernIr.auth.OAuthConfiguration
): IntermediateRepresentation {
    return {
        ...ir,
        auth: {
            requirement: FernIr.auth.AuthSchemesRequirement.All,
            docs: undefined,
            schemes: [FernIr.auth.AuthScheme.oauth({ key: "MyOAuth", docs: undefined, configuration })]
        }
    };
}

describe("dynamic snippets for public-client OAuth flows", () => {
    let ir: IntermediateRepresentation;

    beforeAll(async () => {
        ir = await generateIRFromPath({
            absolutePathToWorkspace: AbsoluteFilePath.of(FIXTURE_DIR),
            workspaceName: "oauthPublicClientDynamic",
            audiences: { type: "all" }
        });
    });

    // The dynamic-snippets converter reads client-credentials-only fields
    // (`configuration.tokenEndpoint`) off the OAuth config. For public-client flows those fields
    // do not exist, so the converter must narrow on the configuration type first — otherwise it
    // throws while building snippets. These tests lock in that it produces an OAuth auth with no
    // custom properties rather than crashing.

    it("emits an OAuth auth with no custom properties for the authorization-code (PKCE) flow", () => {
        const irWithOAuth = withOAuthScheme(
            ir,
            FernIr.auth.OAuthConfiguration.authorizationCode({
                clientId: FernIr.auth.OAuthPublicClientId.literal("public-client-id"),
                authorizationUrl: "https://auth.example.com/authorize",
                tokenUrl: "https://auth.example.com/token",
                refreshUrl: undefined,
                redirectUri: undefined,
                redirectUriBackupPorts: undefined,
                successRedirectUrl: undefined,
                errorRedirectUrl: undefined,
                scopes: undefined,
                pkce: { method: FernIr.auth.OAuthPkceMethod.S256 },
                authorizationParameters: undefined,
                tokenParameters: undefined,
                refreshParameters: undefined,
                tokenHeader: undefined,
                tokenPrefix: undefined
            })
        );

        const dynamicIr = convertIrToDynamicSnippetsIr({
            ir: irWithOAuth,
            smartCasing: true,
            disableExamples: true
        });

        const endpoint = Object.values(dynamicIr.endpoints)[0];
        expect(endpoint).toBeDefined();
        expect(endpoint?.auth?.type).toBe("oauth");
        if (endpoint?.auth?.type === "oauth") {
            expect(endpoint.auth.customProperties).toBeUndefined();
        }
    });

    it("emits an OAuth auth with no custom properties for the device-code flow", () => {
        const irWithOAuth = withOAuthScheme(
            ir,
            FernIr.auth.OAuthConfiguration.deviceCode({
                clientId: FernIr.auth.OAuthPublicClientId.literal("public-client-id"),
                deviceAuthorizationUrl: "https://auth.example.com/device/code",
                tokenUrl: "https://auth.example.com/token",
                refreshUrl: undefined,
                scopes: undefined,
                deviceAuthorizationParameters: undefined,
                tokenParameters: undefined,
                refreshParameters: undefined,
                tokenHeader: undefined,
                tokenPrefix: undefined
            })
        );

        const dynamicIr = convertIrToDynamicSnippetsIr({
            ir: irWithOAuth,
            smartCasing: true,
            disableExamples: true
        });

        const endpoint = Object.values(dynamicIr.endpoints)[0];
        expect(endpoint).toBeDefined();
        expect(endpoint?.auth?.type).toBe("oauth");
        if (endpoint?.auth?.type === "oauth") {
            expect(endpoint.auth.customProperties).toBeUndefined();
        }
    });
});
