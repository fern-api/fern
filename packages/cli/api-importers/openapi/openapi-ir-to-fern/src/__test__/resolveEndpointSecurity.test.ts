import { describe, expect, it } from "vitest";
import { resolveEndpointSecurity } from "../resolveEndpointSecurity.js";

describe("per-endpoint OpenAPI security", () => {
    const globalSecurity = [{ clientId: [], secret: [] }];

    it("retains inherited AND requirements instead of reducing them to auth: true", () => {
        expect(resolveEndpointSecurity(undefined, globalSecurity)).toEqual(globalSecurity);
    });

    it("does not send configured credentials to an explicit public operation", () => {
        expect(resolveEndpointSecurity([], globalSecurity)).toBe(false);
    });

    it("preserves explicit requirements even when they equal the root requirements", () => {
        expect(resolveEndpointSecurity(globalSecurity, globalSecurity)).toEqual(globalSecurity);
    });

    it("keeps operation overrides, OR alternatives, scopes and anonymous alternatives", () => {
        const override = [{ oauth: ["read"] }, { clientId: [], secret: [] }, {}];
        expect(resolveEndpointSecurity(override, globalSecurity)).toEqual(override);
    });

    it("keeps absent and empty root security unauthenticated", () => {
        expect(resolveEndpointSecurity(undefined, undefined)).toBe(false);
        expect(resolveEndpointSecurity(undefined, [])).toBe(false);
        expect(resolveEndpointSecurity([], undefined)).toBe(false);
    });

    it("retains operation security when the root is public", () => {
        expect(resolveEndpointSecurity(globalSecurity, [])).toEqual(globalSecurity);
    });
});
