import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createWriteStream } from "fs";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
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

    it("merges into an existing non-empty directory without touching existing files", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const zipPath = await createTestZip(tmpDir, [{ name: "generated.txt", content: "generated" }]);
        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        await mkdir(path.join(outputDir, ".git"), { recursive: true });
        await writeFile(path.join(outputDir, ".git", "HEAD"), "ref: refs/heads/main");

        await extractZipToDirectory(zipPath, outputDir);

        expect((await readdir(outputDir)).sort()).toEqual([".git", "generated.txt"]);
        expect(await readFile(path.join(outputDir, "generated.txt"), "utf-8")).toBe("generated");
        expect(await readFile(path.join(outputDir, ".git", "HEAD"), "utf-8")).toBe("ref: refs/heads/main");
    });

    it("leaves no partial tree or staging directory behind when the archive is corrupt", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const zipPath = await createTestZip(tmpDir, [
            { name: "first.txt", content: "a".repeat(4096) },
            { name: "second.txt", content: "b".repeat(4096) }
        ]);
        const zipBytes = await readFile(zipPath);
        // Overwrite the compressed payload of the first entry (after its 30-byte local header + file name)
        // so inflating it fails part-way through the extraction.
        zipBytes.fill(0xff, 30 + "first.txt".length, 30 + "first.txt".length + 32);
        await writeFile(zipPath, zipBytes);
        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        await mkdir(outputDir, { recursive: true });

        await expect(extractZipToDirectory(zipPath, outputDir)).rejects.toThrow();

        expect(await readdir(outputDir)).toEqual([]);
        expect((await readdir(tmpDir.path)).sort()).toEqual(["output", "test.zip"]);
    });

    it("removes stale staging directories from a previous interrupted extraction", async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        const zipPath = await createTestZip(tmpDir, [{ name: "file.txt", content: "hello" }]);
        const outputDir = AbsoluteFilePath.of(path.join(tmpDir.path, "output"));
        const staleStagingDir = path.join(tmpDir.path, "output.fern-extract-123-456");
        await mkdir(staleStagingDir, { recursive: true });
        await writeFile(path.join(staleStagingDir, "partial.txt"), "partial");

        await extractZipToDirectory(zipPath, outputDir);

        expect((await readdir(tmpDir.path)).sort()).toEqual(["output", "test.zip"]);
        expect(await readdir(outputDir)).toEqual(["file.txt"]);
    });
});
