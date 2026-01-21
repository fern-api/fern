import { NOOP_LOGGER } from "@fern-api/logger";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadFernYml } from "../config/fern-yml/loadFernYml";
import { SdkConfigConverter } from "../sdk/config/SdkConfigConverter";
import type { Target } from "../sdk/config/Target";

describe("SdkConfigConverter", () => {
    let testDir: string;
    let converter: SdkConfigConverter;

    beforeEach(async () => {
        testDir = join(tmpdir(), `fern-sdk-config-test-${randomUUID()}`);
        await mkdir(testDir, { recursive: true });
        converter = new SdkConfigConverter({ logger: NOOP_LOGGER });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    describe("basic conversion", () => {
        it("converts a minimal fern.yml with a single target", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.org).toBe("acme");
                expect(result.config.targets).toHaveLength(1);
                expect(result.config.targets[0]?.name).toBe("typescript");
                expect(result.config.targets[0]?.lang).toBe("typescript");
                expect(result.config.targets[0]?.version).toBe("1.0.0");
            }
        });

        it("extracts org from fern.yml", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: my-organization
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.org).toBe("my-organization");
            }
        });

        it("extracts defaultGroup from sdks section", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  defaultGroup: production
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.defaultGroup).toBe("production");
            }
        });
    });

    describe("docker image resolution", () => {
        it("resolves docker image for typescript to fern-typescript-node-sdk", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      version: "2.0.0"
      output:
        path: ./sdks/typescript
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.image).toBe("fernapi/fern-typescript-node-sdk");
            }
        });

        it("resolves docker image for python to fern-python-sdk", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      version: "3.0.0"
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.image).toBe("fernapi/fern-python-sdk");
            }
        });

        it("resolves docker images for all supported languages", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    csharp:
      output:
        path: ./sdks/csharp
    go:
      output:
        path: ./sdks/go
    java:
      output:
        path: ./sdks/java
    php:
      output:
        path: ./sdks/php
    python:
      output:
        path: ./sdks/python
    ruby:
      output:
        path: ./sdks/ruby
    rust:
      output:
        path: ./sdks/rust
    swift:
      output:
        path: ./sdks/swift
    typescript:
      output:
        path: ./sdks/typescript
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                const imagesByLang = Object.fromEntries(result.config.targets.map((t: Target) => [t.lang, t.image]));
                expect(imagesByLang).toEqual({
                    csharp: "fernapi/fern-csharp-sdk",
                    go: "fernapi/fern-go-sdk",
                    java: "fernapi/fern-java-sdk",
                    php: "fernapi/fern-php-sdk",
                    python: "fernapi/fern-python-sdk",
                    ruby: "fernapi/fern-ruby-sdk",
                    rust: "fernapi/fern-rust-sdk",
                    swift: "fernapi/fern-swift-sdk",
                    typescript: "fernapi/fern-typescript-node-sdk"
                });
            }
        });
    });

    describe("version handling", () => {
        it("uses explicit version when provided", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      version: "4.5.6"
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.version).toBe("4.5.6");
            }
        });

        it("defaults to 'latest' when no version is specified", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.version).toBe("latest");
            }
        });
    });

    describe("language inference", () => {
        it("infers language from target name when name matches a known language", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.lang).toBe("python");
            }
        });

        it("uses explicit lang when provided even if target name matches a language", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      lang: typescript
      output:
        path: ./sdks/node
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.lang).toBe("typescript");
                expect(result.config.targets[0]?.image).toBe("fernapi/fern-typescript-node-sdk");
            }
        });

        it("requires explicit lang when target name does not match a known language", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    node-sdk:
      lang: typescript
      output:
        path: ./sdks/node
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.name).toBe("node-sdk");
                expect(result.config.targets[0]?.lang).toBe("typescript");
            }
        });

        it("returns validation error when lang is missing and target name is not a known language", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    my-custom-sdk:
      output:
        path: ./sdks/custom
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThan(0);
                expect(result.issues[0]?.message).toContain(
                    'target "my-custom-sdk" is not a recognized language; please specify the "lang" property'
                );
            }
        });
    });

    describe("output configuration", () => {
        it("converts output path", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./generated/python-sdk
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.output.path).toBe("./generated/python-sdk");
            }
        });

        it("converts git output configuration", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
        git:
          repository: acme/python-sdk
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.output.git?.repository).toBe("acme/python-sdk");
            }
        });
    });

    describe("publish configuration", () => {
        it("converts npm publish configuration", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      output:
        path: ./sdks/typescript
      publish:
        npm:
          packageName: "@acme/sdk"
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.publish?.npm?.packageName).toBe("@acme/sdk");
            }
        });

        it("omits publish when not specified", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.publish).toBeUndefined();
            }
        });
    });

    describe("config pass-through", () => {
        it("passes through target-specific config as-is", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      output:
        path: ./sdks/typescript
      config:
        packageName: "@acme/client"
        includeReadme: true
        customOption: 42
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.config).toEqual({
                    packageName: "@acme/client",
                    includeReadme: true,
                    customOption: 42
                });
            }
        });

        it("omits config when not specified", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.config).toBeUndefined();
            }
        });
    });

    describe("groups", () => {
        it("converts group array from target", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
      group:
        - production
        - staging
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.groups).toEqual(["production", "staging"]);
            }
        });

        it("defaults to empty array when group is not specified", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      output:
        path: ./sdks/python
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets[0]?.groups).toEqual([]);
            }
        });
    });

    describe("multiple targets", () => {
        it("converts multiple targets", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    python:
      version: "1.0.0"
      output:
        path: ./sdks/python
    typescript:
      version: "2.0.0"
      output:
        path: ./sdks/typescript
    go:
      version: "0.5.0"
      output:
        path: ./sdks/go
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.config.targets).toHaveLength(3);

                const targetsByName = Object.fromEntries(result.config.targets.map((t: Target) => [t.name, t]));
                expect(targetsByName["python"]?.version).toBe("1.0.0");
                expect(targetsByName["typescript"]?.version).toBe("2.0.0");
                expect(targetsByName["go"]?.version).toBe("0.5.0");
            }
        });
    });

    describe("failure cases", () => {
        it("fails when sdks section is missing", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
`
            );

            const fernYml = await loadFernYml({ cwd: testDir });
            const result = converter.convert({ fernYml });

            expect(result.success).toBe(false);
        });
    });
});
