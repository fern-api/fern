import path from "path";
import { Directory, SourceFile } from "ts-morph";

export function getRelativePathAsModuleSpecifierTo({
    from,
    to,
    packageName,
}: {
    from: Directory | SourceFile | string;
    to: Directory | SourceFile | string;
    packageName: string;
}): string {
    const parsedToFilePath = path.parse(getPath(to));
    const toFilePathWithoutExtension = path.join(parsedToFilePath.dir, parsedToFilePath.name);

    // special case: if "to" is the root, we just use the package name.
    // (this is aliased in tsconfig.json)
    if (path.normalize(toFilePathWithoutExtension) === "/") {
        return packageName;
    }

    let moduleSpecifier = path.relative(getDirectory(from), toFilePathWithoutExtension);
    if (!moduleSpecifier.startsWith(".")) {
        moduleSpecifier = `./${moduleSpecifier}`;
    }
    if (moduleSpecifier.endsWith("/")) {
        moduleSpecifier = moduleSpecifier.slice(0, -1);
    }
    return moduleSpecifier;
}

function getPath(fileOrDirectory: Directory | SourceFile | string): string {
    if (typeof fileOrDirectory === "string") {
        return fileOrDirectory;
    }

    if (isSourceFile(fileOrDirectory)) {
        return fileOrDirectory.getFilePath();
    }

    return fileOrDirectory.getPath();
}

function getDirectory(fileOrDirectory: Directory | SourceFile | string): string {
    const pathStr = getPath(fileOrDirectory);
    if (path.extname(pathStr).length === 0) {
        return pathStr;
    } else {
        return path.dirname(pathStr);
    }
}

function isSourceFile(item: SourceFile | Directory): item is SourceFile {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as SourceFile).getFilePath != null;
}
