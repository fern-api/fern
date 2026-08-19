import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdtemp, readFile, rm, stat } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildVerifyScript, writeVerifyScript } from "../writeVerifyScript";

describe("buildVerifyScript", () => {
    it("emits the pnpm install/build/test sequence under bash + set -euo pipefail", () => {
        expect(buildVerifyScript("pnpm")).toBe("#!/bin/bash\nset -euo pipefail\npnpm install\npnpm build\npnpm test\n");
    });

    it("emits the yarn install/build/test sequence under bash + set -euo pipefail", () => {
        expect(buildVerifyScript("yarn")).toBe("#!/bin/bash\nset -euo pipefail\nyarn install\nyarn build\nyarn test\n");
    });
});

describe("writeVerifyScript", () => {
    let tmpDir: AbsoluteFilePath;

    beforeEach(async () => {
        tmpDir = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "verify-script-test-")));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("writes .fern/verify.sh with the pnpm script body when packageManager is pnpm", async () => {
        await writeVerifyScript({ pathToProject: tmpDir, packageManager: "pnpm" });

        const scriptPath = path.join(tmpDir, ".fern", "verify.sh");
        const content = await readFile(scriptPath, "utf-8");
        expect(content).toBe(buildVerifyScript("pnpm"));
        expect(content.startsWith("#!/bin/bash\n")).toBe(true);
        expect(content).toContain("set -euo pipefail");
        expect(content).toContain("pnpm install");
        expect(content).toContain("pnpm build");
        expect(content).toContain("pnpm test");
        expect(content).not.toContain("yarn ");
    });

    it("writes .fern/verify.sh with the yarn script body when packageManager is yarn", async () => {
        await writeVerifyScript({ pathToProject: tmpDir, packageManager: "yarn" });

        const scriptPath = path.join(tmpDir, ".fern", "verify.sh");
        const content = await readFile(scriptPath, "utf-8");
        expect(content).toBe(buildVerifyScript("yarn"));
        expect(content.startsWith("#!/bin/bash\n")).toBe(true);
        expect(content).toContain("set -euo pipefail");
        expect(content).toContain("yarn install");
        expect(content).toContain("yarn build");
        expect(content).toContain("yarn test");
        expect(content).not.toContain("pnpm ");
    });

    it("writes the file with mode 0755 (executable)", async () => {
        await writeVerifyScript({ pathToProject: tmpDir, packageManager: "pnpm" });

        const scriptPath = path.join(tmpDir, ".fern", "verify.sh");
        const stats = await stat(scriptPath);
        // Mask off the file-type bits and compare just the permission bits.
        // eslint-disable-next-line no-bitwise
        const mode = stats.mode & 0o777;
        expect(mode).toBe(0o755);
    });

    it("creates the .fern directory if it does not already exist", async () => {
        await writeVerifyScript({ pathToProject: tmpDir, packageManager: "pnpm" });

        const fernDir = path.join(tmpDir, ".fern");
        const dirStats = await stat(fernDir);
        expect(dirStats.isDirectory()).toBe(true);
    });
});
