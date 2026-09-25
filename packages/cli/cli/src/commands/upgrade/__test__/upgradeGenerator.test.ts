import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernRegistry } from "@fern-fern/generators-sdk";
import { readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import { compareGeneratorVersions } from "../getSdkGenApiGeneratorVersions.js";
import { loadAndUpdateGenerators, upgradeGenerator } from "../upgradeGenerator.js";

const sdkGenApiHelpers = vi.hoisted(() => ({
    getOrigin: vi.fn(() => process.env.FERN_SDK_GEN_API_ORIGIN),
    getLanguage: vi.fn((generatorId: string) => {
        if (generatorId.includes("typescript")) {
            return "typescript";
        }
        if (generatorId === "fernapi/fern-go-sdk") {
            return "go";
        }
        return undefined;
    }),
    isEnabled: vi.fn(() => process.env.FERN_USE_SDK_GEN_API === "true"),
    askToLogin: vi.fn(async () => ({ type: "organization" as const, value: "test-token" }))
}));
const getSdkGenApiToken = sdkGenApiHelpers.askToLogin;

vi.mock("@fern-api/configuration-loader", () => ({
    getPathToGeneratorsConfiguration: vi.fn(),
    normalizeGeneratorName: vi.fn((name: string) => {
        if (!name.includes("/")) {
            name = `fernapi/${name}`;
        }
        const knownGenerators = [
            "fernapi/fern-typescript-sdk",
            "fernapi/fern-python-sdk",
            "fernapi/fern-java-sdk",
            "fernapi/fern-java-model",
            "fernapi/fern-csharp-sdk",
            "fernapi/fern-go-sdk"
        ];
        if (knownGenerators.includes(name)) {
            return name;
        }
        return undefined;
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
vi.mock("@fern-api/login", () => ({ askToLogin: sdkGenApiHelpers.askToLogin }));
vi.mock("@fern-api/remote-workspace-runner", () => ({
    getFernSdkGenApiOrigin: sdkGenApiHelpers.getOrigin,
    getFernSdkGenApiLanguage: sdkGenApiHelpers.getLanguage,
    isFernSdkGenApiEnabled: sdkGenApiHelpers.isEnabled
}));
vi.mock("../migrations", () => ({
    loadAndRunMigrations: vi.fn()
}));

describe("upgradeGenerator - YAML formatting preservation", () => {
    let mockContext: TaskContext;
    let testYamlPath: string;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();

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

    it.each([
        ["1.2.3-1-gabc", "1.2.3", 1],
        ["1.2.3", "1.2.3-1-gabc", -1],
        ["2.0.0", "latest", -1],
        ["latest", "2.0.0", 1],
        ["latest", "latest", 0]
    ])("compares generator version %s against %s", (candidateVersion, currentVersion, expected) => {
        expect(
            compareGeneratorVersions({
                generatorId: "fernapi/fern-typescript-sdk",
                candidateVersion,
                currentVersion
            })
        ).toBe(expected);
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
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org"
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
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org"
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
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org"
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
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org"
        });

        expect(result.updatedConfiguration).toBeDefined();

        // Verify the order is maintained(name, version, output, config)
        const lines = (result.updatedConfiguration as string).split("\n");
        const nameIndex = lines.findIndex((line) => line.includes("name:"));
        const versionIndex = lines.findIndex((line) => line.includes("version:"));
        const outputIndex = lines.findIndex((line) => line.includes("output:"));
        const configIndex = lines.findIndex((line) => line.includes("config:"));

        expect(nameIndex).toBeLessThan(versionIndex);
        expect(versionIndex).toBeLessThan(outputIndex);
        expect(outputIndex).toBeLessThan(configIndex);
    });

    it.each([
        ["1.0.0", false],
        ["0.9.0", true],
        ["1.0.0-beta.1", true]
    ])("does not mutate or migrate for a non-ahead candidate %s", async (candidate, stale) => {
        const yamlContent = `groups:\n  production:\n    generators:\n      - name: fernapi/fern-typescript-sdk\n        version: 1.0.0\n`;
        const { getPathToGeneratorsConfiguration, getLatestGeneratorVersion } = await import(
            "@fern-api/configuration-loader"
        );
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue(candidate);
        const { loadAndRunMigrations } = await import("../migrations");

        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: true,
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org"
        });

        expect(result.updatedConfiguration).toContain("version: 1.0.0");
        expect(result.appliedUpgrades).toEqual([]);
        expect(loadAndRunMigrations).not.toHaveBeenCalled();
        if (stale) {
            expect(mockContext.logger.warn).toHaveBeenCalledWith(expect.stringContaining("stale FDR candidate"));
            expect(result.alreadyUpToDate).toEqual([]);
            expect(result.staleCandidates).toEqual([
                expect.objectContaining({ candidateVersion: candidate, currentVersion: "1.0.0", backend: "FDR" })
            ]);
        } else {
            expect(mockContext.logger.warn).not.toHaveBeenCalled();
            expect(result.alreadyUpToDate).toHaveLength(1);
            expect(result.staleCandidates).toEqual([]);
        }
    });

    it("preserves the current version for withheld-major reporting when the candidate is older", async () => {
        const yamlContent = `groups:\n  production:\n    generators:\n      - name: fernapi/fern-typescript-sdk\n        version: 1.0.0\n`;
        const { getPathToGeneratorsConfiguration, getLatestGeneratorVersion } = await import(
            "@fern-api/configuration-loader"
        );
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);
        vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen.example.com");
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    targets: [
                        {
                            targetId: "generator",
                            state: "RESOLVED",
                            compatibleVersion: "0.9.0",
                            withheldMajorVersion: "2.0.0"
                        }
                    ]
                })
            })
        );

        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: false,
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org",
            getSdkGenApiToken
        });

        expect(getLatestGeneratorVersion).not.toHaveBeenCalled();
        expect(mockContext.logger.warn).toHaveBeenCalledWith(expect.stringContaining("stale SDK Gen API candidate"));
        expect(result.alreadyUpToDate).toEqual([]);
        expect(result.staleCandidates).toEqual([
            expect.objectContaining({
                candidateVersion: "0.9.0",
                currentVersion: "1.0.0",
                backend: "SDK Gen API"
            })
        ]);
        expect(result.updatedConfiguration).toContain("version: 1.0.0");
        expect(result.skippedMajorUpgrades).toEqual([
            {
                generatorName: "fernapi/fern-typescript-sdk",
                currentVersion: "1.0.0",
                latestMajorVersion: "2.0.0"
            }
        ]);
    });

    it("summarizes stale candidates instead of reporting no generators found", async () => {
        const yamlContent = `groups:\n  production:\n    generators:\n      - name: fernapi/fern-typescript-sdk\n        version: 1.0.0\n`;
        const { getLatestGeneratorVersion, getPathToGeneratorsConfiguration, loadRawGeneratorsConfiguration } =
            await import("@fern-api/configuration-loader");
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(loadRawGeneratorsConfiguration).mockResolvedValue({ groups: {} });
        vi.mocked(readFile).mockResolvedValue(yamlContent);
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue("0.9.0");
        const logger = {
            info: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn()
        };
        const cliContext = {
            environment: { packageVersion: "1.0.0" },
            logger,
            runTaskForWorkspace: vi.fn(async (_workspace: unknown, run: (context: TaskContext) => Promise<void>) =>
                run(mockContext)
            )
        };

        await upgradeGenerator({
            cliContext: cliContext as never,
            generator: undefined,
            group: undefined,
            project: {
                apiWorkspaces: [{ absoluteFilePath: "/test", workspaceName: undefined }],
                config: { organization: "test-org" }
            } as never,
            includeMajor: true,
            skipAutoreleaseDisabled: false,
            channel: undefined
        });

        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Ignored stale generator candidates"));
        expect(logger.info).not.toHaveBeenCalledWith(expect.stringContaining("No generators found"));
    });

    it("uses SDK Gen API discovery without an FDR fallback and preserves the TypeScript Node identity", async () => {
        const yamlContent = `groups:\n  production:\n    generators:\n      - name: fernapi/fern-typescript-node-sdk\n        version: 0.40.0\n`;
        const { getPathToGeneratorsConfiguration, getLatestGeneratorVersion, normalizeGeneratorName } = await import(
            "@fern-api/configuration-loader"
        );
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);
        vi.mocked(normalizeGeneratorName).mockReturnValue("fernapi/fern-typescript-sdk");
        const { loadAndRunMigrations } = await import("../migrations");
        vi.mocked(loadAndRunMigrations).mockResolvedValue(undefined);
        vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen.example.com/control-plane/");
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                targets: [
                    {
                        targetId: "generator",
                        state: "RESOLVED",
                        compatibleVersion: "0.51.7",
                        withheldMajorVersion: "1.2.0"
                    }
                ]
            })
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: false,
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org",
            getSdkGenApiToken
        });

        expect(getLatestGeneratorVersion).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock.mock.calls[0]?.[0].toString()).toBe(
            "https://sdk-gen.example.com/control-plane/v1/fern/generator-versions/discover"
        );
        expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual({
            Authorization: "Bearer test-token",
            "X-Fern-Organization-Id": "test-org",
            "content-type": "application/json"
        });
        expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
            targets: [
                {
                    targetId: "generator",
                    generatorId: "fernapi/fern-typescript-node-sdk",
                    language: "typescript",
                    currentVersion: "0.40.0",
                    includeMajor: false
                }
            ]
        });
        expect(result.updatedConfiguration).toContain("version: 0.51.7");
        expect(result.skippedMajorUpgrades).toEqual([
            {
                generatorName: "fernapi/fern-typescript-node-sdk",
                currentVersion: "0.51.7",
                latestMajorVersion: "1.2.0"
            }
        ]);
    });

    it("adds SDK Gen API context to network errors", async () => {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen.example.com");
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));
        const { getSdkGenApiGeneratorVersions } = await import("../getSdkGenApiGeneratorVersions.js");

        await expect(
            getSdkGenApiGeneratorVersions({
                generatorId: "fernapi/fern-go-sdk",
                currentVersion: "0.30.0",
                includeMajor: false,
                organization: "test-org",
                getToken: getSdkGenApiToken,
                context: mockContext
            })
        ).rejects.toThrow(
            "SDK Gen API version discovery failed for fernapi/fern-go-sdk@0.30.0 because the API could not be reached"
        );
    });

    it("reports unresolved SDK Gen API coordinates without falling back to FDR", async () => {
        const yamlContent = `groups:\n  production:\n    generators:\n      - name: fernapi/fern-go-sdk\n        version: 0.30.0\n`;
        const { getPathToGeneratorsConfiguration, getLatestGeneratorVersion } = await import(
            "@fern-api/configuration-loader"
        );
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);
        vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen.example.com");
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    targets: [
                        {
                            targetId: "generator",
                            state: "UNAVAILABLE",
                            reason: "VERSION_UNAVAILABLE"
                        }
                    ]
                })
            })
        );

        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: false,
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org",
            getSdkGenApiToken
        });

        expect(getLatestGeneratorVersion).not.toHaveBeenCalled();
        expect(mockContext.logger.error).toHaveBeenCalledWith(expect.stringContaining("VERSION_UNAVAILABLE"));
        expect(result.updatedConfiguration).toContain("version: 0.30.0");
    });

    it("rejects an SDK Gen API upgrade channel before making any lookup", async () => {
        const yamlContent = `groups:\n  production:\n    generators:\n      - name: fernapi/fern-go-sdk\n        version: 0.30.0\n`;
        const { getPathToGeneratorsConfiguration, getLatestGeneratorVersion } = await import(
            "@fern-api/configuration-loader"
        );
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);
        vi.stubEnv("FERN_USE_SDK_GEN_API", "true");
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen.example.com");
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await expect(
            loadAndUpdateGenerators({
                absolutePathToWorkspace: "/test" as AbsoluteFilePath,
                context: mockContext,
                generatorFilter: undefined,
                groupFilter: undefined,
                includeMajor: false,
                skipAutoreleaseDisabled: false,
                channel: "beta" as FernRegistry.generators.ReleaseType,
                cliVersion: "1.0.0",
                organization: "test-org",
                getSdkGenApiToken
            })
        ).rejects.toThrow("does not support the requested upgrade channel");
        expect(fetchMock).not.toHaveBeenCalled();
        expect(getLatestGeneratorVersion).not.toHaveBeenCalled();
        expect(sdkGenApiHelpers.getOrigin).not.toHaveBeenCalled();
        expect(sdkGenApiHelpers.getLanguage).not.toHaveBeenCalled();
    });

    it.each([
        ["non-exact semver", { targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "1.2" }] }],
        ["null version", { targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: null }] }],
        [
            "unknown result field",
            { targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "1.2.3", runtime: "fern" }] }
        ],
        [
            "unknown response field",
            { targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "1.2.3" }], internal: true }
        ]
    ])("rejects an SDK Gen API response with %s", async (_name, body) => {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen.example.com");
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => body
            })
        );
        const { getSdkGenApiGeneratorVersions } = await import("../getSdkGenApiGeneratorVersions.js");

        await expect(
            getSdkGenApiGeneratorVersions({
                generatorId: "fernapi/fern-go-sdk",
                currentVersion: "0.30.0",
                includeMajor: false,
                organization: "test-org",
                getToken: getSdkGenApiToken,
                context: mockContext
            })
        ).rejects.toThrow("SDK Gen API returned");
    });

    it.each([
        "1.2.3+build.4",
        "1.2.3-preview.1"
    ])("upgrades to valid broader SemVer candidate %s", async (candidate) => {
        const yamlContent = `groups:\n  production:\n    generators:\n      - name: fernapi/fern-typescript-sdk\n        version: 1.2.2\n`;
        const { getPathToGeneratorsConfiguration, getLatestGeneratorVersion } = await import(
            "@fern-api/configuration-loader"
        );
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue(candidate);
        const { loadAndRunMigrations } = await import("../migrations");
        vi.mocked(loadAndRunMigrations).mockResolvedValue(undefined);

        const result = await loadAndUpdateGenerators({
            absolutePathToWorkspace: "/test" as AbsoluteFilePath,
            context: mockContext,
            generatorFilter: undefined,
            groupFilter: undefined,
            includeMajor: true,
            skipAutoreleaseDisabled: false,
            channel: undefined,
            cliVersion: "1.0.0",
            organization: "test-org"
        });

        expect(result.updatedConfiguration).toContain(`version: ${candidate}`);
        expect(result.appliedUpgrades).toHaveLength(1);
    });

    it.each([
        ["configured", "not-a-version", "1.2.3"],
        ["candidate", "1.2.3", "not-a-version"],
        ["candidate with latest configured", "latest", "not-a-version"],
        ["equal malformed", "not-a-version", "not-a-version"]
    ])("fails actionably for malformed %s version", async (_kind, currentVersion, candidateVersion) => {
        const yamlContent = `groups:\n  production:\n    generators:\n      - name: fernapi/fern-typescript-sdk\n        version: ${currentVersion}\n`;
        const { getPathToGeneratorsConfiguration, getLatestGeneratorVersion } = await import(
            "@fern-api/configuration-loader"
        );
        vi.mocked(getPathToGeneratorsConfiguration).mockResolvedValue(testYamlPath as AbsoluteFilePath);
        vi.mocked(readFile).mockResolvedValue(yamlContent);
        vi.mocked(getLatestGeneratorVersion).mockResolvedValue(candidateVersion);

        await expect(
            loadAndUpdateGenerators({
                absolutePathToWorkspace: "/test" as AbsoluteFilePath,
                context: mockContext,
                generatorFilter: undefined,
                groupFilter: undefined,
                includeMajor: true,
                skipAutoreleaseDisabled: false,
                channel: undefined,
                cliVersion: "1.0.0",
                organization: "test-org"
            })
        ).rejects.toThrow(`configured version "${currentVersion}", candidate version "${candidateVersion}"`);
    });
});
