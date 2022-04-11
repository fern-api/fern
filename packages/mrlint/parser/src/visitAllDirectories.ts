import { Dirent } from "fs";
import { readdir } from "fs/promises";

/**
 * visits all directories in @param root (by calling the provided @param visitor).
 * does not visit symbolic links.
 */
export function visitAllDirectories(
    root: string,
    visitor: (directoryName: string, contents: Dirent[]) => void | Promise<void>
): Promise<void> {
    return visitAllDirectoriesRecursive({
        directoryToSearchIn: root,
        visitor,
        seenDirectories: new Set(),
    });
}

async function visitAllDirectoriesRecursive({
    directoryToSearchIn,
    visitor,
    seenDirectories,
}: {
    directoryToSearchIn: string;
    visitor: (directoryName: string, contents: Dirent[]) => void | Promise<void>;
    seenDirectories: Set<string>;
}): Promise<void> {
    const contents = await readdir(directoryToSearchIn, { withFileTypes: true });
    await Promise.all([
        visitor(directoryToSearchIn, contents),
        ...contents
            .filter((item) => item.isDirectory())
            .map((directory) =>
                visitAllDirectoriesRecursive({
                    directoryToSearchIn: directory.name,
                    visitor,
                    seenDirectories,
                })
            ),
    ]);
}
