import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadFernYml } from "../config/fern-yml/loadFernYml.js";
import { SdkChecker } from "../sdk/checker/SdkChecker.js";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader.js";
import { FIXTURES_DIR } from "./utils/constants.js";
import { createTestContext } from "./utils/createTestContext.js";
import { loadWorkspace } from "./utils/loadWorkspace.js";

/** A version checker that always reports versions as valid. */
const NOOP_VERSION_CHECKER: SdkChecker.VersionChecker = async () => ({ violation: undefined });

describe("SdkChecker", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-sdk-checker-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        await rm(testDir, { recursive: true, force: true });
    });

    describe("valid configuration", () => {
        it("returns no errors for valid SDK config", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const checker = new SdkChecker({
                context: await createTestContext({ cwd }),
                versionChecker: NOOP_VERSION_CHECKER
            });

            const result = await checker.check({ workspace });

            expect(result.errorCount).toBe(0);
            expect(result.warningCount).toBe(0);
            expect(result.violations).toHaveLength(0);
        });

        it("returns empty result for workspace without SDKs", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: openapi.yml
`
            );
            await writeMinimalOpenApi(testDir);

            const workspace = await loadTempWorkspace(testDir);

            const checker = new SdkChecker({
                context: await createTestContext({ cwd: testDir }),
                versionChecker: NOOP_VERSION_CHECKER
            });

            const result = await checker.check({ workspace });

            expect(result.errorCount).toBe(0);
            expect(result.warningCount).toBe(0);
            expect(result.violations).toHaveLength(0);
        });
    });

    describe("defaultGroup validation", () => {
        it("errors when defaultGroup is not referenced by any target", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
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
            const checker = new SdkChecker({
                context: await createTestContext({ cwd: testDir }),
                versionChecker: NOOP_VERSION_CHECKER
            });

            const result = await checker.check({ workspace });

            expect(result.errorCount).toBe(1);
            expect(result.violations.some((v) => v.message.includes("not referenced by any target"))).toBe(true);
        });

        it("passes when defaultGroup is referenced by a target", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const checker = new SdkChecker({
                context: await createTestContext({ cwd }),
                versionChecker: NOOP_VERSION_CHECKER
            });

            const result = await checker.check({ workspace });

            expect(result.errorCount).toBe(0);
        });
    });

    describe("API reference validation", () => {
        it("errors when target references non-existent API", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: openapi.yml
sdks:
  targets:
    typescript:
      version: "1.0.0"
      api: nonexistent
      output:
        path: ./sdks/typescript
`
            );
            await writeMinimalOpenApi(testDir);

            const workspace = await loadTempWorkspace(testDir);
            const checker = new SdkChecker({
                context: await createTestContext({ cwd: testDir }),
                versionChecker: NOOP_VERSION_CHECKER
            });

            const result = await checker.check({ workspace });

            expect(result.errorCount).toBe(1);
            expect(result.violations.some((v) => v.message.includes("not defined"))).toBe(true);
        });
    });

    describe("version validation", () => {
        it("includes elapsed time in result", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const checker = new SdkChecker({
                context: await createTestContext({ cwd }),
                versionChecker: NOOP_VERSION_CHECKER
            });

            const result = await checker.check({ workspace });

            expect(result.elapsedMillis).toBeGreaterThanOrEqual(0);
        });
    });

    describe("violations returned in result", () => {
        it("returns violations with file location for invalid config", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
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
            const checker = new SdkChecker({
                context: await createTestContext({ cwd: testDir }),
                versionChecker: NOOP_VERSION_CHECKER
            });

            const result = await checker.check({ workspace });

            expect(result.violations.some((v) => v.message.includes("not referenced by any target"))).toBe(true);
            expect(result.violations.some((v) => v.displayRelativeFilepath.includes("fern.yml"))).toBe(true);
        });

        it("returns empty violations for valid workspace", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const checker = new SdkChecker({
                context: await createTestContext({ cwd }),
                versionChecker: NOOP_VERSION_CHECKER
            });

            const result = await checker.check({ workspace });

            expect(result.violations).toHaveLength(0);
        });
    });

    describe("registry unreachable", () => {
        it("warns when registry is unreachable", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const checker = new SdkChecker({
                context: await createTestContext({ cwd }),
                versionChecker: async ({ target }) => ({
                    violation: {
                        severity: "warning",
                        relativeFilepath: RelativeFilePath.of("fern.yml"),
                        nodePath: ["sdks", "targets", target.name, "version"],
                        message: `Could not verify version '${target.version}' for generator '${target.name}' (registry unreachable)`
                    }
                })
            });

            const result = await checker.check({ workspace });

            // simple-api has 2 pinned targets (typescript + python), each gets a warning
            expect(result.warningCount).toBe(2);
            expect(result.violations.some((v) => v.message.includes("registry unreachable"))).toBe(true);
        });
    });
});

async function loadTempWorkspace(cwd: AbsoluteFilePath): Promise<import("../workspace/Workspace.js").Workspace> {
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
        `
openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`
    );
}
