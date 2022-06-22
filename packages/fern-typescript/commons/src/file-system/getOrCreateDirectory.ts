import { Directory } from "ts-morph";

export function getOrCreateDirectory(containingModule: Directory, path: string): Directory {
    return containingModule.getDirectory(path) ?? containingModule.createDirectory(path);
}
