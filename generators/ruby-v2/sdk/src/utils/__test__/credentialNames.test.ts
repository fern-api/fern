import { describe, expect, it } from "vitest";

import { credentialParameterName, globalHeaderParameterName } from "../credentialNames.js";

describe("credentialParameterName", () => {
    it("keeps the configured credential name", () => {
        expect(credentialParameterName("api_key")).toBe("api_key");
        expect(credentialParameterName("token")).toBe("token");
    });

    it("suffixes names that would shadow a built-in client keyword", () => {
        expect(credentialParameterName("base_url")).toBe("base_url_auth");
        expect(credentialParameterName("environment")).toBe("environment_auth");
        expect(credentialParameterName("max_retries")).toBe("max_retries_auth");
        expect(credentialParameterName("app_info")).toBe("app_info_auth");
        expect(credentialParameterName("client")).toBe("client_auth");
        expect(credentialParameterName("request_options")).toBe("request_options_auth");
    });
});

describe("globalHeaderParameterName", () => {
    it("keeps a header name that collides with nothing", () => {
        expect(globalHeaderParameterName("api_version", new Set(["api_key"]))).toBe("api_version");
    });

    it("prefixes a header name claimed by a credential", () => {
        expect(globalHeaderParameterName("api_key", new Set(["api_key"]))).toBe("header_api_key");
    });

    it("prefixes a header name that would shadow a built-in client keyword", () => {
        expect(globalHeaderParameterName("base_url", new Set())).toBe("header_base_url");
    });
});
