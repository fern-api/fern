import { describe, expect, it } from "vitest";

import { substituteIdempotencyKeyHeaderName } from "../AsIsManager.js";

const HELPER_SOURCE = `export function getIdempotencyHeaders(): Record<string, string> {
    return { "Idempotency-Key": generateIdempotencyKey() };
}
`;

describe("substituteIdempotencyKeyHeaderName", () => {
    it("leaves the default header name untouched", () => {
        expect(substituteIdempotencyKeyHeaderName(HELPER_SOURCE, "Idempotency-Key")).toBe(HELPER_SOURCE);
    });

    it("swaps in a custom header name", () => {
        const result = substituteIdempotencyKeyHeaderName(HELPER_SOURCE, "X-Custom-Idem");
        expect(result).toContain('{ "X-Custom-Idem": generateIdempotencyKey() }');
        expect(result).not.toContain('"Idempotency-Key"');
    });
});
