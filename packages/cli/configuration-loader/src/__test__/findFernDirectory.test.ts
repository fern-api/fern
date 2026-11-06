import { mkdir, realpath, writeFile } from "fs/promises";
import { dir as tmpDir } from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findFernDirectory } from "../findFernDirectory.js";
import { getFernDirectory } from "../getFernDirectory.js";

describe("findFernDirectory", () => {
    const originalCwd = process.cwd();

    beforeEach(() => {
        process.chdir(originalCwd);
    });

    afterEach(() => {
        process.chdir(originalCwd);
    });

    it("finds the fern directory without requiring a project config file", async () => {
        const tmp = await tmpDir({ unsafeCleanup: true });
        try {
            const root = await realpath(tmp.path);
            await mkdir(`${root}/fern/nested`, { recursive: true });
            process.chdir(`${root}/fern/nested`);

            expect(await findFernDirectory()).toBe(`${root}/fern`);
            expect(await getFernDirectory()).toBeUndefined();
        } finally {
            process.chdir(originalCwd);
            await tmp.cleanup();
        }
    });

    it("getFernDirectory returns the directory when fern.config.json exists", async () => {
        const tmp = await tmpDir({ unsafeCleanup: true });
        try {
            const root = await realpath(tmp.path);
            await mkdir(`${root}/fern`, { recursive: true });
            await writeFile(`${root}/fern/fern.config.json`, "{}");
            process.chdir(root);

            expect(await getFernDirectory()).toBe(`${root}/fern`);
        } finally {
            process.chdir(originalCwd);
            await tmp.cleanup();
        }
    });

    it("returns undefined when no fern directory exists above the working directory", async () => {
        const tmp = await tmpDir({ unsafeCleanup: true });
        try {
            const root = await realpath(tmp.path);
            process.chdir(root);

            expect(await findFernDirectory("definitely-not-a-real-directory-name")).toBeUndefined();
        } finally {
            process.chdir(originalCwd);
            await tmp.cleanup();
        }
    });
});
