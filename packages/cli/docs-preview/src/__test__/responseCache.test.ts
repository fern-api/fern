import { describe, expect, it, vi } from "vitest";

import { ResponseCache } from "../ResponseCache";

describe("ResponseCache", () => {
    it("serializes on first access and returns cached string on subsequent calls", () => {
        const cache = new ResponseCache();
        const builder = vi.fn(() => ({ data: "test" }));

        const first = cache.getOrSerialize(undefined, builder);
        const second = cache.getOrSerialize(undefined, builder);

        expect(first).toBe('{"data":"test"}');
        expect(second).toBe(first);
        expect(builder).toHaveBeenCalledTimes(1);
    });

    it("caches different locales independently", () => {
        const cache = new ResponseCache();
        const enBuilder = vi.fn(() => ({ lang: "en" }));
        const frBuilder = vi.fn(() => ({ lang: "fr" }));

        const en = cache.getOrSerialize(undefined, enBuilder);
        const fr = cache.getOrSerialize("fr", frBuilder);

        expect(en).toBe('{"lang":"en"}');
        expect(fr).toBe('{"lang":"fr"}');
        expect(en).not.toBe(fr);
        expect(cache.size).toBe(2);
    });

    it("invalidate() clears all cached entries and forces re-serialization", () => {
        const cache = new ResponseCache();
        cache.getOrSerialize(undefined, () => ({ version: 1 }));
        cache.getOrSerialize("fr", () => ({ version: 1 }));
        expect(cache.size).toBe(2);

        cache.invalidate();
        expect(cache.size).toBe(0);

        const updatedBuilder = vi.fn(() => ({ version: 2 }));
        const result = cache.getOrSerialize(undefined, updatedBuilder);

        expect(result).toBe('{"version":2}');
        expect(updatedBuilder).toHaveBeenCalledTimes(1);
    });

    it("returns reference-equal strings for the same locale", () => {
        const cache = new ResponseCache();
        const builder = () => ({ big: "payload".repeat(1000) });

        const a = cache.getOrSerialize("ja", builder);
        const b = cache.getOrSerialize("ja", builder);

        // Same string reference — no re-allocation or re-serialization
        expect(a).toBe(b);
    });

    it("treats undefined and explicit locale as separate keys", () => {
        const cache = new ResponseCache();
        const defaultBuilder = vi.fn(() => ({ locale: "default" }));
        const enBuilder = vi.fn(() => ({ locale: "en" }));

        cache.getOrSerialize(undefined, defaultBuilder);
        cache.getOrSerialize("en", enBuilder);

        expect(cache.size).toBe(2);
        expect(defaultBuilder).toHaveBeenCalledTimes(1);
        expect(enBuilder).toHaveBeenCalledTimes(1);
    });
});
