import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { YamlConfigLoader } from "../YamlConfigLoader.js";

describe("YamlConfigLoader", () => {
    let testDir: string;
    let cwd: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = join(tmpdir(), `yaml-config-loader-test-${Date.now()}`);
        await mkdir(testDir, { recursive: true });
        cwd = AbsoluteFilePath.of(testDir);
    });

    afterEach(async () => {
        if (await doesPathExist(AbsoluteFilePath.of(testDir))) {
            await rm(testDir, { recursive: true });
        }
    });

    describe("duplicate keys", () => {
        it("returns a validation error for duplicate top-level keys", async () => {
            const filePath = join(testDir, "fern.yml");
            await writeFile(
                filePath,
                `edition: 2026-01-01
org: acme
org: other
`
            );

            const loader = new YamlConfigLoader({ cwd });
            const result = await loader.load({
                absoluteFilePath: AbsoluteFilePath.of(filePath),
                schema: z.object({
                    edition: z.string(),
                    org: z.string()
                }),
                resolveReferences: false
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                expect(result.issues[0]?.message).toContain("Map keys must be unique");
            }
        });

        it("returns a validation error for duplicate nested keys", async () => {
            const filePath = join(testDir, "fern.yml");
            await writeFile(
                filePath,
                `edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      output: ./sdks/typescript
    typescript:
      output: ./sdks/typescript2
`
            );

            const loader = new YamlConfigLoader({ cwd });
            const result = await loader.load({
                absoluteFilePath: AbsoluteFilePath.of(filePath),
                schema: z.object({
                    edition: z.string(),
                    org: z.string(),
                    sdks: z.object({
                        targets: z.record(z.string(), z.object({ output: z.string() }))
                    })
                }),
                resolveReferences: false
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                expect(result.issues[0]?.message).toContain("Map keys must be unique");
                expect(result.issues[0]?.location.line).toBe(7);
            }
        });

        it("reports source locations for duplicate key errors", async () => {
            const filePath = join(testDir, "config.yml");
            await writeFile(
                filePath,
                `a: 1
b: 2
a: 3
`
            );

            const loader = new YamlConfigLoader({ cwd });
            const result = await loader.load({
                absoluteFilePath: AbsoluteFilePath.of(filePath),
                schema: z.object({ a: z.number(), b: z.number() }),
                resolveReferences: false
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const issue = result.issues[0];
                expect(issue?.location.relativeFilePath).toBe("config.yml");
                expect(issue?.location.line).toBe(3);
                expect(issue?.location.column).toBe(1);
            }
        });
    });
});
