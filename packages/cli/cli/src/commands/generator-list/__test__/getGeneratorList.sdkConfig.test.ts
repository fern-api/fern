import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import YAML from "yaml";

import { GenerationModeFilter, getGeneratorList } from "../getGeneratorList.js";
import {
    createFernProject,
    createMultiApiFernProject,
    type FernProjectFixture,
    LEGACY_GENERATORS_YML,
    removeTemporaryDirectories,
    sdkConfig
} from "./sdkConfigFixtures.js";

const PYTHON_ONLY_LEGACY_YML = {
    ...LEGACY_GENERATORS_YML,
    groups: { "python-sdk": LEGACY_GENERATORS_YML.groups["python-sdk"] }
};

describe("getGeneratorList with SDK Config targets", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await removeTemporaryDirectories(temporaryDirectories);
    });

    async function list(
        { project, cliContext, directory }: FernProjectFixture,
        filters: {
            generatorFilter?: Set<string>;
            groupFilter?: Set<string>;
            targetFilter?: Set<string>;
            apiFilter?: Set<string>;
            includedModes?: Set<GenerationModeFilter>;
            excludedModes?: Set<GenerationModeFilter>;
        } = {}
    ): Promise<unknown> {
        const outputLocation = path.join(directory, "generator-list.yml");
        await getGeneratorList({
            cliContext,
            project,
            generatorFilter: filters.generatorFilter,
            groupFilter: filters.groupFilter,
            targetFilter: filters.targetFilter,
            apiFilter: filters.apiFilter,
            apiKeyFallback: undefined,
            outputLocation,
            includedModes: filters.includedModes,
            excludedModes: filters.excludedModes
        });
        return YAML.parse(await readFile(outputLocation, "utf8"));
    }

    it("lists legacy groups with an empty targets section when there is no sdk-config.yml", async () => {
        const fixture = await createFernProject({ generatorsYml: LEGACY_GENERATORS_YML, temporaryDirectories });

        expect(await list(fixture)).toEqual({
            FERN_DEFAULT: {
                groups: {
                    "python-sdk": ["fernapi/fern-python-sdk"],
                    "java-sdk": ["fernapi/fern-java-sdk"]
                },
                targets: {}
            }
        });
    });

    it("lists targets from an SDK Config-only project", async () => {
        const fixture = await createFernProject({
            sdkConfigYml: sdkConfig([
                { language: "java", generatorVersion: "4.8.12", output: { delivery: "files", path: "./sdks/java" } },
                { language: "python", output: { delivery: "files", path: "./sdks/python" } }
            ]),
            temporaryDirectories
        });

        expect(await list(fixture)).toEqual({
            FERN_DEFAULT: {
                groups: {},
                targets: {
                    java: { language: "java", generator: "fernapi/fern-java-sdk", version: "4.8.12" },
                    python: { language: "python", generator: "fernapi/fern-python-sdk", version: "latest" }
                }
            }
        });
    });

    it("lists both sources of a mid-migration project, keeping a language configured in both", async () => {
        const fixture = await createFernProject({
            legacyGeneratorsYml: LEGACY_GENERATORS_YML,
            sdkConfigYml: sdkConfig([{ language: "java", output: { delivery: "files", path: "./sdks/java" } }]),
            temporaryDirectories
        });

        const listed = await list(fixture);

        expect(listed).toEqual({
            FERN_DEFAULT: {
                groups: {
                    "python-sdk": ["fernapi/fern-python-sdk"],
                    "java-sdk": ["fernapi/fern-java-sdk"]
                },
                targets: {
                    java: { language: "java", generator: "fernapi/fern-java-sdk", version: "latest" }
                }
            }
        });
        // Repeated runs print the same document
        expect(await list(fixture)).toEqual(listed);
    });

    it("gives repeated languages distinct target ids", async () => {
        const fixture = await createFernProject({
            sdkConfigYml: sdkConfig([
                { language: "java", output: { delivery: "files", path: "./sdks/java-files" } },
                { language: "java", output: { delivery: "github", github: { repository: "acme/java-sdk" } } }
            ]),
            temporaryDirectories
        });

        expect(await list(fixture)).toMatchObject({
            FERN_DEFAULT: { targets: { "java-0": { language: "java" }, "java-1": { language: "java" } } }
        });
        expect(await list(fixture, { targetFilter: new Set(["java-1"]) })).toEqual({
            FERN_DEFAULT: {
                groups: {},
                targets: { "java-1": { language: "java", generator: "fernapi/fern-java-sdk", version: "latest" } }
            }
        });
    });

    describe("filters", () => {
        async function midMigrationProject(): Promise<FernProjectFixture> {
            return createFernProject({
                legacyGeneratorsYml: PYTHON_ONLY_LEGACY_YML,
                sdkConfigYml: sdkConfig([
                    { language: "java", output: { delivery: "github", github: { repository: "acme/java-sdk" } } },
                    { language: "ruby", output: { delivery: "files", path: "./sdks/ruby" } }
                ]),
                temporaryDirectories
            });
        }

        it("--groups lists only legacy groups", async () => {
            expect(await list(await midMigrationProject(), { groupFilter: new Set(["python-sdk"]) })).toEqual({
                FERN_DEFAULT: { groups: { "python-sdk": ["fernapi/fern-python-sdk"] }, targets: {} }
            });
        });

        it("--targets lists only SDK Config targets, selected by language", async () => {
            expect(await list(await midMigrationProject(), { targetFilter: new Set(["ruby"]) })).toEqual({
                FERN_DEFAULT: {
                    groups: {},
                    targets: { ruby: { language: "ruby", generator: "fernapi/fern-ruby-sdk-v2", version: "latest" } }
                }
            });
        });

        it("--generators filters both sources by generator name", async () => {
            expect(await list(await midMigrationProject(), { generatorFilter: new Set(["fern-java-sdk"]) })).toEqual({
                FERN_DEFAULT: {
                    groups: { "python-sdk": [] },
                    targets: { java: { language: "java", generator: "fernapi/fern-java-sdk", version: "latest" } }
                }
            });
        });

        it("maps SDK Config delivery onto --include-mode and --exclude-mode", async () => {
            const fixture = await midMigrationProject();

            expect(await list(fixture, { includedModes: new Set([GenerationModeFilter.GitHub]) })).toMatchObject({
                FERN_DEFAULT: { groups: { "python-sdk": [] }, targets: { java: { language: "java" } } }
            });
            expect(
                Object.keys(
                    (
                        (await list(fixture, { excludedModes: new Set([GenerationModeFilter.Local]) })) as {
                            FERN_DEFAULT: { targets: Record<string, unknown> };
                        }
                    ).FERN_DEFAULT.targets
                )
            ).toEqual(["java"]);
        });

        it("filters a target without output by the global output it inherits", async () => {
            // SDK Config requires a target output unless a global output is configured
            const fixture = await createFernProject({
                sdkConfigYml: {
                    ...sdkConfig([
                        { language: "python" },
                        { language: "java", output: { delivery: "github", github: { repository: "acme/java-sdk" } } }
                    ]),
                    output: { delivery: "files", path: "./sdks" }
                },
                temporaryDirectories
            });

            expect(await list(fixture, { includedModes: new Set([GenerationModeFilter.Local]) })).toEqual({
                FERN_DEFAULT: {
                    groups: {},
                    targets: { python: { language: "python", generator: "fernapi/fern-python-sdk", version: "latest" } }
                }
            });
            expect(await list(fixture, { excludedModes: new Set([GenerationModeFilter.Local]) })).toEqual({
                FERN_DEFAULT: {
                    groups: {},
                    targets: { java: { language: "java", generator: "fernapi/fern-java-sdk", version: "latest" } }
                }
            });
        });

        it("--apis never reads the sdk-config.yml of an unselected API", async () => {
            const fixture = await createMultiApiFernProject({
                sdkConfigYmlByApi: {
                    payments: YAML.stringify(
                        sdkConfig([{ language: "java", output: { delivery: "files", path: "./sdks/java" } }])
                    ),
                    billing: "targets: [this is: not valid yaml"
                },
                temporaryDirectories
            });

            expect(await list(fixture, { apiFilter: new Set(["payments"]) })).toEqual({
                payments: {
                    groups: {},
                    targets: { java: { language: "java", generator: "fernapi/fern-java-sdk", version: "latest" } }
                }
            });
        });
    });
});
