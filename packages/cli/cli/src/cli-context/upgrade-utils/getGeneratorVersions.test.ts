import { Project } from "@fern-api/project-loader";
import { CliError, TaskContext } from "@fern-api/task-context";
import { ReleaseType } from "@fern-fern/generators-sdk/api/resources/generators";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../CliContext.js";
import { getLatestGeneratorVersions, processGeneratorGroups } from "./getGeneratorVersions.js";

const h = vi.hoisted(() => ({
    sdkGenApiEnabled: false,
    resolvedSdkGenApiEnabled: undefined as boolean | undefined,
    isFernSdkGenApiEnabled: vi.fn(),
    getLatestGeneratorVersion: vi.fn(),
    loadGeneratorsConfiguration: vi.fn(),
    askToLogin: vi.fn(async () => ({ type: "organization" as const, value: "test-token" }))
}));

vi.mock("@fern-api/configuration-loader", () => ({
    addDefaultDockerOrgIfNotPresent: vi.fn((name: string) => (name.includes("/") ? name : `fernapi/${name}`)),
    getLatestGeneratorVersion: h.getLatestGeneratorVersion,
    loadGeneratorsConfiguration: h.loadGeneratorsConfiguration,
    normalizeGeneratorName: vi.fn((name: string) => name)
}));

vi.mock("@fern-api/remote-workspace-runner", () => ({
    getFernSdkGenApiLanguage: vi.fn(() => "typescript"),
    getFernSdkGenApiOrigin: vi.fn(() => "https://sdk-gen.example.com"),
    getResolvedFernSdkGenApiEnabled: vi.fn(() => h.resolvedSdkGenApiEnabled),
    isFernSdkGenApiEnabled: h.isFernSdkGenApiEnabled,
    USE_SDK_GEN_API_FEATURE_FLAG: "use-sdk-gen-api"
}));
vi.mock("@fern-api/login", () => ({ askToLogin: h.askToLogin }));

