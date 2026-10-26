import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { Directory, File, getDirectoryContents } from "./getDirectoryContents.js";

/**
 * Lists the contents of a directory and splits them into files and directories.
 */
export async function getFilesAndDirectories(
    absoluteFilepath: AbsoluteFilePath
): Promise<{ files: File[]; directories: Directory[] }> {
    const contents = await getDirectoryContents(absoluteFilepath);

    const files: File[] = [];
    const directories: Directory[] = [];
    for (const fileOrFolder of contents) {
        if (fileOrFolder.type === "directory") {
            directories.push(fileOrFolder);
        } else {
            files.push(fileOrFolder);
        }
    }

    return { files, directories };
}
