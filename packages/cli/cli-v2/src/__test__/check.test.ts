import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CheckCommand } from "../commands/check/command.js";
import { CheckCommand as SdkCheckCommand } from "../commands/sdk/check/command.js";
import { createTestContext, createTestContextWithCapture } from "./utils/createTestContext.js";

describe("fern check --json", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-check-json-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("outputs structured JSON with violations and no stderr", async () => {
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
        await writeFile(
            join(testDir, "openapi.yml"),
            `
openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`
        );

        const { context, getStdout, getStderr } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new CheckCommand();

        // The sdk checker will find the defaultGroup violation, which causes an error exit.
        try {
            await cmd.handle(context, {
                json: true,
                strict: false,
                fix: false,
                "log-level": "info"
            });
        } catch {
            // expected CliError.exit()
        }

        const stdout = getStdout();
        const stderr = getStderr();

        // No human-readable output on stderr.
        expect(stderr).toBe("");

        // stdout contains valid JSON.
        const parsed = JSON.parse(stdout);
        expect(parsed.success).toBe(false);
        expect(parsed.results).toBeDefined();
        expect(parsed.results.sdks).toBeDefined();
        expect(parsed.results.sdks.length).toBeGreaterThan(0);

        // Each violation has the expected shape.
        for (const violation of parsed.results.sdks) {
            expect(violation.severity).toBeDefined();
            expect(violation.message).toBeDefined();
        }
    });
});

describe("fern sdk check --json", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-sdk-check-json-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("outputs structured JSON with violations and no stderr", async () => {
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
        await writeFile(
            join(testDir, "openapi.yml"),
            `
openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`
        );

        const { context, getStdout, getStderr } = await createTestContextWithCapture({ cwd: testDir });
        const cmd = new SdkCheckCommand();

        try {
            await cmd.handle(context, {
                json: true,
                strict: false,
                fix: false,
                "log-level": "info"
            });
        } catch {
            // expected CliError.exit()
        }

        const stdout = getStdout();
        const stderr = getStderr();

        // No human-readable output on stderr.
        expect(stderr).toBe("");

        // stdout contains valid JSON.
        const parsed = JSON.parse(stdout);
        expect(parsed.success).toBe(false);
        expect(parsed.results).toBeDefined();
        expect(parsed.results.sdks).toBeDefined();
        expect(parsed.results.sdks.length).toBeGreaterThan(0);

        // Each violation has the expected shape.
        for (const violation of parsed.results.sdks) {
            expect(violation.severity).toBeDefined();
            expect(violation.message).toBeDefined();
            expect(violation.filepath).toBeDefined();
        }
    });
});

describe("fern check --fix", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-check-fix-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("does not throw when --fix is used with violations", async () => {
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
        await writeFile(
            join(testDir, "openapi.yml"),
            `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`
        );

        const context = await createTestContext({ cwd: testDir });
        const cmd = new CheckCommand();

        // With --fix, the command should not throw even though there are violations.
        await expect(
            cmd.handle(context, {
                json: false,
                strict: false,
                fix: true,
                "log-level": "info"
            })
        ).resolves.not.toThrow();

        // Verify the fern.yml was actually mutated: defaultGroup should be removed.
        const updatedContent = await readFile(join(testDir, "fern.yml"), "utf-8");
        expect(updatedContent).not.toContain("defaultGroup");
        expect(updatedContent).not.toContain("nonexistent-group");
    });
});

describe("fern sdk check --fix", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-sdk-check-fix-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("does not throw when --fix is used with violations", async () => {
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
        await writeFile(
            join(testDir, "openapi.yml"),
            `openapi: 3.0.0
info:
  title: Test
  version: 1.0.0
paths: {}
`
        );

        const context = await createTestContext({ cwd: testDir });
        const cmd = new SdkCheckCommand();

        await expect(
            cmd.handle(context, {
                json: false,
                strict: false,
                fix: true,
                "log-level": "info"
            })
        ).resolves.not.toThrow();

        // Verify the fern.yml was actually mutated: defaultGroup should be removed.
        const updatedContent = await readFile(join(testDir, "fern.yml"), "utf-8");
        expect(updatedContent).not.toContain("defaultGroup");
        expect(updatedContent).not.toContain("nonexistent-group");
    });
});
