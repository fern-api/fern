import { Logger } from "@fern-api/logger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SyncSpecsOptions } from "../syncSpecs.js";

// --- hoisted mock state (available at vi.mock hoist time) ---

const {
    mockReposGetFn,
    mockGitGetRefFn,
    mockPullsListFn,
    mockPullsCreateFn,
    mockPullsUpdateFn,
    mockLoggingExecaFn,
    mockExistsSyncFn,
    mockStatIsDirFn,
    execaCalls,
    porcelainOutput,
    diffOutput
} = vi.hoisted(() => {
    const execaCalls: { cmd: string; args: string[]; cwd?: string }[] = [];
    const porcelainOutput = { value: "M openapi/openapi.json\n" };
    const diffOutput = { value: "-old\n+new\n" };

    const mockReposGetFn = vi.fn().mockResolvedValue({});
    const mockGitGetRefFn = vi.fn().mockRejectedValue(new Error("Not Found"));
    const mockPullsListFn = vi.fn().mockResolvedValue({ data: [] });
    const mockPullsCreateFn = vi.fn().mockResolvedValue({ data: { html_url: "https://github.com/pr/1" } });
    const mockPullsUpdateFn = vi.fn().mockResolvedValue({});
    const mockExistsSyncFn = vi.fn().mockReturnValue(true);
    const mockStatIsDirFn = vi.fn().mockReturnValue(false);

    const mockLoggingExecaFn = vi.fn(async (_logger: unknown, cmd: string, args: string[], opts?: { cwd?: string }) => {
        execaCalls.push({ cmd, args, cwd: opts?.cwd });
        if (args.includes("--porcelain")) {
            return { stdout: porcelainOutput.value, stderr: "", failed: false, exitCode: 0 };
        }
        if (args.includes("diff")) {
            return { stdout: diffOutput.value, stderr: "", failed: false, exitCode: 0 };
        }
        return { stdout: "", stderr: "", failed: false, exitCode: 0 };
    });

    return {
        mockReposGetFn,
        mockGitGetRefFn,
        mockPullsListFn,
        mockPullsCreateFn,
        mockPullsUpdateFn,
        mockLoggingExecaFn,
        mockExistsSyncFn,
        mockStatIsDirFn,
        execaCalls,
        porcelainOutput,
        diffOutput
    };
});

// --- module mocks ---

vi.mock("@octokit/rest", () => ({
    Octokit: function () {
        return {
            rest: {
                repos: { get: (...args: unknown[]) => mockReposGetFn(...args) },
                git: { getRef: (...args: unknown[]) => mockGitGetRefFn(...args) },
                pulls: {
                    list: (...args: unknown[]) => mockPullsListFn(...args),
                    create: (...args: unknown[]) => mockPullsCreateFn(...args),
                    update: (...args: unknown[]) => mockPullsUpdateFn(...args)
                }
            }
        };
    }
}));

vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: (logger: unknown, cmd: string, args: string[], opts?: { cwd?: string }) =>
        mockLoggingExecaFn(logger, cmd, args, opts)
}));

vi.mock("glob", () => ({
    glob: vi.fn(async () => [])
}));

vi.mock("node:fs", () => ({
    default: {},
    mkdirSync: vi.fn(),
    existsSync: (...args: unknown[]) => mockExistsSyncFn(...args),
    statSync: (...args: unknown[]) => ({ isDirectory: () => mockStatIsDirFn(...args) }),
    copyFileSync: vi.fn(),
    rmSync: vi.fn()
}));

// --- CliContext stub ---

const mockLogger: Logger = {
    disable: vi.fn(),
    enable: vi.fn(),
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
};

const mockCliContext = {
    logger: mockLogger,
    failAndThrow: vi.fn((msg: string) => {
        throw new Error(msg);
    }),
    runTask: vi.fn(async (fn: () => Promise<void>) => fn())
};

// --- helpers ---

