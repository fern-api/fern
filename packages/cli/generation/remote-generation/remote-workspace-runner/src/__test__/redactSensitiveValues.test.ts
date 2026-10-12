import {
    normalizeSensitiveValues,
    redactPublicationIdentifier,
    redactSensitiveValues
} from "../redactSensitiveValues.js";

describe("redactSensitiveValues", () => {
    it("deduplicates secrets and sorts overlaps from longest to shortest", () => {
        expect(normalizeSensitiveValues(["token", "token-long", "token", ""])).toEqual(["token-long", "token"]);
        expect(redactSensitiveValues("token-long then token", ["token", "token-long", "token"])).toBe(
            "[REDACTED] then [REDACTED]"
        );
    });

    it("redacts secrets embedded in successful publication identifiers", () => {
        expect(
            redactPublicationIdentifier("https://registry.example.com/packages/secret-token", ["secret-token"])
        ).toBe("https://registry.example.com/packages/[REDACTED]");
    });
});
