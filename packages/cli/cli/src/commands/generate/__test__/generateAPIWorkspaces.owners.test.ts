import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { createOrganizationIfDoesNotExist, getToken } from "@fern-api/auth";
import type { fernConfigJson, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { askToLogin } from "@fern-api/login";
import type { Project } from "@fern-api/project-loader";
import type { AutomationRunOptions } from "@fern-api/remote-workspace-runner";
import { CliError, createMockTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import YAML from "yaml";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { checkOutputDirectory } from "../checkOutputDirectory.js";
import { generateWorkspace } from "../generateAPIWorkspace.js";
import { generateAPIWorkspaces } from "../generateAPIWorkspaces.js";

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn()
}));

vi.mock("@fern-api/auth", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/auth")>()),
    createOrganizationIfDoesNotExist: vi.fn(async () => undefined),
    getToken: vi.fn(async () => undefined)
}));

const featureFlags = vi.hoisted(() => ({
    isEnabled: vi.fn(async (_flag: string, _context: { org: string; generator?: string }) => false),
    getCachedValue: vi.fn((): boolean | undefined => undefined)
}));

vi.mock("@fern-api/posthog-manager", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/posthog-manager")>()),
    getFeatureFlagClient: () => featureFlags
}));

vi.mock("../checkOutputDirectory.js", () => ({
    checkOutputDirectory: vi.fn(async () => ({ shouldProceed: true }))
}));

vi.mock("../generateAPIWorkspace.js", () => ({
    generateWorkspace: vi.fn(async () => undefined)
}));

const GO = { language: "go", output: { delivery: "files" } };
const TYPESCRIPT = { language: "typescript", output: { delivery: "files" } };
const PYTHON = { language: "python", output: { delivery: "files" } };
const JAVA = { language: "java", output: { delivery: "files" } };

const NO_SELECTORS: RunOptions = { groupNames: undefined, targetNames: undefined };

interface RunOptions {
    groupNames?: string[] | undefined;
    targetNames?: string[] | undefined;
    sdkConfigPath?: string;
    generatorName?: string;
    generatorIndex?: number;
    useLocalDocker?: boolean;
    preview?: boolean;
    outputDir?: string;
    version?: string;
    force?: boolean;
    automation?: AutomationRunOptions;
}

interface OwnerOptions {
    /** Folder name under the temp root; also the workspace name unless `workspaceName` is given. */
    folder: string;
    workspaceName?: string | null;
    /** sdk-config.yml targets; omitted means no sdk-config.yml in the folder. */
    sdkConfigTargets?: unknown[];
    /** Raw sdk-config.yml contents, for invalid files. */
    rawSdkConfig?: string;
    /** Legacy generators for the `python-sdk` group; `null` leaves the workspace without generators configuration. */
    legacyGenerators?: Array<Partial<generatorsYml.GeneratorInvocation>> | null;
}

