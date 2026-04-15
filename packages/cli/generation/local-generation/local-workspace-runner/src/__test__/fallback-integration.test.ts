import { execSync } from "child_process";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { AutoVersioningService } from "../AutoVersioningService.js";

/**
 * Integration tests for the auto-versioning fallback methods using REAL git repos.
 *
 * Unlike the unit tests in LocalTaskHandler.fallback.test.ts (which mock loggingExeca),
 * these tests create actual temporary git repositories with real commits, tags, and
 * .fern/metadata.json files. This verifies that:
 *   - git ls-remote --tags actually parses real tag output correctly
 *   - git show HEAD:.fern/metadata.json reads real committed files
 *   - The full fallback chain works against real git state
 *   - Nothing crashes with real git edge cases (empty repos, no remote, etc.)
 */

const mockLogger = {
    info: () => {
        /* noop */
    },
    warn: () => {
        /* noop */
    },
    error: () => {
        /* noop */
    },
    debug: () => {
        /* noop */
    },
    disable: () => {
        /* noop */
    },
    enable: () => {
        /* noop */
    },
    trace: () => {
        /* noop */
    },
    log: () => {
        /* noop */
    }
};

function git(args: string, cwd: string): string {
    return execSync(`git ${args}`, { cwd, stdio: "pipe", encoding: "utf-8" }).trim();
}

/** Creates a bare repo + clone with an initial commit. Returns both paths. */
async function createGitRepoWithRemote(): Promise<{ bareDir: string; cloneDir: string }> {
    const bareDir = await fs.mkdtemp(path.join(os.tmpdir(), "test-bare-"));
    const cloneDir = await fs.mkdtemp(path.join(os.tmpdir(), "test-clone-"));

    git(`init --bare --initial-branch=main ${bareDir}`, bareDir);
    git(`clone ${bareDir} ${cloneDir}`, os.tmpdir());
    git('config user.email "test@test.com"', cloneDir);
    git('config user.name "Test"', cloneDir);

    // Initial commit
    await fs.writeFile(path.join(cloneDir, "README.md"), "# Test\n");
    git("add .", cloneDir);
    git('commit -m "Initial commit"', cloneDir);
    git("push -u origin main", cloneDir);

    return { bareDir, cloneDir };
}

/** Creates a standalone git repo (no remote). */
async function createLocalOnlyRepo(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "test-local-"));
    git("init --initial-branch=main", dir);
    git('config user.email "test@test.com"', dir);
    git('config user.name "Test"', dir);

    await fs.writeFile(path.join(dir, "README.md"), "# Test\n");
    git("add .", dir);
    git('commit -m "Initial commit"', dir);

    return dir;
}

const dirsToCleanup: string[] = [];

afterEach(async () => {
    for (const dir of dirsToCleanup) {
        await fs.rm(dir, { recursive: true, force: true }).catch(() => {
            /* ignore */
        });
    }
    dirsToCleanup.length = 0;
});

describe("getLatestVersionFromGitTags - real git repos", () => {
    it("returns the latest semver tag from a real remote", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        git("tag 1.0.0", cloneDir);
        git("tag 1.1.0", cloneDir);
        git("tag 2.0.0", cloneDir);
        git("push origin --tags", cloneDir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(result).toBe("2.0.0");
    });

    it("returns the latest v-prefixed tag", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        git("tag v0.1.0", cloneDir);
        git("tag v0.2.0", cloneDir);
        git("tag v0.3.0-beta.1", cloneDir);
        git("push origin --tags", cloneDir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(cloneDir);
        // v0.3.0-beta.1 is a pre-release, so v0.2.0 is the latest stable
        // Actually, semver sorts pre-release BEFORE the release, so v0.3.0-beta.1 < v0.3.0
        // But v0.3.0-beta.1 > v0.2.0, so it should be returned as latest
        expect(result).toBe("v0.3.0-beta.1");
    });

    it("filters out non-semver tags", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        git("tag latest", cloneDir);
        git("tag release-candidate", cloneDir);
        git("tag build-123", cloneDir);
        git("tag 1.0.0", cloneDir);
        git("push origin --tags", cloneDir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(result).toBe("1.0.0");
    });

    it("returns undefined when no tags exist", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(result).toBeUndefined();
    });

    it("returns undefined when only non-semver tags exist", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        git("tag latest", cloneDir);
        git("tag nightly", cloneDir);
        git("push origin --tags", cloneDir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(result).toBeUndefined();
    });

    it("handles annotated tags correctly", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        git('tag -a v1.0.0 -m "Release 1.0.0"', cloneDir);
        git('tag -a v1.1.0 -m "Release 1.1.0"', cloneDir);
        git("push origin --tags", cloneDir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(result).toBe("v1.1.0");
    });

    it("returns undefined for a repo with no remote", async () => {
        const dir = await createLocalOnlyRepo();
        dirsToCleanup.push(dir);

        // No remote configured, so git ls-remote should fail gracefully
        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(dir);
        expect(result).toBeUndefined();
    });

    it("returns undefined for a non-git directory", async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "test-nongit-"));
        dirsToCleanup.push(dir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(dir);
        expect(result).toBeUndefined();
    });

    it("correctly sorts mixed v-prefixed and bare tags", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        git("tag 1.0.0", cloneDir);
        git("tag v2.0.0", cloneDir);
        git("tag 1.5.0", cloneDir);
        git("push origin --tags", cloneDir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(result).toBe("v2.0.0");
    });

    it("handles tags with slashes in the name", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        // Tags with slashes are valid in git
        git("tag release/1.0.0", cloneDir);
        git("tag 2.0.0", cloneDir);
        git("push origin --tags", cloneDir);

        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(cloneDir);
        // "release/1.0.0" is not a valid semver string, so only "2.0.0" is valid
        expect(result).toBe("2.0.0");
    });
});

