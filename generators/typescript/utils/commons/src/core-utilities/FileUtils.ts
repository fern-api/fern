import { ts } from "ts-morph";

import { CoreUtility } from "./CoreUtility";

export interface FileUtils {
    FileLike: {
        _getReferenceToType: () => ts.TypeNode;
    };
    Uploadable: {
        _getReferenceToType: () => ts.TypeNode;
    };
    toBinaryUploadRequest: {
        _invoke: (arg: ts.Expression) => ts.AwaitExpression;
    };
}

export const MANIFEST: CoreUtility.Manifest = {
    name: "file-utils",
    pathInCoreUtilities: { nameOnDisk: "file", exportDeclaration: { namespaceExport: "file" } },
    dependsOn: [],
    getFilesPatterns: () => ({
        patterns: ["src/core/file/**", "tests/unit/file/**"]
    })
};

export class FileUtilsImpl extends CoreUtility implements FileUtils {
    public readonly MANIFEST = MANIFEST;
    public readonly FileLike = {
        _getReferenceToType: this.withExportedName("Uploadable.FileLike", (FileLike) => () => FileLike.getTypeNode())
    };
    public readonly Uploadable = {
        _getReferenceToType: this.withExportedName("Uploadable", (Uploadable) => () => Uploadable.getTypeNode())
    };

    public readonly toBinaryUploadRequest = {
        _invoke: this.withExportedName(
            "toBinaryUploadRequest",
            (toBinaryUploadRequest) => (arg: ts.Expression) =>
                ts.factory.createAwaitExpression(
                    ts.factory.createCallExpression(toBinaryUploadRequest.getExpression(), undefined, [arg])
                )
        )
    };
}
