import { describe, expect, it, vi } from "vitest";

import { isNonFastForwardError, pushSignedCommit } from "../pipeline/github/pushSignedCommit.js";

interface MockedRepository {
    getHeadSha: ReturnType<typeof vi.fn>;
    getHeadTreeHash: ReturnType<typeof vi.fn>;
    getHeadCommitMessage: ReturnType<typeof vi.fn>;
    getHeadParents: ReturnType<typeof vi.fn>;
    pushObjectToRef: ReturnType<typeof vi.fn>;
    pullWithRebase: ReturnType<typeof vi.fn>;
    resetHardToSha: ReturnType<typeof vi.fn>;
    fetch: ReturnType<typeof vi.fn>;
}

function buildRepository(overrides: Partial<MockedRepository> = {}): MockedRepository {
    return {
        getHeadSha: vi.fn().mockResolvedValue("local-sha"),
        getHeadTreeHash: vi.fn().mockResolvedValue("tree-sha"),
        getHeadCommitMessage: vi.fn().mockResolvedValue("SDK Generation"),
        getHeadParents: vi.fn().mockResolvedValue(["parent-sha"]),
        pushObjectToRef: vi.fn().mockResolvedValue(undefined),
        pullWithRebase: vi.fn().mockResolvedValue(undefined),
        resetHardToSha: vi.fn().mockResolvedValue(undefined),
        fetch: vi.fn().mockResolvedValue(undefined),
        ...overrides
    };
}

interface MockedOctokit {
    git: {
        createCommit: ReturnType<typeof vi.fn>;
        updateRef: ReturnType<typeof vi.fn>;
        createRef: ReturnType<typeof vi.fn>;
        deleteRef: ReturnType<typeof vi.fn>;
    };
}

function buildOctokit(overrides: Partial<MockedOctokit["git"]> = {}): MockedOctokit {
    return {
        git: {
            createCommit: vi.fn().mockResolvedValue({ data: { sha: "signed-sha-1" } }),
            updateRef: vi.fn().mockResolvedValue({ data: {} }),
            createRef: vi.fn().mockResolvedValue({ data: {} }),
            deleteRef: vi.fn().mockResolvedValue({ data: {} }),
            ...overrides
        }
    };
}

const silentLogger = {
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined
};

// The helper accepts concrete ClonedRepository / Octokit types; our tests use structural mocks
// that implement only the methods the helper invokes. This cast is local to the test file.
type Caller = (args: Parameters<typeof pushSignedCommit>[0]) => Promise<string>;

function makeCaller(repository: MockedRepository, octokit: MockedOctokit): Caller {
    return (rest) =>
        pushSignedCommit({
            ...rest,
            repository: repository as unknown as Parameters<typeof pushSignedCommit>[0]["repository"],
            octokit: octokit as unknown as Parameters<typeof pushSignedCommit>[0]["octokit"]
        });
}

