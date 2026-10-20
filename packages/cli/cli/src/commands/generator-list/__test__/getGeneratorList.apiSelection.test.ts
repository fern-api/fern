import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import { GenerationModeFilter, getGeneratorList } from "../getGeneratorList.js";
import { type ApiDirectorySpec, createApisProject, createRootProject } from "./multiApiFixtures.js";
import {
    type FernProjectFixture,
    LEGACY_GENERATORS_YML,
    removeTemporaryDirectories,
    sdkConfig
} from "./sdkConfigFixtures.js";

const PYTHON_ONLY_LEGACY_YML = {
    ...LEGACY_GENERATORS_YML,
    groups: { "python-sdk": LEGACY_GENERATORS_YML.groups["python-sdk"] }
};
const JAVA_ONLY_LEGACY_YML = {
    ...LEGACY_GENERATORS_YML,
    groups: { "java-sdk": LEGACY_GENERATORS_YML.groups["java-sdk"] }
};

const JAVA_TARGET = { language: "java", output: { delivery: "files", path: "./sdks/java" } };
const PYTHON_TARGET = { language: "python", output: { delivery: "files", path: "./sdks/python" } };

/**
 * payments: generators.yml + sdk-config.yml (a "mixed" API workspace)
 * billing:  generators.yml only
 * orders:   sdk-config.yml only (an SDK Config workspace)
 */
const THREE_APIS: Record<string, ApiDirectorySpec> = {
    payments: { generatorsYml: PYTHON_ONLY_LEGACY_YML, sdkConfigYml: sdkConfig([JAVA_TARGET]) },
    billing: { generatorsYml: JAVA_ONLY_LEGACY_YML },
    orders: { sdkConfigYml: sdkConfig([PYTHON_TARGET]) }
};

const PAYMENTS_ENTRY = {
    groups: { "python-sdk": ["fernapi/fern-python-sdk"] },
    targets: { java: { language: "java", generator: "fernapi/fern-java-sdk", version: "latest" } }
};
const BILLING_ENTRY = { groups: { "java-sdk": ["fernapi/fern-java-sdk"] }, targets: {} };
const ORDERS_ENTRY = {
    groups: {},
    targets: { python: { language: "python", generator: "fernapi/fern-python-sdk", version: "latest" } }
};

