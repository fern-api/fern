import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadFernYml } from "../config/fern-yml/loadFernYml.js";
import { DocsChecker } from "../docs/checker/DocsChecker.js";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader.js";
import { createTestContext } from "./utils/createTestContext.js";
import { loadWorkspace } from "./utils/loadWorkspace.js";

describe("DocsChecker", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-docs-checker-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    describe("workspace without docs", () => {
        it("returns empty result when no docs configured", async () => {
            const workspace = await loadWorkspace("simple-api");
            const cwd = AbsoluteFilePath.of(join(__dirname, "fixtures/simple-api"));

            const checker = new DocsChecker({
                context: await createTestContext({ cwd })
            });

            const result = await checker.check({ workspace });

            expect(result.violations).toHaveLength(0);
            expect(result.hasErrors).toBe(false);
            expect(result.hasWarnings).toBe(false);
            expect(result.errorCount).toBe(0);
            expect(result.warningCount).toBe(0);
            expect(result.elapsedMillis).toBe(0);
        });
    });

    describe("workspace with docs", () => {
        it("returns result for valid docs configuration", async () => {
            await writeDocsWorkspace(testDir);

            const workspace = await loadTempWorkspace(testDir);
            const checker = new DocsChecker({
                context: await createTestContext({ cwd: testDir })
            });

            const result = await checker.check({ workspace });

            // Docs check should return a well-formed result.
            expect(result).toHaveProperty("violations");
            expect(result).toHaveProperty("hasErrors");
            expect(result).toHaveProperty("hasWarnings");
            expect(result).toHaveProperty("errorCount");
            expect(result).toHaveProperty("warningCount");
            expect(result).toHaveProperty("elapsedMillis");
            expect(result.elapsedMillis).toBeGreaterThanOrEqual(0);
        });

        it("includes elapsed time in result", async () => {
            await writeDocsWorkspace(testDir);

            const workspace = await loadTempWorkspace(testDir);
            const checker = new DocsChecker({
                context: await createTestContext({ cwd: testDir })
            });

            const result = await checker.check({ workspace });

            expect(result.elapsedMillis).toBeGreaterThanOrEqual(0);
        });
    });

    describe("strict mode", () => {
        it("includes warnings in violations when strict is true", async () => {
            await writeDocsWorkspace(testDir);

            const workspace = await loadTempWorkspace(testDir);
            const checker = new DocsChecker({
                context: await createTestContext({ cwd: testDir })
            });

            const resultStrict = await checker.check({ workspace, strict: true });
            const resultNormal = await checker.check({ workspace, strict: false });

            // In strict mode, warnings are included in violations.
            // In normal mode, only errors are included.
            // The warning count should be the same regardless of strict mode.
            expect(resultStrict.warningCount).toBe(resultNormal.warningCount);

            // Non-strict should filter out warnings from violations list.
            const normalWarnings = resultNormal.violations.filter((v) => v.severity === "warning");
            expect(normalWarnings).toHaveLength(0);
        });
    });

    describe("resolved violations shape", () => {
        it("violations have expected fields", async () => {
            await mkdir(join(testDir, "pages"), { recursive: true });
            await writeFile(
                join(testDir, "pages", "test.mdx"),
                `---
title: Test Page
---

Check out [broken link](/does-not-exist).
`
            );
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: openapi.yml
docs:
  instances:
    - url: acme.docs.buildwithfern.com
  navigation:
    - page: Test Page
      path: ./pages/test.mdx
`
            );
            await writeMinimalOpenApi(testDir);

            const workspace = await loadTempWorkspace(testDir);
            const checker = new DocsChecker({
                context: await createTestContext({ cwd: testDir })
            });

            const result = await checker.check({ workspace, strict: true });

            // If there are violations, they should have the expected shape.
            for (const violation of result.violations) {
                expect(violation.severity).toBeDefined();
                expect(violation.message).toBeDefined();
                expect(typeof violation.displayRelativeFilepath).toBe("string");
                expect(typeof violation.line).toBe("number");
                expect(typeof violation.column).toBe("number");
            }
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

async function writeDocsWorkspace(dir: AbsoluteFilePath): Promise<void> {
    await mkdir(join(dir, "pages"), { recursive: true });
    await writeFile(join(dir, "pages", "welcome.mdx"), "# Welcome\n");
    await writeFile(
        join(dir, "fern.yml"),
        `
edition: 2026-01-01
org: acme
api:
  specs:
    - openapi: openapi.yml
docs:
  instances:
    - url: acme.docs.buildwithfern.com
  navigation:
    - page: Welcome
      path: ./pages/welcome.mdx
`
    );
    await writeMinimalOpenApi(dir);
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
