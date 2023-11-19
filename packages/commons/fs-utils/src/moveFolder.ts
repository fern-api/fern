import { rename } from "fs/promises";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { FileOrDirectory, getDirectoryContents } from "./getDirectoryContents";
import { join } from "./join";
import { RelativeFilePath } from "./RelativeFilePath";

export async function moveFolder({ src, dest }: { src: AbsoluteFilePath; dest: AbsoluteFilePath }): Promise<void> {
    const contents = await getDirectoryContents(src);
    await moveDirectoryContentsFromFolder({ src, dest, contents });
}

async function moveDirectoryContentsFromFolder({
    src,
    dest,
    contents,
}: {
    src: AbsoluteFilePath;
    dest: AbsoluteFilePath;
    contents: FileOrDirectory[];
}): Promise<void> {
    for (const content of contents) {
        if (content.type === "file") {
            const originalPath = join(src, RelativeFilePath.of(content.name));
            const destinationPath = join(dest, RelativeFilePath.of(content.name));
            await rename(originalPath, destinationPath);
        } else {
            await moveDirectoryContentsFromFolder({
                src: join(src, RelativeFilePath.of(content.name)),
                dest: join(dest, RelativeFilePath.of(content.name)),
                contents: content.contents,
            });
        }
    }
}
