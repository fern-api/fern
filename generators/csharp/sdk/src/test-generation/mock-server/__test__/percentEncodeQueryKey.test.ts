import { readFileSync } from "fs";

import { percentEncodeQueryKey, SAFE_QUERY_KEY_CHARS } from "../MockEndpointGenerator.js";

describe("percentEncodeQueryKey", () => {
    it("leaves safe characters unencoded", () => {
        expect(percentEncodeQueryKey("filter.name")).toBe("filter.name");
    });

    it("encodes brackets", () => {
        expect(percentEncodeQueryKey("page[size]")).toBe("page%5Bsize%5D");
    });

    it("encodes semicolons", () => {
        expect(percentEncodeQueryKey("filter;mode")).toBe("filter%3Bmode");
    });

    it("matches the safe query key characters the SDK ships", () => {
        // WireMock.Net matches param names against the raw, still-encoded query key, so the
        // generated stubs only match if this set is identical to the SDK's SafeQueryKeyChars.
        const template = readFileSync(
            new URL("../../../../../base/src/asIs/QueryStringBuilder.Template.cs", import.meta.url),
            "utf-8"
        );
        const match = template.match(/private const string SafeQueryKeyChars =\s*"([^"]+)";/);
        expect(match?.[1]).toBeDefined();
        expect(new Set(match?.[1])).toEqual(SAFE_QUERY_KEY_CHARS);
    });
});
