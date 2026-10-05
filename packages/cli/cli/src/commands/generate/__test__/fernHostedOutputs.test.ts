import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { CliError, createMockTaskContext, TaskContext, TaskResult } from "@fern-api/task-context";
import { existsSync } from "fs";
import { mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { deployHostedMcpServer } from "../../mcp/deployMcpServer.js";
import {
    assignFernHostedOutputDirectories,
    deployFernHostedOutputs,
    removeFernHostedOutputDirectories
} from "../fernHostedOutputs.js";

vi.mock("../../mcp/deployMcpServer.js", () => ({
    deployHostedMcpServer: vi.fn()
}));

const deployHostedMcpServerMock = vi.mocked(deployHostedMcpServer);

function createLogger(): Logger {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
}

function createGenerator(
    overrides: Partial<generatorsYml.GeneratorInvocation> = {}
): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-mcp-server",
        version: "1.0.0",
        fernHostedOutput: undefined,
        absolutePathToLocalOutput: undefined,
        ...overrides
    } as unknown as generatorsYml.GeneratorInvocation;
}

function createGroup(generators: generatorsYml.GeneratorInvocation[]): generatorsYml.GeneratorGroup {
    return {
        groupName: "default",
        generators
    } as unknown as generatorsYml.GeneratorGroup;
}

function createContext({
    result = TaskResult.Success,
    logger = createLogger()
}: {
    result?: TaskResult;
    logger?: ReturnType<typeof createLogger>;
} = {}): TaskContext & {
    failure?: { message: string | undefined; code: CliError.Code | undefined };
} {
    const context = createMockTaskContext({ logger });
    context.getResult = () => result;
    context.runInteractiveTask = async (_params, run) => {
        await run({ ...context, setSubtitle: () => undefined });
        return true;
    };
    const originalFailAndThrow = context.failAndThrow;
    const testContext = context as TaskContext & {
        failure?: { message: string | undefined; code: CliError.Code | undefined };
    };
    context.failAndThrow = ((message, error, options) => {
        testContext.failure = { message, code: options?.code };
        return originalFailAndThrow(message, error, options);
    }) as TaskContext["failAndThrow"];
    return testContext;
}

const workspace = {
    absoluteFilePath: AbsoluteFilePath.of(process.cwd())
} as never;

describe("assignFernHostedOutputDirectories", () => {
    it("assigns temporary output only to hosted generators without an explicit path", async () => {
        const explicitPath = AbsoluteFilePath.of(path.join(tmpdir(), "explicit-output"));
        const assignment = await assignFernHostedOutputDirectories(
            createGroup([
                createGenerator({ fernHostedOutput: { slug: undefined } }),
                createGenerator({ fernHostedOutput: { slug: "explicit" }, absolutePathToLocalOutput: explicitPath }),
                createGenerator({ name: "fernapi/fern-python-sdk" })
            ])
        );

        expect(assignment.temporaryDirectories).toHaveLength(1);
        expect(String(assignment.temporaryDirectories[0])).toMatch(
            new RegExp(`^${tmpdir().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${path.sep}fern-hosted-mcp-`)
        );
        expect(assignment.group.generators[0]?.absolutePathToLocalOutput).toBe(assignment.temporaryDirectories[0]);
        expect(assignment.group.generators[1]?.absolutePathToLocalOutput).toBe(explicitPath);
        expect(assignment.group.generators[2]?.absolutePathToLocalOutput).toBeUndefined();
    });
});

describe("removeFernHostedOutputDirectories", () => {
    it("removes created directories and ignores missing directories", async () => {
        const directory = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-hosted-remove-test-")));
        const logger = createLogger();

        await removeFernHostedOutputDirectories(
            [directory, AbsoluteFilePath.of(path.join(tmpdir(), "fern-hosted-does-not-exist"))],
            logger
        );

        expect(existsSync(directory)).toBe(false);
        expect(logger.debug).not.toHaveBeenCalled();
    });
});

