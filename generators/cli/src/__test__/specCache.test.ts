import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SpecCache } from "../specCache.js";

describe("SpecCache", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "specCache-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("parses and returns the JSON on first read", async () => {
        const specPath = path.join(tmpDir, "openapi.json");
        await writeFile(specPath, JSON.stringify({ openapi: "3.0.0", info: { title: "My API" } }));

        const cache = new SpecCache();
        const parsed = await cache.read(specPath);
        expect(parsed?.info?.title).toBe("My API");
    });

    it("returns the same object on second read — no second disk hit", async () => {
        const specPath = path.join(tmpDir, "openapi.json");
        await writeFile(specPath, JSON.stringify({ openapi: "3.0.0" }));

        const cache = new SpecCache();
        const first = await cache.read(specPath);
        // Rewrite the file on disk; cached value should not change.
        await writeFile(specPath, JSON.stringify({ openapi: "DIFFERENT" }));
        const second = await cache.read(specPath);
        expect(second).toBe(first); // identity, not deep-equal
    });

    it("returns null for a missing file, and null is cached too", async () => {
        const cache = new SpecCache();
        const missingPath = path.join(tmpDir, "missing.json");
        expect(await cache.read(missingPath)).toBeNull();
        // Even if the file later appears, the cached null persists for this lifetime.
        await writeFile(missingPath, "{}");
        expect(await cache.read(missingPath)).toBeNull();
    });

    it("returns null for malformed JSON", async () => {
        const specPath = path.join(tmpDir, "bad.json");
        await writeFile(specPath, "{ not valid");
        const cache = new SpecCache();
        expect(await cache.read(specPath)).toBeNull();
    });
});
