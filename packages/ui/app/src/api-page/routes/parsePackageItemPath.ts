import { PackagePath } from "../../commons/PackagePath";

export interface ParsedPackageItemPath {
    packagePath: PackagePath;
    itemId: string;
}

export function parsePackageItemPath(path: string, regexp: RegExp): ParsedPackageItemPath | undefined {
    const match = path.match(regexp);
    if (match == null) {
        return undefined;
    }
    const [_, packagePath = "", itemId] = match;

    if (itemId == null) {
        return undefined;
    }

    return {
        packagePath: packagePath
            .split("/")
            .filter((part) => part.length > 0)
            .map(decodeURI),
        itemId: decodeURI(itemId),
    };
}
