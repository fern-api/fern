import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { publishDirectory } from "../utils/publishDirectory.js";

describe("publishDirectory", () => {
    let root: string;

    beforeEach(async () => {
        root = await mkdtemp(path.join(tmpdir(), "publish-directory-"));
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    async function stage(name: string, content: string): Promise<string> {
        const dir = path.join(root, name);
        await mkdir(path.join(dir, "dependencies"), { recursive: true });
        await writeFile(path.join(dir, "dependencies", "api.yml"), content);
        await writeFile(path.join(dir, "metadata.json"), "{}");
        return dir;
    }

    const isCompleteAt = (target: string) => async () => {
        try {
            await readFile(path.join(target, "metadata.json"));
            return true;
        } catch {
            return false;
        }
    };

    it("moves the staged directory into place", async () => {
        const target = path.join(root, "target");
        await publishDirectory({
            stagingDir: await stage("s1", "a"),
            targetDir: target,
            isComplete: isCompleteAt(target)
        });
        expect(await readFile(path.join(target, "dependencies", "api.yml"), "utf-8")).toBe("a");
    });

    it("keeps an already-published complete target and discards the staging dir", async () => {
        const target = path.join(root, "target");
        await publishDirectory({
            stagingDir: await stage("s1", "first"),
            targetDir: target,
            isComplete: isCompleteAt(target)
        });
        await publishDirectory({
            stagingDir: await stage("s2", "second"),
            targetDir: target,
            isComplete: isCompleteAt(target)
        });
        expect(await readFile(path.join(target, "dependencies", "api.yml"), "utf-8")).toBe("first");
        expect((await readdir(root)).sort()).toEqual(["target"]);
    });

    it("replaces an incomplete leftover target", async () => {
        const target = path.join(root, "target");
        await mkdir(path.join(target, "dependencies"), { recursive: true });
        await writeFile(path.join(target, "dependencies", "api.yml"), "");
        await publishDirectory({
            stagingDir: await stage("s1", "good"),
            targetDir: target,
            isComplete: isCompleteAt(target)
        });
        expect(await readFile(path.join(target, "dependencies", "api.yml"), "utf-8")).toBe("good");
    });

    it("never exposes a partial target when many publishes race", async () => {
        const target = path.join(root, "target");
        await Promise.all(
            ["a", "b", "c"].map(async (n) =>
                publishDirectory({ stagingDir: await stage(n, n), targetDir: target, isComplete: isCompleteAt(target) })
            )
        );
        expect(await isCompleteAt(target)()).toBe(true);
        expect((await readdir(root)).sort()).toEqual(["target"]);
    });
});
