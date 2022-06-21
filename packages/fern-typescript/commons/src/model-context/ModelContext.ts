import { ContainerType, ErrorName, FernFilepath, PrimitiveType, TypeName, TypeReference } from "@fern-api/api";
import { assertNever } from "@fern-api/commons";
import { camelCase } from "lodash";
import path from "path";
import { Directory, SourceFile, ts } from "ts-morph";
import {
    getParentDirectory,
    getRelativePathAsModuleSpecifierTo,
} from "../codegen/utils/getRelativePathAsModuleSpecifierTo";
import { getOrCreateSourceFile } from "../file-system/getOrCreateSourceFile";

export enum ImportStrategy {
    MODEL_NAMESPACE_IMPORT,
    NAMED_IMPORT,
}

export class ModelContext {
    constructor(private readonly modelDirectory: Directory) {}

    public addTypeDefinition(typeName: TypeName, withFile: (file: SourceFile) => void): void {
        this.addFile(typeName.name, typeName.fernFilepath, ["types"], withFile);
    }

    public addErrorDefinition(errorName: ErrorName, withFile: (file: SourceFile) => void): void {
        this.addFile(errorName.name, errorName.fernFilepath, ["errors"], withFile);
    }

    private addFile(
        fileNameWithoutExtension: string,
        fernFilepath: FernFilepath,
        intermediateDirectories: string[],
        withFile: (file: SourceFile) => void
    ): void {
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

    public getReferenceToType({
        reference,
        referencedIn,
        importStrategy,
    }: {
        reference: TypeReference;
        referencedIn: SourceFile;
        importStrategy: ImportStrategy;
    }): ts.TypeNode {
        return TypeReference._visit<ts.TypeNode>(reference, {
            named: (typeName) => {
                const packagePath = getPackagePath(typeName.fernFilepath);

                switch (importStrategy) {
                    case ImportStrategy.MODEL_NAMESPACE_IMPORT: {
                        referencedIn.addImportDeclaration({
                            moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, this.modelDirectory),
                            namespaceImport: "model",
                        });

                        const qualifiedNameToPackage = packagePath.reduce<ts.EntityName>(
                            (qualifiedName, part) =>
                                ts.factory.createQualifiedName(qualifiedName, part.namespaceExport),
                            ts.factory.createIdentifier("model")
                        );
                        return ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(qualifiedNameToPackage, typeName.name)
                        );
                    }

                    case ImportStrategy.NAMED_IMPORT: {
                        referencedIn.addImportDeclaration({
                            moduleSpecifier: getRelativePathAsModuleSpecifierTo(
                                referencedIn,
                                path.join(
                                    this.modelDirectory.getPath(),
                                    ...packagePath.map((part) => part.directoryName)
                                )
                            ),
                            namedImports: [
                                {
                                    name: typeName.name,
                                },
                            ],
                        });

                        return ts.factory.createTypeReferenceNode(typeName.name);
                    }
                }
            },

            primitive: (primitive) => {
                return PrimitiveType._visit<ts.TypeNode>(primitive, {
                    boolean: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                    double: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    integer: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    long: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
                    string: () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    _unknown: () => {
                        throw new Error("Unexpected primitive type: " + primitive);
                    },
                });
            },

            container: (container) => {
                return ContainerType._visit<ts.TypeNode>(container, {
                    map: (map) =>
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                            this.getReferenceToType({
                                reference: map.keyType,
                                referencedIn,
                                importStrategy,
                            }),
                            this.getReferenceToType({
                                reference: map.valueType,
                                referencedIn,
                                importStrategy,
                            }),
                        ]),
                    list: (list) =>
                        ts.factory.createArrayTypeNode(
                            this.getReferenceToType({ reference: list, referencedIn, importStrategy })
                        ),
                    set: (set) =>
                        ts.factory.createArrayTypeNode(
                            this.getReferenceToType({ reference: set, referencedIn, importStrategy })
                        ),
                    optional: (optional) =>
                        ts.factory.createUnionTypeNode([
                            this.getReferenceToType({
                                reference: optional,
                                referencedIn,
                                importStrategy,
                            }),
                            ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                        ]),
                    _unknown: () => {
                        throw new Error("Unexpected container type: " + container._type);
                    },
                });
            },

            unknown: () => {
                return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
            },

            void: () => {
                return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
                ]);
            },

            _unknown: () => {
                throw new Error("Unexpected type reference: " + reference._type);
            },
        });
    }
}

type PackagePath = PackagePathPart[];

interface PackagePathPart {
    directoryName: string;
    namespaceExport: string;
}

function getPackagePath(fernFilepath: FernFilepath): PackagePath {
    return fernFilepath.split("/").map((part) => ({
        directoryName: part,
        namespaceExport: camelCase(part),
    }));
}

type ExportStrategy = { type: "all" } | { type: "namespace"; namespaceExport: string };

interface DirectoryNameWithExportStrategy {
    directoryName: string;
    exportStrategy: ExportStrategy;
}

function createDirectories(parent: Directory, path: DirectoryNameWithExportStrategy[]): Directory {
    let directory = parent;

    for (const part of path) {
        let nextDirectory = directory.getDirectory(part.directoryName);
        if (nextDirectory == null) {
            nextDirectory = directory.createDirectory(part.directoryName);
            exportFromModule(nextDirectory, part.exportStrategy);
        }
        directory = nextDirectory;
    }

    return directory;
}

function exportFromModule(toExport: SourceFile | Directory, exportStrategy: ExportStrategy): void {
    const indexTsOfParent = getOrCreateSourceFile(getParentDirectory(toExport), "index.ts");
    const moduleSpecifier = getRelativePathAsModuleSpecifierTo(indexTsOfParent, toExport);
    switch (exportStrategy.type) {
        case "all":
            indexTsOfParent.addExportDeclaration({
                moduleSpecifier,
            });
            break;
        case "namespace":
            indexTsOfParent.addExportDeclaration({
                namespaceExport: exportStrategy.namespaceExport,
                moduleSpecifier,
            });
            break;
        default:
            assertNever(exportStrategy);
    }
}
