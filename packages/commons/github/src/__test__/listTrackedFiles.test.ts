import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { simpleGit } from "simple-git";
import tmp from "tmp-promise";
import { describe, expect, it } from "vitest";

import { ClonedRepository } from "../ClonedRepository.js";

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

describe("ClonedRepository.listTrackedFiles", () => {
    it("returns every file path tracked at HEAD", async () => {
        const dir = await makeRepoWith({
            ".fernignore": "src/keep/**\n",
            "README.md": "# hi",
            "src/keep/a.py": "a",
            "src/keep/nested/b.py": "b",
            "src/drop/c.py": "c"
        });
        const repo = ClonedRepository.createAtPath(dir);

        const tracked = await repo.listTrackedFiles();

        expect([...tracked].sort()).toEqual(
            [".fernignore", "README.md", "src/drop/c.py", "src/keep/a.py", "src/keep/nested/b.py"].sort()
        );
    });
});
