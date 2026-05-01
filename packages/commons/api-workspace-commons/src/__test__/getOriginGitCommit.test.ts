import { execSync } from "child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOriginGitCommit, getOriginGitCommitIsDirty } from "../getOriginGitCommit.js";

vi.mock("child_process");

describe("getOriginGitCommit", () => {
    const mockExecSync = vi.mocked(execSync);

    beforeEach(() => {
        vi.resetAllMocks();
        delete process.env.IGNORE_GIT_IN_METADATA;
    });

    it("returns DUMMY when IGNORE_GIT_IN_METADATA is true", () => {
        process.env.IGNORE_GIT_IN_METADATA = "true";

        const result = getOriginGitCommit();

        expect(result).toBe("DUMMY");
        expect(mockExecSync).not.toHaveBeenCalled();
    });

    it("returns actual commit hash when environment variable is not set", () => {
        const mockCommit = "a1b2c3d4e5f6789012345678901234567890abcd";
        mockExecSync.mockReturnValue(mockCommit);

        const result = getOriginGitCommit();

        expect(result).toBe(mockCommit);
        expect(mockExecSync).toHaveBeenCalledWith("git rev-parse HEAD", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        });
    });

    it("returns undefined when git command fails", () => {
        mockExecSync.mockImplementation(() => {
            throw new Error("git not found");
        });

        const result = getOriginGitCommit();

        expect(result).toBeUndefined();
    });

    it("returns undefined for invalid commit hash format", () => {
        mockExecSync.mockReturnValue("invalid-hash");

        const result = getOriginGitCommit();

        expect(result).toBeUndefined();
    });

    it("trims whitespace from git output", () => {
        const mockCommit = "a1b2c3d4e5f6789012345678901234567890abcd";
        mockExecSync.mockReturnValue(`  ${mockCommit}  \n`);

        const result = getOriginGitCommit();

        expect(result).toBe(mockCommit);
    });
});

describe("getOriginGitCommitIsDirty", () => {
    const mockExecSync = vi.mocked(execSync);

    beforeEach(() => {
        vi.resetAllMocks();
        delete process.env.IGNORE_GIT_IN_METADATA;
    });

    it("returns undefined when IGNORE_GIT_IN_METADATA is true and does not shell out", () => {
        process.env.IGNORE_GIT_IN_METADATA = "true";

        const result = getOriginGitCommitIsDirty();

        expect(result).toBeUndefined();
        expect(mockExecSync).not.toHaveBeenCalled();
    });

    it("returns false for a clean working tree", () => {
        mockExecSync.mockReturnValue("");

        const result = getOriginGitCommitIsDirty();

        expect(result).toBe(false);
        expect(mockExecSync).toHaveBeenCalledWith("git status --porcelain", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        });
    });

    it("treats output consisting only of whitespace as clean", () => {
        mockExecSync.mockReturnValue("   \n  \n");

        expect(getOriginGitCommitIsDirty()).toBe(false);
    });

    it("returns true when the working tree has changes", () => {
        mockExecSync.mockReturnValue(" M packages/foo/bar.ts\n?? packages/foo/new.ts\n");

        expect(getOriginGitCommitIsDirty()).toBe(true);
    });

    it("returns undefined when git is not available", () => {
        mockExecSync.mockImplementation(() => {
            throw new Error("git not found");
        });

        expect(getOriginGitCommitIsDirty()).toBeUndefined();
    });
});
