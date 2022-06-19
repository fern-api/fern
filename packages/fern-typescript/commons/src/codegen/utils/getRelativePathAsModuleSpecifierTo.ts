import path from "path";
import { Directory, SourceFile } from "ts-morph";

export function getRelativePathAsModuleSpecifierTo(
    from: SourceFile | Directory,
    to: SourceFile | Directory | string
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

function getFilePathOfDirectory(item: SourceFile | Directory) {
    if (isSourceFile(item)) {
        return item.getDirectoryPath();
    } else {
        return item.getPath();
    }
}

function getFilePath(item: SourceFile | Directory): string {
    return isSourceFile(item) ? item.getFilePath() : item.getPath();
}

function isSourceFile(item: SourceFile | Directory): item is SourceFile {
    return (item as SourceFile).getFilePath != null;
}
