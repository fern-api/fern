import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_FDR_ORIGIN_URL, getFdrOrigin } from "../fallbacks/fdrOrigin.js";

const VARIABLES = ["FERN_FDR_ORIGIN", "OVERRIDE_FDR_ORIGIN", "DEFAULT_FDR_ORIGIN"] as const;

describe("getFdrOrigin", () => {
    const original: Record<string, string | undefined> = {};

    beforeEach(() => {
        for (const name of VARIABLES) {
            original[name] = process.env[name];
            delete process.env[name];
        }
    });

    afterEach(() => {
        for (const name of VARIABLES) {
            if (original[name] == null) {
                delete process.env[name];
            } else {
                process.env[name] = original[name];
            }
        }
    });

    it("falls back to the production origin", () => {
        expect(getFdrOrigin()).toBe(DEFAULT_FDR_ORIGIN_URL);
    });

    it("prefers DEFAULT_FDR_ORIGIN over the production origin", () => {
        process.env.DEFAULT_FDR_ORIGIN = "https://default.example";
        expect(getFdrOrigin()).toBe("https://default.example");
    });

    it("prefers OVERRIDE_FDR_ORIGIN over DEFAULT_FDR_ORIGIN", () => {
        process.env.DEFAULT_FDR_ORIGIN = "https://default.example";
        process.env.OVERRIDE_FDR_ORIGIN = "https://override.example";
        expect(getFdrOrigin()).toBe("https://override.example");
    });

    it("prefers FERN_FDR_ORIGIN over everything else", () => {
        process.env.DEFAULT_FDR_ORIGIN = "https://default.example";
        process.env.OVERRIDE_FDR_ORIGIN = "https://override.example";
        process.env.FERN_FDR_ORIGIN = "https://fern.example";
        expect(getFdrOrigin()).toBe("https://fern.example");
    });
});
