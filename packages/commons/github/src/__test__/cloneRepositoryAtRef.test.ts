import { beforeEach, describe, expect, it, vi } from "vitest";

import { cloneRepositoryAtRef, resolveRepositorySubpath } from "../cloneRepositoryAtRef.js";

const mocks = vi.hoisted(() => ({
    checkout: vi.fn(),
    clone: vi.fn(),
    fetch: vi.fn(),
    setGracefulCleanup: vi.fn()
}));

vi.mock("@fern-api/core-utils", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/core-utils")>()),
    isGitAvailable: () => true
}));

vi.mock("tmp-promise", () => ({
    default: {
        dir: vi.fn().mockResolvedValue({ path: "/tmp/clone" }),
        setGracefulCleanup: mocks.setGracefulCleanup
    }
}));

vi.mock("simple-git", () => ({
    simpleGit: (baseDir?: string) =>
        baseDir == null
            ? { clone: mocks.clone }
            : {
                  checkout: mocks.checkout,
                  fetch: mocks.fetch
              }
}));

describe("cloneRepositoryAtRef", () => {
    beforeEach(() => {
        mocks.checkout.mockReset();
        mocks.clone.mockReset();
        mocks.fetch.mockReset();
    });

    it("registers temporary clones for process-exit cleanup", () => {
        expect(mocks.setGracefulCleanup).toHaveBeenCalledOnce();
    });

    it("clones the default branch when ref is omitted", async () => {
        await cloneRepositoryAtRef({ repositoryUrl: "https://github.com/acme/sdk", ref: undefined });

        expect(mocks.clone).toHaveBeenCalledWith("https://github.com/acme/sdk", "/tmp/clone", [
            "--depth",
            "1",
            "--config",
            "core.symlinks=false"
        ]);
    });

    it("clones branch and tag refs with --branch", async () => {
        await cloneRepositoryAtRef({ repositoryUrl: "https://github.com/acme/sdk", ref: "v2.0.0" });

        expect(mocks.clone).toHaveBeenCalledWith("https://github.com/acme/sdk", "/tmp/clone", [
            "--depth",
            "1",
            "--config",
            "core.symlinks=false",
            "--branch",
            "v2.0.0"
        ]);
    });

    it("fetches and checks out commit refs", async () => {
        const ref = "a1b2c3d";

        await cloneRepositoryAtRef({ repositoryUrl: "https://github.com/acme/sdk", ref });

        expect(mocks.clone).toHaveBeenCalledWith("https://github.com/acme/sdk", "/tmp/clone", [
            "--depth",
            "1",
            "--config",
            "core.symlinks=false",
            "--no-checkout"
        ]);
        expect(mocks.fetch).toHaveBeenCalledWith("origin", ref, { "--depth": "1" });
        expect(mocks.checkout).toHaveBeenCalledWith(ref);
    });

    it("includes invalid refs in clone errors", async () => {
        mocks.clone.mockRejectedValue(new Error("Remote branch missing not found"));

        await expect(
            cloneRepositoryAtRef({ repositoryUrl: "https://github.com/acme/sdk", ref: "missing" })
        ).rejects.toThrow("at ref 'missing'");
    });

    it("identifies missing repositories", async () => {
        mocks.clone.mockRejectedValue(new Error("remote: Repository not found."));

        await expect(
            cloneRepositoryAtRef({ repositoryUrl: "https://github.com/acme/missing", ref: undefined })
        ).rejects.toThrow("repository not found");
    });
});

describe("resolveRepositorySubpath", () => {
    it("resolves paths within the repository", () => {
        expect(
            resolveRepositorySubpath({
                repositoryRoot: "/tmp/clone",
                subpath: "packages/sdk",
                description: "library subpath"
            })
        ).toBe("/tmp/clone/packages/sdk");
    });

    it("rejects paths outside the repository", () => {
        expect(() =>
            resolveRepositorySubpath({
                repositoryRoot: "/tmp/clone",
                subpath: "../outside",
                description: "library subpath"
            })
        ).toThrow("path must be relative to the repository root and cannot traverse outside it");
    });
});
