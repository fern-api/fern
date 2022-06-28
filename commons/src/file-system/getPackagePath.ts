import { FernFilepath } from "@fern-fern/ir-model/types";
import { camelCase } from "lodash";

export type PackagePath = PackagePathPart[];

export interface PackagePathPart {
    directoryName: string;
    namespaceExport: string;
}

export function getPackagePath(fernFilepath: FernFilepath): PackagePath {
    return fernFilepath.split("/").map((part) => ({
        directoryName: part,
        namespaceExport: camelCase(part),
    }));
}
