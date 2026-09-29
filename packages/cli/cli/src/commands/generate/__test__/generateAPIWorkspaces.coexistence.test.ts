import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import type { fernConfigJson, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import { CliError, createMockTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { generateWorkspace } from "../generateAPIWorkspace.js";
import { generateAPIWorkspaces } from "../generateAPIWorkspaces.js";

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn(async () => ({ type: "organization" as const, value: "test-token" }))
}));

vi.mock("../checkOutputDirectory.js", () => ({
    checkOutputDirectory: vi.fn(async () => ({ shouldProceed: true }))
}));

vi.mock("../generateAPIWorkspace.js", () => ({
    generateWorkspace: vi.fn(async () => undefined)
}));

describe("generateAPIWorkspaces coexistence", () => {
    let temporaryDirectory: string;
    let project: Project;
    let cliContext: CliContext;

    beforeEach(async () => {
        temporaryDirectory = await mkdtemp(path.join(tmpdir(), "fern-generate-coexistence-"));
        await mkdir(path.join(temporaryDirectory, "openapi"));
        await writeFile(
            path.join(temporaryDirectory, "openapi", "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n"
        );
        await writeFile(
            path.join(temporaryDirectory, "sdk-config.yml"),
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./openapi/openapi.yml" }] },
                targets: [{ language: "typescript", output: { delivery: "files", path: "./generated/typescript" } }]
            })
        );
        const taskContext = createMockTaskContext();
        cliContext = {
            environment: { packageVersion: "0.0.0" },
            failAndThrow: vi.fn(taskContext.failAndThrow.bind(taskContext)),
            instrumentPostHogEvent: vi.fn(),
            logger: taskContext.logger,
            runTask: vi.fn(async (task) => task(taskContext)),
            runTaskForWorkspace: vi.fn(async (_workspace, task) => task(taskContext))
        } as unknown as CliContext;
        project = createProject(temporaryDirectory);
        vi.mocked(generateWorkspace).mockClear();
    });

    afterEach(async () => {
        await rm(temporaryDirectory, { recursive: true, force: true });
    });

    it.each([
        {
            name: "generates only a legacy group when only --group is supplied",
            groupNames: ["python-sdk"],
            targetNames: undefined,
            expected: ["legacy"]
        },
        {
            name: "generates only an SDK Config target when only --target is supplied",
            groupNames: undefined,
            targetNames: ["typescript"],
            expected: ["sdk-config"]
        },
        {
            name: "generates legacy and SDK Config selections together",
            groupNames: ["python-sdk"],
            targetNames: ["typescript"],
            expected: ["legacy", "sdk-config"]
        },
        {
            name: "generates the legacy default and every default SDK Config target without selectors",
            groupNames: undefined,
            targetNames: undefined,
            expected: ["legacy", "sdk-config"]
        }
    ])("$name", async ({ groupNames, targetNames, expected }) => {
        await runGenerate({ project, cliContext, groupNames, targetNames });

        const kinds = vi
            .mocked(generateWorkspace)
            .mock.calls.map(([args]) => (args.sdkConfigV1 == null ? "legacy" : "sdk-config"));
        expect(kinds).toEqual(expected);
    });

    it("uses an explicitly selected SDK Config instead of the workspace default", async () => {
        const alternativePath = path.join(temporaryDirectory, "internal-sdk-config.yml");
        await writeFile(
            alternativePath,
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "internal-payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./openapi/openapi.yml" }] },
                targets: [{ language: "typescript", output: { delivery: "files" } }]
            })
        );

        await runGenerate({
            project,
            cliContext,
            groupNames: ["python-sdk"],
            targetNames: ["typescript"],
            sdkConfigPath: alternativePath
        });

        const sdkCall = vi.mocked(generateWorkspace).mock.calls.find(([args]) => args.sdkConfigV1 != null)?.[0];
        expect(sdkCall?.sdkConfigV1?.sdkName).toBe("internal-payments");
        expect(vi.mocked(generateWorkspace)).toHaveBeenCalledTimes(2);
    });

    it("rejects an explicit SDK Config with a pre-cutover generator version", async () => {
        const configPath = path.join(temporaryDirectory, "pre-cutover-sdk-config.yml");
        await writeFile(
            configPath,
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./openapi/openapi.yml" }] },
                targets: [
                    {
                        language: "typescript",
                        generatorVersion: "3.99.0",
                        output: { delivery: "files" }
                    }
                ]
            })
        );

        await expect(
            runGenerate({
                project,
                cliContext,
                groupNames: undefined,
                targetNames: undefined,
                sdkConfigPath: configPath
            })
        ).rejects.toBeDefined();

        expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(
            "--sdk-config cannot be used with fernapi/fern-typescript-sdk 3.99.0 because SDK Config support starts at 4.0.0. Use 4.0.0 or later, or remove --sdk-config and configure the pre-cutover generator in generators.yml.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
    });

    it("does not validate a pre-cutover target excluded by --generator-index", async () => {
        const configPath = path.join(temporaryDirectory, "mixed-sdk-config.yml");
        await writeFile(
            configPath,
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./openapi/openapi.yml" }] },
                targets: [
                    { language: "typescript", generatorVersion: "3.99.0", output: { delivery: "files" } },
                    { language: "python", generatorVersion: "6.0.0", output: { delivery: "files" } }
                ]
            })
        );

        await runGenerate({
            project,
            cliContext,
            groupNames: undefined,
            targetNames: undefined,
            generatorIndex: 1,
            sdkConfigPath: configPath
        });

        expect(vi.mocked(generateWorkspace)).toHaveBeenCalledOnce();
    });

    it("runs only legacy generation when --local is used without selectors", async () => {
        await runGenerate({
            project,
            cliContext,
            groupNames: undefined,
            targetNames: undefined,
            useLocalDocker: true
        });

        const calls = vi.mocked(generateWorkspace).mock.calls;
        expect(calls).toHaveLength(1);
        expect(calls[0]?.[0].sdkConfigV1).toBeUndefined();
    });

    it("rejects a language selected by both legacy and SDK Config before generation starts", async () => {
        await writeFile(
            path.join(temporaryDirectory, "sdk-config.yml"),
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./openapi/openapi.yml" }] },
                targets: [{ language: "python", output: { delivery: "files" } }]
            })
        );

        await expect(
            runGenerate({
                project,
                cliContext,
                groupNames: ["python-sdk"],
                targetNames: ["python"]
            })
        ).rejects.toBeDefined();

        expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
    });

    it("generates a root SDK Config-only project", async () => {
        await runGenerate({
            project: { ...project, apiWorkspaces: [] },
            cliContext,
            groupNames: undefined,
            targetNames: ["typescript"]
        });

        const call = vi.mocked(generateWorkspace).mock.calls[0]?.[0];
        expect(call?.sdkConfigV1?.targets.map((target) => target.language)).toEqual(["typescript"]);
    });

    it("generates a named SDK Config-only API workspace", async () => {
        await runGenerate({
            project: {
                ...project,
                apiWorkspaces: [],
                sdkConfigWorkspaces: [
                    { absoluteFilePath: AbsoluteFilePath.of(temporaryDirectory), workspaceName: "my-api" }
                ]
            },
            cliContext,
            groupNames: undefined,
            targetNames: ["typescript"]
        });

        const call = vi.mocked(generateWorkspace).mock.calls[0]?.[0];
        expect(call?.workspace.workspaceName).toBe("my-api");
        expect(call?.sdkConfigV1?.targets.map((target) => target.language)).toEqual(["typescript"]);
    });

    it("explains that --generator does not select a discovered SDK Config", async () => {
        await expect(
            runGenerate({
                project: {
                    ...project,
                    apiWorkspaces: [],
                    sdkConfigWorkspaces: [
                        { absoluteFilePath: AbsoluteFilePath.of(temporaryDirectory), workspaceName: "my-api" }
                    ]
                },
                cliContext,
                groupNames: undefined,
                targetNames: undefined,
                generatorName: "fernapi/fern-typescript-sdk"
            })
        ).rejects.toBeDefined();

        expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(
            expect.stringContaining("--generator only filters generators in selected legacy groups"),
            undefined,
            expect.anything()
        );
        expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
    });
});

