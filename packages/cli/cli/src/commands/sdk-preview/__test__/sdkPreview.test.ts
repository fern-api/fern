import { CliError } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sdkPreview } from "../sdkPreview.js";
import { makeGroup, makeNpmGenerator, makePypiGenerator } from "./test-utils.js";

vi.mock("@fern-api/login", () => ({
    askToLogin: vi.fn()
}));
vi.mock("../../../cliCommons.js", () => ({
    loadProjectAndRegisterWorkspacesWithContext: vi.fn()
}));
vi.mock("@fern-api/remote-workspace-runner", () => ({
    runRemoteGenerationForAPIWorkspace: vi.fn()
}));

const askToLogin = (await import("@fern-api/login")).askToLogin as ReturnType<typeof vi.fn>;
const loadProject = (
    (await import("../../../cliCommons.js")) as {
        loadProjectAndRegisterWorkspacesWithContext: ReturnType<typeof vi.fn>;
    }
).loadProjectAndRegisterWorkspacesWithContext;
const runRemote = (await import("@fern-api/remote-workspace-runner")).runRemoteGenerationForAPIWorkspace as ReturnType<
    typeof vi.fn
>;

function makeCliContextStub() {
    return {
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        runTask: async <T>(fn: (ctx: unknown) => Promise<T>) => fn({}),
        runTaskForWorkspace: async <T>(_ws: unknown, fn: (ctx: unknown) => Promise<T>) => fn({})
    } as unknown as Parameters<typeof sdkPreview>[0]["cliContext"];
}

function withPypiGroup(generator = makePypiGenerator(/* pypi output mode irrelevant for orchestration */ {} as never)) {
    askToLogin.mockResolvedValue({ type: "user", value: "fern-token" });
    loadProject.mockResolvedValue({
        config: { organization: "acme" },
        apiWorkspaces: [
            {
                workspaceName: "ws",
                generatorsConfiguration: {
                    defaultGroup: "preview",
                    groups: [makeGroup([generator])],
                    whitelabel: undefined
                }
            }
        ]
    });
}

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    delete process.env.FERN_PREVIEW_PYPI_REGISTRY_URL;
});

describe("sdkPreview - npm happy path (preserved)", () => {
    it("publishes a single npm preview successfully", async () => {
        askToLogin.mockResolvedValue({ type: "user", value: "tok" });
        loadProject.mockResolvedValue({
            config: { organization: "acme" },
            apiWorkspaces: [
                {
                    workspaceName: "ws",
                    generatorsConfiguration: {
                        defaultGroup: "preview",
                        groups: [makeGroup([makeNpmGenerator({ type: "downloadFiles" } as never)])]
                    }
                }
            ]
        });
        runRemote.mockResolvedValue(undefined);

        const result = await sdkPreview({
            cliContext: makeCliContextStub(),
            groupName: "preview",
            generatorFilter: undefined,
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: false
        });

        expect(result.status).toBe("success");
        if (result.status === "success") {
            expect(result.previews).toHaveLength(1);
            expect(result.previews[0]?.install).toMatch(/^npm install .+--registry https:\/\/npm\.buildwithfern\.com/);
        }
    });
});

describe("sdkPreview - pypi preflight failures", () => {
    it("errors when no PyPI registry is configured", async () => {
        withPypiGroup();
        const result = await sdkPreview({
            cliContext: makeCliContextStub(),
            groupName: "preview",
            generatorFilter: undefined,
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: false
        });
        expect(result.status).toBe("error");
        if (result.status === "error") {
            expect(result.code).toBe(CliError.Code.ConfigError);
            expect(result.message).toContain("FERN_PREVIEW_PYPI_REGISTRY_URL");
        }
    });

    it("errors when PyPI token is missing", async () => {
        process.env.FERN_PREVIEW_PYPI_REGISTRY_URL = "https://pypi.example.com/legacy/";
        withPypiGroup();
        askToLogin.mockResolvedValue({ type: "user", value: "" });
        const result = await sdkPreview({
            cliContext: makeCliContextStub(),
            groupName: "preview",
            generatorFilter: undefined,
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: false
        });
        expect(result.status).toBe("error");
        if (result.status === "error") {
            expect(result.code).toBe(CliError.Code.AuthError);
            expect(result.message).toContain("PyPI token");
        }
    });

    it("errors when no Python generator is in the filtered group", async () => {
        // generatorFilter targets a name not present anywhere
        askToLogin.mockResolvedValue({ type: "user", value: "tok" });
        loadProject.mockResolvedValue({
            config: { organization: "acme" },
            apiWorkspaces: [
                {
                    workspaceName: "ws",
                    generatorsConfiguration: {
                        defaultGroup: "preview",
                        groups: [makeGroup([makeNpmGenerator({ type: "downloadFiles" } as never)])]
                    }
                }
            ]
        });
        const result = await sdkPreview({
            cliContext: makeCliContextStub(),
            groupName: "preview",
            generatorFilter: "fernapi/fern-python-sdk",
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: false
        });
        expect(result.status).toBe("error");
        if (result.status === "error") {
            expect(result.code).toBe(CliError.Code.ConfigError);
        }
    });

    it("rejects --push-diff when any Python generator is present", async () => {
        process.env.FERN_PREVIEW_PYPI_REGISTRY_URL = "https://pypi.example.com/legacy/";
        withPypiGroup();
        const result = await sdkPreview({
            cliContext: makeCliContextStub(),
            groupName: "preview",
            generatorFilter: undefined,
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: true
        });
        expect(result.status).toBe("error");
        if (result.status === "error") {
            expect(result.message).toContain("--push-diff");
            expect(result.message).toContain("v1");
        }
        expect(runRemote).not.toHaveBeenCalled();
    });
});