describe("generator upgrade version reporting", () => {
    let context: TaskContext;
    let cliContext: CliContext;
    let project: Project;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        h.sdkGenApiEnabled = false;
        h.resolvedSdkGenApiEnabled = undefined;
        h.isFernSdkGenApiEnabled.mockImplementation(async () => h.sdkGenApiEnabled);
        context = {
            logger: {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn()
            }
        } as unknown as TaskContext;
        cliContext = {
            environment: { packageVersion: "1.0.0" },
            logger: context.logger,
            runTask: vi.fn(async (run: (taskContext: TaskContext) => Promise<unknown>) => run(context)),
            runTaskForWorkspace: vi.fn(async (_workspace: unknown, run: (taskContext: TaskContext) => Promise<void>) =>
                run(context)
            )
        } as unknown as CliContext;
        project = {
            apiWorkspaces: [{ absoluteFilePath: "/workspace", workspaceName: undefined }],
            config: { organization: "test-org" }
        } as unknown as Project;
        h.loadGeneratorsConfiguration.mockResolvedValue({
            groups: [
                {
                    groupName: "production",
                    generators: [{ name: "fernapi/fern-typescript-node-sdk", version: "0.40.0" }]
                }
            ]
        });
    });

    it("uses SDK Gen API without an FDR fallback when enabled", async () => {
        h.sdkGenApiEnabled = true;
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "0.51.7" }]
            })
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await getLatestGeneratorVersions({ cliContext, project });

        expect(h.getLatestGeneratorVersion).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual({
            Authorization: "Bearer test-token",
            "X-Fern-Organization-Id": "test-org",
            "content-type": "application/json"
        });
        expect(result).toEqual({
            type: "singleApi",
            versions: {
                production: {
                    "fernapi/fern-typescript-node-sdk": {
                        previousVersion: "0.40.0",
                        latestVersion: "0.51.7"
                    }
                }
            }
        });
    });

    it("retains FDR reporting when SDK Gen API is disabled", async () => {
        h.getLatestGeneratorVersion.mockResolvedValue("0.52.0");
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await getLatestGeneratorVersions({ cliContext, project });

        expect(h.getLatestGeneratorVersion).toHaveBeenCalledOnce();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("evaluates the sdk-gen-api flag per generator and picks each generator's version source", async () => {
        h.loadGeneratorsConfiguration.mockResolvedValue({
            groups: [
                {
                    groupName: "production",
                    generators: [
                        { name: "fernapi/fern-typescript-node-sdk", version: "0.40.0" },
                        { name: "fern-python-sdk", version: "4.0.0" }
                    ]
                }
            ]
        });
        h.isFernSdkGenApiEnabled.mockImplementation(
            async ({ generatorName }: { generatorName: string }) => generatorName === "fernapi/fern-typescript-node-sdk"
        );
        h.getLatestGeneratorVersion.mockResolvedValue("4.1.0");
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "0.51.7" }]
            })
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await getLatestGeneratorVersions({ cliContext, project });

        expect(h.isFernSdkGenApiEnabled.mock.calls).toEqual([
            [{ organization: "test-org", generatorName: "fernapi/fern-typescript-node-sdk" }],
            [{ organization: "test-org", generatorName: "fernapi/fern-python-sdk" }]
        ]);
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(h.getLatestGeneratorVersion).toHaveBeenCalledOnce();
        expect(result).toEqual({
            type: "singleApi",
            versions: {
                production: {
                    "fernapi/fern-typescript-node-sdk": { previousVersion: "0.40.0", latestVersion: "0.51.7" },
                    "fern-python-sdk": { previousVersion: "4.0.0", latestVersion: "4.1.0" }
                }
            }
        });
    });

    it("does not log in when the flag routes no generator through sdk-gen-api", async () => {
        h.getLatestGeneratorVersion.mockResolvedValue("0.52.0");
        vi.stubGlobal("fetch", vi.fn());

        await getLatestGeneratorVersions({ cliContext, project });

        expect(h.askToLogin).not.toHaveBeenCalled();
    });

    it("reuses an already-resolved flag without a request when skipFeatureFlagRequest is set", async () => {
        h.resolvedSdkGenApiEnabled = true;
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: "0.51.7" }]
            })
        });
        vi.stubGlobal("fetch", fetchMock);

        await getLatestGeneratorVersions({ cliContext, project, skipFeatureFlagRequest: true });

        expect(h.isFernSdkGenApiEnabled).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(h.getLatestGeneratorVersion).not.toHaveBeenCalled();
    });

    it("falls back to FDR when skipFeatureFlagRequest is set and the flag was never resolved", async () => {
        h.getLatestGeneratorVersion.mockResolvedValue("0.52.0");
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await getLatestGeneratorVersions({ cliContext, project, skipFeatureFlagRequest: true });

        expect(h.isFernSdkGenApiEnabled).not.toHaveBeenCalled();
        expect(h.getLatestGeneratorVersion).toHaveBeenCalledOnce();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("treats configured latest as already tracking latest without discovery", async () => {
        h.sdkGenApiEnabled = true;
        h.loadGeneratorsConfiguration.mockResolvedValue({
            groups: [
                {
                    groupName: "production",
                    generators: [{ name: "fernapi/fern-typescript-node-sdk", version: "latest" }]
                }
            ]
        });
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const result = await getLatestGeneratorVersions({ cliContext, project });

        expect(fetchMock).not.toHaveBeenCalled();
        expect(h.askToLogin).not.toHaveBeenCalled();
        expect(result).toEqual({
            type: "singleApi",
            versions: {
                production: {
                    "fernapi/fern-typescript-node-sdk": {
                        previousVersion: "latest",
                        latestVersion: "latest"
                    }
                }
            }
        });
    });

    it("rejects channels before an SDK Gen API list lookup", async () => {
        h.sdkGenApiEnabled = true;
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await expect(
            getLatestGeneratorVersions({
                cliContext,
                project,
                channel: "beta" as ReleaseType
            })
        ).rejects.toThrow("does not support the requested upgrade channel");
        expect(h.getLatestGeneratorVersion).not.toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("compares broader valid SemVer in list output", () => {
        expect(
            processGeneratorGroups(
                {
                    production: {
                        "fernapi/fern-typescript-sdk": {
                            previousVersion: "1.2.2",
                            latestVersion: "1.2.3-preview.1"
                        }
                    }
                },
                undefined,
                context.logger
            )[0]?.isUpgradeAvailable
        ).toBe(true);
    });

    it("fails list output actionably for malformed versions", () => {
        expect(() =>
            processGeneratorGroups(
                {
                    production: {
                        "fernapi/fern-typescript-sdk": {
                            previousVersion: "invalid-current",
                            latestVersion: "invalid-candidate"
                        }
                    }
                },
                undefined,
                context.logger
            )
        ).toThrowError(CliError);
        expect(() =>
            processGeneratorGroups(
                {
                    production: {
                        "fernapi/fern-typescript-sdk": {
                            previousVersion: "invalid-current",
                            latestVersion: "invalid-candidate"
                        }
                    }
                },
                undefined,
                context.logger
            )
        ).toThrow('configured version "invalid-current", candidate version "invalid-candidate"');
    });
});