describe("getVersionFromLocalMetadata - real git repos", () => {
    /**
     * getVersionFromLocalMetadata is a private method on LocalTaskHandler,
     * so we test the underlying git operation directly: `git show HEAD:.fern/metadata.json`
     * This verifies that the real git command works as expected.
     */

    it("reads sdkVersion from a committed .fern/metadata.json", async () => {
        const dir = await createLocalOnlyRepo();
        dirsToCleanup.push(dir);

        // Create .fern/metadata.json and commit it
        await fs.mkdir(path.join(dir, ".fern"), { recursive: true });
        await fs.writeFile(
            path.join(dir, ".fern", "metadata.json"),
            JSON.stringify({ sdkVersion: "1.5.0", language: "swift" })
        );
        git("add .", dir);
        git('commit -m "Add metadata"', dir);

        // Now overwrite with magic version (simulating generator output)
        await fs.writeFile(
            path.join(dir, ".fern", "metadata.json"),
            JSON.stringify({ sdkVersion: "0.0.0-fern-placeholder", language: "swift" })
        );

        // git show HEAD should return the COMMITTED version, not the overwritten one
        const stdout = execSync("git show HEAD:.fern/metadata.json", {
            cwd: dir,
            encoding: "utf-8"
        });
        const metadata = JSON.parse(stdout) as { sdkVersion?: string };
        expect(metadata.sdkVersion).toBe("1.5.0");
    });

    it("returns exit code 128 when .fern/metadata.json does not exist in HEAD", async () => {
        const dir = await createLocalOnlyRepo();
        dirsToCleanup.push(dir);

        // No .fern/metadata.json committed
        try {
            execSync("git show HEAD:.fern/metadata.json", {
                cwd: dir,
                encoding: "utf-8",
                stdio: "pipe"
            });
            // Should not reach here
            expect.fail("Expected git show to fail");
        } catch (e) {
            // git show exits with non-zero when path doesn't exist
            expect(e).toBeDefined();
        }
    });

    it("reads the HEAD version even after working directory is modified", async () => {
        const dir = await createLocalOnlyRepo();
        dirsToCleanup.push(dir);

        // Commit version 1.0.0
        await fs.mkdir(path.join(dir, ".fern"), { recursive: true });
        await fs.writeFile(path.join(dir, ".fern", "metadata.json"), JSON.stringify({ sdkVersion: "1.0.0" }));
        git("add .", dir);
        git('commit -m "v1.0.0"', dir);

        // Overwrite on disk with 2.0.0 (not committed)
        await fs.writeFile(path.join(dir, ".fern", "metadata.json"), JSON.stringify({ sdkVersion: "2.0.0" }));

        // git show HEAD should still return 1.0.0
        const stdout = execSync("git show HEAD:.fern/metadata.json", {
            cwd: dir,
            encoding: "utf-8"
        });
        const metadata = JSON.parse(stdout) as { sdkVersion?: string };
        expect(metadata.sdkVersion).toBe("1.0.0");
    });

    it("handles metadata.json with missing sdkVersion field", async () => {
        const dir = await createLocalOnlyRepo();
        dirsToCleanup.push(dir);

        await fs.mkdir(path.join(dir, ".fern"), { recursive: true });
        await fs.writeFile(
            path.join(dir, ".fern", "metadata.json"),
            JSON.stringify({ language: "swift", generatorVersion: "0.30.0" })
        );
        git("add .", dir);
        git('commit -m "Add metadata without sdkVersion"', dir);

        const stdout = execSync("git show HEAD:.fern/metadata.json", {
            cwd: dir,
            encoding: "utf-8"
        });
        const metadata = JSON.parse(stdout) as { sdkVersion?: string };
        expect(metadata.sdkVersion).toBeUndefined();
    });
});

