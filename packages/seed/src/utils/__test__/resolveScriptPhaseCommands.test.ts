import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    GENERATOR_VERIFY_SCRIPT_RELATIVE_PATH,
    generatorEmittedVerifyScript,
    resolveScriptPhaseCommands
} from "../resolveScriptPhaseCommands.js";

async function makeTempDir(): Promise<AbsoluteFilePath> {
    const dir = await mkdtemp(path.join(os.tmpdir(), "seed-verify-"));
    return AbsoluteFilePath.of(dir);
}

async function writeVerifyScript(outputDir: AbsoluteFilePath): Promise<void> {
    const verifyDir = path.join(outputDir, ".fern");
    await mkdir(verifyDir, { recursive: true });
    await writeFile(path.join(verifyDir, "verify.sh"), "#!/bin/bash\necho ok\n");
}

describe("resolveScriptPhaseCommands", () => {
    let outputDir: AbsoluteFilePath;

    beforeEach(async () => {
        outputDir = await makeTempDir();
    });

    afterEach(() => {
        // Tmp dirs in /tmp get cleaned up by the OS; no-op for determinism.
    });

    describe("when .fern/verify.sh is present", () => {
        beforeEach(async () => {
            await writeVerifyScript(outputDir);
        });

        it("runs the verify.sh invocation during the build phase", () => {
            const result = resolveScriptPhaseCommands({
                commands: { build: ["legacy build"], test: ["legacy test"] },
                phase: "build",
                outputDir
            });
            expect(result).toEqual([`bash ${GENERATOR_VERIFY_SCRIPT_RELATIVE_PATH}`]);
        });

        it("returns an empty list for the test phase (verify.sh covers both)", () => {
            const result = resolveScriptPhaseCommands({
                commands: { build: ["legacy build"], test: ["legacy test"] },
                phase: "test",
                outputDir
            });
            expect(result).toEqual([]);
        });

        it("overrides legacy `list<string>` build commands too", () => {
            const result = resolveScriptPhaseCommands({
                commands: ["legacy build"],
                phase: "build",
                outputDir
            });
            expect(result).toEqual([`bash ${GENERATOR_VERIFY_SCRIPT_RELATIVE_PATH}`]);
        });
    });

    describe("when .fern/verify.sh is absent (fallback path)", () => {
        it("returns the seed.yml-declared build commands", () => {
            const result = resolveScriptPhaseCommands({
                commands: { build: ["pnpm install", "pnpm build"], test: ["pnpm test"] },
                phase: "build",
                outputDir
            });
            expect(result).toEqual(["pnpm install", "pnpm build"]);
        });

        it("returns the seed.yml-declared test commands", () => {
            const result = resolveScriptPhaseCommands({
                commands: { build: ["pnpm install", "pnpm build"], test: ["pnpm test"] },
                phase: "test",
                outputDir
            });
            expect(result).toEqual(["pnpm test"]);
        });

        it("treats the legacy `list<string>` format as build-only", () => {
            const buildResult = resolveScriptPhaseCommands({
                commands: ["legacy build"],
                phase: "build",
                outputDir
            });
            const testResult = resolveScriptPhaseCommands({
                commands: ["legacy build"],
                phase: "test",
                outputDir
            });
            expect(buildResult).toEqual(["legacy build"]);
            expect(testResult).toEqual([]);
        });

        it("returns empty arrays for missing phase entries", () => {
            const result = resolveScriptPhaseCommands({
                commands: { build: ["pnpm build"] },
                phase: "test",
                outputDir
            });
            expect(result).toEqual([]);
        });
    });

    describe("generatorEmittedVerifyScript", () => {
        it("returns false when the script is absent", () => {
            expect(generatorEmittedVerifyScript(outputDir)).toBe(false);
        });

        it("returns true when the script is present", async () => {
            await writeVerifyScript(outputDir);
            expect(generatorEmittedVerifyScript(outputDir)).toBe(true);
        });
    });
});
