import { FernFilepath } from "@fern-fern/ir-model";

export type PackagePath = PackagePathPart[];

export interface PackagePathPart {
    directoryName: string;
    namespaceExport: string;
}

export function getPackagePath(fernFilepath: FernFilepath): PackagePath {
    return fernFilepath.map((part) => ({
        directoryName: part.originalValue,
        namespaceExport: part.camelCase,
    }));
}
