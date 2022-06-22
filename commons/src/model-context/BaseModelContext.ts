import { FernFilepath } from "@fern-api/api";
import path from "path";
import { Directory, ImportSpecifierStructure, OptionalKind, SourceFile, ts } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../codegen/utils/getRelativePathAsModuleSpecifierTo";
import { createSourceFile, DirectoryNameWithExportStrategy, PathToSourceFile } from "./utils/createDirectories";
import { getPackagePath, PackagePath } from "./utils/getPackagePath";
import { ImportStrategy } from "./utils/ImportStrategy";

const MODEL_NAMESPACE_IMPORT = "model";

export interface ModelItem {
    typeName: string;
    fernFilepath: FernFilepath;
}

export abstract class BaseModelContext<T extends ModelItem = ModelItem> {
    private modelDirectory: Directory;
    private intermediateDirectories: string[] | ((item: T) => string[]);

    constructor({
        modelDirectory,
        intermediateDirectories,
    }: {
        modelDirectory: Directory;
        intermediateDirectories: string[] | ((item: T) => string[]);
    }) {
        this.modelDirectory = modelDirectory;
        this.intermediateDirectories = intermediateDirectories;
    }

    protected addFile({ item, withFile }: { item: T; withFile: (file: SourceFile) => void }): void {
        const file = createSourceFile(this.modelDirectory, this.getPathToSourceFile(item));
        withFile(file);
    }

    private getPathToSourceFile(item: T): PathToSourceFile {
        const packagePath = getPackagePath(item.fernFilepath);

        const intermediateDirectories =
            typeof this.intermediateDirectories === "function"
                ? this.intermediateDirectories(item)
                : this.intermediateDirectories;

        const directories = [
            ...packagePath.map(
                (part): DirectoryNameWithExportStrategy => ({
                    directoryName: part.directoryName,
                    exportStrategy: { type: "namespace", namespaceExport: part.namespaceExport },
                })
            ),
            ...intermediateDirectories.map(
                (directoryName): DirectoryNameWithExportStrategy => ({ directoryName, exportStrategy: { type: "all" } })
            ),
        ];

        return {
            directories,
            fileName: `${item.typeName}.ts`,
            exportStrategy: { type: "all" },
        };
    }

    protected getReferenceToTypeInModel({
        item,
        importStrategy: maybeImportStrategy,
        referencedIn,
    }: {
        item: T;
        importStrategy?: ImportStrategy;
        referencedIn: SourceFile;
    }): ts.TypeReferenceNode {
        const pathToItem = this.getPathToSourceFile(item);
        const filepathOfItem = path.join(
            this.modelDirectory.getPath(),
            ...pathToItem.directories.map((d) => d.directoryName),
            pathToItem.fileName
        );
        const isReferenceInSameFile = filepathOfItem === referencedIn.getFilePath();
        function maybeAddImport({
            importOf,
            namedImports,
            namespaceImport,
        }: {
            importOf: Directory | SourceFile | string;
            namedImports?: (OptionalKind<ImportSpecifierStructure> | string)[];
            namespaceImport?: string;
        }) {
            if (isReferenceInSameFile) {
                return;
            }
            referencedIn.addImportDeclaration({
                moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, importOf),
                namedImports,
                namespaceImport,
            });
        }

        const packagePathOfImportedType = getPackagePath(item.fernFilepath);

        const importStrategy =
            maybeImportStrategy ??
            getDefaultImportStrategy({
                packagePathOfImportedType,
                referencedIn,
                modelDirectory: this.modelDirectory,
            });

        switch (importStrategy) {
            case ImportStrategy.MODEL_NAMESPACE_IMPORT: {
                maybeAddImport({
                    importOf: this.modelDirectory,
                    namespaceImport: MODEL_NAMESPACE_IMPORT,
                });

                const qualifiedNameToPackage = packagePathOfImportedType.reduce<ts.EntityName>(
                    (qualifiedName, part) => ts.factory.createQualifiedName(qualifiedName, part.namespaceExport),
                    ts.factory.createIdentifier(MODEL_NAMESPACE_IMPORT)
                );
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(qualifiedNameToPackage, item.typeName)
                );
            }

            case ImportStrategy.TOP_PACKAGE_IMPORT: {
                const [topPackagePart, ...remainingPackageParts] = packagePathOfImportedType;
                if (topPackagePart == null) {
                    throw new Error("Cannot find package for type " + item.typeName);
                }
                maybeAddImport({
                    importOf: this.modelDirectory,
                    namedImports: [topPackagePart.namespaceExport],
                });

                const qualifiedNameToPackage = remainingPackageParts.reduce<ts.EntityName>(
                    (qualifiedName, part) => ts.factory.createQualifiedName(qualifiedName, part.namespaceExport),
                    ts.factory.createIdentifier(topPackagePart.namespaceExport)
                );
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(qualifiedNameToPackage, item.typeName)
                );
            }

            case ImportStrategy.NAMED_IMPORT: {
                maybeAddImport({
                    importOf: path.join(
                        this.modelDirectory.getPath(),
                        ...packagePathOfImportedType.map((part) => part.directoryName)
                    ),
                    namedImports: [{ name: item.typeName }],
                });

                return ts.factory.createTypeReferenceNode(item.typeName);
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
    const modelDirectoryPath = modelDirectory.getPath();
    const referencedInDirectoryPath = referencedIn.getDirectory().getPath();
    const importedTypeDirectoryPath = path.join(
        modelDirectoryPath,
        ...packagePathOfImportedType.map((part) => part.directoryName)
    );

    if (importedTypeDirectoryPath.startsWith(referencedInDirectoryPath)) {
        return ImportStrategy.NAMED_IMPORT;
    } else if (modelDirectoryPath.startsWith(referencedInDirectoryPath)) {
        return ImportStrategy.TOP_PACKAGE_IMPORT;
    } else {
        return ImportStrategy.MODEL_NAMESPACE_IMPORT;
    }
}
