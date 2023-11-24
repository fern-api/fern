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

export declare namespace getDirectoryContents {
    export interface Options {
        fileExtensions?: string[];
    }
}

export async function getDirectoryContents(
    absolutePath: AbsoluteFilePath,
    options: getDirectoryContents.Options = {}
): Promise<FileOrDirectory[]> {
    const fileExtensionsWithPeriods =
        options.fileExtensions != null
            ? new Set(
                  options.fileExtensions.map((fileExtension) =>
                      fileExtension.startsWith(".") ? fileExtension : `.${fileExtension}`
                  )
              )
            : undefined;

    const contents: FileOrDirectory[] = [];

    const items = await readdir(absolutePath, { withFileTypes: true });
    await Promise.all(
        items.map(async (item) => {
            if (item.isDirectory()) {
                contents.push({
                    type: "directory",
                    name: item.name,
                    contents: await getDirectoryContents(join(absolutePath, RelativeFilePath.of(item.name)), options)
                });
            } else if (fileExtensionsWithPeriods == null || fileExtensionsWithPeriods.has(path.extname(item.name))) {
                contents.push({
                    type: "file",
                    name: item.name,
                    contents: (await readFile(path.join(absolutePath, item.name))).toString()
                });
            }
        })
    );

    return contents.sort((a, b) => (a.name < b.name ? -1 : 1));
}
