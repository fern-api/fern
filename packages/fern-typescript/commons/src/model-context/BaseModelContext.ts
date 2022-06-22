import { FernFilepath } from "@fern-api/api";
import path from "path";
import { Directory, SourceFile, ts } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../codegen/utils/getRelativePathAsModuleSpecifierTo";
import { createDirectories, DirectoryNameWithExportStrategy } from "./utils/createDirectories";
import { exportFromModule } from "./utils/exportFromModule";
import { getPackagePath, PackagePath } from "./utils/getPackagePath";
import { ImportStrategy } from "./utils/ImportStrategy";

const MODEL_NAMESPACE_IMPORT = "model";

export abstract class BaseModelContext {
    constructor(private readonly modelDirectory: Directory) {}

    protected addFile({
        fileNameWithoutExtension,
        fernFilepath,
        intermediateDirectories,
        withFile,
    }: {
        fileNameWithoutExtension: string;
        fernFilepath: FernFilepath;
        intermediateDirectories: string[];
        withFile: (file: SourceFile) => void;
    }): void {
        const packagePath = getPackagePath(fernFilepath);

        const directory = createDirectories(this.modelDirectory, [
            ...packagePath.map(
                (part): DirectoryNameWithExportStrategy => ({
                    directoryName: part.directoryName,
                    exportStrategy: { type: "namespace", namespaceExport: part.namespaceExport },
                })
            ),
            ...intermediateDirectories.map(
                (directoryName): DirectoryNameWithExportStrategy => ({ directoryName, exportStrategy: { type: "all" } })
            ),
        ]);

        const sourceFile = directory.createSourceFile(`${fileNameWithoutExtension}.ts`);
        withFile(sourceFile);
        exportFromModule(sourceFile, { type: "all" });
    }

    protected getReferenceToTypeInModel({
        exportedType,
        fernFilepath,
        importStrategy: maybeImportStrategy,
        referencedIn,
    }: {
        exportedType: string;
        fernFilepath: FernFilepath;
        importStrategy?: ImportStrategy;
        referencedIn: SourceFile;
    }): ts.TypeReferenceNode {
        const packagePathOfImportedType = getPackagePath(fernFilepath);

        const importStrategy =
            maybeImportStrategy ??
            getDefaultImportStrategy({
                packagePathOfImportedType,
                referencedIn,
                modelDirectory: this.modelDirectory,
            });

        switch (importStrategy) {
            case ImportStrategy.MODEL_NAMESPACE_IMPORT: {
                referencedIn.addImportDeclaration({
                    moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, this.modelDirectory),
                    namespaceImport: MODEL_NAMESPACE_IMPORT,
                });

                const qualifiedNameToPackage = packagePathOfImportedType.reduce<ts.EntityName>(
                    (qualifiedName, part) => ts.factory.createQualifiedName(qualifiedName, part.namespaceExport),
                    ts.factory.createIdentifier(MODEL_NAMESPACE_IMPORT)
                );
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(qualifiedNameToPackage, exportedType)
                );
            }

            case ImportStrategy.TOP_PACKAGE_IMPORT: {
                const [topPackagePart, ...remainingPackageParts] = packagePathOfImportedType;
                if (topPackagePart == null) {
                    throw new Error("Cannot find package for type " + exportedType);
                }
                referencedIn.addImportDeclaration({
                    moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, this.modelDirectory),
                    namedImports: [topPackagePart.namespaceExport],
                });

                const qualifiedNameToPackage = remainingPackageParts.reduce<ts.EntityName>(
                    (qualifiedName, part) => ts.factory.createQualifiedName(qualifiedName, part.namespaceExport),
                    ts.factory.createIdentifier(topPackagePart.namespaceExport)
                );
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(qualifiedNameToPackage, exportedType)
                );
            }

            case ImportStrategy.NAMED_IMPORT: {
                referencedIn.addImportDeclaration({
                    moduleSpecifier: getRelativePathAsModuleSpecifierTo(
                        referencedIn,
                        path.join(
                            this.modelDirectory.getPath(),
                            ...packagePathOfImportedType.map((part) => part.directoryName)
                        )
                    ),
                    namedImports: [{ name: exportedType }],
                });

                return ts.factory.createTypeReferenceNode(exportedType);
            }
        }
    }
}

function getDefaultImportStrategy({
    packagePathOfImportedType,
    referencedIn,
    modelDirectory,
}: {
    packagePathOfImportedType: PackagePath;
    referencedIn: SourceFile;
    modelDirectory: Directory;
}): ImportStrategy {
    const directoryOfType = getDirectoryForPackagePath(modelDirectory, packagePathOfImportedType);
    if (directoryOfType.isAncestorOf(referencedIn)) {
        return ImportStrategy.NAMED_IMPORT;
    } else if (modelDirectory.isAncestorOf(referencedIn)) {
        return ImportStrategy.TOP_PACKAGE_IMPORT;
    } else {
        return ImportStrategy.MODEL_NAMESPACE_IMPORT;
    }
}

function getDirectoryForPackagePath(directory: Directory, packagePath: PackagePath): Directory {
    const [nextPackage, ...remainingPackagePath] = packagePath;
    if (nextPackage == null) {
        return directory;
    }
    return getDirectoryForPackagePath(directory.getDirectoryOrThrow(nextPackage.directoryName), remainingPackagePath);
}