describe("generateAPIWorkspaces owners", () => {
    let root: string;
    let cliContext: CliContext;
    let log: Mock<(level: LogLevel, ...args: string[]) => void>;

    beforeEach(async () => {
        root = await mkdtemp(path.join(tmpdir(), "fern-generate-owners-"));
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
        vi.mocked(generateWorkspace).mockClear();
        vi.mocked(checkOutputDirectory).mockReset().mockResolvedValue({ shouldProceed: true });
        vi.mocked(askToLogin)
            .mockReset()
            .mockResolvedValue({ type: "organization", value: "test-token" } as never);
        vi.mocked(createOrganizationIfDoesNotExist).mockClear();
        vi.mocked(getToken).mockClear();
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    function generator(overrides: Partial<generatorsYml.GeneratorInvocation> = {}): generatorsYml.GeneratorInvocation {
        return {
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
            settings: undefined,
            ...overrides
        };
    }

    interface Owner {
        workspace: AbstractAPIWorkspace<unknown>;
        directory: string;
        sdkConfigPath: string;
    }

    async function createOwner(options: OwnerOptions): Promise<Owner> {
        const directory = path.join(root, options.folder);
        await mkdir(path.join(directory), { recursive: true });
        await writeFile(
            path.join(directory, "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Acme\n  version: 1.0.0\npaths: {}\n"
        );
        const sdkConfigPath = path.join(directory, "sdk-config.yml");
        if (options.rawSdkConfig != null) {
            await writeFile(sdkConfigPath, options.rawSdkConfig);
        } else if (options.sdkConfigTargets != null) {
            await writeFile(
                sdkConfigPath,
                YAML.stringify({
                    schemaVersion: "sdk-config/v1",
                    sdkName: "acme",
                    source: { specs: [{ id: "acme", type: "openapi", path: "./openapi.yml" }] },
                    targets: options.sdkConfigTargets
                })
            );
        }
        const workspaceName = options.workspaceName === null ? undefined : (options.workspaceName ?? options.folder);
        const generatorsConfiguration =
            options.legacyGenerators === null
                ? undefined
                : ({
                      absolutePathToConfiguration: AbsoluteFilePath.of(path.join(directory, "generators.yml")),
                      api: undefined,
                      defaultGroup: "python-sdk",
                      groupAliases: {},
                      groups: [
                          {
                              groupName: "python-sdk",
                              audiences: { type: "all" },
                              generators: (options.legacyGenerators ?? [{}]).map((overrides) => generator(overrides)),
                              reviewers: undefined
                          }
                      ],
                      rawConfiguration: {},
                      reviewers: undefined,
                      whitelabel: undefined,
                      ai: undefined,
                      replay: undefined
                  } as generatorsYml.GeneratorsConfiguration);
        const workspace = {
            absoluteFilePath: AbsoluteFilePath.of(directory),
            cliVersion: "0.0.0",
            generatorsConfiguration,
            workspaceName
        } as unknown as AbstractAPIWorkspace<unknown>;
        return { workspace, directory, sdkConfigPath };
    }

    function projectOf({
        apiWorkspaces = [],
        sdkConfigWorkspaces
    }: {
        apiWorkspaces?: Owner[];
        sdkConfigWorkspaces?: Owner[];
    }): Project {
        const config: fernConfigJson.ProjectConfig = {
            _absolutePath: AbsoluteFilePath.of(path.join(root, "fern.config.json")),
            organization: "test",
            rawConfig: { organization: "test", version: "*" },
            version: "*"
        };
        return {
            config,
            apiWorkspaces: apiWorkspaces.map((owner) => owner.workspace),
            sdkConfigWorkspaces: sdkConfigWorkspaces?.map((owner) => ({
                absoluteFilePath: owner.workspace.absoluteFilePath,
                workspaceName: owner.workspace.workspaceName
            })),
            docsWorkspaces: undefined,
            loadAPIWorkspace: () => apiWorkspaces[0]?.workspace
        };
    }

    async function run(project: Project, options: RunOptions = NO_SELECTORS): Promise<void> {
        await generateAPIWorkspaces({
            project,
            cliContext,
            version: options.version,
            groupNames: options.groupNames,
            targetNames: options.targetNames,
            generatorName: options.generatorName,
            generatorIndex: options.generatorIndex,
            shouldLogS3Url: false,
            keepDocker: false,
            useLocalDocker: options.useLocalDocker ?? false,
            preview: options.preview ?? false,
            mode: undefined,
            force: options.force ?? true,
            runner: undefined,
            inspect: false,
            lfsOverride: undefined,
            sdkConfigPath: options.sdkConfigPath,
            fernignorePath: undefined,
            skipFernignore: false,
            dynamicIrOnly: false,
            outputDir: options.outputDir,
            noReplay: false,
            verify: false,
            retryRateLimited: false,
            requireEnvVars: true,
            automation: options.automation
        });
    }

    /** `kind:workspaceName` of each generation, in the order it ran. */
    function generations(): string[] {
        return vi
            .mocked(generateWorkspace)
            .mock.calls.map(
                ([args]) => `${args.sdkConfigV1 == null ? "legacy" : "sdk-config"}:${args.workspace.workspaceName}`
            );
    }

    function sdkConfigLanguages(): string[][] {
        return vi
            .mocked(generateWorkspace)
            .mock.calls.flatMap(([args]) =>
                args.sdkConfigV1 == null ? [] : [args.sdkConfigV1.targets.map((target) => target.language)]
            );
    }

    async function expectConfigError(promise: Promise<void>, message: string): Promise<void> {
        // biome-ignore lint/suspicious/noMisplacedAssertion: test helper function
        await expect(promise).rejects.toBeDefined();
        // biome-ignore lint/suspicious/noMisplacedAssertion: test helper function
        expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(message, undefined, {
            code: CliError.Code.ConfigError
        });
        // biome-ignore lint/suspicious/noMisplacedAssertion: test helper function
        expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
    }

    describe("default sdk-config.yml discovery across owners", () => {
        it("generates every owner's legacy group, then every owner's sdk-config.yml, in owner order", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const beta = await createOwner({ folder: "beta", sdkConfigTargets: [TYPESCRIPT] });
            const gamma = await createOwner({ folder: "gamma", sdkConfigTargets: [JAVA], legacyGenerators: null });

            await run(projectOf({ apiWorkspaces: [alpha, beta], sdkConfigWorkspaces: [gamma] }));

            expect(generations()).toEqual([
                "legacy:alpha",
                "legacy:beta",
                "sdk-config:alpha",
                "sdk-config:beta",
                "sdk-config:gamma"
            ]);
            expect(sdkConfigLanguages()).toEqual([["go"], ["typescript"], ["java"]]);
        });

        it("skips an owner without an sdk-config.yml when no --target is given", async () => {
            const alpha = await createOwner({ folder: "alpha" });
            const beta = await createOwner({ folder: "beta", sdkConfigTargets: [TYPESCRIPT] });

            await run(projectOf({ apiWorkspaces: [alpha, beta] }));

            expect(generations()).toEqual(["legacy:alpha", "legacy:beta", "sdk-config:beta"]);
        });

        it("does not generate legacy groups with --target, only the SDK Config of every owner", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO, TYPESCRIPT] });
            const beta = await createOwner({ folder: "beta", sdkConfigTargets: [TYPESCRIPT] });

            await run(projectOf({ apiWorkspaces: [alpha, beta] }), {
                groupNames: undefined,
                targetNames: ["typescript"]
            });

            expect(generations()).toEqual(["sdk-config:alpha", "sdk-config:beta"]);
            expect(sdkConfigLanguages()).toEqual([["typescript"], ["typescript"]]);
        });

        it.each([
            { name: "an API workspace", missing: "alpha", owners: ["api", "api"], expected: "alpha" },
            { name: "the second API workspace", missing: "beta", owners: ["api", "api"], expected: "beta" },
            { name: "an SDK Config workspace", missing: "gamma", owners: ["api", "sdk"], expected: "gamma" }
        ])("fails --target naming $name without an sdk-config.yml", async ({ missing, owners, expected }) => {
            const folders = owners[1] === "sdk" ? ["alpha", "gamma"] : ["alpha", "beta"];
            const created = await Promise.all(
                folders.map((folder) =>
                    createOwner({
                        folder,
                        sdkConfigTargets: folder === missing ? undefined : [TYPESCRIPT],
                        legacyGenerators: owners[1] === "sdk" && folder === "gamma" ? null : [{}]
                    })
                )
            );
            const project =
                owners[1] === "sdk"
                    ? projectOf({ apiWorkspaces: [created[0] as Owner], sdkConfigWorkspaces: [created[1] as Owner] })
                    : projectOf({ apiWorkspaces: created });

            await expectConfigError(
                run(project, { groupNames: undefined, targetNames: ["typescript"] }),
                `No sdk-config.yml found for API '${expected}'. Use --sdk-config to select another file.`
            );
        });

        it("names a nameless owner 'default' in the missing-file error", async () => {
            const nameless = await createOwner({ folder: "nameless", workspaceName: null });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [nameless] }), { groupNames: undefined, targetNames: ["go"] }),
                "No sdk-config.yml found for API 'default'. Use --sdk-config to select another file."
            );
        });

        it("reports the first owner without a file even when a later owner has one", async () => {
            const alpha = await createOwner({ folder: "alpha" });
            const beta = await createOwner({ folder: "beta", sdkConfigTargets: [TYPESCRIPT] });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha, beta] }), {
                    groupNames: undefined,
                    targetNames: ["typescript"]
                }),
                "No sdk-config.yml found for API 'alpha'. Use --sdk-config to select another file."
            );
        });

        it("fails when a selected owner's sdk-config.yml is invalid, before generating anything", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [TYPESCRIPT] });
            const beta = await createOwner({ folder: "beta", rawSdkConfig: "targets: [this is: not valid yaml" });

            await expect(run(projectOf({ apiWorkspaces: [alpha, beta] }))).rejects.toBeDefined();

            expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({ message: expect.stringContaining("is not valid YAML") }),
                { code: CliError.Code.ConfigError }
            );
            expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
        });
    });

    describe("fallback to the sdk-config.yml beside fern.config.json", () => {
        it("is used when the project has no owners", async () => {
            await writeFile(
                path.join(root, "sdk-config.yml"),
                YAML.stringify({
                    schemaVersion: "sdk-config/v1",
                    sdkName: "acme",
                    source: { specs: [{ id: "acme", type: "openapi", path: "./openapi.yml" }] },
                    targets: [GO]
                })
            );
            await writeFile(
                path.join(root, "openapi.yml"),
                "openapi: 3.0.0\ninfo:\n  title: Acme\n  version: 1.0.0\npaths: {}\n"
            );

            await run(projectOf({}));

            expect(generations()).toEqual(["sdk-config:undefined"]);
        });

        it("is ignored when the project has an owner without an sdk-config.yml", async () => {
            await writeFile(path.join(root, "sdk-config.yml"), "schemaVersion: sdk-config/v1\n");
            const alpha = await createOwner({ folder: "alpha" });

            await run(projectOf({ apiWorkspaces: [alpha] }));

            expect(generations()).toEqual(["legacy:alpha"]);
        });

        it("fails --target when there is no owner and no file", async () => {
            await expectConfigError(
                run(projectOf({}), { groupNames: undefined, targetNames: ["go"] }),
                "No sdk-config.yml found. Use --sdk-config to select an SDK Config file."
            );
        });

        it("fails --target when the owners have no file, naming the first owner rather than the fallback", async () => {
            const alpha = await createOwner({ folder: "alpha" });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] }), { groupNames: undefined, targetNames: ["go"] }),
                "No sdk-config.yml found for API 'alpha'. Use --sdk-config to select another file."
            );
        });
    });

    describe("nothing selected", () => {
        const NOTHING_SELECTED =
            "No generation configuration was selected. Check the --api selection and confirm the workspace contains generators.yml, generators.legacy.yml, or sdk-config.yml; use --group for a legacy group or --target for an SDK Config target.";

        it("fails for a project without owners and without an sdk-config.yml", async () => {
            await expectConfigError(run(projectOf({})), NOTHING_SELECTED);
        });

        it("fails for --group on a project without API workspaces", async () => {
            await expectConfigError(
                run(projectOf({}), { groupNames: ["python-sdk"], targetNames: undefined }),
                NOTHING_SELECTED
            );
        });

        it("fails when only SDK Config workspaces exist and --group excludes them", async () => {
            const gamma = await createOwner({ folder: "gamma", sdkConfigTargets: [GO], legacyGenerators: null });

            await expectConfigError(
                run(projectOf({ sdkConfigWorkspaces: [gamma] }), {
                    groupNames: ["python-sdk"],
                    targetNames: undefined
                }),
                NOTHING_SELECTED
            );
        });
    });

    describe("--sdk-config", () => {
        it("fails when it selects one file but several owners are selected", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const beta = await createOwner({ folder: "beta", sdkConfigTargets: [TYPESCRIPT] });
            const elsewhere = path.join(root, "elsewhere", "sdk-config.yml");

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha, beta] }), { ...NO_SELECTORS, sdkConfigPath: elsewhere }),
                "--sdk-config selects one file, but 2 API workspaces are selected. Use --api to select exactly one API."
            );
        });

        it("counts SDK Config workspaces among the selected owners", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const gamma = await createOwner({ folder: "gamma", sdkConfigTargets: [JAVA], legacyGenerators: null });
            const delta = await createOwner({ folder: "delta", sdkConfigTargets: [JAVA], legacyGenerators: null });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha], sdkConfigWorkspaces: [gamma, delta] }), {
                    ...NO_SELECTORS,
                    sdkConfigPath: path.join(root, "elsewhere", "sdk-config.yml")
                }),
                "--sdk-config selects one file, but 3 API workspaces are selected. Use --api to select exactly one API."
            );
        });

        it("uses the owner whose directory holds the file and never reads the other owners' files", async () => {
            const alpha = await createOwner({ folder: "alpha", rawSdkConfig: "targets: [this is: not valid yaml" });
            const beta = await createOwner({ folder: "beta", sdkConfigTargets: [TYPESCRIPT] });

            await run(projectOf({ apiWorkspaces: [alpha, beta] }), {
                ...NO_SELECTORS,
                sdkConfigPath: beta.sdkConfigPath
            });

            expect(generations()).toEqual(["sdk-config:beta"]);
        });

        it("matches an SDK Config workspace's directory as well", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const gamma = await createOwner({ folder: "gamma", sdkConfigTargets: [JAVA], legacyGenerators: null });

            await run(projectOf({ apiWorkspaces: [alpha], sdkConfigWorkspaces: [gamma] }), {
                ...NO_SELECTORS,
                sdkConfigPath: gamma.sdkConfigPath
            });

            expect(generations()).toEqual(["sdk-config:gamma"]);
        });

        it("resolves a relative path against the working directory before matching owners", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const beta = await createOwner({ folder: "beta", sdkConfigTargets: [TYPESCRIPT] });

            await run(projectOf({ apiWorkspaces: [alpha, beta] }), {
                ...NO_SELECTORS,
                sdkConfigPath: path.relative(process.cwd(), beta.sdkConfigPath)
            });

            expect(generations()).toEqual(["sdk-config:beta"]);
        });

        it("attributes a file outside every owner to the only owner", async () => {
            const alpha = await createOwner({ folder: "alpha" });
            const configs = await createOwner({ folder: "configs", sdkConfigTargets: [GO] });

            await run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, sdkConfigPath: configs.sdkConfigPath });

            expect(generations()).toEqual(["sdk-config:alpha"]);
        });

        it("attributes the file to no workspace when the project has no owners", async () => {
            const configs = await createOwner({ folder: "configs", sdkConfigTargets: [GO] });

            await run(projectOf({}), { ...NO_SELECTORS, sdkConfigPath: configs.sdkConfigPath });

            expect(generations()).toEqual(["sdk-config:undefined"]);
        });

        it("generates only SDK Config unless a group is also selected", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });

            await run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, sdkConfigPath: alpha.sdkConfigPath });
            expect(generations()).toEqual(["sdk-config:alpha"]);

            vi.mocked(generateWorkspace).mockClear();
            await run(projectOf({ apiWorkspaces: [alpha] }), {
                groupNames: ["python-sdk"],
                targetNames: undefined,
                sdkConfigPath: alpha.sdkConfigPath
            });
            expect(generations()).toEqual(["legacy:alpha", "sdk-config:alpha"]);
        });

        it("applies --target to the explicit file and fails naming the available targets", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO, TYPESCRIPT] });

            await expect(
                run(projectOf({ apiWorkspaces: [alpha] }), {
                    groupNames: undefined,
                    targetNames: ["ruby"],
                    sdkConfigPath: alpha.sdkConfigPath
                })
            ).rejects.toBeDefined();

            expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    message: expect.stringContaining(
                        "SDK Config target 'ruby' not found. Available targets: go, typescript"
                    )
                }),
                { code: CliError.Code.ConfigError }
            );
        });

        it("lists a language without a generator under its language name when no generator matches", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                sdkConfigTargets: [{ language: "terraform", output: { delivery: "files" } }, TYPESCRIPT]
            });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] }), {
                    ...NO_SELECTORS,
                    generatorName: "fernapi/not-present",
                    sdkConfigPath: alpha.sdkConfigPath
                }),
                "SDK Config generator 'fernapi/not-present' not found. Available generators: terraform, fernapi/fern-typescript-sdk"
            );
        });

        it("does not check the cutover of a language with no generator, which the workspace builder rejects instead", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                sdkConfigTargets: [{ language: "terraform", generatorVersion: "0.0.1", output: { delivery: "files" } }]
            });

            await expect(
                run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, sdkConfigPath: alpha.sdkConfigPath })
            ).rejects.toBeDefined();
            // Rejected later by the workspace builder, not by the cutover check
            expect(log).toHaveBeenCalledWith(
                LogLevel.Error,
                "SDK Config target language 'terraform' is not supported by the Fern remote generation bridge"
            );
            expect(vi.mocked(cliContext.failAndThrow).mock.calls.map(([message]) => message ?? "")).not.toContainEqual(
                expect.stringContaining("support starts at")
            );
        });

        it("checks the cutover of every first-party generator language, here mcp", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                sdkConfigTargets: [{ language: "mcp", generatorVersion: "0.0.1", output: { delivery: "files" } }]
            });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, sdkConfigPath: alpha.sdkConfigPath }),
                "--sdk-config cannot be used with fernapi/fern-mcp-server 0.0.1 because SDK Config support starts at 0.1.0. Use 0.1.0 or later, or remove --sdk-config and configure the pre-cutover generator in generators.yml."
            );
        });

        it("only checks the cutover of an explicit --sdk-config, not of the discovered one", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                sdkConfigTargets: [
                    { language: "typescript", generatorVersion: "3.99.0", output: { delivery: "files" } }
                ]
            });

            await run(projectOf({ apiWorkspaces: [alpha] }), NO_SELECTORS);

            expect(generations()).toEqual(["legacy:alpha", "sdk-config:alpha"]);
        });
    });

    describe("selector combinations", () => {
        async function singleOwnerProject(): Promise<{ project: Project; sdkConfigPath: string }> {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            return { project: projectOf({ apiWorkspaces: [alpha] }), sdkConfigPath: alpha.sdkConfigPath };
        }

        it.each([
            { name: "no selectors", options: NO_SELECTORS, expected: ["legacy:alpha", "sdk-config:alpha"] },
            {
                name: "--group",
                options: { groupNames: ["python-sdk"], targetNames: undefined },
                expected: ["legacy:alpha"]
            },
            {
                name: "--target",
                options: { groupNames: undefined, targetNames: ["go"] },
                expected: ["sdk-config:alpha"]
            },
            {
                name: "--group and --target",
                options: { groupNames: ["python-sdk"], targetNames: ["go"] },
                expected: ["legacy:alpha", "sdk-config:alpha"]
            },
            {
                name: "--generator without --group",
                options: { ...NO_SELECTORS, generatorName: "fernapi/fern-python-sdk" },
                expected: ["legacy:alpha"]
            },
            {
                name: "--generator-index without --group",
                options: { ...NO_SELECTORS, generatorIndex: 0 },
                expected: ["legacy:alpha"]
            },
            {
                name: "--group and --generator",
                options: {
                    groupNames: ["python-sdk"],
                    targetNames: undefined,
                    generatorName: "fernapi/fern-python-sdk"
                },
                expected: ["legacy:alpha"]
            }
        ])("generates $expected for $name", async ({ options, expected }) => {
            const { project } = await singleOwnerProject();

            await run(project, options);

            expect(generations()).toEqual(expected);
        });

        it.each([
            { name: "--generator", options: { generatorName: "fernapi/fern-python-sdk" } },
            { name: "--generator-index", options: { generatorIndex: 0 } }
        ])("rejects $name with --target and no --group", async ({ options }) => {
            const { project } = await singleOwnerProject();

            await expectConfigError(
                run(project, { groupNames: undefined, targetNames: ["go"], ...options }),
                "--generator only filters generators in selected legacy groups. Add --group (and adjust --api if needed), or use --target to select an SDK Config target."
            );
        });

        it("accepts --generator with --sdk-config and no --group, selecting inside the SDK Config", async () => {
            const { project, sdkConfigPath } = await singleOwnerProject();

            await run(project, { ...NO_SELECTORS, generatorName: "fernapi/fern-go-sdk", sdkConfigPath });

            expect(generations()).toEqual(["sdk-config:alpha"]);
        });
    });

    describe("automation", () => {
        const automation: AutomationRunOptions = {
            recorder: {
                recordSuccess: () => undefined,
                recordFailure: () => undefined,
                recordSkipped: () => undefined
            }
        };

        it("never reads sdk-config.yml, even when --target or --sdk-config is given", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const project = projectOf({ apiWorkspaces: [alpha] });

            await run(project, { ...NO_SELECTORS, automation });
            await run(project, {
                groupNames: undefined,
                targetNames: ["go"],
                sdkConfigPath: alpha.sdkConfigPath,
                automation
            });

            expect(generations()).toEqual(["legacy:alpha", "legacy:alpha"]);
        });

        it("does not even look at an invalid sdk-config.yml", async () => {
            const alpha = await createOwner({ folder: "alpha", rawSdkConfig: "targets: [this is: not valid yaml" });

            await run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, automation });

            expect(generations()).toEqual(["legacy:alpha"]);
        });

        it("fails with nothing selected when the only owners are SDK Config workspaces", async () => {
            const gamma = await createOwner({ folder: "gamma", sdkConfigTargets: [GO], legacyGenerators: null });

            await expectConfigError(
                run(projectOf({ sdkConfigWorkspaces: [gamma] }), { ...NO_SELECTORS, automation }),
                "No generation configuration was selected. Check the --api selection and confirm the workspace contains generators.yml, generators.legacy.yml, or sdk-config.yml; use --group for a legacy group or --target for an SDK Config target."
            );
        });

        it("labels the telemetry event as an automation run", async () => {
            const alpha = await createOwner({ folder: "alpha" });

            await run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, automation });

            expect(vi.mocked(cliContext.instrumentPostHogEvent).mock.calls[0]?.[0]).toMatchObject({
                command: "fern automations generate"
            });
        });

        it("skips the output-directory prompt for generators automation would not run", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                legacyGenerators: [{ absolutePathToLocalOutput: AbsoluteFilePath.of(path.join(root, "out")) }]
            });

            await run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, automation });

            expect(vi.mocked(checkOutputDirectory)).not.toHaveBeenCalled();
        });
    });

    describe("language ownership", () => {
        const conflict = (api: string, language: string, first: string, second: string): string =>
            `API '${api}' selects language '${language}' from both ${first} and ${second}. Remove one selector before generating.`;

        it("rejects a language selected by a legacy group and by the sdk-config.yml of the same API", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [PYTHON] });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] })),
                conflict("alpha", "python", "legacy group 'python-sdk'", alpha.sdkConfigPath)
            );
        });

        it("reports a nameless API as 'default'", async () => {
            const nameless = await createOwner({ folder: "nameless", workspaceName: null, sdkConfigTargets: [PYTHON] });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [nameless] })),
                conflict("default", "python", "legacy group 'python-sdk'", nameless.sdkConfigPath)
            );
        });

        it("derives a legacy generator's language from its name when it declares none", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                sdkConfigTargets: [PYTHON],
                legacyGenerators: [{ language: undefined }]
            });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] })),
                conflict("alpha", "python", "legacy group 'python-sdk'", alpha.sdkConfigPath)
            );
        });

        it("ignores a legacy generator whose language cannot be determined", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                sdkConfigTargets: [PYTHON],
                legacyGenerators: [{ name: "acme/custom-generator", language: undefined }]
            });

            await run(projectOf({ apiWorkspaces: [alpha] }));

            expect(generations()).toEqual(["legacy:alpha", "sdk-config:alpha"]);
        });

        it("takes a group out of the check when --generator matches nothing in it", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [PYTHON] });

            await run(projectOf({ apiWorkspaces: [alpha] }), {
                groupNames: ["python-sdk"],
                targetNames: ["python"],
                generatorName: "fernapi/fern-go-sdk"
            });

            expect(generations()).toEqual(["legacy:alpha", "sdk-config:alpha"]);
        });

        it("rejects the same conflict when the sdk-config.yml comes from --sdk-config", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [PYTHON] });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] }), {
                    groupNames: ["python-sdk"],
                    targetNames: undefined,
                    sdkConfigPath: alpha.sdkConfigPath
                }),
                conflict("alpha", "python", "legacy group 'python-sdk'", alpha.sdkConfigPath)
            );
        });

        it("does not compare languages across different APIs", async () => {
            const alpha = await createOwner({ folder: "alpha", legacyGenerators: [{}] });
            const beta = await createOwner({
                folder: "beta",
                sdkConfigTargets: [PYTHON],
                legacyGenerators: [{ name: "fernapi/fern-go-sdk", language: "go" }]
            });

            await run(projectOf({ apiWorkspaces: [alpha, beta] }));

            expect(generations()).toEqual(["legacy:alpha", "legacy:beta", "sdk-config:beta"]);
        });

        it("allows two selectors of the same kind to share a language", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                sdkConfigTargets: [GO, GO],
                legacyGenerators: [{}, { name: "fernapi/fern-python-sdk", language: "python" }]
            });

            await run(projectOf({ apiWorkspaces: [alpha] }));

            expect(generations()).toEqual(["legacy:alpha", "sdk-config:alpha"]);
            expect(sdkConfigLanguages()).toEqual([["go", "go"]]);
        });

        it("ignores generations whose workspace has no generators configuration", async () => {
            const alpha = await createOwner({ folder: "alpha", legacyGenerators: null, sdkConfigTargets: [PYTHON] });

            await run(projectOf({ apiWorkspaces: [alpha] }));

            expect(generations()).toEqual(["legacy:alpha", "sdk-config:alpha"]);
            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].resolvedGroupNames).toEqual([]);
        });

        it("attributes a cli target to the sdk-config.yml, not to the translated generators.yml", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                sdkConfigTargets: [{ language: "cli", output: { delivery: "files" } }],
                legacyGenerators: [{ name: "fernapi/fern-cli-generator", language: "cli" }]
            });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] })),
                conflict("alpha", "cli", "legacy group 'python-sdk'", alpha.sdkConfigPath)
            );
        });
    });

    describe("cli targets", () => {
        const CLI_TARGET = { language: "cli", output: { delivery: "files" } };

        async function cliOwner(sdkVersion: string | undefined, targetSdkVersion?: string): Promise<Owner> {
            const alpha = await createOwner({ folder: "alpha", legacyGenerators: null });
            await writeFile(
                alpha.sdkConfigPath,
                YAML.stringify({
                    schemaVersion: "sdk-config/v1",
                    sdkName: "acme",
                    ...(sdkVersion != null ? { sdkVersion } : {}),
                    source: { specs: [{ id: "acme", type: "openapi", path: "./openapi.yml" }] },
                    targets: [{ ...CLI_TARGET, ...(targetSdkVersion != null ? { sdkVersion: targetSdkVersion } : {}) }]
                })
            );
            return alpha;
        }

        it("generates with the sdkVersion of the sdk-config.yml", async () => {
            const alpha = await cliOwner("1.2.3");

            await run(projectOf({ sdkConfigWorkspaces: [alpha] }), { groupNames: undefined, targetNames: ["cli"] });

            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].version).toBe("1.2.3");
        });

        it("prefers the target's own sdkVersion over the document's", async () => {
            const alpha = await cliOwner("1.2.3", "4.5.6");

            await run(projectOf({ sdkConfigWorkspaces: [alpha] }), { groupNames: undefined, targetNames: ["cli"] });

            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].version).toBe("4.5.6");
        });

        it("lets --version override the sdkVersion", async () => {
            const alpha = await cliOwner("1.2.3");

            await run(projectOf({ sdkConfigWorkspaces: [alpha] }), {
                groupNames: undefined,
                targetNames: ["cli"],
                version: "9.9.9"
            });

            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].version).toBe("9.9.9");
        });

        it("falls back to the default sdkVersion 1.0.0 when neither is set, so a cli target always carries a version", async () => {
            const alpha = await cliOwner(undefined);

            await run(projectOf({ sdkConfigWorkspaces: [alpha] }), { groupNames: undefined, targetNames: ["cli"] });

            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].version).toBe("1.0.0");
        });
    });

    describe("--local with --sdk-config", () => {
        it("accepts an sdk-config.yaml that is the only file the local runner would find", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const yamlPath = path.join(root, "alpha", "sdk-config.yaml");
            await writeFile(yamlPath, await import("node:fs/promises").then((fs) => fs.readFile(alpha.sdkConfigPath)));
            await rm(alpha.sdkConfigPath);

            await run(projectOf({ apiWorkspaces: [alpha] }), {
                ...NO_SELECTORS,
                sdkConfigPath: yamlPath,
                useLocalDocker: true
            });

            expect(generations()).toEqual(["sdk-config:alpha"]);
        });

        it("falls back to naming sdk-config.yml when the directory has no file the local runner can read", async () => {
            const alpha = await createOwner({ folder: "alpha" });
            const customPath = path.join(root, "alpha", "custom.yml");
            await writeFile(customPath, "schemaVersion: sdk-config/v1\n");

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] }), {
                    ...NO_SELECTORS,
                    sdkConfigPath: customPath,
                    useLocalDocker: true
                }),
                "--local reads sdk-config.yml from the directory of --sdk-config, so it cannot use custom.yml. Rename the file to sdk-config.yml, or remove --local."
            );
        });

        it("names the file the local runner would read instead when it is another extension", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const yamlPath = path.join(root, "alpha", "sdk-config.yaml");
            await writeFile(yamlPath, "schemaVersion: sdk-config/v1\n");
            await rm(alpha.sdkConfigPath);
            const customPath = path.join(root, "alpha", "custom.yml");
            await writeFile(customPath, "schemaVersion: sdk-config/v1\n");

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] }), {
                    ...NO_SELECTORS,
                    sdkConfigPath: customPath,
                    useLocalDocker: true
                }),
                "--local reads sdk-config.yaml from the directory of --sdk-config, so it cannot use custom.yml. Rename the file to sdk-config.yml, or remove --local."
            );
        });
    });

    describe("output directory confirmation", () => {
        const localOutput = (): AbsoluteFilePath => AbsoluteFilePath.of(path.join(root, "out"));

        it("asks about every generator's local output with the --force flag and stops when declined", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                legacyGenerators: [{ absolutePathToLocalOutput: localOutput() }]
            });
            vi.mocked(checkOutputDirectory).mockResolvedValue({ shouldProceed: false });

            await expectConfigError(
                run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, force: false }),
                "Generation cancelled"
            );

            expect(vi.mocked(checkOutputDirectory)).toHaveBeenCalledWith(localOutput(), cliContext, false);
        });

        it("continues when the prompt is accepted", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                legacyGenerators: [{ absolutePathToLocalOutput: localOutput() }]
            });

            await run(projectOf({ apiWorkspaces: [alpha] }));

            expect(vi.mocked(checkOutputDirectory)).toHaveBeenCalledOnce();
            expect(generations()).toEqual(["legacy:alpha"]);
        });

        it("does not ask about a generator excluded by --generator", async () => {
            const alpha = await createOwner({
                folder: "alpha",
                legacyGenerators: [{ absolutePathToLocalOutput: localOutput() }]
            });

            await run(projectOf({ apiWorkspaces: [alpha] }), {
                groupNames: ["python-sdk"],
                targetNames: undefined,
                generatorName: "fernapi/fern-go-sdk"
            });

            expect(vi.mocked(checkOutputDirectory)).not.toHaveBeenCalled();
        });

        it("has nothing to ask about a workspace without generators configuration", async () => {
            const alpha = await createOwner({ folder: "alpha", legacyGenerators: null });

            await run(projectOf({ apiWorkspaces: [alpha] }));

            expect(vi.mocked(checkOutputDirectory)).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        it("creates the organization for a signed-in user", async () => {
            const alpha = await createOwner({ folder: "alpha" });
            const token = { type: "user", value: "user-token" };
            vi.mocked(askToLogin).mockResolvedValue(token as never);

            await run(projectOf({ apiWorkspaces: [alpha] }));

            expect(vi.mocked(createOrganizationIfDoesNotExist)).toHaveBeenCalledWith(
                expect.objectContaining({ organization: "test", token })
            );
            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].token).toBe(token);
        });

        it("does not create the organization for an organization token", async () => {
            const alpha = await createOwner({ folder: "alpha" });

            await run(projectOf({ apiWorkspaces: [alpha] }));

            expect(vi.mocked(createOrganizationIfDoesNotExist)).not.toHaveBeenCalled();
        });

        it("never prompts for login with --local and uses an existing token when there is one", async () => {
            const alpha = await createOwner({ folder: "alpha" });
            const token = { type: "organization", value: "existing" };
            vi.mocked(getToken).mockResolvedValue(token as never);

            await run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, useLocalDocker: true });

            expect(vi.mocked(askToLogin)).not.toHaveBeenCalled();
            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].token).toBe(token);
        });
    });

    describe("preview", () => {
        it("writes to --output when given, whichever owner generates", async () => {
            const alpha = await createOwner({ folder: "alpha" });

            await run(projectOf({ apiWorkspaces: [alpha] }), {
                ...NO_SELECTORS,
                preview: true,
                outputDir: "preview-here"
            });

            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].absolutePathToPreview).toBe(
                path.resolve(process.cwd(), "preview-here")
            );
        });

        it("writes to .preview inside each owner's directory by default", async () => {
            const alpha = await createOwner({ folder: "alpha", sdkConfigTargets: [GO] });
            const beta = await createOwner({ folder: "beta" });

            await run(projectOf({ apiWorkspaces: [alpha, beta] }), { ...NO_SELECTORS, preview: true });

            expect(vi.mocked(generateWorkspace).mock.calls.map(([args]) => args.absolutePathToPreview)).toEqual([
                path.join(root, "alpha", ".preview"),
                path.join(root, "beta", ".preview"),
                path.join(root, "alpha", ".preview")
            ]);
        });

        it("writes no preview without --preview", async () => {
            const alpha = await createOwner({ folder: "alpha" });

            await run(projectOf({ apiWorkspaces: [alpha] }), { ...NO_SELECTORS, outputDir: "ignored" });

            expect(vi.mocked(generateWorkspace).mock.calls[0]?.[0].absolutePathToPreview).toBeUndefined();
        });
    });
});
