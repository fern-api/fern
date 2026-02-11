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
        patterns: ["src/core/file/**", "tests/unit/file/**", "tests/unit/test-file.txt"]
    })
};

export class FileUtilsImpl extends CoreUtility implements FileUtils {
    public readonly MANIFEST: CoreUtility.Manifest = MANIFEST;
    public readonly FileLike: FileUtils["FileLike"] = {
        _getReferenceToType: this.withExportedName(
            "Uploadable.FileLike",
            (FileLike) => (): ts.TypeNode => FileLike.getTypeNode()
        )
    };
    public readonly Uploadable: FileUtils["Uploadable"] = {
        _getReferenceToType: this.withExportedName(
            "Uploadable",
            (Uploadable) => (): ts.TypeNode => Uploadable.getTypeNode()
        )
    };

    public readonly toBinaryUploadRequest: FileUtils["toBinaryUploadRequest"] = {
        _invoke: this.withExportedName(
            "toBinaryUploadRequest",
            (toBinaryUploadRequest) =>
                (arg: ts.Expression): ts.AwaitExpression =>
                    ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(toBinaryUploadRequest.getExpression(), undefined, [arg])
                    )
        )
    };
}
