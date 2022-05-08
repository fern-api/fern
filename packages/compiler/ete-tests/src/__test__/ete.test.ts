import { exec } from "child_process";
import { lstat, rm } from "fs/promises";
import path from "path";
import { promisify } from "util";

const promisifiedExec = promisify(exec);

const MOCKS_DIR = path.join(__dirname, "mocks");

describe("ETE tests", () => {
    it("posts", async () => {
        const outputPath = path.join(MOCKS_DIR, "posts", "generated");
        await rm(outputPath, { force: true, recursive: true });

        const processPromise = promisifiedExec(`NODE_ENV=development node ../cli/cli generate -W ${MOCKS_DIR}`);

        const process = processPromise.child;
        await processPromise;
        expect(process.exitCode).toBe(0);

        const doesOutputExist = await doesPathExist(path.join(outputPath, "model/posts/Post.ts"));
        expect(doesOutputExist).toBe(true);
    }, 10_000);
});

async function doesPathExist(path: string): Promise<boolean> {
    try {
        await lstat(path);
        return true;
    } catch (e) {
        return false;
    }
}
