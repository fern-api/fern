import { describe, expect, it } from "vitest";
import { validateCustomConfig } from "../customConfig.js";

describe("validateCustomConfig", () => {
    it("returns defaults (customCommands: true) for null/undefined", () => {
        expect(validateCustomConfig(null)).toEqual({ customCommands: true });
        expect(validateCustomConfig(undefined)).toEqual({ customCommands: true });
    });

    it("returns the empty result for an empty object (customCommands resolved at pipeline level)", () => {
        expect(validateCustomConfig({})).toEqual({});
    });

    it("accepts a string binaryName", () => {
        expect(validateCustomConfig({ binaryName: "acme-cli" })).toEqual({ binaryName: "acme-cli" });
    });

    it("ignores undefined binaryName explicitly set", () => {
        expect(validateCustomConfig({ binaryName: undefined })).toEqual({});
    });

    it("ignores unknown keys (forward-compatible)", () => {
        expect(validateCustomConfig({ binaryName: "x", futureField: 42 })).toEqual({ binaryName: "x" });
    });

    it("throws on non-string binaryName (number)", () => {
        expect(() => validateCustomConfig({ binaryName: 42 })).toThrow(/expected a string, got number/);
    });

    it("throws on non-string binaryName (object)", () => {
        expect(() => validateCustomConfig({ binaryName: {} })).toThrow(/expected a string, got object/);
    });

    it("throws on non-object input (string)", () => {
        expect(() => validateCustomConfig("acme")).toThrow(/expected an object, got string/);
    });

    it("throws on non-object input (array)", () => {
        expect(() => validateCustomConfig(["acme"])).toThrow(/expected an object, got array/);
    });

    it("accepts a boolean customCommands", () => {
        expect(validateCustomConfig({ customCommands: false })).toEqual({ customCommands: false });
    });

    it("throws on non-boolean customCommands", () => {
        expect(() => validateCustomConfig({ customCommands: "yes" })).toThrow(/expected a boolean, got string/);
    });

    it("accepts a string rootGroup", () => {
        expect(validateCustomConfig({ rootGroup: "api" })).toEqual({ rootGroup: "api" });
    });

    it("ignores undefined rootGroup explicitly set", () => {
        expect(validateCustomConfig({ rootGroup: undefined })).toEqual({});
    });

    it("throws on non-string rootGroup (number)", () => {
        expect(() => validateCustomConfig({ rootGroup: 42 })).toThrow(/expected a string, got number/);
    });

    it("throws on non-string rootGroup (boolean)", () => {
        expect(() => validateCustomConfig({ rootGroup: true })).toThrow(/expected a string, got boolean/);
    });

    it("accepts rootGroup with hyphens, underscores, and digits", () => {
        expect(validateCustomConfig({ rootGroup: "my-api_v2" })).toEqual({ rootGroup: "my-api_v2" });
    });

    it("throws on rootGroup with uppercase letters", () => {
        expect(() => validateCustomConfig({ rootGroup: "Api" })).toThrow(/contains invalid characters/);
    });

    it("throws on rootGroup starting with a digit", () => {
        expect(() => validateCustomConfig({ rootGroup: "2api" })).toThrow(/contains invalid characters/);
    });

    it("throws on rootGroup containing quotes (injection attempt)", () => {
        expect(() => validateCustomConfig({ rootGroup: 'api")); panic!("' })).toThrow(/contains invalid characters/);
    });

    it("throws on empty rootGroup", () => {
        expect(() => validateCustomConfig({ rootGroup: "" })).toThrow(/contains invalid characters/);
    });

    it("accepts OAuth client credentials, PKCE, and device-code flows", () => {
        expect(
            validateCustomConfig({
                oauth: [
                    {
                        scheme: "MachineOAuth",
                        flow: "client-credentials",
                        tokenUrl: "https://auth.example.com/token",
                        clientIdEnv: "ACME_CLIENT_ID",
                        clientSecretEnv: "ACME_CLIENT_SECRET",
                        scopes: ["read", "write"]
                    },
                    {
                        scheme: "BrowserOAuth",
                        flow: "pkce",
                        authorizationUrl: "https://auth.example.com/authorize",
                        tokenUrl: "https://auth.example.com/token",
                        clientId: "public-client",
                        redirectPort: 8765
                    },
                    {
                        scheme: "DeviceOAuth",
                        flow: "device-code",
                        deviceAuthorizationUrl: "https://auth.example.com/device",
                        tokenUrl: "https://auth.example.com/token",
                        clientId: "public-client"
                    }
                ]
            }).oauth
        ).toHaveLength(3);
    });

    it("rejects malformed OAuth config", () => {
        expect(() => validateCustomConfig({ oauth: {} })).toThrow(/expected an array/);
        expect(() =>
            validateCustomConfig({
                oauth: [{ scheme: "OAuth2", flow: "pkce", tokenUrl: "/token", clientId: "public" }]
            })
        ).toThrow(/authorizationUrl/);
        expect(() =>
            validateCustomConfig({
                oauth: [
                    {
                        scheme: "OAuth2",
                        flow: "pkce",
                        authorizationUrl: "https://auth.example.com/authorize",
                        tokenUrl: "/token",
                        clientId: "public"
                    }
                ]
            })
        ).toThrow(/absolute HTTP\(S\) URL/);
        expect(() =>
            validateCustomConfig({
                oauth: [
                    {
                        scheme: "OAuth2",
                        flow: "pkce",
                        authorizationUrl: "https://auth.example.com/authorize",
                        tokenUrl: "https://auth.example.com/token",
                        clientId: "public",
                        redirectPort: 70_000
                    }
                ]
            })
        ).toThrow(/between 1 and 65535/);
    });

    it("rejects duplicate OAuth schemes", () => {
        expect(() =>
            validateCustomConfig({
                oauth: [
                    {
                        scheme: "OAuth2",
                        flow: "client-credentials",
                        tokenUrl: "https://auth.example.com/token"
                    },
                    {
                        scheme: "OAuth2",
                        flow: "device-code",
                        deviceAuthorizationUrl: "https://auth.example.com/device",
                        tokenUrl: "https://auth.example.com/token",
                        clientId: "public"
                    }
                ]
            })
        ).toThrow(/duplicate scheme "OAuth2"/);
    });
});
