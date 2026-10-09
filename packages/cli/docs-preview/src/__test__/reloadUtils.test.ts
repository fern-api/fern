import { readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, describe, expect, it } from "vitest";

import { GenerationFileManager, isContentOnlyEdit } from "../reloadUtils.js";

// ---------------------------------------------------------------------------
// isContentOnlyEdit
// ---------------------------------------------------------------------------
describe("isContentOnlyEdit", () => {
    it("returns true for a single .md file", () => {
        expect(isContentOnlyEdit(["/project/docs/getting-started.md"])).toBe(true);
    });

    it("returns true for a single .mdx file", () => {
        expect(isContentOnlyEdit(["/project/docs/onboarding.mdx"])).toBe(true);
    });

    it("returns true for mixed .md and .mdx files", () => {
        expect(isContentOnlyEdit(["/a/intro.md", "/b/guide.mdx", "/c/readme.MD"])).toBe(true);
    });

    it("is case-insensitive on the extension", () => {
        expect(isContentOnlyEdit(["/docs/FILE.MDX", "/docs/OTHER.Md"])).toBe(true);
    });

    it("returns false when any non-markdown file is present", () => {
        expect(isContentOnlyEdit(["/docs/guide.md", "/openapi/spec.json"])).toBe(false);
    });

    it("returns false for YAML files", () => {
        expect(isContentOnlyEdit(["/fern/docs.yml"])).toBe(false);
    });

    it("returns false for OpenAPI specs", () => {
        expect(isContentOnlyEdit(["/fern/openapi/openapi.json"])).toBe(false);
    });

    it("returns false for TypeScript files", () => {
        expect(isContentOnlyEdit(["/src/component.tsx"])).toBe(false);
    });

    it("returns false for an empty array", () => {
        expect(isContentOnlyEdit([])).toBe(false);
    });

    it("returns false for undefined", () => {
        expect(isContentOnlyEdit(undefined)).toBe(false);
    });

    it("handles paths with dots in directory names", () => {
        expect(isContentOnlyEdit(["/project/v2.0/docs/page.md"])).toBe(true);
    });

    it("returns false for files that contain .md but have a different extension", () => {
        expect(isContentOnlyEdit(["/docs/.md.bak"])).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// GenerationFileManager
// ---------------------------------------------------------------------------
describe("GenerationFileManager", () => {
    const genFilePath = join(tmpdir(), `fern-test-gen-${process.pid}-${Date.now()}`);

    afterEach(async () => {
        try {
            await rm(genFilePath);
        } catch {
            // file may not exist
        }
    });

    it("starts at generation 0", () => {
        const mgr = new GenerationFileManager(genFilePath);
        expect(mgr.current).toBe(0);
    });

    it("increments monotonically", async () => {
        const mgr = new GenerationFileManager(genFilePath);
        expect(await mgr.increment()).toBe(1);
        expect(await mgr.increment()).toBe(2);
        expect(await mgr.increment()).toBe(3);
        expect(mgr.current).toBe(3);
    });

    it("writes the generation to the temp file", async () => {
        const mgr = new GenerationFileManager(genFilePath);
        await mgr.increment();
        await mgr.increment();

        const contents = await readFile(genFilePath, "utf-8");
        expect(contents).toBe("2");
    });

    it("overwrites previous generation on each increment", async () => {
        const mgr = new GenerationFileManager(genFilePath);
        await mgr.increment();
        expect(await readFile(genFilePath, "utf-8")).toBe("1");

        await mgr.increment();
        expect(await readFile(genFilePath, "utf-8")).toBe("2");

        await mgr.increment();
        expect(await readFile(genFilePath, "utf-8")).toBe("3");
    });

    it("does not throw when writing to an invalid path", async () => {
        const badMgr = new GenerationFileManager("/nonexistent/dir/gen-file");
        // Should not throw — write failure is swallowed (best-effort)
        await expect(badMgr.increment()).resolves.toBe(1);
        expect(badMgr.current).toBe(1);
    });
});
