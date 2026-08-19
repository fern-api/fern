import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { simpleGit } from "simple-git";
import tmp from "tmp-promise";
import { describe, expect, it } from "vitest";

import { ClonedRepository } from "../ClonedRepository.js";
import { expandFernignorePatterns } from "../expandFernignorePatterns.js";

async function makeRepoWith(files: Record<string, string>): Promise<string> {
    const dir = (await tmp.dir({ unsafeCleanup: true })).path;
    const git = simpleGit(dir);
    await git.init();
    await git.addConfig("user.name", "test");
    await git.addConfig("user.email", "test@example.com");
    for (const [relPath, contents] of Object.entries(files)) {
        const absPath = path.join(dir, relPath);
        await mkdir(path.dirname(absPath), { recursive: true });
        await writeFile(absPath, contents);
    }
    await git.add(".");
    await git.commit("initial");
    return dir;
}

async function makeSourceDirWith(files: Record<string, string>): Promise<string> {
    const dir = (await tmp.dir({ unsafeCleanup: true })).path;
    for (const [relPath, contents] of Object.entries(files)) {
        const absPath = path.join(dir, relPath);
        await mkdir(path.dirname(absPath), { recursive: true });
        await writeFile(absPath, contents);
    }
    return dir;
}

async function readIfExists(absPath: string): Promise<string | undefined> {
    try {
        return await readFile(absPath, "utf-8");
    } catch {
        return undefined;
    }
}

describe(".fernignore preservation through the publish sequence", () => {
    it("preserves files matching a glob and lets the generator replace the rest", async () => {
        const repoDir = await makeRepoWith({
            ".fernignore": "src/keep/**\n",
            "src/keep/a.py": "customer-a",
            "src/keep/nested/b.py": "customer-b",
            "src/replace/c.py": "old-generator-c"
        });
        const sourceDir = await makeSourceDirWith({
            "src/replace/c.py": "new-generator-c",
            "src/new/d.py": "new-generator-d"
        });
        const repo = ClonedRepository.createAtPath(repoDir);

        const fernignore = await repo.getFernignore();
        const tracked = await repo.listTrackedFiles();
        const preserved = fernignore !== undefined ? expandFernignorePatterns(fernignore, tracked) : [];

        await repo.overwriteLocalContents(sourceDir);
        await repo.add(".");
        if (preserved.length > 0) {
            await repo.restoreFiles({ files: preserved, staged: true });
            await repo.restoreFiles({ files: preserved });
        }

        expect(await readIfExists(path.join(repoDir, "src/keep/a.py"))).toBe("customer-a");
        expect(await readIfExists(path.join(repoDir, "src/keep/nested/b.py"))).toBe("customer-b");
        expect(await readIfExists(path.join(repoDir, "src/replace/c.py"))).toBe("new-generator-c");
        expect(await readIfExists(path.join(repoDir, "src/new/d.py"))).toBe("new-generator-d");
    });
});
