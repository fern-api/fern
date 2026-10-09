import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isSdkConfigOnlyWorkspace } from "../isSdkConfigOnlyWorkspace.js";

describe("isSdkConfigOnlyWorkspace", () => {
    let directory: string;

    beforeEach(async () => {
        directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-only-"));
    });

    afterEach(async () => {
        await rm(directory, { recursive: true, force: true });
    });

    const check = () => isSdkConfigOnlyWorkspace(AbsoluteFilePath.of(directory));

    it("is true for a workspace with only an sdk-config.yml", async () => {
        await writeFile(path.join(directory, "sdk-config.yml"), "");

        expect(await check()).toBe(true);
    });

    it("is false for a workspace without an sdk-config.yml", async () => {
        expect(await check()).toBe(false);
    });

    it.each([
        "generators.yml",
        "generators.yaml",
        "generators.legacy.yml"
    ])("is false when the workspace also has a %s", async (generatorsFilename) => {
        await writeFile(path.join(directory, "sdk-config.yml"), "");
        await writeFile(path.join(directory, generatorsFilename), "");

        expect(await check()).toBe(false);
    });
});
