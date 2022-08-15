import {
    createDirectoriesAndSourceFile,
    DirectoryNameWithExportStrategy,
    getPackagePath,
    ImportStrategy,
    PathToSourceFile,
} from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { getQualifiedReferenceToModelItem } from "./getQualifiedReferenceToModel";
import { ModelItem } from "./types";

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
        const file = createDirectoriesAndSourceFile(this.modelDirectory, this.getPathToSourceFile(item));
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

    protected getReferenceToModelItemType({
        item,
        importStrategy,
        referencedIn,
    }: {
        item: T;
        importStrategy?: ImportStrategy;
        referencedIn: SourceFile;
    }): ts.TypeReferenceNode {
        return getQualifiedReferenceToModelItem({
            item,
            importStrategy,
            pathToFile: this.getPathToSourceFile(item),
            modelDirectory: this.modelDirectory,
            referencedIn,
            getNonQualifiedReference: () => ts.factory.createTypeReferenceNode(item.typeName),
            getQualifiedReference: ({ basePath, packagePath }) => {
                const qualifiedNameToPackage = packagePath.reduce<ts.EntityName>(
                    (qualifiedName, part) => ts.factory.createQualifiedName(qualifiedName, part.namespaceExport),
                    ts.factory.createIdentifier(basePath)
                );
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(qualifiedNameToPackage, item.typeName)
                );
            },
        });
    }

    protected getReferenceToModelItemValue({
        item,
        importStrategy,
        referencedIn,
    }: {
        item: T;
        importStrategy?: ImportStrategy;
        referencedIn: SourceFile;
    }): ts.Expression {
        return getQualifiedReferenceToModelItem<ts.Expression>({
            item,
            importStrategy,
            pathToFile: this.getPathToSourceFile(item),
            modelDirectory: this.modelDirectory,
            referencedIn,
            getNonQualifiedReference: () => ts.factory.createIdentifier(item.typeName),
            getQualifiedReference: ({ basePath, packagePath }) => {
                const qualifiedNameToPackage = packagePath.reduce<ts.Expression>(
                    (qualifiedName, part) =>
                        ts.factory.createPropertyAccessExpression(qualifiedName, part.namespaceExport),
                    ts.factory.createIdentifier(basePath)
                );
                return ts.factory.createPropertyAccessExpression(
                    qualifiedNameToPackage,
                    ts.factory.createIdentifier(item.typeName)
                );
            },
        });
    }
}
