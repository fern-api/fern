import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CheckCommand } from "../commands/check/command.js";
import { CheckCommand as SdkCheckCommand } from "../commands/sdk/check/command.js";
import { createTestContextWithCapture } from "./utils/createTestContext.js";

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
