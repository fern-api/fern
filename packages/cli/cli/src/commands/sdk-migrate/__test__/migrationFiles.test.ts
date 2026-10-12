import { access, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { validateSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { commitMigrationFiles } from "../commitMigrationFiles.js";
import { editLegacyGeneratorsConfiguration } from "../editLegacyGeneratorsConfiguration.js";
import { mergeSdkConfig } from "../mergeSdkConfig.js";

const LEGACY = `# yaml-language-server: schema.json
default-group: public
aliases:
  all: [public, server]
groups:
  public:
    generators:
      # Keep this TypeScript version and expression exactly.
      - &typescript
        name: fernapi/fern-typescript-sdk
        version: 3.3.3
        output:
          token: ${"${NPM_TOKEN}"}
      - name: fernapi/fern-python-sdk
        version: 4.30.2
  server:
    generators:
      - name: fernapi/fern-go-sdk
        version: 1.2.3
`;

describe("legacy generators migration edits", () => {
    it("comments only selected invocations while preserving untouched YAML bytes", () => {
        const updated = editLegacyGeneratorsConfiguration({
            contents: LEGACY,
            sdkConfigPath: "./configs/sdk-config.yml",
            selections: [{ generatorIndexes: [0], groupName: "public", isEntireGroup: false }]
        });

        expect(updated).toContain("      # Migrated to ./configs/sdk-config.yml.");
        expect(updated).toContain("      # - &typescript");
        expect(updated).toContain("        # version: 3.3.3");
        expect(updated).toContain("          # token: ${NPM_TOKEN}");
        expect(updated).toContain("      - name: fernapi/fern-python-sdk\n        version: 4.30.2");
        expect(updated).toContain("default-group: public\naliases:\n  all: [public, server]");
        expect(YAML.parseDocument(updated).errors).toHaveLength(0);
    });

    it("preserves rollback copies of a fully migrated group and its references", () => {
        const updated = editLegacyGeneratorsConfiguration({
            contents: LEGACY,
            sdkConfigPath: "./sdk-config.yml",
            selections: [{ generatorIndexes: [0, 1], groupName: "public", isEntireGroup: true }]
        });
        const active = YAML.parse(updated) as {
            aliases: Record<string, string[]>;
            groups: Record<string, unknown>;
        };

        expect(active.groups).toEqual({
            server: { generators: [{ name: "fernapi/fern-go-sdk", version: "1.2.3" }] }
        });
        expect(active.aliases).toEqual({ all: ["server"] });
        expect(updated).not.toMatch(/^default-group:/m);
        expect(updated).toContain("# default-group: public");
        expect(updated).toContain("  # all: [public, server]");
        expect(updated).toContain("  # public:");
    });

    it("keeps one rollback comment layer when a partially migrated group is completed", () => {
        const partiallyMigrated = editLegacyGeneratorsConfiguration({
            contents: LEGACY,
            sdkConfigPath: "./sdk-config.yml",
            selections: [{ generatorIndexes: [0], groupName: "public", isEntireGroup: false }]
        });
        const fullyMigrated = editLegacyGeneratorsConfiguration({
            contents: partiallyMigrated,
            sdkConfigPath: "./sdk-config.yml",
            selections: [{ generatorIndexes: [0], groupName: "public", isEntireGroup: true }]
        });

        expect(fullyMigrated).toContain("  # public:");
        expect(fullyMigrated).toContain("      # - &typescript");
        expect(fullyMigrated).not.toContain("      # # - &typescript");
        expect(fullyMigrated).not.toContain("# # Migrated to ./sdk-config.yml.");
    });
});

describe("SDK Config migration merge", () => {
    const root = {
        api: { audiences: [] },
        schemaVersion: "sdk-config/v1" as const,
        sdkName: "example",
        source: { specs: [{ id: "api", path: "./openapi.yml", type: "openapi" as const }] }
    };

    it("appends a distinct language without overwriting existing targets or comments", () => {
        const existing = `# existing comment
schemaVersion: sdk-config/v1
sdkName: example
source:
  specs:
    - id: api
      path: ./openapi.yml
      type: openapi
api:
  audiences: []
targets:
  - language: python
    output:
      delivery: zip
`;
        const merged = mergeSdkConfig({
            existingContents: existing,
            mapped: {
                diagnostics: [],
                sdkConfig: validateSdkConfigV1({
                    ...root,
                    targets: [{ language: "typescript", output: { delivery: "zip" } }]
                })
            },
            outputPath: "/tmp/sdk-config.yml"
        });

        expect(merged).toContain("# existing comment");
        expect((YAML.parse(merged) as { targets: unknown[] }).targets).toHaveLength(2);
    });

    it("scopes compatible settings contributed by a later language to its target", () => {
        const existing = YAML.stringify({
            ...root,
            generation: { naming: { smartCasing: false } },
            targets: [{ language: "typescript", output: { delivery: "zip" } }]
        });
        const merged = mergeSdkConfig({
            existingContents: existing,
            mapped: {
                diagnostics: [],
                sdkConfig: validateSdkConfigV1({
                    ...root,
                    generation: { naming: { clientName: "AirweaveSDK", smartCasing: false } },
                    targets: [{ language: "python", output: { delivery: "zip" } }]
                })
            },
            outputPath: "/tmp/sdk-config.yml"
        });

        expect(YAML.parse(merged)).toMatchObject({
            generation: { naming: { smartCasing: false } },
            targets: [
                { language: "typescript" },
                {
                    language: "python",
                    generation: { naming: { clientName: "AirweaveSDK", smartCasing: false } }
                }
            ]
        });
    });

    it("reports the precise root setting when two languages conflict", () => {
        const existing = validateSdkConfigV1({
            ...root,
            generation: { naming: { clientName: "ExistingSDK" } },
            targets: [{ language: "typescript", output: { delivery: "zip" } }]
        });
        const migrated = validateSdkConfigV1({
            ...root,
            generation: { naming: { clientName: "MigratedSDK" } },
            targets: [{ language: "python", output: { delivery: "zip" } }]
        });

        expect(() =>
            mergeSdkConfig({
                existingContents: YAML.stringify(existing),
                mapped: { diagnostics: [], sdkConfig: migrated },
                outputPath: "/tmp/sdk-config.yml"
            })
        ).toThrow("generation.naming.clientName");
    });

    it("rejects a language already owned by the selected SDK Config", () => {
        const config = validateSdkConfigV1({
            ...root,
            targets: [{ language: "typescript", output: { delivery: "zip" } }]
        });
        expect(() =>
            mergeSdkConfig({
                existingContents: YAML.stringify(config),
                mapped: { diagnostics: [], sdkConfig: config },
                outputPath: "/tmp/sdk-config.yml"
            })
        ).toThrow("already migrated or owned by another target");
    });
});

describe("migration file transaction", () => {
    it("renames the original configuration and writes both prepared documents", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-migration-files-"));
        const original = path.join(directory, "generators.yml");
        const legacy = path.join(directory, "generators.legacy.yml");
        const sdkConfig = path.join(directory, "sdk-config.yml");
        await writeFile(original, "original\n");

        await commitMigrationFiles({
            files: [
                { contents: "commented\n", path: legacy },
                { contents: "sdk config\n", path: sdkConfig }
            ],
            remove: [original]
        });

        await expect(readFile(original, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
        await expect(readFile(legacy, "utf8")).resolves.toBe("commented\n");
        await expect(readFile(sdkConfig, "utf8")).resolves.toBe("sdk config\n");
        await rm(directory, { force: true, recursive: true });
    });

    it("removes output directories created before a failed commit", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-migration-files-"));
        const nestedOutput = path.join(directory, "configs", "generated", "sdk-config.yml");
        const blockingFile = path.join(directory, "blocking-file");
        await writeFile(blockingFile, "unchanged\n");

        await expect(
            commitMigrationFiles({
                files: [
                    { contents: "sdk config\n", path: nestedOutput },
                    { contents: "cannot be written\n", path: path.join(blockingFile, "sdk-config.yml") }
                ],
                remove: []
            })
        ).rejects.toBeDefined();

        await expect(access(path.join(directory, "configs"))).rejects.toMatchObject({ code: "ENOENT" });
        await expect(readFile(blockingFile, "utf8")).resolves.toBe("unchanged\n");
        await rm(directory, { force: true, recursive: true });
    });

    it("removes a prepared temporary file when final preparation fails", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-migration-files-"));
        const output = path.join(directory, "sdk-config.yml");

        await expect(
            commitMigrationFiles({
                files: [{ contents: "sdk config\n", mode: -1, path: output }],
                remove: []
            })
        ).rejects.toBeDefined();

        await expect(access(output)).rejects.toMatchObject({ code: "ENOENT" });
        await expect(readdir(directory)).resolves.toEqual([]);
        await rm(directory, { force: true, recursive: true });
    });
});
