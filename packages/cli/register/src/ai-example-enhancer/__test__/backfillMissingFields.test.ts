import { describe, expect, it } from "vitest";

import { backfillMissingFields, unwrapLambdaBodyEnvelope } from "../enhanceExamplesWithAI.js";

describe("backfillMissingFields", () => {
    it("backfills missing fields from original into enhanced", () => {
        const enhanced = { channelIds: [101, 202] };
        const original = {
            firstName: "string",
            lastName: "string",
            email: "string",
            role: "string",
            companyId: 1,
            channelIds: [1]
        };

        const result = backfillMissingFields(enhanced, original);
        expect(result).toEqual({
            firstName: "string",
            lastName: "string",
            email: "string",
            role: "string",
            companyId: 1,
            channelIds: [101, 202]
        });
    });

    it("preserves AI values when both have the same field", () => {
        const enhanced = { name: "Jane Doe", email: "jane@example.com" };
        const original = { name: "string", email: "string", age: 1 };

        const result = backfillMissingFields(enhanced, original);
        expect(result).toEqual({
            name: "Jane Doe",
            email: "jane@example.com",
            age: 1
        });
    });

    it("returns enhanced unchanged when no fields are missing", () => {
        const enhanced = { a: 1, b: 2 };
        const original = { a: 0, b: 0 };

        const result = backfillMissingFields(enhanced, original);
        expect(result).toBe(enhanced);
    });

    it("returns enhanced when enhanced is not an object", () => {
        expect(backfillMissingFields("hello", { a: 1 })).toBe("hello");
        expect(backfillMissingFields(42, { a: 1 })).toBe(42);
        expect(backfillMissingFields(null, { a: 1 })).toBe(null);
    });

    it("returns enhanced when original is not an object", () => {
        const enhanced = { a: 1 };
        expect(backfillMissingFields(enhanced, "hello")).toBe(enhanced);
        expect(backfillMissingFields(enhanced, null)).toBe(enhanced);
        expect(backfillMissingFields(enhanced, 42)).toBe(enhanced);
    });

    it("returns enhanced when both are arrays", () => {
        const enhanced = [1, 2, 3];
        const original = [4, 5, 6, 7];
        expect(backfillMissingFields(enhanced, original)).toBe(enhanced);
    });

    it("handles empty enhanced object by filling all fields from original", () => {
        const enhanced = {};
        const original = { firstName: "string", lastName: "string" };

        const result = backfillMissingFields(enhanced, original);
        expect(result).toEqual({ firstName: "string", lastName: "string" });
    });

    it("handles empty original object with no backfill needed", () => {
        const enhanced = { a: 1 };
        const result = backfillMissingFields(enhanced, {});
        expect(result).toBe(enhanced);
    });
});

describe("unwrapLambdaBodyEnvelope", () => {
    it("unwraps {body: {...}} envelope", () => {
        const wrapped = { body: { channelIds: [101, 202] } };
        const result = unwrapLambdaBodyEnvelope(wrapped);
        expect(result.wasWrapped).toBe(true);
        expect(result.inner).toEqual({ channelIds: [101, 202] });
    });

    it("does not unwrap when body is not the only key", () => {
        const notWrapped = { body: { a: 1 }, extra: "field" };
        const result = unwrapLambdaBodyEnvelope(notWrapped);
        expect(result.wasWrapped).toBe(false);
        expect(result.inner).toBe(notWrapped);
    });

    it("does not unwrap non-objects", () => {
        expect(unwrapLambdaBodyEnvelope("hello")).toEqual({ wasWrapped: false, inner: "hello" });
        expect(unwrapLambdaBodyEnvelope(null)).toEqual({ wasWrapped: false, inner: null });
        expect(unwrapLambdaBodyEnvelope(42)).toEqual({ wasWrapped: false, inner: 42 });
    });

    it("does not unwrap arrays", () => {
        const arr = [1, 2, 3];
        expect(unwrapLambdaBodyEnvelope(arr)).toEqual({ wasWrapped: false, inner: arr });
    });

    it("backfills correctly through body envelope", () => {
        const wrapped = { body: { channelIds: [101, 202] } };
        const original = {
            firstName: "string",
            lastName: "string",
            email: "string",
            channelIds: [1]
        };

        const unwrapped = unwrapLambdaBodyEnvelope(wrapped);
        expect(unwrapped.wasWrapped).toBe(true);

        const backfilled = backfillMissingFields(unwrapped.inner, original);
        expect(backfilled).toEqual({
            firstName: "string",
            lastName: "string",
            email: "string",
            channelIds: [101, 202]
        });
    });
});
