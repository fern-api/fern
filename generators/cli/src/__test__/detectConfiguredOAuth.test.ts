import { describe, expect, it } from "vitest";
import { detectConfiguredOAuthBindings } from "../detectConfiguredOAuth.js";

describe("detectConfiguredOAuthBindings", () => {
    it("emits client-credentials OAuth with scopes and default env vars", () => {
        const [binding] = detectConfiguredOAuthBindings({
            binaryName: "acme-cli",
            authSchemeNames: new Set(["OAuth2"]),
            oauth: [
                {
                    scheme: "OAuth2",
                    flow: "client-credentials",
                    tokenUrl: "https://auth.example.com/token",
                    scopes: ["read", "write"]
                }
            ]
        });

        expect(binding?.rustCall).toBe(
            '.auth(OAuth2Auth::new("OAuth2").token_url("https://auth.example.com/token").client_id_env("ACME_CLI_CLIENT_ID").client_secret_env("ACME_CLI_CLIENT_SECRET").scopes(["read", "write"]))'
        );
        expect(binding?.envVars).toEqual(["ACME_CLI_CLIENT_ID", "ACME_CLI_CLIENT_SECRET"]);
        expect(binding?.kind).toBe("oauth-client-credentials");
    });

    it("emits PKCE login with usability options", () => {
        const [binding] = detectConfiguredOAuthBindings({
            binaryName: "acme",
            authSchemeNames: new Set(["OAuth2"]),
            oauth: [
                {
                    scheme: "OAuth2",
                    flow: "pkce",
                    authorizationUrl: "https://auth.example.com/authorize",
                    tokenUrl: "https://auth.example.com/token",
                    clientId: "public-client",
                    scopes: ["read"],
                    redirectPort: 8765,
                    tokenPasteUrl: "https://app.example.com/tokens"
                }
            ]
        });

        expect(binding?.rustCall).toBe(
            '.login_flow(PkceLoginFlow::new("OAuth2").client_id("public-client").authorization_url("https://auth.example.com/authorize").token_url("https://auth.example.com/token").scopes(["read"]).redirect_port(8765).token_paste_url("https://app.example.com/tokens"))'
        );
        expect(binding?.envVars).toEqual([]);
        expect(binding?.kind).toBe("oauth-interactive");
    });

    it("emits device-code login", () => {
        const [binding] = detectConfiguredOAuthBindings({
            binaryName: "acme",
            authSchemeNames: new Set(["OAuth2"]),
            oauth: [
                {
                    scheme: "OAuth2",
                    flow: "device-code",
                    deviceAuthorizationUrl: "https://auth.example.com/device",
                    tokenUrl: "https://auth.example.com/token",
                    clientId: "public-client"
                }
            ]
        });

        expect(binding?.rustCall).toBe(
            '.login_flow(DeviceCodeLoginFlow::new("OAuth2").client_id("public-client").device_authorization_url("https://auth.example.com/device").token_url("https://auth.example.com/token"))'
        );
    });

    it("rejects a scheme that is not present in the IR", () => {
        expect(() =>
            detectConfiguredOAuthBindings({
                binaryName: "acme",
                authSchemeNames: new Set(["ApiKey"]),
                oauth: [
                    {
                        scheme: "OAuth2",
                        flow: "client-credentials",
                        tokenUrl: "https://auth.example.com/token"
                    }
                ]
            })
        ).toThrow(/not present in the Fern IR/);
    });
});
