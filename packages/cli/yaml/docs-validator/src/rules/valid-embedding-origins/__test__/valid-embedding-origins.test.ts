import { docsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";

describe("validateEmbeddingOrigin", () => {
    it.each([
        "https://app.fernwood.example",
        "http://localhost:3000",
        "https://*.moss.example",
        "https://docs.fern-wood.example:8443"
    ])("accepts %s", (origin) => {
        expect(docsYml.validateEmbeddingOrigin(origin)).toBeUndefined();
    });

    it.each([
        "*",
        "*.example.com",
        "'self'",
        "'none'",
        "https://app.example.com/path",
        "https://app.example.com?x=1",
        "app.example.com",
        "ftp://app.example.com",
        "https://app.example.com https://evil.example",
        "https://app.example.com;",
        " https://app.example.com",
        ""
    ])("rejects %j", (origin) => {
        expect(docsYml.validateEmbeddingOrigin(origin)).toBeDefined();
    });
});
