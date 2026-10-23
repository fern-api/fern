import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("LOCAL_STORAGE_FOLDER", () => {
    const original = process.env.LOCAL_STORAGE_FOLDER;

    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        if (original == null) {
            delete process.env.LOCAL_STORAGE_FOLDER;
        } else {
            process.env.LOCAL_STORAGE_FOLDER = original;
        }
    });

    it("defaults to .fern", async () => {
        delete process.env.LOCAL_STORAGE_FOLDER;
        const { LOCAL_STORAGE_FOLDER } = await import("../fallbacks/localStorageFolder.js");
        expect(LOCAL_STORAGE_FOLDER).toBe(".fern");
    });

    it("uses the environment variable when it is set", async () => {
        process.env.LOCAL_STORAGE_FOLDER = ".fern-dev";
        const { LOCAL_STORAGE_FOLDER } = await import("../fallbacks/localStorageFolder.js");
        expect(LOCAL_STORAGE_FOLDER).toBe(".fern-dev");
    });
});
