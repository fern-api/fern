import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";
import type { CliContext } from "../../../cli-context/CliContext.js";

import {
    createFernProject,
    createMultiApiFernProject,
    LEGACY_GENERATORS_YML,
    removeTemporaryDirectories,
    sdkConfig
} from "../../generator-list/__test__/sdkConfigFixtures.js";
import {
    getGeneratorMetadata,
    getSdkConfigTargetMetadata,
    resolveGeneratorGetSelection
} from "../getGeneratorMetadata.js";

const PYTHON_ONLY_LEGACY_YML = {
    ...LEGACY_GENERATORS_YML,
    groups: { "python-sdk": LEGACY_GENERATORS_YML.groups["python-sdk"] }
};

describe("resolveGeneratorGetSelection", () => {
    const cliContext = {
        failAndThrow: vi.fn((message?: string) => {
            throw new Error(message);
        })
    } as unknown as CliContext;
    const resolve = (selectors: { target?: string; group?: string; generator?: string }) =>
        resolveGeneratorGetSelection({
            cliContext,
            target: selectors.target,
            group: selectors.group,
            generator: selectors.generator
        });

    it("selects an SDK Config target or a legacy group generator", () => {
        expect(resolve({ target: "java" })).toEqual({ type: "target", target: "java" });
        expect(resolve({ group: "java-sdk", generator: "fernapi/fern-java-sdk" })).toEqual({
            type: "group",
            group: "java-sdk",
            generator: "fernapi/fern-java-sdk"
        });
    });

    it("rejects --target combined with legacy selectors", () => {
        expect(() => resolve({ target: "java", group: "java-sdk" })).toThrow(
            "Use --target, or --group with --generator, not both."
        );
        expect(() => resolve({ target: "java", generator: "fernapi/fern-java-sdk" })).toThrow("not both");
    });

    it("rejects an incomplete legacy selection", () => {
        expect(() => resolve({})).toThrow("Specify --target");
        expect(() => resolve({ group: "java-sdk" })).toThrow("Specify --target");
        expect(() => resolve({ generator: "fernapi/fern-java-sdk" })).toThrow("Specify --target");
    });
});

describe("generator get with SDK Config targets", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await removeTemporaryDirectories(temporaryDirectories);
    });

    it("still reads a legacy group generator", async () => {
        const { project, cliContext } = await createFernProject({
            generatorsYml: LEGACY_GENERATORS_YML,
            temporaryDirectories
        });

        await expect(
            getGeneratorMetadata({
                cliContext,
                project,
                generatorFilter: "fern-java-sdk",
                groupFilter: "java-sdk",
                apiFilter: undefined
            })
        ).resolves.toMatchObject({ version: "4.8.12" });
    });

    it("reads a target's version, language, and repository", async () => {
        const { project, cliContext } = await createFernProject({
            sdkConfigYml: sdkConfig([
                {
                    language: "java",
                    generatorVersion: "4.8.12",
                    output: { delivery: "github", github: { repository: "acme/java-sdk" } }
                },
                { language: "python", output: { delivery: "files", path: "./sdks/python" } }
            ]),
            temporaryDirectories
        });

        await expect(
            getSdkConfigTargetMetadata({ cliContext, project, targetFilter: "java", apiFilter: undefined })
        ).resolves.toEqual({
            description: "SDK Config target java",
            version: "4.8.12",
            language: "java",
            repository: "acme/java-sdk"
        });
        await expect(
            getSdkConfigTargetMetadata({ cliContext, project, targetFilter: "python", apiFilter: undefined })
        ).resolves.toMatchObject({ version: "latest", repository: undefined });
    });

    it("reads a target in a mid-migration project", async () => {
        const { project, cliContext } = await createFernProject({
            legacyGeneratorsYml: PYTHON_ONLY_LEGACY_YML,
            sdkConfigYml: sdkConfig([{ language: "java", output: { delivery: "files", path: "./sdks/java" } }]),
            temporaryDirectories
        });

        await expect(
            getSdkConfigTargetMetadata({ cliContext, project, targetFilter: "java", apiFilter: undefined })
        ).resolves.toMatchObject({ language: "java", version: "latest" });
    });

    it("names sdk-config.yml and the available targets when the target is missing", async () => {
        const { project, cliContext, directory } = await createFernProject({
            sdkConfigYml: sdkConfig([{ language: "java", output: { delivery: "files", path: "./sdks/java" } }]),
            temporaryDirectories
        });

        await expect(
            getSdkConfigTargetMetadata({ cliContext, project, targetFilter: "go", apiFilter: undefined })
        ).rejects.toThrow(
            `SDK Config target 'go' was not found in ${path.join(directory, "sdk-config.yml")}. Available targets: java.`
        );
    });

    it("rejects --target when the project has no sdk-config.yml", async () => {
        const { project, cliContext } = await createFernProject({
            generatorsYml: LEGACY_GENERATORS_YML,
            temporaryDirectories
        });

        await expect(
            getSdkConfigTargetMetadata({ cliContext, project, targetFilter: "java", apiFilter: undefined })
        ).rejects.toThrow("No sdk-config.yml was found. Use --group and --generator");
    });

    it("rejects a language that matches several targets and accepts a target id", async () => {
        const { project, cliContext } = await createFernProject({
            sdkConfigYml: sdkConfig([
                { language: "java", output: { delivery: "files", path: "./sdks/java-files" } },
                {
                    language: "java",
                    generatorVersion: "4.8.12",
                    output: { delivery: "github", github: { repository: "acme/java-sdk" } }
                }
            ]),
            temporaryDirectories
        });

        await expect(
            getSdkConfigTargetMetadata({ cliContext, project, targetFilter: "java", apiFilter: undefined })
        ).rejects.toThrow(/--target java matches 2 SDK Config targets \(java-0, java-1\).*--target java-0\./);
        await expect(
            getSdkConfigTargetMetadata({ cliContext, project, targetFilter: "java-1", apiFilter: undefined })
        ).resolves.toMatchObject({ version: "4.8.12", repository: "acme/java-sdk" });
    });

    it("points a migrated legacy selection at its SDK Config target", async () => {
        const { project, cliContext, directory } = await createFernProject({
            legacyGeneratorsYml: PYTHON_ONLY_LEGACY_YML,
            sdkConfigYml: sdkConfig([{ language: "java", output: { delivery: "files", path: "./sdks/java" } }]),
            temporaryDirectories
        });

        await expect(
            getGeneratorMetadata({
                cliContext,
                project,
                generatorFilter: "fern-java-sdk",
                groupFilter: "java-sdk",
                apiFilter: undefined
            })
        ).rejects.toThrow(
            `Generator fern-java-sdk, in group java-sdk was not found in ${path.join(directory, "generators.legacy.yml")}. ` +
                `It is configured as SDK Config target 'java' in ${path.join(directory, "sdk-config.yml")}; use --target java.`
        );
    });

    it("--api never reads the sdk-config.yml of an unselected API", async () => {
        const { project, cliContext } = await createMultiApiFernProject({
            sdkConfigYmlByApi: {
                payments: YAML.stringify(
                    sdkConfig([
                        { language: "java", generatorVersion: "4.8.12", output: { delivery: "files", path: "./java" } }
                    ])
                ),
                billing: "targets: [this is: not valid yaml"
            },
            temporaryDirectories
        });

        await expect(
            getSdkConfigTargetMetadata({ cliContext, project, targetFilter: "java", apiFilter: "payments" })
        ).resolves.toMatchObject({ version: "4.8.12" });
    });
});
