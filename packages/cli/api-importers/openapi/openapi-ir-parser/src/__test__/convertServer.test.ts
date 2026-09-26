import { describe, expect, it } from "vitest";

import { convertServer } from "../openapi/v3/converters/convertServer.js";

describe("convertServer", () => {
    it("substitutes a server variable that holds the whole base url", () => {
        expect(
            convertServer({
                url: "{baseUrl}",
                variables: { baseUrl: { default: "https://api.example.com" } }
            }).url
        ).toBe("https://api.example.com");
    });

    it("keeps slashes in a server variable default", () => {
        expect(
            convertServer({
                url: "https://api.example.com/{basePath}",
                variables: { basePath: { default: "api/v1" } }
            }).url
        ).toBe("https://api.example.com/api/v1");
    });

    it("substitutes every occurrence of a server variable", () => {
        expect(
            convertServer({
                url: "https://{region}.api.example.com/{region}",
                variables: { region: { default: "us-east-1" } }
            }).url
        ).toBe("https://us-east-1.api.example.com/us-east-1");
    });

    it("escapes query and fragment delimiters in a path segment default", () => {
        expect(
            convertServer({
                url: "https://api.example.com/{tenant}/v1",
                variables: { tenant: { default: "foo?bar#baz" } }
            }).url
        ).toBe("https://api.example.com/foo%3Fbar%23baz/v1");
    });

    it("does not read dollar sequences in a default as replacement patterns", () => {
        expect(
            convertServer({
                url: "https://api.example.com/{tenant}",
                variables: { tenant: { default: "a$&b$$c" } }
            }).url
        ).toBe("https://api.example.com/a$&b$$c");
    });
});
