import { describe, expect, it } from "vitest";

import { formatAutoVersionFallbackLog, parseAutoVersionFallbackReason } from "../autoversion/AutoVersionFallback";

describe("AutoVersionFallback", () => {
    it("formats a stable reason line and parses it back", () => {
        const line = formatAutoVersionFallbackLog("diff-too-large", "diff too large for FAI (61234KB, limit 50000KB)");
        expect(line).toBe(
            "AUTO versioning fallback: reason=diff-too-large (diff too large for FAI (61234KB, limit 50000KB))"
        );
        expect(parseAutoVersionFallbackReason(line)).toBe("diff-too-large");
    });

    it("omits empty details", () => {
        expect(formatAutoVersionFallbackLog("analysis-failed")).toBe(
            "AUTO versioning fallback: reason=analysis-failed"
        );
    });

    it("returns undefined for unrelated or unknown reasons", () => {
        expect(parseAutoVersionFallbackReason("AUTO versioning picked new version: 1.2.3")).toBeUndefined();
        expect(parseAutoVersionFallbackReason("AUTO versioning fallback: reason=something-else")).toBeUndefined();
    });
});