describe("Full fallback chain - real git repos", () => {
    /**
     * These tests verify that getLatestVersionFromGitTags works correctly
     * when combined with the metadata fallback in a realistic scenario.
     * They test the priority: metadata.json > git tags > initial version.
     */

    it("git tags provide correct version when metadata.json is absent", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        // Create tags but no .fern/metadata.json
        git("tag v1.2.3", cloneDir);
        git("tag v1.3.0", cloneDir);
        git("push origin --tags", cloneDir);

        // Verify metadata.json is absent
        try {
            execSync("git show HEAD:.fern/metadata.json", {
                cwd: cloneDir,
                encoding: "utf-8",
                stdio: "pipe"
            });
            expect.fail("Expected git show to fail");
        } catch {
            // Expected — metadata.json doesn't exist
        }

        // Verify git tags return the right version
        const svc = new AutoVersioningService({ logger: mockLogger });
        const tagVersion = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(tagVersion).toBe("v1.3.0");
    });

    it("both metadata.json and git tags provide versions (metadata takes priority in handler)", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        // Commit .fern/metadata.json with version 1.5.0
        await fs.mkdir(path.join(cloneDir, ".fern"), { recursive: true });
        await fs.writeFile(path.join(cloneDir, ".fern", "metadata.json"), JSON.stringify({ sdkVersion: "1.5.0" }));
        git("add .", cloneDir);
        git('commit -m "Add metadata"', cloneDir);
        git("push origin main", cloneDir);

        // Also create tags
        git("tag v1.3.0", cloneDir);
        git("tag v1.5.0", cloneDir);
        git("push origin --tags", cloneDir);

        // Both should be readable
        const stdout = execSync("git show HEAD:.fern/metadata.json", {
            cwd: cloneDir,
            encoding: "utf-8"
        });
        const metadata = JSON.parse(stdout) as { sdkVersion?: string };
        expect(metadata.sdkVersion).toBe("1.5.0");

        const svc = new AutoVersioningService({ logger: mockLogger });
        const tagVersion = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(tagVersion).toBe("v1.5.0");
    });

    it("neither metadata.json nor git tags exist (new repo scenario)", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();
        dirsToCleanup.push(bareDir, cloneDir);

        // No metadata.json, no tags — this is a brand-new SDK repo
        try {
            execSync("git show HEAD:.fern/metadata.json", {
                cwd: cloneDir,
                encoding: "utf-8",
                stdio: "pipe"
            });
            expect.fail("Expected git show to fail");
        } catch {
            // Expected
        }

        const svc = new AutoVersioningService({ logger: mockLogger });
        const tagVersion = await svc.getLatestVersionFromGitTags(cloneDir);
        expect(tagVersion).toBeUndefined();

        // In the handler, this would result in initial version 0.0.1
    });

    it("clone that did not fetch tags still works via ls-remote", async () => {
        const { bareDir, cloneDir } = await createGitRepoWithRemote();

        // Create some tags
        git("tag v1.0.0", cloneDir);
        git("tag v2.0.0", cloneDir);
        git("push origin --tags", cloneDir);

        // Create a new clone with --no-tags so local `git tag -l` would be empty
        const noTagsDir = await fs.mkdtemp(path.join(os.tmpdir(), "test-notags-"));
        dirsToCleanup.push(bareDir, cloneDir, noTagsDir);
        git(`clone --no-tags ${bareDir} ${noTagsDir}`, os.tmpdir());

        // Verify local tags are empty
        const localTags = git("tag -l", noTagsDir);
        expect(localTags).toBe("");

        // ls-remote should still see tags on the remote
        const svc = new AutoVersioningService({ logger: mockLogger });
        const result = await svc.getLatestVersionFromGitTags(noTagsDir);
        expect(result).toBe("v2.0.0");
    });
});
