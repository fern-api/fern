import path from "path";
import { Directory } from "ts-morph";
import { SourceFileManager } from "../SourceFileManager";

export function getRelativePathAsModuleSpecifierTo(
    from: SourceFileManager | Directory,
    to: SourceFileManager | Directory | string
): string {
    const fromFilePath = getFilePathOfDirectory(from);
    const toFilePath = typeof to === "string" ? to : getFilePath(to);

    const relativePath = path.relative(fromFilePath, toFilePath);
    const parsedRelativePath = path.parse(relativePath);

    const relativePathWithoutExtension = path.join(parsedRelativePath.dir, parsedRelativePath.name);
    if (relativePathWithoutExtension.startsWith(".")) {
        return relativePathWithoutExtension;
    }
    return `./${relativePathWithoutExtension}`;
}

function getFilePathOfDirectory(item: SourceFileManager | Directory) {
    if (isDirectory(item)) {
        return item.getPath();
    } else {
        return item.file.getDirectoryPath();
    }
}

function getFilePath(item: SourceFileManager | Directory): string {
    return isDirectory(item) ? item.getPath() : item.file.getFilePath();
}

function isDirectory(item: SourceFileManager | Directory): item is Directory {
    return (item as Directory).getPath != null;
}