describe("deployFernHostedOutputs", () => {
    afterEach(() => {
        deployHostedMcpServerMock.mockReset();
        vi.unstubAllEnvs();
    });

    it("does not deploy when there are no hosted generators", async () => {
        await deployFernHostedOutputs({
            group: createGroup([createGenerator()]),
            workspace,
            organization: "acme",
            cliVersion: "1.0.0",
            token: { value: "token" } as never,
            absolutePathToPreview: undefined,
            requireEnvVars: false,
            context: createContext()
        });

        expect(deployHostedMcpServerMock).not.toHaveBeenCalled();
    });

    it("does not deploy in preview mode", async () => {
        await deployFernHostedOutputs({
            group: createGroup([
                createGenerator({
                    fernHostedOutput: { slug: "mcp" },
                    absolutePathToLocalOutput: AbsoluteFilePath.of(path.join(tmpdir(), "bundle"))
                })
            ]),
            workspace,
            organization: "acme",
            cliVersion: "1.0.0",
            token: { value: "token" } as never,
            absolutePathToPreview: AbsoluteFilePath.of(path.join(tmpdir(), "preview")),
            requireEnvVars: false,
            context: createContext()
        });

        expect(deployHostedMcpServerMock).not.toHaveBeenCalled();
    });

    it("does not deploy after generation failure", async () => {
        const logger = createLogger();
        await deployFernHostedOutputs({
            group: createGroup([
                createGenerator({
                    fernHostedOutput: { slug: "mcp" },
                    absolutePathToLocalOutput: AbsoluteFilePath.of(path.join(tmpdir(), "bundle"))
                })
            ]),
            workspace,
            organization: "acme",
            cliVersion: "1.0.0",
            token: { value: "token" } as never,
            absolutePathToPreview: undefined,
            requireEnvVars: false,
            context: createContext({ result: TaskResult.Failure, logger })
        });

        expect(deployHostedMcpServerMock).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith("Skipping hosted MCP server deploy because generation failed.");
    });

    it("fails with an auth error without a token", async () => {
        const context = createContext();
        await expect(
            deployFernHostedOutputs({
                group: createGroup([
                    createGenerator({
                        fernHostedOutput: { slug: "mcp" },
                        absolutePathToLocalOutput: AbsoluteFilePath.of(path.join(tmpdir(), "bundle"))
                    })
                ]),
                workspace,
                organization: "acme",
                cliVersion: "1.0.0",
                token: undefined,
                absolutePathToPreview: undefined,
                requireEnvVars: false,
                context
            })
        ).rejects.toThrow();

        expect(context.failure?.code).toBe(CliError.Code.AuthError);
        expect(deployHostedMcpServerMock).not.toHaveBeenCalled();
    });

    it("deploys with the environment-resolved slug", async () => {
        vi.stubEnv("MCP_SLUG", "acme-mcp");
        const bundleDir = AbsoluteFilePath.of(path.join(tmpdir(), "bundle"));
        const generator = createGenerator({
            fernHostedOutput: { slug: "${MCP_SLUG}" },
            absolutePathToLocalOutput: bundleDir
        });

        await deployFernHostedOutputs({
            group: createGroup([generator]),
            workspace,
            organization: "acme",
            cliVersion: "1.0.0",
            token: { value: "token" } as never,
            absolutePathToPreview: undefined,
            requireEnvVars: false,
            context: createContext()
        });

        expect(deployHostedMcpServerMock).toHaveBeenCalledTimes(1);
        expect(deployHostedMcpServerMock).toHaveBeenCalledWith(
            expect.objectContaining({ bundleDir, slug: "acme-mcp", token: "token" })
        );
    });

    it("includes git provenance from the CI source", async () => {
        const commitSha = "0123456789abcdef0123456789abcdef01234567";
        vi.stubEnv("GITHUB_ACTIONS", "true");
        vi.stubEnv("GITHUB_REPOSITORY", "acme/api");
        vi.stubEnv("GITHUB_REF_NAME", "main");
        vi.stubEnv("GITHUB_SHA", commitSha);

        await deployFernHostedOutputs({
            group: createGroup([
                createGenerator({
                    fernHostedOutput: { slug: "mcp" },
                    absolutePathToLocalOutput: AbsoluteFilePath.of(path.join(tmpdir(), "bundle"))
                })
            ]),
            workspace,
            organization: "acme",
            cliVersion: "1.0.0",
            token: { value: "token" } as never,
            absolutePathToPreview: undefined,
            requireEnvVars: false,
            context: createContext()
        });

        expect(deployHostedMcpServerMock).toHaveBeenCalledWith(
            expect.objectContaining({
                git: {
                    repoUrl: "https://github.com/acme/api",
                    branch: "main",
                    commitSha
                }
            })
        );
    });

    it("fails with a config error when the slug environment variable is missing", async () => {
        const context = createContext();
        await expect(
            deployFernHostedOutputs({
                group: createGroup([
                    createGenerator({
                        fernHostedOutput: { slug: "${MCP_SLUG}" },
                        absolutePathToLocalOutput: AbsoluteFilePath.of(path.join(tmpdir(), "bundle"))
                    })
                ]),
                workspace,
                organization: "acme",
                cliVersion: "1.0.0",
                token: { value: "token" } as never,
                absolutePathToPreview: undefined,
                requireEnvVars: true,
                context
            })
        ).rejects.toThrow();

        expect(context.failure?.code).toBe(CliError.Code.ConfigError);
        expect(deployHostedMcpServerMock).not.toHaveBeenCalled();
    });
});
