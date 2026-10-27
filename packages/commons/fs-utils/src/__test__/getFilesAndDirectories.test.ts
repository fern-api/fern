import { mkdir, writeFile } from "fs/promises";
import { dir as tmpDir } from "tmp-promise";
import { describe, expect, it } from "vitest";
import { AbsoluteFilePath } from "../AbsoluteFilePath.js";
import { getFilesAndDirectories } from "../getFilesAndDirectories.js";

describe("getFilesAndDirectories", () => {
    it("splits the contents of a directory into files and directories", async () => {
        const tmp = await tmpDir({ unsafeCleanup: true });
        try {
            await writeFile(`${tmp.path}/b.txt`, "b");
            await writeFile(`${tmp.path}/a.txt`, "a");
            await mkdir(`${tmp.path}/sub`);
            await writeFile(`${tmp.path}/sub/nested.txt`, "nested");

            const { files, directories } = await getFilesAndDirectories(AbsoluteFilePath.of(tmp.path));

            expect(files.map((file) => file.name)).toEqual(["a.txt", "b.txt"]);
            expect(directories.map((directory) => directory.name)).toEqual(["sub"]);
        } finally {
            await tmp.cleanup();
        }
    });

    it("returns empty lists for an empty directory", async () => {
        const tmp = await tmpDir({ unsafeCleanup: true });
        try {
            const result = await getFilesAndDirectories(AbsoluteFilePath.of(tmp.path));
            expect(result).toEqual({ files: [], directories: [] });
        } finally {
            await tmp.cleanup();
        }
    });
});
