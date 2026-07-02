import { describe, expect, it } from "vitest";

import { resolveEnhancedRequestBody } from "../enhanceExamplesWithAI.js";

describe("resolveEnhancedRequestBody", () => {
    it("drops an empty object body when the endpoint had no request example", () => {
        expect(resolveEnhancedRequestBody({}, undefined)).toBeUndefined();
        expect(resolveEnhancedRequestBody({}, null)).toBeUndefined();
    });

    it("drops a null/undefined body when the endpoint had no request example", () => {
        expect(resolveEnhancedRequestBody(undefined, undefined)).toBeUndefined();
        expect(resolveEnhancedRequestBody(null, undefined)).toBeUndefined();
    });

    it("keeps a non-empty body even when the endpoint had no request example", () => {
        expect(resolveEnhancedRequestBody({ name: "Fern" }, undefined)).toEqual({ name: "Fern" });
    });

    it("keeps an empty object body when the original example was an empty object", () => {
        expect(resolveEnhancedRequestBody({}, {})).toEqual({});
    });

    it("keeps the body when the original example exists", () => {
        expect(resolveEnhancedRequestBody({ name: "Fern" }, { name: "string" })).toEqual({ name: "Fern" });
    });
});
