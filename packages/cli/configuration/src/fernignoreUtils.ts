import { readFile } from "fs/promises";

import { FERNIGNORE_FILENAME } from "./constants";

const NEW_LINE_REGEX = /\r?\n/;

/**
 * Parses a .fernignore file and returns the list of paths to ignore.
 * The .fernignore file itself is always included in the list.
 *
 * @param absolutePathToFernignore - The absolute path to the .fernignore file
 * @returns An array of paths to ignore, including the .fernignore file itself
 */
export async function getFernIgnorePaths({
    absolutePathToFernignore
}: {
    absolutePathToFernignore: string;
}): Promise<string[]> {
    const fernIgnoreFileContents = (await readFile(absolutePathToFernignore)).toString();
    return parseFernIgnoreContents(fernIgnoreFileContents);
}

/**
 * Parses the contents of a .fernignore file and returns the list of paths to ignore.
 * The .fernignore file itself is always included in the list.
 *
 * @param fernIgnoreFileContents - The contents of the .fernignore file
 * @returns An array of paths to ignore, including the .fernignore file itself
 */
export function parseFernIgnoreContents(fernIgnoreFileContents: string): string[] {
    return [
        FERNIGNORE_FILENAME,
        ...fernIgnoreFileContents
            .trim()
            .split(NEW_LINE_REGEX)
            .map((line) => {
                // Remove comments at the end of the line
                const commentIndex = line.indexOf("#");
                if (commentIndex !== -1) {
                    return line.slice(0, commentIndex).trim();
                }
                return line.trim();
            })
            .filter((line) => line.length > 0)
    ];
}
