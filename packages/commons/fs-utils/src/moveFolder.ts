import { rename } from "fs/promises";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { FileOrDirectory, getDirectoryContents } from "./getDirectoryContents";
import { join } from "./join";
import { RelativeFilePath } from "./RelativeFilePath";

export async function moveFolder({ src, dest }: { src: AbsoluteFilePath; dest: AbsoluteFilePath }): Promise<void> {
    const directoryContents = await getDirectoryContents(src);
    await moveDirectoryContentsFromFolder({ src, dest, directoryContents });
}

async function moveDirectoryContentsFromFolder({
    src,
    dest,
    directoryContents,
}: {
    src: AbsoluteFilePath;
    dest: AbsoluteFilePath;
    directoryContents: FileOrDirectory[];
}): Promise<void> {
    for (const content of directoryContents) {
        if (content.type === "file") {
            const originalPath = join(src, RelativeFilePath.of(content.name));
            const destinationPath = join(dest, RelativeFilePath.of(content.name));
            await rename(originalPath, destinationPath);
        } else {
            await moveDirectoryContentsFromFolder({
                src: join(src, RelativeFilePath.of(content.name)),
                dest: join(dest, RelativeFilePath.of(content.name)),
                directoryContents: content.contents,
            });
        }
    }
}
