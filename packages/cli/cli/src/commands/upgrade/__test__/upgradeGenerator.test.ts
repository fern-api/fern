import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import { loadAndUpdateGenerators } from "../upgradeGenerator";

vi.mock("@fern-api/configuration-loader", () => ({
    getPathToGeneratorsConfiguration: vi.fn(),
    getGeneratorNameOrThrow: vi.fn((name: string) => {
        if (!name.includes("/")) {
            return `fernapi/${name}`;
        }
        return name;
    }),
    getLatestGeneratorVersion: vi.fn(),
    addDefaultDockerOrgIfNotPresent: vi.fn((name: string) => {
        if (!name.includes("/")) {
            return `fernapi/${name}`;
        }
        return name;
    }),
    loadRawGeneratorsConfiguration: vi.fn()
}));

vi.mock("fs/promises");
vi.mock("../migrations", () => ({
    loadAndRunMigrations: vi.fn()
}));

describe("upgradeGenerator - YAML formatting preservation", () => {
    let mockContext: TaskContext;
    let testYamlPath: string;

    beforeEach(() => {
        vi.clearAllMocks();

        testYamlPath = join(tmpdir(), `generators-${Date.now()}.yml`);

        mockContext = {
            logger: {
                info: vi.fn(),
                error: vi.fn(),
                warn: vi.fn(),
                debug: vi.fn()
            },
            failAndThrow: vi.fn((message: string) => {
                throw new Error(message);
            })
        } as unknown as TaskContext;
    });

    it("should preserve YAML comments when applying migrations", async () => {
        const yamlContent = `# Top-level comment about generators
groups:
  production:
    generators:
      # This is the TypeScript SDK generator
      - name: fernapi/fern-typescript-sdk
        version: 1.0.0
        # Configuration section
        config:
          # Package name for npm
          packageName: my-sdk
          # Whether to use branded types
          useBrandedStringAliases: true
      # This is the Python SDK generator
      - name: fernapi/fern-python-sdk
        version: 2.0.0
        config:
          clientClassName: MyClient
`;

        // Mock file operations
        const { getPathToGeneratorsConfiguration } = await import("@fern-api/configuration-loader");
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);

        // Mock getLatestGeneratorVersion to return new versions
        const { getLatestGeneratorVersion } = await import("@fern-api/configuration-loader");
        vi.mocked(getLatestGeneratorVersion).mockImplementation(async ({ generatorName }) => {
            if (generatorName === "fernapi/fern-typescript-sdk") {
                return "1.5.0";
            }
            return undefined; // Python SDK stays at 2.0.0
        });

        // Mock migration that adds a new field and removes an old field
        const { loadAndRunMigrations } = await import("../migrations");
        vi.mocked(loadAndRunMigrations).mockResolvedValue({
            config: {
                name: "fernapi/fern-typescript-sdk",
                version: "1.5.0",
                config: {
                    packageName: "my-sdk",
                    // useBrandedStringAliases removed by migration
                    allowExtraFields: false // New field added by migration
                }
            },
            migrationsApplied: 1,
            appliedVersions: ["1.5.0"]
        });

        // Run the upgrade
        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: false,
            channel: undefined,
            cliVersion: "1.0.0"
        });

        // Verify writeFile was called with updated content
        expect(writeFile).not.toHaveBeenCalled(); // writeFile is called by the parent function

        // Parse the updated YAML
        const updatedYaml = result.updatedConfiguration;
        expect(updatedYaml).toBeDefined();

        // Verify comments are preserved in the output
        expect(updatedYaml).toContain("# Top-level comment about generators");
        expect(updatedYaml).toContain("# This is the TypeScript SDK generator");
        expect(updatedYaml).toContain("# Configuration section");
        expect(updatedYaml).toContain("# This is the Python SDK generator");

        // Parse and verify the structure
        expect(updatedYaml).toBeDefined();
        if (!updatedYaml) {
            throw new Error("updatedYaml is undefined");
        }
        const parsedDoc = YAML.parseDocument(updatedYaml);
        const groups = parsedDoc.get("groups") as YAML.YAMLMap;
        const production = groups.get("production") as YAML.YAMLMap;
        const generators = production.get("generators") as YAML.YAMLSeq;
        const tsGenerator = generators.items[0] as YAML.YAMLMap;

        // Verify version was updated
        expect(tsGenerator.get("version")).toBe("1.5.0");

        // Verify config changes were applied
        const config = tsGenerator.get("config") as YAML.YAMLMap;
        expect(config.get("packageName")).toBe("my-sdk");
        expect(config.get("allowExtraFields")).toBe(false);
        expect(config.has("useBrandedStringAliases")).toBe(false); // Should be removed

        // Verify Python SDK was not modified
        const pythonGenerator = generators.items[1] as YAML.YAMLMap;
        expect(pythonGenerator.get("version")).toBe("2.0.0");
    });

    it("should preserve YAML formatting when removing deprecated fields", async () => {
        const yamlContent = `groups:
  production:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 1.0.0
        deprecated-field: old-value
        config:
          packageName: my-sdk
`;

        const { getPathToGeneratorsConfiguration } = await import("@fern-api/configuration-loader");
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);

        const { getLatestGeneratorVersion } = await import("@fern-api/configuration-loader");
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("2.0.0");

        // Mock migration that removes deprecated-field
        const { loadAndRunMigrations } = await import("../migrations");
        vi.mocked(loadAndRunMigrations).mockResolvedValue({
            config: {
                name: "fernapi/fern-typescript-sdk",
                version: "2.0.0",
                config: {
                    packageName: "my-sdk"
                }
                // Note: deprecated-field is not in the migration result
            },
            migrationsApplied: 1,
            appliedVersions: ["2.0.0"]
        });

        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: false,
            channel: undefined,
            cliVersion: "1.0.0"
        });

        expect(result.updatedConfiguration).toBeDefined();

        // Parse and verify deprecated-field was removed
        const parsedDoc = YAML.parseDocument(result.updatedConfiguration as string);
        const groups = parsedDoc.get("groups") as YAML.YAMLMap;
        const production = groups.get("production") as YAML.YAMLMap;
        const generators = production.get("generators") as YAML.YAMLSeq;
        const generator = generators.items[0] as YAML.YAMLMap;

        expect(generator.has("deprecated-field")).toBe(false);
        expect(generator.get("version")).toBe("2.0.0");
        expect(generator.has("config")).toBe(true);
    });

    it("should handle migrations that add top-level fields", async () => {
        const yamlContent = `groups:
  production:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 1.0.0
`;

        const { getPathToGeneratorsConfiguration } = await import("@fern-api/configuration-loader");
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);

        const { getLatestGeneratorVersion } = await import("@fern-api/configuration-loader");
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("2.0.0");

        // Mock migration that adds new top-level field
        const { loadAndRunMigrations } = await import("../migrations");
        vi.mocked(loadAndRunMigrations).mockResolvedValue({
            config: {
                name: "fernapi/fern-typescript-sdk",
                version: "2.0.0",
                github: {
                    repository: "my-org/my-repo"
                }
            },
            migrationsApplied: 1,
            appliedVersions: ["2.0.0"]
        });

        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: false,
            channel: undefined,
            cliVersion: "1.0.0"
        });

        expect(result.updatedConfiguration).toBeDefined();

        // Parse and verify new field was added
        const parsedDoc = YAML.parseDocument(result.updatedConfiguration as string);
        const groups = parsedDoc.get("groups") as YAML.YAMLMap;
        const production = groups.get("production") as YAML.YAMLMap;
        const generators = production.get("generators") as YAML.YAMLSeq;
        const generator = generators.items[0] as YAML.YAMLMap;

        expect(generator.get("version")).toBe("2.0.0");
        const github = generator.get("github") as YAML.YAMLMap;
        expect(github).toBeDefined();
        expect(github.get("repository")).toBe("my-org/my-repo");
    });

    it("should maintain key order when updating fields", async () => {
        const yamlContent = `groups:
  production:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 1.0.0
        output:
          location: npm
        config:
          packageName: my-sdk
`;

        const { getPathToGeneratorsConfiguration } = await import("@fern-api/configuration-loader");
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);

        const { getLatestGeneratorVersion } = await import("@fern-api/configuration-loader");
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("1.5.0");

        // Mock migration that doesn't change the config
        const { loadAndRunMigrations } = await import("../migrations");
        vi.mocked(loadAndRunMigrations).mockResolvedValue({
            config: {
                name: "fernapi/fern-typescript-sdk",
                version: "1.5.0",
                output: {
                    location: "npm",
                    "package-name": "my-sdk"
                },
                config: {
                    packageName: "my-sdk"
                }
            },
            migrationsApplied: 0,
            appliedVersions: []
        });

        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: false,
            channel: undefined,
            cliVersion: "1.0.0"
        });

        expect(result.updatedConfiguration).toBeDefined();

        // Verify the order is maintained (name, version, output, config)
        const lines = (result.updatedConfiguration as string).split("\n");
        const nameIndex = lines.findIndex((line) => line.includes("name:"));
        const versionIndex = lines.findIndex((line) => line.includes("version:"));
        const outputIndex = lines.findIndex((line) => line.includes("output:"));
        const configIndex = lines.findIndex((line) => line.includes("config:"));

        expect(nameIndex).toBeLessThan(versionIndex);
        expect(versionIndex).toBeLessThan(outputIndex);
        expect(outputIndex).toBeLessThan(configIndex);
    });
});
