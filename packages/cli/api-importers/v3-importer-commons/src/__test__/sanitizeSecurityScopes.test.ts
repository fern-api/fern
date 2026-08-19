import { describe, expect, it } from "vitest";
import { sanitizeSecurityScopes } from "../utils/sanitizeSecurityScopes.js";

describe("sanitizeSecurityScopes", () => {
    it("should return undefined for undefined input", () => {
        expect(sanitizeSecurityScopes(undefined)).toBeUndefined();
    });

    it("should return undefined for null input", () => {
        expect(sanitizeSecurityScopes(null as unknown as undefined)).toBeUndefined();
    });

    it("should pass through valid scopes unchanged", () => {
        const security = [{ oauth2: ["read", "write"] }, { apiKey: [] }];
        expect(sanitizeSecurityScopes(security)).toEqual([{ oauth2: ["read", "write"] }, { apiKey: [] }]);
    });

    it("should sanitize null scopes to empty arrays", () => {
        const security = [{ oauth2: null }];
        expect(sanitizeSecurityScopes(security)).toEqual([{ oauth2: [] }]);
    });

    it("should sanitize null scopes while preserving valid scopes in the same requirement", () => {
        const security = [{ oauth2: null, bearer: ["read"] }];
        expect(sanitizeSecurityScopes(security)).toEqual([{ oauth2: [], bearer: ["read"] }]);
    });

    it("should handle multiple requirements with mixed null and valid scopes", () => {
        const security = [{ oauth2: null }, { apiKey: [] }, { bearer: ["admin"] }];
        expect(sanitizeSecurityScopes(security)).toEqual([{ oauth2: [] }, { apiKey: [] }, { bearer: ["admin"] }]);
    });

    it("should handle empty security array", () => {
        expect(sanitizeSecurityScopes([])).toEqual([]);
    });
});
