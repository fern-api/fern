// cspell:ignore unstub
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import type { fernConfigJson, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { askToLogin } from "@fern-api/login";
import type { Project } from "@fern-api/project-loader";
import { CliError, createMockTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
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
    let log: Mock<(level: LogLevel, ...args: string[]) => void>;

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
        log = vi.fn<(level: LogLevel, ...args: string[]) => void>();
        const taskContext = createMockTaskContext({ logger: createLogger(log) });
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
        vi.mocked(askToLogin).mockClear();
    });

    afterEach(async () => {
        await rm(temporaryDirectory, { recursive: true, force: true });
    });

    async function writeSdkConfig(targets: unknown[]): Promise<void> {
        await writeFile(
            path.join(temporaryDirectory, "sdk-config.yml"),
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./openapi/openapi.yml" }] },
                targets
            })
        );
    }

    function sdkConfigGenerators(): Array<{ name: string; version: string }> {
        const call = vi.mocked(generateWorkspace).mock.calls.find(([args]) => args.sdkConfigV1 != null)?.[0];
        return (
            call?.workspace.generatorsConfiguration?.groups.flatMap((group) =>
                group.generators.map(({ name, version }) => ({ name, version }))
            ) ?? []
        );
    }

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

    it("does not validate a pre-cutover target excluded by --target", async () => {
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
            targetNames: ["python"],
            sdkConfigPath: configPath
        });

        expect(vi.mocked(generateWorkspace)).toHaveBeenCalledOnce();
    });

    describe("SDK Config targets without a native generator", () => {
        const CLI_UNSUPPORTED_MESSAGE =
            "SDK Config target 'cli' cannot be generated: fernapi/fern-cli-generator does not support SDK Config yet. Generate it from generators.yml instead.";

        afterEach(() => {
            vi.unstubAllEnvs();
        });

        async function writeCliSdkConfig(configPath: string, cliTarget: Record<string, unknown>): Promise<void> {
            await writeFile(
                configPath,
                YAML.stringify({
                    schemaVersion: "sdk-config/v1",
                    sdkName: "payments",
                    source: { specs: [{ id: "payments", type: "openapi", path: "./openapi/openapi.yml" }] },
                    targets: [
                        { language: "typescript", output: { delivery: "files" } },
                        { language: "cli", output: { delivery: "files" }, ...cliTarget }
                    ]
                })
            );
        }

        interface CliRejectionCase {
            name: string;
            explicit: boolean;
            cliTarget: Record<string, unknown>;
            targetNames?: string[];
            bypass?: string;
        }

        it.each<CliRejectionCase>([
            { name: "an unpinned explicit --sdk-config target", explicit: true, cliTarget: {} },
            {
                name: "an explicit --sdk-config target pinned at the cutover",
                explicit: true,
                cliTarget: { generatorVersion: "1.0.0" }
            },
            {
                name: "an explicit --sdk-config target pinned after the cutover",
                explicit: true,
                cliTarget: { generatorVersion: "1.2.3" }
            },
            {
                name: "a pre-cutover explicit --sdk-config target as unsupported rather than pre-cutover",
                explicit: true,
                cliTarget: { generatorVersion: "0.9.0" }
            },
            { name: "an auto-discovered target without selectors", explicit: false, cliTarget: {} },
            {
                name: "an auto-discovered target selected by --target",
                explicit: false,
                cliTarget: { generatorVersion: "1.0.0" },
                targetNames: ["cli"]
            },
            ...["TRUE", "1", "false"].map((bypass) => ({
                name: `an auto-discovered target when the bypass is ${JSON.stringify(bypass)}`,
                explicit: false,
                cliTarget: {},
                targetNames: ["cli"],
                bypass
            }))
        ])("rejects $name before login", async ({ explicit, cliTarget, targetNames, bypass }) => {
            if (bypass != null) {
                vi.stubEnv("FERN_SDK_GEN_API_SKIP_SDK_CONFIG_SUPPORT_CHECK", bypass);
            }
            const configPath = path.join(temporaryDirectory, explicit ? "cli-sdk-config.yml" : "sdk-config.yml");
            await writeCliSdkConfig(configPath, cliTarget);

            await expect(
                runGenerate({
                    project,
                    cliContext,
                    groupNames: undefined,
                    targetNames,
                    ...(explicit ? { sdkConfigPath: configPath } : {})
                })
            ).rejects.toBeDefined();

            expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(CLI_UNSUPPORTED_MESSAGE, undefined, {
                code: CliError.Code.ConfigError
            });
            expect(vi.mocked(askToLogin)).not.toHaveBeenCalled();
            expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
        });

        it("does not validate a CLI target excluded by --target", async () => {
            await writeCliSdkConfig(path.join(temporaryDirectory, "sdk-config.yml"), { generatorVersion: "1.0.0" });

            await runGenerate({ project, cliContext, groupNames: undefined, targetNames: ["typescript"] });

            expect(vi.mocked(cliContext.failAndThrow)).not.toHaveBeenCalled();
            const call = vi.mocked(generateWorkspace).mock.calls.find(([args]) => args.sdkConfigV1 != null)?.[0];
            expect(call?.sdkConfigV1?.targets.map((target) => target.language)).toEqual(["typescript"]);
        });

        it("does not validate a CLI target excluded by --generator-index", async () => {
            const configPath = path.join(temporaryDirectory, "cli-sdk-config.yml");
            await writeCliSdkConfig(configPath, {});

            await runGenerate({
                project,
                cliContext,
                groupNames: undefined,
                targetNames: undefined,
                generatorIndex: 0,
                sdkConfigPath: configPath
            });

            expect(vi.mocked(cliContext.failAndThrow)).not.toHaveBeenCalled();
            expect(vi.mocked(generateWorkspace)).toHaveBeenCalledOnce();
        });

        it("proceeds to generation when the support check is bypassed", async () => {
            vi.stubEnv("FERN_SDK_GEN_API_SKIP_SDK_CONFIG_SUPPORT_CHECK", "true");
            await writeCliSdkConfig(path.join(temporaryDirectory, "sdk-config.yml"), { generatorVersion: "1.0.0" });

            await runGenerate({ project, cliContext, groupNames: undefined, targetNames: ["cli"] });

            expect(vi.mocked(cliContext.failAndThrow)).not.toHaveBeenCalled();
            expect(log).toHaveBeenCalledWith(
                LogLevel.Warn,
                "Skipping the SDK Config support check for target 'cli' (fernapi/fern-cli-generator) because FERN_SDK_GEN_API_SKIP_SDK_CONFIG_SUPPORT_CHECK=true; sdk-gen-api may reject it."
            );
            const call = vi.mocked(generateWorkspace).mock.calls.find(([args]) => args.sdkConfigV1 != null)?.[0];
            expect(call?.sdkConfigV1?.targets.map((target) => target.language)).toEqual(["cli"]);
        });

        it("keeps generating supported SDK Config targets", async () => {
            await writeSdkConfig([
                { language: "typescript", output: { delivery: "files" } },
                { language: "mcp", output: { delivery: "files" } }
            ]);

            await runGenerate({ project, cliContext, groupNames: undefined, targetNames: ["typescript", "mcp"] });

            expect(vi.mocked(cliContext.failAndThrow)).not.toHaveBeenCalled();
            const call = vi.mocked(generateWorkspace).mock.calls.find(([args]) => args.sdkConfigV1 != null)?.[0];
            expect(call?.sdkConfigV1?.targets.map((target) => target.language)).toEqual(["typescript", "mcp"]);
        });
    });

    it("generates the legacy default and SDK Config targets with --local, on the on-prem adapter", async () => {
        await runGenerate({
            project,
            cliContext,
            groupNames: undefined,
            targetNames: undefined,
            useLocalDocker: true
        });

        const calls = vi.mocked(generateWorkspace).mock.calls;
        expect(calls.map(([args]) => (args.sdkConfigV1 == null ? "legacy" : "sdk-config"))).toEqual([
            "legacy",
            "sdk-config"
        ]);
        expect(sdkConfigGenerators()).toEqual([{ name: "fernapi/fern-typescript-sdk", version: "4.0.0" }]);
    });

    it("runs a pinned SDK Config target with --local --target at its pinned version", async () => {
        await writeSdkConfig([{ language: "ruby", generatorVersion: "2.1.0", output: { delivery: "files" } }]);

        await runGenerate({ project, cliContext, groupNames: undefined, targetNames: ["ruby"], useLocalDocker: true });

        expect(sdkConfigGenerators()).toEqual([{ name: "fernapi/fern-ruby-sdk", version: "2.1.0" }]);
    });

    it("generates a non-files delivery target with --local into a local directory", async () => {
        await writeSdkConfig([{ language: "typescript", output: { delivery: "zip" } }]);

        await runGenerate({
            project,
            cliContext,
            groupNames: undefined,
            targetNames: ["typescript"],
            useLocalDocker: true
        });

        const call = vi.mocked(generateWorkspace).mock.calls.find(([args]) => args.sdkConfigV1 != null)?.[0];
        expect(call?.workspace.generatorsConfiguration?.groups[0]?.generators[0]?.absolutePathToLocalOutput).toBe(
            path.join(temporaryDirectory, "generated", "typescript")
        );
    });

    it.each([
        {
            name: "a pre-cutover generatorVersion",
            targets: [{ language: "typescript", generatorVersion: "3.99.0", output: { delivery: "files" } }],
            message:
                "SDK Config target 'typescript' pins generatorVersion 3.99.0, but SDK Config support starts at 4.0.0. Use 4.0.0 or later."
        },
        {
            name: "a language with no local generator",
            targets: [{ language: "kotlin", output: { delivery: "files" } }],
            message:
                "SDK Config target 'kotlin' cannot run with --local because no local generator exists for it. Remove --local to generate it remotely."
        },
        {
            name: "repeated-language targets",
            targets: [
                { language: "typescript", sdkName: "public", output: { delivery: "files" } },
                { language: "typescript", sdkName: "internal", output: { delivery: "files" } }
            ],
            message:
                "--local runs one SDK Config target per language, but more than one 'typescript' target is selected. Select a single target, or remove --local."
        }
    ])("rejects $name with --local", async ({ targets, message }) => {
        await writeSdkConfig(targets);

        await expect(
            runGenerate({
                project,
                cliContext,
                groupNames: undefined,
                targetNames: [targets[0]?.language ?? ""],
                useLocalDocker: true
            })
        ).rejects.toBeDefined();
        expect(log).toHaveBeenCalledWith(LogLevel.Error, message);
        expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
    });

    it("rejects an alternately named --sdk-config with --local", async () => {
        const alternativePath = path.join(temporaryDirectory, "internal-sdk-config.yml");
        await writeFile(alternativePath, "schemaVersion: sdk-config/v1\n");

        await expect(
            runGenerate({
                project,
                cliContext,
                groupNames: undefined,
                targetNames: undefined,
                sdkConfigPath: alternativePath,
                useLocalDocker: true
            })
        ).rejects.toBeDefined();
        expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(
            "--local reads sdk-config.yml from the directory of --sdk-config, so it cannot use internal-sdk-config.yml. Rename the file to sdk-config.yml, or remove --local.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
    });

    it("rejects an explicit sdk-config.yaml with --local when the local runner would read sdk-config.yml", async () => {
        const yamlPath = path.join(temporaryDirectory, "sdk-config.yaml");
        await writeFile(yamlPath, "schemaVersion: sdk-config/v1\n");

        await expect(
            runGenerate({
                project,
                cliContext,
                groupNames: undefined,
                targetNames: undefined,
                sdkConfigPath: yamlPath,
                useLocalDocker: true
            })
        ).rejects.toBeDefined();
        expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(
            "--local reads sdk-config.yml from the directory of --sdk-config, so it cannot use sdk-config.yaml. Rename the file to sdk-config.yml, or remove --local.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
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