function makeOptions(overrides: Partial<SyncSpecsOptions> = {}): SyncSpecsOptions {
    return {
        repository: "target-owner/target-repo",
        sources: '[{"from": "openapi/openapi.json", "to": "openapi/openapi.json"}]',
        token: "fake-token",
        branch: "fern/sync-openapi",
        autoMerge: false,
        cwd: "/workspace",
        ...overrides
    };
}

async function runSync(options: SyncSpecsOptions = makeOptions()) {
    const { syncSpecs } = await import("../syncSpecs.js");
    return syncSpecs({ options, cliContext: mockCliContext as never });
}

// --- setup / teardown ---

beforeEach(() => {
    execaCalls.length = 0;
    porcelainOutput.value = "M openapi/openapi.json\n";
    diffOutput.value = "-old\n+new\n";

    mockReposGetFn.mockReset().mockResolvedValue({});
    mockGitGetRefFn.mockReset().mockRejectedValue(new Error("Not Found"));
    mockPullsListFn.mockReset().mockResolvedValue({ data: [] });
    mockPullsCreateFn.mockReset().mockResolvedValue({ data: { html_url: "https://github.com/pr/1" } });
    mockPullsUpdateFn.mockReset().mockResolvedValue({});
    mockExistsSyncFn.mockReset().mockReturnValue(true);
    mockStatIsDirFn.mockReset().mockReturnValue(false);
    mockLoggingExecaFn.mockClear();
});

afterEach(() => {
    vi.clearAllMocks();
});

// --- tests ---

describe("repository format validation", () => {
    it("fails when repository has no slash", async () => {
        await expect(runSync(makeOptions({ repository: "noslash" }))).rejects.toThrow(
            'Invalid repository format: "noslash"'
        );
    });

    it("fails when owner is empty", async () => {
        await expect(runSync(makeOptions({ repository: "/repo-only" }))).rejects.toThrow(
            'Invalid repository format: "/repo-only"'
        );
    });

    it("fails when repo name is empty", async () => {
        await expect(runSync(makeOptions({ repository: "owner/" }))).rejects.toThrow(
            'Invalid repository format: "owner/"'
        );
    });
});

describe("repository access verification", () => {
    it("verifies repo access before cloning", async () => {
        await runSync();

        expect(mockReposGetFn).toHaveBeenCalledWith({ owner: "target-owner", repo: "target-repo" });
    });

    it("throws when repo is inaccessible", async () => {
        mockReposGetFn.mockRejectedValue(new Error("Not Found"));

        await expect(runSync()).rejects.toThrow("Failed to verify access to target-owner/target-repo");

        const cloneCall = execaCalls.find((c) => c.args.includes("clone"));
        expect(cloneCall).toBeUndefined();
    });
});

describe("sources parsing", () => {
    it("accepts JSON sources", async () => {
        await expect(
            runSync(makeOptions({ sources: '[{"from": "a.json", "to": "b.json"}]' }))
        ).resolves.toBeUndefined();
    });

    it("accepts YAML sources", async () => {
        await expect(runSync(makeOptions({ sources: "- from: a.json\n  to: b.json\n" }))).resolves.toBeUndefined();
    });

    it("throws when sources is empty array", async () => {
        await expect(runSync(makeOptions({ sources: "[]" }))).rejects.toThrow("'sources' must be a non-empty array");
    });

    it("throws when a mapping is missing 'to'", async () => {
        await expect(runSync(makeOptions({ sources: '[{"from": "a.json"}]' }))).rejects.toThrow(
            "missing 'from' or 'to'"
        );
    });
});

