import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import type { fernConfigJson } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import { CliError, createMockTaskContext } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { createSdkConfigWorkspace } from "../createSdkConfigWorkspace.js";
import { generateWorkspace } from "../generateAPIWorkspace.js";
import { generateAPIWorkspaces } from "../generateAPIWorkspaces.js";

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn(async () => ({ type: "organization" as const, value: "test-token" }))
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

vi.mock("../createSdkConfigWorkspace.js", () => ({
    createSdkConfigWorkspace: vi.fn()
}));

interface FakeOwner {
    workspaceName: string | undefined;
    absoluteFilePath: AbsoluteFilePath;
    getAbsoluteFilePaths?: () => AbsoluteFilePath[];
}

describe("generateAPIWorkspaces SDK Config workspace creation", () => {
    let root: string;
    let cliContext: CliContext;
    let cleanups: Array<ReturnType<typeof vi.fn<() => Promise<void>>>>;

    beforeEach(async () => {
        root = await mkdtemp(path.join(tmpdir(), "fern-generate-source-root-"));
        const taskContext = createMockTaskContext();
        cliContext = {
            environment: { packageVersion: "0.0.0" },
            failAndThrow: vi.fn(taskContext.failAndThrow.bind(taskContext)),
            instrumentPostHogEvent: vi.fn(),
            logger: taskContext.logger,
            runTask: vi.fn(async (task) => task(taskContext)),
            runTaskForWorkspace: vi.fn(async (_workspace, task) => task(taskContext))
        } as unknown as CliContext;
        cleanups = [];
        vi.mocked(generateWorkspace).mockClear();
        vi.mocked(createSdkConfigWorkspace)
            .mockReset()
            .mockImplementation(async ({ workspaceName }) => {
                const cleanup = vi.fn(async () => undefined);
                cleanups.push(cleanup);
                return {
                    workspace: {
                        workspaceName,
                        generatorsConfiguration: { defaultGroup: "sdk-config", groups: [], rawConfiguration: {} }
                    } as never,
                    cleanup
                };
            });
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    async function writeConfig(directory: string, fileName = "sdk-config.yml"): Promise<string> {
        await mkdir(directory, { recursive: true });
        const configPath = path.join(directory, fileName);
        await writeFile(
            configPath,
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "acme",
                source: { specs: [{ id: "acme", type: "openapi", path: "./openapi.yml" }] },
                targets: [{ language: "go", output: { delivery: "files" } }]
            })
        );
        return configPath;
    }

    function owner(folder: string, extras: Partial<FakeOwner> = {}): FakeOwner {
        return {
            workspaceName: folder,
            absoluteFilePath: AbsoluteFilePath.of(path.join(root, folder)),
            ...extras
        };
    }

    function projectOf({
        apiWorkspaces = [],
        sdkConfigWorkspaces
    }: {
        apiWorkspaces?: FakeOwner[];
        sdkConfigWorkspaces?: FakeOwner[];
    }): Project {
        const config: fernConfigJson.ProjectConfig = {
            _absolutePath: AbsoluteFilePath.of(path.join(root, "fern.config.json")),
            organization: "test",
            rawConfig: { organization: "test", version: "*" },
            version: "*"
        };
        return {
            config,
            // Only the SDK Config path is under test, so the owners carry no generators configuration
            apiWorkspaces: apiWorkspaces.map(
                (fake) => ({ ...fake, generatorsConfiguration: undefined }) as unknown as AbstractAPIWorkspace<unknown>
            ),
            sdkConfigWorkspaces,
            docsWorkspaces: undefined,
            loadAPIWorkspace: () => undefined
        };
    }

    async function runWithSdkConfig(project: Project, sdkConfigPath?: string): Promise<void> {
        await generateAPIWorkspaces({
            project,
            cliContext,
            version: undefined,
            groupNames: undefined,
            targetNames: undefined,
            generatorName: undefined,
            generatorIndex: undefined,
            shouldLogS3Url: false,
            keepDocker: false,
            useLocalDocker: false,
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

    function sourceRoots(): Array<string | undefined> {
        return vi.mocked(createSdkConfigWorkspace).mock.calls.map(([args]) => args.sourceRoot);
    }

    describe("source root", () => {
        it("is the owner's directory for the owner's own sdk-config.yml", async () => {
            await writeConfig(path.join(root, "alpha"));

            await runWithSdkConfig(projectOf({ apiWorkspaces: [owner("alpha")] }));

            expect(sourceRoots()).toEqual([path.join(root, "alpha")]);
        });

        it("is the owner's directory for a file nested inside it", async () => {
            const nested = await writeConfig(path.join(root, "alpha", "configs"));

            await runWithSdkConfig(projectOf({ apiWorkspaces: [owner("alpha")] }), nested);

            expect(sourceRoots()).toEqual([path.join(root, "alpha")]);
        });

        it("widens to the closest common ancestor for a file outside the owner's directory", async () => {
            await mkdir(path.join(root, "alpha"), { recursive: true });
            const outside = await writeConfig(path.join(root, "configs"));

            await runWithSdkConfig(projectOf({ apiWorkspaces: [owner("alpha")] }), outside);

            expect(sourceRoots()).toEqual([root]);
        });

        it("widens to cover every file the owner's workspace reads", async () => {
            await writeConfig(path.join(root, "alpha"));
            const shared = AbsoluteFilePath.of(path.join(root, "shared", "specs", "openapi.yml"));

            await runWithSdkConfig(
                projectOf({ apiWorkspaces: [owner("alpha", { getAbsoluteFilePaths: () => [shared] })] })
            );

            expect(sourceRoots()).toEqual([root]);
        });

        it("stays at the owner's directory when every file the owner reads is inside it", async () => {
            await writeConfig(path.join(root, "alpha"));
            const inside = AbsoluteFilePath.of(path.join(root, "alpha", "openapi", "openapi.yml"));

            await runWithSdkConfig(
                projectOf({ apiWorkspaces: [owner("alpha", { getAbsoluteFilePaths: () => [inside] })] })
            );

            expect(sourceRoots()).toEqual([path.join(root, "alpha")]);
        });

        it("is left to the workspace builder (undefined) when the file has no owner", async () => {
            const configPath = await writeConfig(path.join(root, "configs"));

            await runWithSdkConfig(projectOf({}), configPath);

            expect(sourceRoots()).toEqual([undefined]);
        });

        it("is computed per owner when several owners have a file", async () => {
            await writeConfig(path.join(root, "alpha"));
            await writeConfig(path.join(root, "beta"));
            const shared = AbsoluteFilePath.of(path.join(root, "shared", "openapi.yml"));

            await runWithSdkConfig(
                projectOf({
                    apiWorkspaces: [owner("alpha"), owner("beta", { getAbsoluteFilePaths: () => [shared] })]
                })
            );

            expect(sourceRoots()).toEqual([path.join(root, "alpha"), root]);
        });

        it("passes the owner's name, the config path and the CLI version to the builder", async () => {
            const configPath = await writeConfig(path.join(root, "alpha"));

            await runWithSdkConfig(projectOf({ sdkConfigWorkspaces: [owner("alpha")] }));

            expect(vi.mocked(createSdkConfigWorkspace).mock.calls[0]?.[0]).toMatchObject({
                workspaceName: "alpha",
                absolutePathToConfig: configPath,
                cliVersion: "0.0.0",
                local: false
            });
        });
    });

    describe("a workspace without a default group", () => {
        it("fails, and cleans up both that workspace and the ones already prepared", async () => {
            await writeConfig(path.join(root, "alpha"));
            await writeConfig(path.join(root, "beta"));
            vi.mocked(createSdkConfigWorkspace)
                .mockReset()
                .mockImplementationOnce(async ({ workspaceName }) => {
                    const cleanup = vi.fn(async () => undefined);
                    cleanups.push(cleanup);
                    return {
                        workspace: {
                            workspaceName,
                            generatorsConfiguration: { defaultGroup: "sdk-config", groups: [], rawConfiguration: {} }
                        } as never,
                        cleanup
                    };
                })
                .mockImplementationOnce(async ({ workspaceName }) => {
                    const cleanup = vi.fn(async () => undefined);
                    cleanups.push(cleanup);
                    return { workspace: { workspaceName, generatorsConfiguration: undefined } as never, cleanup };
                });

            await expect(
                runWithSdkConfig(projectOf({ apiWorkspaces: [owner("alpha"), owner("beta")] }))
            ).rejects.toBeDefined();

            expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(
                "SDK Config workspace has no generation targets",
                undefined,
                { code: CliError.Code.ConfigError }
            );
            expect(cleanups).toHaveLength(2);
            for (const cleanup of cleanups) {
                expect(cleanup).toHaveBeenCalled();
            }
            expect(vi.mocked(generateWorkspace)).not.toHaveBeenCalled();
        });
    });

    describe("cleanup", () => {
        it("cleans up every prepared workspace after generating", async () => {
            await writeConfig(path.join(root, "alpha"));
            await writeConfig(path.join(root, "beta"));

            await runWithSdkConfig(projectOf({ apiWorkspaces: [owner("alpha"), owner("beta")] }));

            expect(cleanups).toHaveLength(2);
            for (const cleanup of cleanups) {
                expect(cleanup).toHaveBeenCalledOnce();
            }
        });

        it("cleans up every prepared workspace when generation fails", async () => {
            await writeConfig(path.join(root, "alpha"));
            vi.mocked(generateWorkspace).mockRejectedValueOnce(new Error("generation failed"));

            await expect(runWithSdkConfig(projectOf({ apiWorkspaces: [owner("alpha")] }))).rejects.toThrow(
                "generation failed"
            );

            expect(cleanups[0]).toHaveBeenCalledOnce();
        });
    });
});
