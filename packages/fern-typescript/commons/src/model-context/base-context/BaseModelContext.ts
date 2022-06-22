import { FernFilepath } from "@fern-api/api";
import path from "path";
import { Directory, SourceFile, ts } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../../codegen/utils/getRelativePathAsModuleSpecifierTo";
import { createDirectories, DirectoryNameWithExportStrategy } from "./createDirectories";
import { exportFromModule } from "./exportFromModule";
import { getPackagePath } from "./getPackagePath";

export enum ImportStrategy {
    MODEL_NAMESPACE_IMPORT,
    NAMED_IMPORT,
}

const MODEL_NAMESPACE_IMPORT = "model";

export abstract class BaseModelContext {
    constructor(private readonly modelDirectory: Directory) {}

    protected addFile(
        fileNameWithoutExtension: string,
        fernFilepath: FernFilepath,
        intermediateDirectories: string[],
        withFile: (file: SourceFile) => void
    ): // TODO don't return a SourceFile to the consumer
    SourceFile {
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
        return sourceFile;
    }

    protected getReferenceToTypeInModel({
        exportedType,
        fernFilepath,
        importStrategy,
        referencedIn,
    }: {
        exportedType: string;
        fernFilepath: FernFilepath;
        importStrategy: ImportStrategy;
        referencedIn: SourceFile;
    }): ts.TypeReferenceNode {
        const packagePath = getPackagePath(fernFilepath);

        switch (importStrategy) {
            case ImportStrategy.MODEL_NAMESPACE_IMPORT: {
                referencedIn.addImportDeclaration({
                    moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, this.modelDirectory),
                    namespaceImport: MODEL_NAMESPACE_IMPORT,
                });

                const qualifiedNameToPackage = packagePath.reduce<ts.EntityName>(
                    (qualifiedName, part) => ts.factory.createQualifiedName(qualifiedName, part.namespaceExport),
                    ts.factory.createIdentifier(MODEL_NAMESPACE_IMPORT)
                );
                return ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(qualifiedNameToPackage, exportedType)
                );
            }

            case ImportStrategy.NAMED_IMPORT: {
                referencedIn.addImportDeclaration({
                    moduleSpecifier: getRelativePathAsModuleSpecifierTo(
                        referencedIn,
                        path.join(this.modelDirectory.getPath(), ...packagePath.map((part) => part.directoryName))
                    ),
                    namedImports: [{ name: exportedType }],
                });

                return ts.factory.createTypeReferenceNode(exportedType);
            }
        }
    }
}
