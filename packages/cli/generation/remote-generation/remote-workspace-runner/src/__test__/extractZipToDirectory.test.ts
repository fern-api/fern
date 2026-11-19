import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomBytes } from "crypto";
import { createWriteStream } from "fs";
import { mkdir, readdir, readFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import yazl from "yazl";
import { extractZipToDirectory } from "../RemoteTaskHandler.js";

async function createTestZip(
    tmpDir: tmp.DirectoryResult,
    entries: { name: string; content?: string }[]
): Promise<string> {
    const zipPath = path.join(tmpDir.path, "test.zip");
    const zipfile = new yazl.ZipFile();

    for (const entry of entries) {
        if (entry.name.endsWith("/")) {
            zipfile.addEmptyDirectory(entry.name);
        } else {
            zipfile.addBuffer(Buffer.from(entry.content ?? ""), entry.name);
        }
    }

    zipfile.end();

    await new Promise<void>((resolve, reject) => {
        const writeStream = createWriteStream(zipPath);
        zipfile.outputStream.pipe(writeStream);
        writeStream.on("close", resolve);
        writeStream.on("error", reject);
    });

    return zipPath;
}

describe("extractZipToDirectory", () => {
    it("extracts files correctly", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const zipPath = await createTestZip(tmpDir, [{ name: "file.txt", content: "hello world" }]);

        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        await mkdir(outputDir, { recursive: true });

        await extractZipToDirectory(zipPath, outputDir);

        const content = await readFile(path.join(outputDir, "file.txt"), "utf-8");
        expect(content).toBe("hello world");

        await tmpDir.cleanup();
    });

    it("extracts directories correctly", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const zipPath = await createTestZip(tmpDir, [
            { name: "subdir/" },
            { name: "subdir/file.txt", content: "nested content" }
        ]);

        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        await mkdir(outputDir, { recursive: true });

        await extractZipToDirectory(zipPath, outputDir);

        const entries = await readdir(outputDir);
        expect(entries).toContain("subdir");

        const nestedContent = await readFile(path.join(outputDir, "subdir", "file.txt"), "utf-8");
        expect(nestedContent).toBe("nested content");

        await tmpDir.cleanup();
    });

    it("handles nested directory structures", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const zipPath = await createTestZip(tmpDir, [
            { name: "a/" },
            { name: "a/b/" },
            { name: "a/b/c/" },
            { name: "a/b/c/deep.txt", content: "deep file" }
        ]);

        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        await mkdir(outputDir, { recursive: true });

        await extractZipToDirectory(zipPath, outputDir);

        const content = await readFile(path.join(outputDir, "a", "b", "c", "deep.txt"), "utf-8");
        expect(content).toBe("deep file");

        await tmpDir.cleanup();
    });

    it("creates parent directories for files without explicit directory entries", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const zipPath = await createTestZip(tmpDir, [{ name: "implicit/path/file.txt", content: "implicit dirs" }]);

        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        await mkdir(outputDir, { recursive: true });

        await extractZipToDirectory(zipPath, outputDir);

        const content = await readFile(path.join(outputDir, "implicit", "path", "file.txt"), "utf-8");
        expect(content).toBe("implicit dirs");

        await tmpDir.cleanup();
    });

    // yauzl <= 3.3.0's read stream stalls partway through an entry like this one on Node 26. The extraction promise
    // never settled, so the CLI exited 0 without writing the rest of the output or running what came after it.
    it("extracts an entry that spans many read chunks", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        // Random, so it barely compresses: about 1 MiB of entry data, read in many chunks.
        const large = randomBytes(768 * 1024).toString("base64");
        const zipPath = await createTestZip(tmpDir, [
            { name: "dist/engine.mjs", content: large },
            { name: "dist/after.txt", content: "after the large entry" }
        ]);

        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        await mkdir(outputDir, { recursive: true });

        await extractZipToDirectory(zipPath, outputDir);

        expect(await readFile(path.join(outputDir, "dist", "engine.mjs"), "utf-8")).toBe(large);
        expect(await readFile(path.join(outputDir, "dist", "after.txt"), "utf-8")).toBe("after the large entry");

        await tmpDir.cleanup();
    });

    it("handles empty zip files", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const zipPath = await createTestZip(tmpDir, []);

        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        await mkdir(outputDir, { recursive: true });

        await extractZipToDirectory(zipPath, outputDir);

        const entries = await readdir(outputDir);
        expect(entries).toHaveLength(0);

        await tmpDir.cleanup();
    });
});
