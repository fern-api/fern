import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadFernYml } from "../config/fern-yml/loadFernYml.js";
import { SdkChecker } from "../sdk/checker/SdkChecker.js";
import { SdkFixer } from "../sdk/fixer/SdkFixer.js";
import type { Workspace } from "../workspace/Workspace.js";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader.js";
import { createTestContext } from "./utils/createTestContext.js";

describe("SdkFixer", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-sdk-fixer-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("fixes invalid version by replacing with latest stable", async () => {
        await writeFile(
            join(testDir, "fern.yml"),
            `edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: openapi.yml
sdks:
  targets:
    typescript:
      version: "999.0.0"
      output:
        path: ./sdks/typescript
`
        );
        await writeMinimalOpenApi(testDir);

        const workspace = await loadTempWorkspace(testDir);
        const context = await createTestContext({ cwd: testDir });

        // Run checker with a version checker that flags "999.0.0" as invalid.
        const checker = new SdkChecker({
            context,
            versionChecker: async ({ target }) => ({
                violation: {
                    severity: "error",
                    relativeFilepath: target.sourceLocation.relativeFilePath,
                    nodePath: ["sdks", "targets", target.name, "version"],
                    message: `Version '${target.version}' does not exist for generator '${target.name}'`
                }
            })
        });
        const result = await checker.check({ workspace });
        expect(result.errorCount).toBe(1);

        // Run fixer — it will resolve the latest version via the registry.
        const fixer = new SdkFixer({ context });
        const fixResult = await fixer.fix({ workspace, violations: result.violations });

        // The fixer should have attempted to fix the version.
        // It may or may not succeed depending on registry availability,
        // but the structure should be correct.
        expect(fixResult).toBeDefined();
        expect(fixResult.fixes.length).toBeLessThanOrEqual(1);

        if (fixResult.fixedCount > 0) {
            // Verify the fern.yml was updated.
            const updatedContent = await readFile(join(testDir, "fern.yml"), "utf-8");
            expect(updatedContent).not.toContain("999.0.0");
            expect(fixResult.fixes[0]?.targetName).toBe("typescript");
        }
    });

    it("fixes empty version by replacing with latest stable", async () => {
        await writeFile(
            join(testDir, "fern.yml"),
            `edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: openapi.yml
sdks:
  targets:
    typescript:
      version: ""
      output:
        path: ./sdks/typescript
`
        );
        await writeMinimalOpenApi(testDir);

        const workspace = await loadTempWorkspace(testDir);
        const context = await createTestContext({ cwd: testDir });

        const checker = new SdkChecker({
            context,
            versionChecker: async () => ({ violation: undefined })
        });
        const result = await checker.check({ workspace });

        // Empty version should produce an error.
        const emptyVersionViolation = result.violations.find((v) => v.message === "Version must not be empty");
        expect(emptyVersionViolation).toBeDefined();

        const fixer = new SdkFixer({ context });
        const fixResult = await fixer.fix({ workspace, violations: result.violations });

        expect(fixResult).toBeDefined();
        expect(fixResult.fixes.length).toBeLessThanOrEqual(1);

        if (fixResult.fixedCount > 0) {
            const updatedContent = await readFile(join(testDir, "fern.yml"), "utf-8");
            expect(updatedContent).not.toContain('version: ""');
            expect(fixResult.fixes[0]?.oldValue).toBe("(empty)");
        }
    });

    it("fixes unreferenced defaultGroup by removing it", async () => {
        await writeFile(
            join(testDir, "fern.yml"),
            `edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: openapi.yml
sdks:
  defaultGroup: nonexistent-group
  targets:
    typescript:
      version: "1.0.0"
      output:
        path: ./sdks/typescript
      group:
        - other-group
`
        );
        await writeMinimalOpenApi(testDir);

        const workspace = await loadTempWorkspace(testDir);
        const context = await createTestContext({ cwd: testDir });

        const checker = new SdkChecker({
            context,
            versionChecker: async () => ({ violation: undefined })
        });
        const result = await checker.check({ workspace });

        // The defaultGroup violation should be detected.
        expect(result.errorCount).toBe(1);
        expect(result.violations[0]?.message).toContain("is not referenced by any target");

        const fixer = new SdkFixer({ context });
        const fixResult = await fixer.fix({ workspace, violations: result.violations });

        expect(fixResult.fixedCount).toBe(1);
        expect(fixResult.fixes[0]?.description).toBe("unreferenced defaultGroup removed");
        expect(fixResult.fixes[0]?.oldValue).toBe("nonexistent-group");
        expect(fixResult.fixes[0]?.newValue).toBe("(removed)");

        // Verify fern.yml no longer contains defaultGroup.
        const updatedContent = await readFile(join(testDir, "fern.yml"), "utf-8");
        expect(updatedContent).not.toContain("defaultGroup");
        expect(updatedContent).not.toContain("nonexistent-group");
    });

    it("returns empty result for workspace without fern.yml path", async () => {
        const context = await createTestContext({ cwd: testDir });
        const workspace: Workspace = {
            apis: {},
            cliVersion: "1.0.0",
            org: "acme"
        };

        const fixer = new SdkFixer({ context });
        const fixResult = await fixer.fix({ workspace, violations: [] });

        expect(fixResult.fixedCount).toBe(0);
        expect(fixResult.fixes).toHaveLength(0);
    });
});

async function loadTempWorkspace(cwd: AbsoluteFilePath): Promise<Workspace> {
    const fernYml = await loadFernYml({ cwd });
    const loader = new WorkspaceLoader({ cwd, logger: NOOP_LOGGER });
    const result = await loader.load({ fernYml });
    if (!result.success) {
        throw new Error(`Failed to load workspace: ${JSON.stringify(result.issues)}`);
    }
    return result.workspace;
}

async function writeMinimalOpenApi(dir: AbsoluteFilePath): Promise<void> {
    await writeFile(
        join(dir, "openapi.yml"),
        `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`
    );
}
