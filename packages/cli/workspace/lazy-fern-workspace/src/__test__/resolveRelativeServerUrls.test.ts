import { describe, expect, it } from "vitest";

import { isRelativeServerUrl, resolveRelativeServerUrls } from "../utils/resolveRelativeServerUrls.js";

const SPEC_URL = "https://petstore31.swagger.io/api/v31/openapi.json";

describe("resolveRelativeServerUrls", () => {
    it("resolves a root-relative server against the origin of the spec URL", () => {
        const resolved = resolveRelativeServerUrls({ openapi: "3.0.4", servers: [{ url: "/api/v31" }] }, SPEC_URL);

        expect(resolved).toEqual({ openapi: "3.0.4", servers: [{ url: "https://petstore31.swagger.io/api/v31" }] });
    });

    it("resolves a path-relative server against the directory of the spec URL", () => {
        const resolved = resolveRelativeServerUrls({ servers: [{ url: "v2" }, { url: "../v3" }] }, SPEC_URL);

        expect(resolved).toEqual({
            servers: [
                { url: "https://petstore31.swagger.io/api/v31/v2" },
                { url: "https://petstore31.swagger.io/api/v3" }
            ]
        });
    });

    it("keeps absolute servers, server variables and other server fields", () => {
        const servers = [
            { url: "https://api.example.com/v1", description: "prod" },
            { url: "{scheme}://api.example.com", variables: { scheme: { default: "https" } } }
        ];

        expect(resolveRelativeServerUrls({ servers }, SPEC_URL)).toEqual({ servers });
    });

    it("keeps variable braces in a relative server", () => {
        const resolved = resolveRelativeServerUrls({ servers: [{ url: "/api/{version}" }] }, SPEC_URL);

        expect(resolved).toEqual({ servers: [{ url: "https://petstore31.swagger.io/api/{version}" }] });
    });

    it("resolves path item and operation servers", () => {
        const resolved = resolveRelativeServerUrls(
            {
                paths: {
                    "/pets": {
                        servers: [{ url: "/pets-api" }],
                        get: { servers: [{ url: "/get-api" }], operationId: "listPets" },
                        parameters: []
                    }
                }
            },
            SPEC_URL
        );

        expect(resolved).toEqual({
            paths: {
                "/pets": {
                    servers: [{ url: "https://petstore31.swagger.io/pets-api" }],
                    get: { servers: [{ url: "https://petstore31.swagger.io/get-api" }], operationId: "listPets" },
                    parameters: []
                }
            }
        });
    });

    it("does not change the input document", () => {
        const document = { servers: [{ url: "/api/v31" }] };

        resolveRelativeServerUrls(document, SPEC_URL);

        expect(document).toEqual({ servers: [{ url: "/api/v31" }] });
    });

    it("returns a document without servers as it is", () => {
        expect(resolveRelativeServerUrls({ openapi: "3.0.0" }, SPEC_URL)).toEqual({ openapi: "3.0.0" });
        expect(resolveRelativeServerUrls("not a document", SPEC_URL)).toBe("not a document");
    });
});

describe("trailing slash and variable-prefixed servers", () => {
    it("does not add a trailing slash the spec did not have", () => {
        expect(resolveRelativeServerUrls({ servers: [{ url: "/" }, { url: "/api/" }] }, SPEC_URL)).toEqual({
            servers: [{ url: "https://petstore31.swagger.io/" }, { url: "https://petstore31.swagger.io/api/" }]
        });
        expect(resolveRelativeServerUrls({ servers: [{ url: "." }] }, SPEC_URL)).toEqual({
            servers: [{ url: "https://petstore31.swagger.io/api/v31" }]
        });
    });

    it("resolves a relative server that starts with a variable", () => {
        const resolved = resolveRelativeServerUrls(
            { servers: [{ url: "{stage}/api", variables: { stage: { default: "prod" } } }] },
            "https://example.com/specs/openapi.json"
        );

        expect(resolved).toEqual({
            servers: [{ url: "https://example.com/specs/{stage}/api", variables: { stage: { default: "prod" } } }]
        });
    });

    it("keeps a server whose variable default is a full address", () => {
        const servers = [{ url: "{base}/v1", variables: { base: { default: "https://api.example.com" } } }];

        expect(resolveRelativeServerUrls({ servers }, SPEC_URL)).toEqual({ servers });
    });
});

describe("isRelativeServerUrl", () => {
    it.each(["/api/v31", "v1", "../v1", "//api.example.com"])("treats %s as relative", (url) => {
        expect(isRelativeServerUrl(url)).toBe(true);
    });

    it.each([
        "https://api.example.com",
        "http://localhost:3000",
        "{scheme}://api.example.com"
    ])("treats %s as absolute", (url) => {
        expect(isRelativeServerUrl(url)).toBe(false);
    });
});
