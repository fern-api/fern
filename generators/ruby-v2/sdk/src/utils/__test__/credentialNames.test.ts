import { describe, expect, it } from "vitest";

import { bearerTokenParameterName, credentialParameterName, globalHeaderParameterName } from "../credentialNames.js";

describe("credentialParameterName", () => {
    it("uses the configured name as-is without respectAuthSchemeNames", () => {
        expect(credentialParameterName("api_key", false)).toBe("api_key");
        expect(credentialParameterName("base_url", false)).toBe("base_url");
    });

    it("keeps the configured credential name", () => {
        expect(credentialParameterName("api_key", true)).toBe("api_key");
        expect(credentialParameterName("token", true)).toBe("token");
    });

    it("suffixes names that would shadow a built-in client keyword", () => {
        expect(credentialParameterName("base_url", true)).toBe("base_url_auth");
        expect(credentialParameterName("environment", true)).toBe("environment_auth");
        expect(credentialParameterName("max_retries", true)).toBe("max_retries_auth");
        expect(credentialParameterName("app_info", true)).toBe("app_info_auth");
        expect(credentialParameterName("client", true)).toBe("client_auth");
        expect(credentialParameterName("request_options", true)).toBe("request_options_auth");
    });
});

describe("bearerTokenParameterName", () => {
    it("keeps the legacy token keyword without respectAuthSchemeNames", () => {
        expect(bearerTokenParameterName("api_key", false)).toBe("token");
        expect(bearerTokenParameterName(undefined, false)).toBe("token");
    });

    it("follows the configured token name with respectAuthSchemeNames", () => {
        expect(bearerTokenParameterName("api_key", true)).toBe("api_key");
    });

    it("falls back to token when the API declares no bearer auth", () => {
        expect(bearerTokenParameterName(undefined, true)).toBe("token");
    });

    it("suffixes a configured token name that would shadow a built-in client keyword", () => {
        expect(bearerTokenParameterName("environment", true)).toBe("environment_auth");
    });
});

describe("globalHeaderParameterName", () => {
    it("uses the header name as-is without respectAuthSchemeNames", () => {
        expect(globalHeaderParameterName("api_key", new Set(["api_key"]), false)).toBe("api_key");
    });

    it("keeps a header name that collides with nothing", () => {
        expect(globalHeaderParameterName("api_version", new Set(["api_key"]), true)).toBe("api_version");
    });

    it("prefixes a header name claimed by a credential", () => {
        expect(globalHeaderParameterName("api_key", new Set(["api_key"]), true)).toBe("header_api_key");
    });

    it("prefixes a header name that would shadow a built-in client keyword", () => {
        expect(globalHeaderParameterName("base_url", new Set(), true)).toBe("header_base_url");
    });
});
