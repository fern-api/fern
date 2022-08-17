import { readdir, readFile } from "fs/promises";
import path from "path";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { join } from "./join";
import { RelativeFilePath } from "./RelativeFilePath";

export type FileOrDirectory = File | Directory;

export interface File {
    type: "file";
    name: string;
    contents: string;
}

export interface Directory {
    type: "directory";
    name: string;
    contents: FileOrDirectory[];
}

export async function getDirectoryContents(absolutePath: AbsoluteFilePath): Promise<FileOrDirectory[]> {
    const items = await readdir(absolutePath, { withFileTypes: true });
    return Promise.all(
        items.map(async (item) =>
            item.isDirectory()
                ? {
                      type: "directory",
                      name: item.name,
                      contents: await getDirectoryContents(join(absolutePath, item.name as RelativeFilePath)),
                  }
                : {
                      type: "file",
                      name: item.name,
                      contents: (await readFile(path.join(absolutePath, item.name))).toString(),
                  }
        )
    );
}
