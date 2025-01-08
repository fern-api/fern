import { mkdir, rename } from "fs/promises";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";
import { dirname } from "./dirname";
import { doesPathExist } from "./doesPathExist";
import { FileOrDirectory, getDirectoryContents } from "./getDirectoryContents";
import { join } from "./join";

export async function moveFolder({ src, dest }: { src: AbsoluteFilePath; dest: AbsoluteFilePath }): Promise<void> {
    const contents = await getDirectoryContents(src);
    await moveDirectoryContentsFromFolder({ src, dest, contents });
}

async function moveDirectoryContentsFromFolder({
    src,
    dest,
    contents
}: {
    src: AbsoluteFilePath;
    dest: AbsoluteFilePath;
    contents: FileOrDirectory[];
}): Promise<void> {
    for (const content of contents) {
        if (content.type === "file") {
            const originalPath = join(src, RelativeFilePath.of(content.name));
            const destinationPath = join(dest, RelativeFilePath.of(content.name));

            const destinationParentDir = dirname(destinationPath);
            if (!(await doesPathExist(destinationParentDir))) {
                await mkdir(destinationParentDir, { recursive: true });
            }
            await rename(originalPath, destinationPath);
        } else {
            await moveDirectoryContentsFromFolder({
                src: join(src, RelativeFilePath.of(content.name)),
                dest: join(dest, RelativeFilePath.of(content.name)),
                contents: content.contents
            });
        }
    }
}