describe("sdkPreview - pypi happy path", () => {
    it("publishes and emits a pip install command", async () => {
        process.env.FERN_PREVIEW_PYPI_REGISTRY_URL = "https://pypi.example.com/legacy/";
        withPypiGroup();
        runRemote.mockResolvedValue(undefined);

        const result = await sdkPreview({
            cliContext: makeCliContextStub(),
            groupName: "preview",
            generatorFilter: undefined,
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: false
        });
        expect(result.status).toBe("success");
        if (result.status === "success") {
            expect(result.previews[0]?.install).toMatch(
                /^pip install acme-preview-.+==0\.0\.1\.dev\d+\+.+ --index-url https:\/\/pypi\.example\.com\/legacy\/$/
            );
            expect(result.previews[0]?.version).toMatch(/^0\.0\.1\.dev\d+\+/);
        }
    });

    it("surfaces version-already-uploaded as a clear error", async () => {
        process.env.FERN_PREVIEW_PYPI_REGISTRY_URL = "https://pypi.example.com/legacy/";
        withPypiGroup();
        runRemote.mockRejectedValue(new Error("400 File already exists"));

        const result = await sdkPreview({
            cliContext: makeCliContextStub(),
            groupName: "preview",
            generatorFilter: undefined,
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: false
        });
        expect(result.status).toBe("error");
        if (result.status === "error") {
            expect(result.message).toContain("already exists");
            expect(result.message).toContain("Bump previewId");
        }
    });
});

describe("sdkPreview - parallel execution", () => {
    it("fires both Fiddle calls concurrently", async () => {
        process.env.FERN_PREVIEW_PYPI_REGISTRY_URL = "https://pypi.example.com/legacy/";
        askToLogin.mockResolvedValue({ type: "user", value: "tok" });
        loadProject.mockResolvedValue({
            config: { organization: "acme" },
            apiWorkspaces: [
                {
                    workspaceName: "ws",
                    generatorsConfiguration: {
                        defaultGroup: "preview",
                        groups: [
                            makeGroup([
                                makeNpmGenerator({ type: "downloadFiles" } as never),
                                makePypiGenerator({ type: "downloadFiles" } as never)
                            ])
                        ]
                    }
                }
            ]
        });

        let inflight = 0;
        let peakInflight = 0;
        runRemote.mockImplementation(async () => {
            inflight++;
            peakInflight = Math.max(peakInflight, inflight);
            await new Promise((r) => setTimeout(r, 10));
            inflight--;
        });

        const result = await sdkPreview({
            cliContext: makeCliContextStub(),
            groupName: "preview",
            generatorFilter: undefined,
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: false
        });
        expect(result.status).toBe("success");
        expect(peakInflight).toBeGreaterThanOrEqual(2);
    });

    it("emits a partial-success warning on mixed outcomes", async () => {
        process.env.FERN_PREVIEW_PYPI_REGISTRY_URL = "https://pypi.example.com/legacy/";
        askToLogin.mockResolvedValue({ type: "user", value: "tok" });
        loadProject.mockResolvedValue({
            config: { organization: "acme" },
            apiWorkspaces: [
                {
                    workspaceName: "ws",
                    generatorsConfiguration: {
                        defaultGroup: "preview",
                        groups: [
                            makeGroup([
                                makeNpmGenerator({ type: "downloadFiles" } as never),
                                makePypiGenerator({ type: "downloadFiles" } as never)
                            ])
                        ]
                    }
                }
            ]
        });

        const cli = makeCliContextStub();
        let call = 0;
        runRemote.mockImplementation(async () => {
            call++;
            if (call === 2) {
                throw new Error("pypi network error");
            }
        });

        const result = await sdkPreview({
            cliContext: cli,
            groupName: "preview",
            generatorFilter: undefined,
            apiName: undefined,
            output: undefined,
            local: false,
            pushDiff: false
        });
        expect(result.status).toBe("success");
        if (result.status === "success") {
            expect(result.previews).toHaveLength(1);
        }
        const warnCalls = (cli.logger.warn as ReturnType<typeof vi.fn>).mock.calls.flat().join(" ");
        expect(warnCalls).toContain("Successfully published 1 of 2");
        expect(warnCalls).toContain("pypi network error");
    });
});
