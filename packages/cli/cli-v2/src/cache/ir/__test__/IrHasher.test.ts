import { describe, expect, it } from "vitest";
import { IrHasher } from "../IrHasher.js";

describe("IrHasher", () => {
    const hasher = new IrHasher();

    it("produces deterministic hashes", () => {
        const content = { name: "test", version: "1.0" };
        const hash1 = hasher.hash(content);
        const hash2 = hasher.hash(content);
        expect(hash1).toBe(hash2);
    });

    it("produces different hashes for different content", () => {
        const hash1 = hasher.hash({ name: "alpha" });
        const hash2 = hasher.hash({ name: "beta" });
        expect(hash1).not.toBe(hash2);
    });

    it("is independent of key order", () => {
        const hash1 = hasher.hash({ b: 1, a: 2 });
        const hash2 = hasher.hash({ a: 2, b: 1 });
        expect(hash1).toBe(hash2);
    });

    it("excludes fdrApiDefinitionId from hash computation", () => {
        const hash1 = hasher.hash({ name: "test", fdrApiDefinitionId: "abc-123" });
        const hash2 = hasher.hash({ name: "test", fdrApiDefinitionId: "xyz-789" });
        const hash3 = hasher.hash({ name: "test" });
        expect(hash1).toBe(hash2);
        expect(hash1).toBe(hash3);
    });

    it("hashFromJSON produces same hash as hash(JSON.parse(json))", () => {
        const json = JSON.stringify({ name: "test", version: "2.0" });
        const hashFromJSON = hasher.hashFromJSON(json);
        const hashFromParsed = hasher.hash(JSON.parse(json));
        expect(hashFromJSON).toBe(hashFromParsed);
    });

    it("sorts keys in nested objects", () => {
        const hash1 = hasher.hash({ outer: { z: 1, a: 2 } });
        const hash2 = hasher.hash({ outer: { a: 2, z: 1 } });
        expect(hash1).toBe(hash2);
    });

    it("preserves array order but sorts element keys", () => {
        const hash1 = hasher.hash({
            items: [
                { b: 1, a: 2 },
                { d: 3, c: 4 }
            ]
        });
        const hash2 = hasher.hash({
            items: [
                { a: 2, b: 1 },
                { c: 4, d: 3 }
            ]
        });
        expect(hash1).toBe(hash2);

        // Different array order should produce different hash
        const hash3 = hasher.hash({
            items: [
                { c: 4, d: 3 },
                { a: 2, b: 1 }
            ]
        });
        expect(hash1).not.toBe(hash3);
    });

    it("handles null values", () => {
        const hash = hasher.hash({ a: null });
        expect(hash).toBeDefined();
        expect(hash).toHaveLength(64);
    });

    it("produces a 64-character lowercase hex string", () => {
        const hash = hasher.hash({ anything: "value" });
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
});
