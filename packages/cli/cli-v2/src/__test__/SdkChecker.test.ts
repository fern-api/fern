import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { Writable } from "stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadFernYml } from "../config/fern-yml/loadFernYml.js";
import { SdkChecker } from "../sdk/checker/SdkChecker.js";
import { WorkspaceLoader } from "../workspace/WorkspaceLoader.js";
import { createTestContext } from "./utils/createTestContext.js";
import { loadWorkspace } from "./utils/loadWorkspace.js";

const FIXTURES_DIR = AbsoluteFilePath.of(join(__dirname, "fixtures"));

describe("SdkChecker", () => {
    let testDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-sdk-checker-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    describe("check()", () => {
        it("returns valid result for workspace with valid SDK configuration", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream, getOutput } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd }),
                stream
            });

            const result = checker.check({ workspace });

            expect(result.errorCount).toBe(0);
            expect(result.warningCount).toBe(0);
            expect(getOutput()).toBe("");
        });

        it("returns empty result for workspace without SDKs", async () => {
            // Create a fern.yml with no sdks section.
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

            const fernYml = await loadFernYml({ cwd: testDir });
            const loader = new WorkspaceLoader({ cwd: testDir, logger: NOOP_LOGGER });
            const loadResult = await loader.load({ fernYml });
            expect(loadResult.success).toBe(true);
            if (!loadResult.success) {
                return;
            }

            const { stream, getOutput } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd: testDir }),
                stream
            });

            const result = checker.check({ workspace: loadResult.workspace });

            expect(result.errorCount).toBe(0);
            expect(result.warningCount).toBe(0);
            expect(getOutput()).toBe("");
        });

        it("includes elapsed time in result", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd }),
                stream
            });

            const result = checker.check({ workspace });

            expect(result.elapsedMillis).toBeGreaterThanOrEqual(0);
        });
    });

    describe("zod schema validity", () => {
        it("workspace loading fails for invalid SDK schema (missing output)", async () => {
            // The zod schema requires `output` on each target.
            // If the schema is invalid, the WorkspaceLoader will fail before SdkChecker runs.
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

            // loadFernYml should throw because `output` is required by the zod schema.
            await expect(loadFernYml({ cwd: testDir })).rejects.toThrow();
        });

        it("passes for valid SDK schema with all required fields", async () => {
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
      output:
        path: ./sdks/typescript
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

            const fernYml = await loadFernYml({ cwd: testDir });
            const loader = new WorkspaceLoader({ cwd: testDir, logger: NOOP_LOGGER });
            const loadResult = await loader.load({ fernYml });
            expect(loadResult.success).toBe(true);
            if (!loadResult.success) {
                return;
            }

            const { stream, getOutput } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd: testDir }),
                stream
            });

            const result = checker.check({ workspace: loadResult.workspace });

            expect(result.errorCount).toBe(0);
            expect(result.warningCount).toBe(0);
            expect(getOutput()).toBe("");
        });
    });

    describe("target version validation", () => {
        it("passes when all targets have valid versions", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd }),
                stream
            });

            const result = checker.check({ workspace });

            // simple-api has targets with versions "0.39.3" and "4.3.10".
            expect(result.errorCount).toBe(0);
        });

        it("passes for targets using 'latest' as version", async () => {
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
      output:
        path: ./sdks/typescript
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

            const fernYml = await loadFernYml({ cwd: testDir });
            const loader = new WorkspaceLoader({ cwd: testDir, logger: NOOP_LOGGER });
            const loadResult = await loader.load({ fernYml });
            expect(loadResult.success).toBe(true);
            if (!loadResult.success) {
                return;
            }

            const { stream } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd: testDir }),
                stream
            });

            const result = checker.check({ workspace: loadResult.workspace });

            // Version defaults to "latest" which is valid.
            expect(result.errorCount).toBe(0);
        });
    });

    describe("language validation", () => {
        it("passes for all supported languages", async () => {
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
      output:
        path: ./sdks/typescript
    python:
      output:
        path: ./sdks/python
    java:
      output:
        path: ./sdks/java
    go:
      output:
        path: ./sdks/go
    csharp:
      output:
        path: ./sdks/csharp
    ruby:
      output:
        path: ./sdks/ruby
    php:
      output:
        path: ./sdks/php
    rust:
      output:
        path: ./sdks/rust
    swift:
      output:
        path: ./sdks/swift
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

            const fernYml = await loadFernYml({ cwd: testDir });
            const loader = new WorkspaceLoader({ cwd: testDir, logger: NOOP_LOGGER });
            const loadResult = await loader.load({ fernYml });
            expect(loadResult.success).toBe(true);
            if (!loadResult.success) {
                return;
            }

            const { stream } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd: testDir }),
                stream
            });

            const result = checker.check({ workspace: loadResult.workspace });

            expect(result.errorCount).toBe(0);
        });

        it("passes when target name is a valid language (lang inferred)", async () => {
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
    python:
      output:
        path: ./sdks/python
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

            const fernYml = await loadFernYml({ cwd: testDir });
            const loader = new WorkspaceLoader({ cwd: testDir, logger: NOOP_LOGGER });
            const loadResult = await loader.load({ fernYml });
            expect(loadResult.success).toBe(true);
            if (!loadResult.success) {
                return;
            }

            const { stream } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd: testDir }),
                stream
            });

            const result = checker.check({ workspace: loadResult.workspace });

            expect(result.errorCount).toBe(0);
        });

        it("passes when custom target name has explicit lang", async () => {
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
    node-sdk:
      lang: typescript
      output:
        path: ./sdks/node
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

            const fernYml = await loadFernYml({ cwd: testDir });
            const loader = new WorkspaceLoader({ cwd: testDir, logger: NOOP_LOGGER });
            const loadResult = await loader.load({ fernYml });
            expect(loadResult.success).toBe(true);
            if (!loadResult.success) {
                return;
            }

            const { stream } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd: testDir }),
                stream
            });

            const result = checker.check({ workspace: loadResult.workspace });

            expect(result.errorCount).toBe(0);
        });

        it("SdkConfigConverter rejects unrecognized target name without lang", async () => {
            // When a target name doesn't match a known language and no explicit lang is provided,
            // the SdkConfigConverter produces a validation issue (workspace loading fails).
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
    my-custom-sdk:
      output:
        path: ./sdks/custom
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

            const fernYml = await loadFernYml({ cwd: testDir });
            const loader = new WorkspaceLoader({ cwd: testDir, logger: NOOP_LOGGER });
            const loadResult = await loader.load({ fernYml });

            // The workspace loader should fail because the SdkConfigConverter cannot resolve the language.
            expect(loadResult.success).toBe(false);
            if (!loadResult.success) {
                expect(loadResult.issues.length).toBeGreaterThan(0);
                expect(loadResult.issues[0]?.message).toContain("not a recognized language");
            }
        });
    });

    describe("stream injection", () => {
        it("writes output to injected stream for valid workspace", async () => {
            const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, "simple-api"));
            const workspace = await loadWorkspace("simple-api");

            const { stream, getOutput } = createCaptureStream();
            const checker = new SdkChecker({
                context: createTestContext({ cwd }),
                stream
            });

            checker.check({ workspace });

            // Valid SDK produces no output.
            expect(getOutput()).toBe("");
        });
    });
});

/**
 * Creates a writable stream that captures output for testing.
 */
function createCaptureStream(): { stream: NodeJS.WriteStream; getOutput: () => string } {
    let output = "";
    const stream = new Writable({
        write(chunk, _encoding, callback) {
            output += chunk.toString();
            callback();
        }
    }) as NodeJS.WriteStream;

    return {
        stream,
        getOutput: () => output
    };
}
