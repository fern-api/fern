import path from "path";
import { SourceFile } from "ts-morph";

export function getRelativePathAsModuleSpecifierTo(from: SourceFile | string, to: SourceFile | string): string {
    const parsedToFilePath = path.parse(typeof to === "string" ? to : to.getFilePath());
    const toFilePathWithoutExtension = path.join(parsedToFilePath.dir, parsedToFilePath.name);
    let moduleSpecifier = path.relative(getDirectory(from), toFilePathWithoutExtension);
    if (!moduleSpecifier.startsWith(".")) {
        moduleSpecifier = `./${moduleSpecifier}`;
    }
    if (moduleSpecifier.endsWith("/")) {
        moduleSpecifier = moduleSpecifier.slice(0, -1);
    }
    return moduleSpecifier;
}

function getDirectory(fileOrDirectory: SourceFile | string): string {
    if (typeof fileOrDirectory === "string" && path.extname(fileOrDirectory).length === 0) {
        return fileOrDirectory;
    }
    return path.dirname(typeof fileOrDirectory === "string" ? fileOrDirectory : fileOrDirectory.getFilePath());
}
