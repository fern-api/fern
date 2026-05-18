import { describe, expect, it } from "vitest";

import { deepMergeGlobalWins, isPlainObject, mergeThemeOverride } from "../stitchGlobalTheme.js";

describe("isPlainObject", () => {
    it("returns true for plain objects", () => {
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject({ a: 1 })).toBe(true);
    });

    it("returns false for non-objects", () => {
        expect(isPlainObject(null)).toBe(false);
        expect(isPlainObject("string")).toBe(false);
        expect(isPlainObject(42)).toBe(false);
        expect(isPlainObject(undefined)).toBe(false);
    });

    it("returns false for arrays", () => {
        expect(isPlainObject([])).toBe(false);
        expect(isPlainObject([1, 2, 3])).toBe(false);
    });
});

describe("deepMergeGlobalWins", () => {
    it("keeps local-only fields when global doesn't define them", () => {
        const result = deepMergeGlobalWins({ a: 1, b: 2 }, { a: 99 });
        expect(result).toEqual({ a: 99, b: 2 });
    });

    it("global wins on conflicting scalar fields", () => {
        const result = deepMergeGlobalWins({ a: "local" }, { a: "global" });
        expect(result).toEqual({ a: "global" });
    });

    it("adds global-only fields", () => {
        const result = deepMergeGlobalWins({ a: 1 }, { b: 2 });
        expect(result).toEqual({ a: 1, b: 2 });
    });

    it("recurses into nested objects", () => {
        const local = { logo: { "right-text": "Docs", height: 28 } };
        const global = { logo: { dark: "dark.svg", light: "light.svg" } };
        const result = deepMergeGlobalWins(local, global);
        expect(result).toEqual({
            logo: { "right-text": "Docs", height: 28, dark: "dark.svg", light: "light.svg" }
        });
    });

    it("global wins on conflicting nested scalar", () => {
        const local = { logo: { href: "local.com", height: 28 } };
        const global = { logo: { href: "global.com" } };
        const result = deepMergeGlobalWins(local, global);
        expect(result).toEqual({ logo: { href: "global.com", height: 28 } });
    });

    it("global array replaces local array (no merge)", () => {
        const result = deepMergeGlobalWins({ items: [1, 2] }, { items: [3, 4, 5] });
        expect(result).toEqual({ items: [3, 4, 5] });
    });

    it("does not mutate inputs", () => {
        const local = { a: 1 };
        const global = { b: 2 };
        deepMergeGlobalWins(local, global);
        expect(local).toEqual({ a: 1 });
        expect(global).toEqual({ b: 2 });
    });
});

describe("mergeThemeOverride", () => {
    it("deep-merges object fields — logo example from the bug report", () => {
        const local = {
            logo: { "right-text": "Docs", height: 28 }
        } as never;
        const globalTheme = {
            logo: { href: "https://example.com", dark: "logo-dark.svg", light: "logo-light.svg" }
        };
        const result = mergeThemeOverride(local, globalTheme) as unknown as Record<string, unknown>;
        expect(result.logo).toEqual({
            href: "https://example.com",
            dark: "logo-dark.svg",
            light: "logo-light.svg",
            "right-text": "Docs",
            height: 28
        });
    });

    it("global scalar replaces local scalar (favicon)", () => {
        const local = { favicon: "local-favicon.ico" } as never;
        const globalTheme = { favicon: "global-favicon.ico" };
        const result = mergeThemeOverride(local, globalTheme) as unknown as Record<string, unknown>;
        expect(result.favicon).toBe("global-favicon.ico");
    });

    it("keeps local value when global doesn't define the field", () => {
        const local = { favicon: "local-favicon.ico" } as never;
        const result = mergeThemeOverride(local, {}) as unknown as Record<string, unknown>;
        expect(result.favicon).toBe("local-favicon.ico");
    });

    it("uses global value when local doesn't define the field", () => {
        const local = {} as never;
        const globalTheme = { favicon: "global-favicon.ico" };
        const result = mergeThemeOverride(local, globalTheme) as unknown as Record<string, unknown>;
        expect(result.favicon).toBe("global-favicon.ico");
    });

    it("normalizes kebab-case theme keys before merging", () => {
        const local = {} as never;
        const globalTheme = { "background-image": "bg.png" };
        const result = mergeThemeOverride(local, globalTheme) as unknown as Record<string, unknown>;
        expect(result.backgroundImage).toBe("bg.png");
    });

    it("background-image as string replaces local object", () => {
        const local = { backgroundImage: { dark: "dark-bg.png" } } as never;
        const globalTheme = { "background-image": "flat-bg.png" };
        const result = mergeThemeOverride(local, globalTheme) as unknown as Record<string, unknown>;
        expect(result.backgroundImage).toBe("flat-bg.png");
    });
});