function createProject(directory: string): Project {
    const generator: generatorsYml.GeneratorInvocation = {
        name: "fernapi/fern-python-sdk",
        version: "4.0.0",
        language: "python",
        config: {},
        automation: { generate: true, preview: true, upgrade: true, verify: true },
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: undefined,
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined
    };
    const group: generatorsYml.GeneratorGroup = {
        groupName: "python-sdk",
        audiences: { type: "all" },
        generators: [generator],
        reviewers: undefined
    };
    const generatorsConfiguration = {
        absolutePathToConfiguration: AbsoluteFilePath.of(path.join(directory, "generators.legacy.yml")),
        api: undefined,
        defaultGroup: "python-sdk",
        groupAliases: {},
        groups: [group],
        rawConfiguration: {},
        reviewers: undefined,
        whitelabel: undefined,
        ai: undefined,
        replay: undefined
    } as generatorsYml.GeneratorsConfiguration;
    const workspace = {
        absoluteFilePath: AbsoluteFilePath.of(directory),
        cliVersion: "0.0.0",
        generatorsConfiguration,
        workspaceName: "my-api"
    } as unknown as AbstractAPIWorkspace<unknown>;
    const config: fernConfigJson.ProjectConfig = {
        _absolutePath: AbsoluteFilePath.of(path.join(directory, "fern.config.json")),
        organization: "test",
        rawConfig: { organization: "test", version: "*" },
        version: "*"
    };
    return {
        config,
        apiWorkspaces: [workspace],
        docsWorkspaces: undefined,
        loadAPIWorkspace: () => workspace
    };
}

async function runGenerate({
    project,
    cliContext,
    groupNames,
    targetNames,
    sdkConfigPath,
    generatorName,
    generatorIndex,
    useLocalDocker = false
}: {
    project: Project;
    cliContext: CliContext;
    groupNames: string[] | undefined;
    targetNames: string[] | undefined;
    sdkConfigPath?: string;
    generatorName?: string;
    generatorIndex?: number;
    useLocalDocker?: boolean;
}): Promise<void> {
    await generateAPIWorkspaces({
        project,
        cliContext,
        version: undefined,
        groupNames,
        targetNames,
        generatorName,
        generatorIndex,
        shouldLogS3Url: false,
        keepDocker: false,
        useLocalDocker,
        preview: false,
        mode: undefined,
        force: true,
        runner: undefined,
        inspect: false,
        lfsOverride: undefined,
        sdkConfigPath,
        fernignorePath: undefined,
        skipFernignore: false,
        dynamicIrOnly: false,
        outputDir: undefined,
        noReplay: false,
        verify: false,
        retryRateLimited: false,
        requireEnvVars: true
    });
}