describe("branch setup", () => {
    it("creates a new branch when it does not exist", async () => {
        mockGitGetRefFn.mockRejectedValue(new Error("Not Found"));

        await runSync();

        const checkoutCall = execaCalls.find(
            (c) => c.cmd === "git" && c.args.includes("checkout") && c.args.includes("-b")
        );
        expect(checkoutCall).toBeDefined();
        expect(checkoutCall?.args).toContain("fern/sync-openapi");
    });

    it("checks out and pulls existing branch when it exists", async () => {
        mockGitGetRefFn.mockResolvedValue({});

        await runSync();

        const fetchCall = execaCalls.find((c) => c.cmd === "git" && c.args.includes("fetch"));
        expect(fetchCall).toBeDefined();

        const checkoutCall = execaCalls.find(
            (c) => c.cmd === "git" && c.args.includes("checkout") && !c.args.includes("-b")
        );
        expect(checkoutCall).toBeDefined();
        expect(checkoutCall?.args).toContain("fern/sync-openapi");
    });
});

describe("no-op when no changes", () => {
    it("does not push or create a PR when git status returns nothing", async () => {
        porcelainOutput.value = "";

        await runSync();

        const pushCall = execaCalls.find((c) => c.cmd === "git" && c.args.includes("push"));
        expect(pushCall).toBeUndefined();
        expect(mockPullsCreateFn).not.toHaveBeenCalled();
    });
});

describe("git push", () => {
    it("pushes with --force to the configured branch", async () => {
        await runSync();

        const pushCall = execaCalls.find((c) => c.cmd === "git" && c.args.includes("push"));
        expect(pushCall).toBeDefined();
        expect(pushCall?.args).toContain("--force");
        expect(pushCall?.args).toContain("origin");
        expect(pushCall?.args).toContain("fern/sync-openapi");
    });

    it("skips push when content is identical to remote", async () => {
        diffOutput.value = ""; // no difference with remote

        await runSync();

        const pushCall = execaCalls.find((c) => c.cmd === "git" && c.args.includes("push"));
        expect(pushCall).toBeUndefined();
        expect(mockPullsCreateFn).not.toHaveBeenCalled();
    });

    it("pushes when content differs from remote", async () => {
        diffOutput.value = "-old line\n+new line\n";

        await runSync();

        const pushCall = execaCalls.find((c) => c.cmd === "git" && c.args.includes("push"));
        expect(pushCall).toBeDefined();
    });

    it("proceeds with push when remote fetch fails (first push to new branch)", async () => {
        mockLoggingExecaFn.mockImplementation(
            async (_logger: unknown, cmd: string, args: string[], opts?: { cwd?: string }) => {
                execaCalls.push({ cmd, args, cwd: opts?.cwd });
                if (args.includes("--porcelain")) {
                    return { stdout: "M openapi/openapi.json\n", stderr: "", failed: false, exitCode: 0 };
                }
                if (cmd === "git" && args[0] === "fetch" && args.length === 3) {
                    throw new Error("fatal: couldn't find remote ref");
                }
                return { stdout: "", stderr: "", failed: false, exitCode: 0 };
            }
        );

        await runSync();

        const pushCall = execaCalls.find((c) => c.cmd === "git" && c.args.includes("push"));
        expect(pushCall).toBeDefined();
    });
});

describe("PR creation", () => {
    it("creates a PR when changes are detected and no PR exists", async () => {
        mockPullsListFn.mockResolvedValue({ data: [] });

        await runSync();

        expect(mockPullsCreateFn).toHaveBeenCalledWith(
            expect.objectContaining({
                owner: "target-owner",
                repo: "target-repo",
                head: "fern/sync-openapi",
                base: "main"
            })
        );
    });

    it("updates existing PR instead of creating a new one", async () => {
        mockPullsListFn.mockResolvedValue({ data: [{ number: 42 }] });

        await runSync();

        expect(mockPullsCreateFn).not.toHaveBeenCalled();
        expect(mockPullsUpdateFn).toHaveBeenCalledWith(
            expect.objectContaining({
                owner: "target-owner",
                repo: "target-repo",
                pull_number: 42
            })
        );
    });

    it("skips PR creation when auto-merge is enabled", async () => {
        await runSync(makeOptions({ autoMerge: true }));

        expect(mockPullsListFn).not.toHaveBeenCalled();
        expect(mockPullsCreateFn).not.toHaveBeenCalled();
    });
});
