import { assertNever } from "@fern-api/core-utils";
import {
    getPackagePath,
    getRelativePathAsModuleSpecifierTo,
    ImportStrategy,
    PackagePath,
    PathToSourceFile,
} from "@fern-typescript/commons";
import path from "path";
import { Directory, ImportSpecifierStructure, OptionalKind, SourceFile } from "ts-morph";
import { ModelItem } from "./types";

const MODEL_NAMESPACE_IMPORT = "model";

export declare namespace getQualifiedReferenceToModelItem {
    export interface Args<T> {
        item: ModelItem;
        pathToFile: PathToSourceFile;
        modelDirectory: Directory;
        referencedIn: SourceFile;
        importStrategy: ImportStrategy | undefined;
        getNonQualifiedReference: () => T;
        getQualifiedReference: (args: { basePath: string; packagePath: PackagePath }) => T;
    }
}

export function getQualifiedReferenceToModelItem<T>({
    item,
    pathToFile,
    modelDirectory,
    referencedIn,
    importStrategy: maybeImportStrategy,
    getNonQualifiedReference,
    getQualifiedReference,
}: getQualifiedReferenceToModelItem.Args<T>): T {
    const filepath = path.join(
        modelDirectory.getPath(),
        ...pathToFile.directories.map((d) => d.directoryName),
        pathToFile.fileName
    );
    const isReferenceInSameFile = filepath === referencedIn.getFilePath();
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
            modelDirectory,
        });

    if (importStrategy === ImportStrategy.NAMED_IMPORT) {
        maybeAddImport({
            importOf: path.join(
                modelDirectory.getPath(),
                ...packagePathOfImportedType.map((part) => part.directoryName)
            ),
            namedImports: [{ name: item.typeName }],
        });

        return getNonQualifiedReference();
    }

    const [topPackagePart, ...remainingPackageParts] = packagePathOfImportedType;

    if (importStrategy === ImportStrategy.MODEL_NAMESPACE_IMPORT || topPackagePart == null) {
        maybeAddImport({
            importOf: modelDirectory,
            namespaceImport: MODEL_NAMESPACE_IMPORT,
        });

        return getQualifiedReference({
            basePath: MODEL_NAMESPACE_IMPORT,
            packagePath: packagePathOfImportedType,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (importStrategy === ImportStrategy.TOP_PACKAGE_IMPORT) {
        maybeAddImport({
            importOf: modelDirectory,
            namedImports: [topPackagePart.namespaceExport],
        });

        return getQualifiedReference({
            basePath: topPackagePart.namespaceExport,
            packagePath: remainingPackageParts,
        });
    }

    assertNever(importStrategy);
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