describe("pushSignedCommit", () => {
    const baseArgs = {
        owner: "acme",
        repo: "acme-sdk",
        branch: "fern-bot/2026-04-22_00-00-00",
        force: true,
        logger: silentLogger
    } as const;

    it("pushes the local commit to a temp ref, creates a signed commit, and updates the branch ref", async () => {
        const repository = buildRepository();
        const octokit = buildOctokit();

        const result = await makeCaller(
            repository,
            octokit
        )({
            ...baseArgs,
            repository: repository as never,
            octokit: octokit as never
        });

        expect(result).toBe("signed-sha-1");
        expect(repository.pushObjectToRef).toHaveBeenCalledTimes(1);
        expect(repository.pushObjectToRef).toHaveBeenNthCalledWith(
            1,
            "local-sha",
            expect.stringMatching(/^refs\/temp\/fern-/)
        );
        expect(octokit.git.createCommit).toHaveBeenCalledWith({
            owner: "acme",
            repo: "acme-sdk",
            message: "SDK Generation",
            tree: "tree-sha",
            parents: ["parent-sha"]
        });
        expect(octokit.git.updateRef).toHaveBeenCalledWith({
            owner: "acme",
            repo: "acme-sdk",
            ref: "heads/fern-bot/2026-04-22_00-00-00",
            sha: "signed-sha-1",
            force: true
        });
        expect(octokit.git.createRef).not.toHaveBeenCalled();
        expect(octokit.git.deleteRef).toHaveBeenCalledWith({
            owner: "acme",
            repo: "acme-sdk",
            ref: expect.stringMatching(/^temp\/fern-/)
        });
        expect(repository.resetHardToSha).toHaveBeenCalledWith("signed-sha-1");
    });

    it("falls back to createRef when the branch does not yet exist on the remote", async () => {
        const notFound = Object.assign(new Error("Not Found"), { status: 404 });
        const repository = buildRepository();
        const octokit = buildOctokit({
            updateRef: vi.fn().mockRejectedValue(notFound)
        });

        const result = await makeCaller(
            repository,
            octokit
        )({
            ...baseArgs,
            force: false,
            repository: repository as never,
            octokit: octokit as never
        });

        expect(result).toBe("signed-sha-1");
        expect(octokit.git.createRef).toHaveBeenCalledWith({
            owner: "acme",
            repo: "acme-sdk",
            ref: "refs/heads/fern-bot/2026-04-22_00-00-00",
            sha: "signed-sha-1"
        });
    });

    it("does not retry on non-fast-forward when force=true (trusts caller's force intent)", async () => {
        const nonFF = Object.assign(new Error("Update is not a fast forward"), { status: 422 });
        const repository = buildRepository();
        const octokit = buildOctokit({
            updateRef: vi.fn().mockRejectedValue(nonFF)
        });

        await expect(
            makeCaller(
                repository,
                octokit
            )({
                ...baseArgs,
                force: true,
                repository: repository as never,
                octokit: octokit as never
            })
        ).rejects.toBe(nonFF);

        expect(octokit.git.createCommit).toHaveBeenCalledTimes(1);
        expect(repository.pullWithRebase).not.toHaveBeenCalled();
        // Temp ref is still cleaned up on failure.
        expect(octokit.git.deleteRef).toHaveBeenCalled();
    });

    it("throws on non-fast-forward when force=false and rebaseOnConflict is not set", async () => {
        const nonFF = Object.assign(new Error("Update is not a fast forward"), { status: 422 });
        const repository = buildRepository();
        const octokit = buildOctokit({
            updateRef: vi.fn().mockRejectedValue(nonFF)
        });

        await expect(
            makeCaller(
                repository,
                octokit
            )({
                ...baseArgs,
                force: false,
                repository: repository as never,
                octokit: octokit as never
            })
        ).rejects.toBe(nonFF);

        expect(repository.pullWithRebase).not.toHaveBeenCalled();
    });

    it("rebases and retries on non-fast-forward when rebaseOnConflict=true", async () => {
        const nonFF = Object.assign(new Error("Update is not a fast forward"), { status: 422 });
        const repository = buildRepository({
            getHeadSha: vi.fn().mockResolvedValueOnce("local-sha-1").mockResolvedValue("local-sha-2"),
            getHeadTreeHash: vi.fn().mockResolvedValueOnce("tree-sha-1").mockResolvedValue("tree-sha-2"),
            getHeadParents: vi.fn().mockResolvedValueOnce(["parent-sha-1"]).mockResolvedValue(["parent-sha-2"])
        });
        const octokit = buildOctokit({
            createCommit: vi
                .fn()
                .mockResolvedValueOnce({ data: { sha: "signed-sha-1" } })
                .mockResolvedValueOnce({ data: { sha: "signed-sha-2" } }),
            updateRef: vi.fn().mockRejectedValueOnce(nonFF).mockResolvedValueOnce({ data: {} })
        });

        const result = await makeCaller(
            repository,
            octokit
        )({
            ...baseArgs,
            force: false,
            rebaseOnConflict: true,
            repository: repository as never,
            octokit: octokit as never
        });

        expect(result).toBe("signed-sha-2");
        expect(repository.pullWithRebase).toHaveBeenCalledWith("fern-bot/2026-04-22_00-00-00");
        expect(octokit.git.createCommit).toHaveBeenNthCalledWith(2, {
            owner: "acme",
            repo: "acme-sdk",
            message: "SDK Generation",
            tree: "tree-sha-2",
            parents: ["parent-sha-2"]
        });
        // Temp ref re-push on the rebase retry must force, because the rebased commit
        // is not a descendant of the original tempRef tip.
        expect(repository.pushObjectToRef).toHaveBeenCalledTimes(2);
        expect(repository.pushObjectToRef).toHaveBeenNthCalledWith(
            1,
            "local-sha-1",
            expect.stringMatching(/^refs\/temp\/fern-/)
        );
        expect(repository.pushObjectToRef).toHaveBeenNthCalledWith(
            2,
            "local-sha-2",
            expect.stringMatching(/^refs\/temp\/fern-/),
            { force: true }
        );
    });

    it("propagates errors from the post-update local sync (does not swallow stale-HEAD risk)", async () => {
        const resetBoom = new Error("reset --hard failed");
        const repository = buildRepository({
            resetHardToSha: vi.fn().mockRejectedValue(resetBoom)
        });
        const octokit = buildOctokit();

        await expect(
            makeCaller(
                repository,
                octokit
            )({
                ...baseArgs,
                repository: repository as never,
                octokit: octokit as never
            })
        ).rejects.toBe(resetBoom);

        // Signed commit was created and the remote ref was updated before sync failed.
        expect(octokit.git.createCommit).toHaveBeenCalledTimes(1);
        expect(octokit.git.updateRef).toHaveBeenCalledTimes(1);
        // Temp ref still cleaned up.
        expect(octokit.git.deleteRef).toHaveBeenCalled();
    });

    it("cleans up the temp ref even when the push fails", async () => {
        const boom = new Error("boom");
        const repository = buildRepository();
        const octokit = buildOctokit({
            createCommit: vi.fn().mockRejectedValue(boom)
        });

        await expect(
            makeCaller(
                repository,
                octokit
            )({
                ...baseArgs,
                repository: repository as never,
                octokit: octokit as never
            })
        ).rejects.toBe(boom);

        expect(octokit.git.deleteRef).toHaveBeenCalled();
    });
});

describe("isNonFastForwardError", () => {
    it("recognizes 422 + 'not a fast forward'", () => {
        expect(isNonFastForwardError(Object.assign(new Error("Update is not a fast forward"), { status: 422 }))).toBe(
            true
        );
    });

    it("ignores 422 errors with unrelated messages", () => {
        expect(isNonFastForwardError(Object.assign(new Error("Validation failed"), { status: 422 }))).toBe(false);
    });

    it("ignores non-422 statuses", () => {
        expect(isNonFastForwardError(Object.assign(new Error("Not a fast forward"), { status: 409 }))).toBe(false);
    });

    it("handles non-error inputs safely", () => {
        expect(isNonFastForwardError(undefined)).toBe(false);
        expect(isNonFastForwardError("nope")).toBe(false);
        expect(isNonFastForwardError({})).toBe(false);
    });
});
