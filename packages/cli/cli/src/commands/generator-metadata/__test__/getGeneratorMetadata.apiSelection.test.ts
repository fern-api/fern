import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type ApiDirectorySpec, createApisProject } from "../../generator-list/__test__/multiApiFixtures.js";
import {
    type FernProjectFixture,
    LEGACY_GENERATORS_YML,
    removeTemporaryDirectories,
    sdkConfig
} from "../../generator-list/__test__/sdkConfigFixtures.js";
import {
    getGeneratorMetadata,
    getSdkConfigTargetMetadata,
    getSelectedGeneratorMetadata
} from "../getGeneratorMetadata.js";

function legacyYmlWithJavaVersion(version: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        api: { specs: [{ openapi: "./openapi.yml" }] },
        groups: {
            "java-sdk": {
                generators: [
                    {
                        name: "fernapi/fern-java-sdk",
                        version,
                        output: { location: "local-file-system", path: "../sdks/java" },
                        ...extra
                    }
                ]
            }
        }
    };
}

const JAVA_TARGET = { language: "java", output: { delivery: "files", path: "./sdks/java" } };

describe("generator get --api selection", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await removeTemporaryDirectories(temporaryDirectories);
    });

    async function project(apis: Record<string, ApiDirectorySpec>): Promise<FernProjectFixture> {
        return createApisProject({ apis, temporaryDirectories });
    }

    describe("getSelectedGeneratorMetadata", () => {
        it("dispatches a target selection to the SDK Config reader", async () => {
            const { project: loaded, cliContext } = await project({
                payments: { sdkConfigYml: sdkConfig([{ ...JAVA_TARGET, generatorVersion: "4.8.12" }]) }
            });

            await expect(
                getSelectedGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    apiFilter: undefined,
                    selection: { type: "target", target: "java" }
                })
            ).resolves.toEqual({
                description: "SDK Config target java",
                version: "4.8.12",
                language: "java",
                repository: undefined
            });
        });

        it("dispatches a group selection to the generators.yml reader", async () => {
            const { project: loaded, cliContext } = await project({
                payments: { generatorsYml: legacyYmlWithJavaVersion("4.8.12") }
            });

            await expect(
                getSelectedGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    apiFilter: "payments",
                    selection: { type: "group", group: "java-sdk", generator: "fern-java-sdk" }
                })
            ).resolves.toMatchObject({
                description: "generator fernapi/fern-java-sdk in group java-sdk",
                version: "4.8.12"
            });
        });
    });

    describe("getGeneratorMetadata", () => {
        const TWO_VERSIONS = {
            payments: { generatorsYml: legacyYmlWithJavaVersion("1.0.0") },
            billing: { generatorsYml: legacyYmlWithJavaVersion("2.0.0") }
        };

        it.each([
            { apiFilter: "payments", version: "1.0.0" },
            { apiFilter: "billing", version: "2.0.0" }
        ])("reads the generator of the API named by --api $apiFilter", async ({ apiFilter, version }) => {
            const { project: loaded, cliContext } = await project(TWO_VERSIONS);

            await expect(
                getGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    generatorFilter: "fern-java-sdk",
                    groupFilter: "java-sdk",
                    apiFilter
                })
            ).resolves.toMatchObject({ version });
        });

        it("silently resolves to one of the APIs when several have the generator and --api is omitted", async () => {
            const { project: loaded, cliContext } = await project(TWO_VERSIONS);

            const metadata = await getGeneratorMetadata({
                cliContext,
                project: loaded,
                generatorFilter: "fern-java-sdk",
                groupFilter: "java-sdk",
                apiFilter: undefined
            });

            // No ambiguity error is raised: the last workspace to finish loading wins
            expect(["1.0.0", "2.0.0"]).toContain(metadata.version);
        });

        it("enters a task for unselected workspaces too, unlike generator list, and returns from it early", async () => {
            const { project: loaded, cliContext } = await project(TWO_VERSIONS);

            await getGeneratorMetadata({
                cliContext,
                project: loaded,
                generatorFilter: "fern-java-sdk",
                groupFilter: "java-sdk",
                apiFilter: "billing"
            });

            const enteredWorkspaces = vi
                .mocked(cliContext.runTaskForWorkspace)
                .mock.calls.map(([workspace]) => workspace.workspaceName)
                .sort();
            expect(enteredWorkspaces).toEqual(["billing", "payments"]);
        });

        it("names the API and says no generators.yml was inspected when --api matches nothing", async () => {
            const { project: loaded, cliContext } = await project(TWO_VERSIONS);

            await expect(
                getGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    generatorFilter: "fern-java-sdk",
                    groupFilter: "java-sdk",
                    apiFilter: "nope"
                })
            ).rejects.toThrow(
                "Generator fern-java-sdk, in group java-sdk for API nope was not found; no generators.yml with groups was found."
            );
        });

        it("lists every inspected configuration, sorted, when nothing matches without --api", async () => {
            const { project: loaded, cliContext, directory } = await project(TWO_VERSIONS);

            await expect(
                getGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    generatorFilter: "fern-java-sdk",
                    groupFilter: "missing-group",
                    apiFilter: undefined
                })
            ).rejects.toThrow(
                `Generator fern-java-sdk, in group missing-group was not found in ${path.join(directory, "apis", "billing", "generators.yml")}, ${path.join(directory, "apis", "payments", "generators.yml")}.`
            );
        });

        it("lists only the selected API's configuration when nothing matches with --api", async () => {
            const { project: loaded, cliContext, directory } = await project(TWO_VERSIONS);

            await expect(
                getGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    generatorFilter: "fern-go-sdk",
                    groupFilter: "java-sdk",
                    apiFilter: "payments"
                })
            ).rejects.toThrow(
                `Generator fern-go-sdk, in group java-sdk for API payments was not found in ${path.join(directory, "apis", "payments", "generators.yml")}.`
            );
        });

        it("skips an API workspace that has no generators configuration", async () => {
            const { project: loaded, cliContext } = await project({
                definitionOnly: { extraFiles: { "definition/api.yml": "name: definition-only\n" } },
                payments: { generatorsYml: legacyYmlWithJavaVersion("1.0.0") }
            });

            await expect(
                getGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    generatorFilter: "fern-java-sdk",
                    groupFilter: "java-sdk",
                    apiFilter: undefined
                })
            ).resolves.toMatchObject({ version: "1.0.0" });
            await expect(
                getGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    generatorFilter: "fern-java-sdk",
                    groupFilter: "java-sdk",
                    apiFilter: "definitionOnly"
                })
            ).rejects.toThrow("for API definitionOnly was not found; no generators.yml with groups was found.");
        });

        it("adds a migration hint only from the selected APIs' sdk-config.yml", async () => {
            const {
                project: loaded,
                cliContext,
                directory
            } = await project({
                payments: {
                    legacyGeneratorsYml: { ...LEGACY_GENERATORS_YML, groups: {} },
                    sdkConfigYml: sdkConfig([JAVA_TARGET])
                },
                billing: {
                    legacyGeneratorsYml: { ...LEGACY_GENERATORS_YML, groups: {} },
                    sdkConfigYml: sdkConfig([JAVA_TARGET])
                }
            });

            await expect(
                getGeneratorMetadata({
                    cliContext,
                    project: loaded,
                    generatorFilter: "fern-java-sdk",
                    groupFilter: "java-sdk",
                    apiFilter: "billing"
                })
            ).rejects.toThrow(
                `It is configured as SDK Config target 'java' in ${path.join(directory, "apis", "billing", "sdk-config.yml")}; use --target java.`
            );
        });

        it.each([
            {
                name: "a github output",
                extra: { output: undefined, github: { repository: "acme/java-sdk" } },
                repository: "java-sdk"
            },
            { name: "a local output", extra: {}, repository: undefined }
        ])("reports the repository of $name", async ({ extra, repository }) => {
            const { project: loaded, cliContext } = await project({
                payments: { generatorsYml: legacyYmlWithJavaVersion("1.0.0", extra) }
            });

            const metadata = await getGeneratorMetadata({
                cliContext,
                project: loaded,
                generatorFilter: "fern-java-sdk",
                groupFilter: "java-sdk",
                apiFilter: undefined
            });

            expect(metadata.repository).toBe(repository);
        });
    });

    describe("getSdkConfigTargetMetadata", () => {
        const THREE_APIS: Record<string, ApiDirectorySpec> = {
            payments: { sdkConfigYml: sdkConfig([{ ...JAVA_TARGET, generatorVersion: "1.0.0" }]) },
            billing: { sdkConfigYml: sdkConfig([{ ...JAVA_TARGET, generatorVersion: "2.0.0" }]) },
            orders: {
                sdkConfigYml: sdkConfig([{ language: "python", output: { delivery: "files", path: "./py" } }])
            }
        };

        it.each([
            { apiFilter: "payments", version: "1.0.0" },
            { apiFilter: "billing", version: "2.0.0" }
        ])("reads the target of the API named by --api $apiFilter", async ({ apiFilter, version }) => {
            const { project: loaded, cliContext } = await project(THREE_APIS);

            await expect(
                getSdkConfigTargetMetadata({ cliContext, project: loaded, targetFilter: "java", apiFilter })
            ).resolves.toMatchObject({ version });
        });

        it("rejects a language shared by several APIs and points at --api", async () => {
            const { project: loaded, cliContext, directory } = await project(THREE_APIS);

            await expect(
                getSdkConfigTargetMetadata({ cliContext, project: loaded, targetFilter: "java", apiFilter: undefined })
            ).rejects.toThrow(
                new RegExp(
                    `--target java matches 2 SDK Config targets \\(java, java\\) in .*${escapeRegExp(path.join(directory, "apis"))}.*, but generator get reads exactly one\\. Use --api to select one API\\.$`
                )
            );
        });

        it("accepts a language that only one API has", async () => {
            const { project: loaded, cliContext } = await project(THREE_APIS);

            await expect(
                getSdkConfigTargetMetadata({
                    cliContext,
                    project: loaded,
                    targetFilter: "python",
                    apiFilter: undefined
                })
            ).resolves.toMatchObject({ language: "python", version: "latest" });
        });

        it("selects a repeated language by target id across APIs", async () => {
            const { project: loaded, cliContext } = await project({
                payments: {
                    sdkConfigYml: sdkConfig([
                        { ...JAVA_TARGET, generatorVersion: "1.0.0" },
                        { ...JAVA_TARGET, generatorVersion: "1.1.0" }
                    ])
                },
                billing: { sdkConfigYml: sdkConfig([{ ...JAVA_TARGET, generatorVersion: "2.0.0" }]) }
            });

            // Ids are per API: `java-1` exists only in payments, but plain `java` is ambiguous across all three
            await expect(
                getSdkConfigTargetMetadata({
                    cliContext,
                    project: loaded,
                    targetFilter: "java-1",
                    apiFilter: undefined
                })
            ).resolves.toMatchObject({ version: "1.1.0" });
            await expect(
                getSdkConfigTargetMetadata({ cliContext, project: loaded, targetFilter: "java", apiFilter: undefined })
            ).rejects.toThrow(/--target java matches 3 SDK Config targets \(.*\).*Use --api to select one API\./);
        });

        it("reports the targets of every selected API, de-duplicated, when the target is missing", async () => {
            const { project: loaded, cliContext } = await project(THREE_APIS);

            await expect(
                getSdkConfigTargetMetadata({ cliContext, project: loaded, targetFilter: "go", apiFilter: undefined })
            ).rejects.toThrow(/Available targets: java, python\.$/);
        });

        it("limits the available targets and the inspected files to the selected API", async () => {
            const { project: loaded, cliContext, directory } = await project(THREE_APIS);

            await expect(
                getSdkConfigTargetMetadata({ cliContext, project: loaded, targetFilter: "go", apiFilter: "orders" })
            ).rejects.toThrow(
                `SDK Config target 'go' was not found in ${path.join(directory, "apis", "orders", "sdk-config.yml")}. Available targets: python.`
            );
        });

        it("cannot reach the 'none' available-targets message: an sdk-config.yml without targets fails to load", async () => {
            const { project: loaded, cliContext } = await project({ empty: { sdkConfigYml: sdkConfig([]) } });

            await expect(
                getSdkConfigTargetMetadata({ cliContext, project: loaded, targetFilter: "java", apiFilter: undefined })
            ).rejects.toThrow(/failed validation/);
        });

        it("reports the API in the error when --api matches no sdk-config.yml", async () => {
            const { project: loaded, cliContext } = await project(THREE_APIS);

            await expect(
                getSdkConfigTargetMetadata({ cliContext, project: loaded, targetFilter: "java", apiFilter: "nope" })
            ).rejects.toThrow(
                "No sdk-config.yml was found for API nope. Use --group and --generator to select a generator from generators.yml."
            );
        });

        it("reports a missing sdk-config.yml for an API that only has a generators.yml", async () => {
            const { project: loaded, cliContext } = await project({
                ...THREE_APIS,
                legacy: { generatorsYml: legacyYmlWithJavaVersion("1.0.0") }
            });

            await expect(
                getSdkConfigTargetMetadata({ cliContext, project: loaded, targetFilter: "java", apiFilter: "legacy" })
            ).rejects.toThrow("No sdk-config.yml was found for API legacy.");
        });
    });
});

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
