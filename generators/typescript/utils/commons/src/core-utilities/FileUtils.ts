import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";
import { MANIFEST as RuntimeManifest } from "./Runtime";

export interface FileUtils {
    FileLike: {
        _getReferenceToType: () => ts.TypeNode;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "file-utils",
    pathInCoreUtilities: { nameOnDisk: "file.ts", exportDeclaration: { exportAll: true } },
    dependsOn: [RuntimeManifest],
    getFilesPatterns: () => ({
        patterns: ["src/core/file.ts"]
    })
};

export class FileUtilsImpl extends CoreUtility implements FileUtils {
    public readonly MANIFEST = MANIFEST;
    public readonly FileLike = {
        _getReferenceToType: this.withExportedName("FileLike", (FileLike) => () => FileLike.getTypeNode())
    };
}