describe("getGeneratorList --api selection", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        vi.restoreAllMocks();
        await removeTemporaryDirectories(temporaryDirectories);
    });

    async function list(
        { project, cliContext, directory }: FernProjectFixture,
        filters: {
            apiFilter?: Set<string>;
            groupFilter?: Set<string>;
            generatorFilter?: Set<string>;
            includedModes?: Set<GenerationModeFilter>;
            excludedModes?: Set<GenerationModeFilter>;
            apiKeyFallback?: string;
        } = {}
    ): Promise<unknown> {
        const outputLocation = path.join(directory, "generator-list.yml");
        await getGeneratorList({
            cliContext,
            project,
            generatorFilter: filters.generatorFilter,
            groupFilter: filters.groupFilter,
            targetFilter: undefined,
            apiFilter: filters.apiFilter,
            apiKeyFallback: filters.apiKeyFallback,
            outputLocation,
            includedModes: filters.includedModes,
            excludedModes: filters.excludedModes
        });
        return YAML.parse(await readFile(outputLocation, "utf8"));
    }

    describe("project with legacy, mixed and SDK Config-only APIs", () => {
        it("classifies the fixture directories as expected", async () => {
            const { project } = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(project.apiWorkspaces.map((workspace) => workspace.workspaceName).sort()).toEqual([
                "billing",
                "payments"
            ]);
            expect((project.sdkConfigWorkspaces ?? []).map((workspace) => workspace.workspaceName)).toEqual(["orders"]);
        });

        it("lists every API without --api", async () => {
            const fixture = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(await list(fixture)).toEqual({
                payments: PAYMENTS_ENTRY,
                billing: BILLING_ENTRY,
                orders: ORDERS_ENTRY
            });
        });

        it.each([
            { name: "a mixed API", apis: ["payments"], expected: { payments: PAYMENTS_ENTRY } },
            { name: "a legacy-only API", apis: ["billing"], expected: { billing: BILLING_ENTRY } },
            { name: "an SDK Config-only API", apis: ["orders"], expected: { orders: ORDERS_ENTRY } }
        ])("lists only $name for one --api", async ({ apis, expected }) => {
            const fixture = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(await list(fixture, { apiFilter: new Set(apis) })).toEqual(expected);
        });

        it("lists exactly the named APIs for several --api values", async () => {
            const fixture = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(await list(fixture, { apiFilter: new Set(["billing", "orders"]) })).toEqual({
                billing: BILLING_ENTRY,
                orders: ORDERS_ENTRY
            });
            expect(await list(fixture, { apiFilter: new Set(["orders", "payments", "billing"]) })).toEqual({
                payments: PAYMENTS_ENTRY,
                billing: BILLING_ENTRY,
                orders: ORDERS_ENTRY
            });
        });

        it("prints an empty document for an unknown API instead of failing", async () => {
            const fixture = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(await list(fixture, { apiFilter: new Set(["nope"]) })).toEqual({});
        });

        it("ignores unknown names next to known ones", async () => {
            const fixture = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(await list(fixture, { apiFilter: new Set(["nope", "orders"]) })).toEqual({ orders: ORDERS_ENTRY });
        });

        it("matches API names exactly, including case", async () => {
            const fixture = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(await list(fixture, { apiFilter: new Set(["Payments", "pay"]) })).toEqual({});
        });

        it("does not load the generators.yml of an unselected API", async () => {
            const fixture = await createApisProject({
                apis: {
                    payments: { generatorsYml: PYTHON_ONLY_LEGACY_YML },
                    billing: { generatorsYml: JAVA_ONLY_LEGACY_YML }
                },
                temporaryDirectories
            });
            const { cliContext } = fixture;

            await list(fixture, { apiFilter: new Set(["payments"]) });

            const workspacesRunByTask = vi
                .mocked(cliContext.runTaskForWorkspace)
                .mock.calls.map(([workspace]) => workspace.workspaceName);
            expect(workspacesRunByTask).toEqual(["payments"]);
        });

        it("applies --groups to the selected APIs only and still lists an API with no matching group", async () => {
            const fixture = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(
                await list(fixture, { apiFilter: new Set(["payments", "billing"]), groupFilter: new Set(["java-sdk"]) })
            ).toEqual({
                payments: { groups: {}, targets: {} },
                billing: BILLING_ENTRY
            });
        });

        it("keeps an API in the output when --generators filters out all of its generators", async () => {
            const fixture = await createApisProject({ apis: THREE_APIS, temporaryDirectories });

            expect(
                await list(fixture, {
                    apiFilter: new Set(["billing"]),
                    generatorFilter: new Set(["fernapi/fern-go-sdk"])
                })
            ).toEqual({ billing: { groups: { "java-sdk": [] }, targets: {} } });
        });
    });

    describe("single API at the root of fern/", () => {
        it("lists a nameless API under FERN_DEFAULT without --api", async () => {
            const fixture = await createRootProject({
                root: { generatorsYml: PYTHON_ONLY_LEGACY_YML },
                temporaryDirectories
            });

            expect(await list(fixture)).toEqual({ FERN_DEFAULT: { groups: PAYMENTS_ENTRY.groups, targets: {} } });
        });

        it("uses the apiKeyFallback as the key of a nameless API", async () => {
            const fixture = await createRootProject({
                root: { generatorsYml: PYTHON_ONLY_LEGACY_YML, sdkConfigYml: sdkConfig([JAVA_TARGET]) },
                temporaryDirectories
            });

            expect(await list(fixture, { apiKeyFallback: "my-api" })).toEqual({ "my-api": PAYMENTS_ENTRY });
        });

        it("never selects a nameless API when --api is given, whatever the name", async () => {
            const fixture = await createRootProject({
                root: { generatorsYml: PYTHON_ONLY_LEGACY_YML, sdkConfigYml: sdkConfig([JAVA_TARGET]) },
                temporaryDirectories
            });

            expect(await list(fixture, { apiFilter: new Set(["anything"]) })).toEqual({});
            expect(await list(fixture, { apiFilter: new Set(["FERN_DEFAULT"]) })).toEqual({});
        });
    });

    describe("API workspace without a generators configuration", () => {
        it("is omitted from the output", async () => {
            const fixture = await createApisProject({
                apis: {
                    definitionOnly: { extraFiles: { "definition/api.yml": "name: definition-only\n" } },
                    billing: { generatorsYml: JAVA_ONLY_LEGACY_YML }
                },
                temporaryDirectories
            });

            expect(await list(fixture)).toEqual({ billing: BILLING_ENTRY });
        });
    });

    describe("SDK Config targets without a generator", () => {
        it("lists a terraform target without a generator and drops it when --generators is given", async () => {
            const fixture = await createApisProject({
                apis: {
                    infra: {
                        sdkConfigYml: sdkConfig([
                            { language: "terraform", output: { delivery: "files", path: "./terraform" } },
                            PYTHON_TARGET
                        ])
                    }
                },
                temporaryDirectories
            });

            expect(await list(fixture)).toEqual({
                infra: {
                    groups: {},
                    targets: {
                        terraform: { language: "terraform", version: "latest" },
                        python: { language: "python", generator: "fernapi/fern-python-sdk", version: "latest" }
                    }
                }
            });
            expect(await list(fixture, { generatorFilter: new Set(["fernapi/fern-python-sdk"]) })).toEqual({
                infra: {
                    groups: {},
                    targets: { python: { language: "python", generator: "fernapi/fern-python-sdk", version: "latest" } }
                }
            });
        });
    });

    describe("output modes of legacy generators", () => {
        const LEGACY_MODES = {
            api: { specs: [{ openapi: "./openapi.yml" }] },
            groups: {
                local: {
                    generators: [
                        {
                            name: "fernapi/fern-python-sdk",
                            version: "4.3.10",
                            output: { location: "local-file-system", path: "../sdks/python" }
                        }
                    ]
                },
                github: {
                    generators: [
                        {
                            name: "fernapi/fern-java-sdk",
                            version: "4.8.12",
                            github: { repository: "acme/java-sdk" }
                        }
                    ]
                },
                npm: {
                    generators: [
                        {
                            name: "fernapi/fern-typescript-sdk",
                            version: "3.0.0",
                            output: { location: "npm", "package-name": "@acme/sdk", token: "${NPM_TOKEN}" }
                        }
                    ]
                },
                "fern-registry": {
                    generators: [{ name: "fernapi/fern-go-sdk", version: "1.0.0" }]
                }
            }
        };

        const allGroups = {
            local: ["fernapi/fern-python-sdk"],
            github: ["fernapi/fern-java-sdk"],
            npm: ["fernapi/fern-typescript-sdk"],
            "fern-registry": ["fernapi/fern-go-sdk"]
        };

        it.each([
            { name: "no mode filter", filters: {}, expectedGroups: ["local", "github", "npm", "fern-registry"] },
            {
                name: "include local-file-system",
                filters: { includedModes: new Set([GenerationModeFilter.Local]) },
                expectedGroups: ["local"]
            },
            {
                name: "include github",
                filters: { includedModes: new Set([GenerationModeFilter.GitHub]) },
                expectedGroups: ["github"]
            },
            {
                name: "include publish",
                filters: { includedModes: new Set([GenerationModeFilter.PackageRegistry]) },
                expectedGroups: ["npm", "fern-registry"]
            },
            {
                name: "exclude publish",
                filters: { excludedModes: new Set([GenerationModeFilter.PackageRegistry]) },
                expectedGroups: ["local", "github"]
            },
            {
                name: "exclude publish but include github (an exclusion overrides the inclusion)",
                filters: {
                    includedModes: new Set([GenerationModeFilter.GitHub]),
                    excludedModes: new Set([GenerationModeFilter.PackageRegistry])
                },
                expectedGroups: ["local", "github"]
            }
        ])("classifies each output mode with $name", async ({ filters, expectedGroups }) => {
            const fixture = await createRootProject({
                root: { generatorsYml: LEGACY_MODES },
                temporaryDirectories
            });

            const listed = (await list(fixture, filters)) as {
                FERN_DEFAULT: { groups: Record<string, string[]> };
            };

            // Groups stay listed with an empty generator list when all their generators are filtered out
            expect(Object.keys(listed.FERN_DEFAULT.groups)).toEqual(Object.keys(allGroups));
            expect(
                Object.entries(listed.FERN_DEFAULT.groups)
                    .filter(([, generators]) => generators.length > 0)
                    .map(([groupName]) => groupName)
            ).toEqual(expectedGroups);
        });
    });

    describe("SDK Config output delivery modes", () => {
        const TARGETS = [
            { language: "java", output: { delivery: "files", path: "./java" } },
            { language: "php", output: { delivery: "zip" } },
            {
                language: "python",
                package: { packageName: "acme" },
                output: { delivery: "files", publish: { registry: "pypi" } }
            },
            {
                language: "typescript",
                package: { packageName: "@acme/sdk" },
                output: { delivery: "github", github: { repository: "acme/ts" }, publish: { registry: "npm" } }
            }
        ];

        it.each([
            { name: "local", mode: GenerationModeFilter.Local, expected: ["java", "php"] },
            { name: "github", mode: GenerationModeFilter.GitHub, expected: ["typescript"] },
            { name: "publish", mode: GenerationModeFilter.PackageRegistry, expected: ["python"] }
        ])("maps delivery onto the $name mode", async ({ mode, expected }) => {
            const fixture = await createRootProject({
                root: { sdkConfigYml: sdkConfig(TARGETS) },
                temporaryDirectories
            });

            const listed = (await list(fixture, { includedModes: new Set([mode]) })) as {
                FERN_DEFAULT: { targets: Record<string, unknown> };
            };

            expect(Object.keys(listed.FERN_DEFAULT.targets)).toEqual(expected);
        });
    });

    describe("output destination", () => {
        it("writes the document to stdout when no output location is given", async () => {
            const fixture = await createRootProject({
                root: { generatorsYml: PYTHON_ONLY_LEGACY_YML },
                temporaryDirectories
            });
            const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

            await getGeneratorList({
                cliContext: fixture.cliContext,
                project: fixture.project,
                generatorFilter: undefined,
                groupFilter: undefined,
                targetFilter: undefined,
                apiFilter: undefined,
                apiKeyFallback: undefined,
                outputLocation: undefined,
                includedModes: undefined,
                excludedModes: undefined
            });

            expect(write).toHaveBeenCalledOnce();
            expect(YAML.parse(String(write.mock.calls[0]?.[0]))).toEqual({
                FERN_DEFAULT: { groups: PAYMENTS_ENTRY.groups, targets: {} }
            });
        });

        it("fails with the location in the message when the file cannot be written", async () => {
            const fixture = await createRootProject({
                root: { generatorsYml: PYTHON_ONLY_LEGACY_YML },
                temporaryDirectories
            });
            const outputLocation = path.join(fixture.directory, "missing-directory", "out.yml");

            await expect(
                getGeneratorList({
                    cliContext: fixture.cliContext,
                    project: fixture.project,
                    generatorFilter: undefined,
                    groupFilter: undefined,
                    targetFilter: undefined,
                    apiFilter: undefined,
                    apiKeyFallback: undefined,
                    outputLocation,
                    includedModes: undefined,
                    excludedModes: undefined
                })
            ).rejects.toThrow(`Could not write file to the specified location: ${outputLocation}`);
        });
    });
});
