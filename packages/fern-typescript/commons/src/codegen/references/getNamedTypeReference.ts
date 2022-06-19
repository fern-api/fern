import { NamedType } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../utils/getRelativePathAsModuleSpecifierTo";
import { getImportPathForNamedType } from "./getImportPathForNamedType";

export declare namespace getNamedTypeReference {
    export interface Args {
        typeName: NamedType;
        referencedIn: SourceFile;
        /**
         * the directory where the original type lives.
         * for types, this should be the model directory.
         * for errors, this should be the errors directory.
         */
        baseDirectory: Directory;
        baseDirectoryType: "errors" | "model";
        /**
         * if true: baseDirectory is added as a namespace import.
         * if false:
         *   if referencedIn falls outside of baseDirectory, then baseDirectory is
         *     added as a namespace import.
         *   otherwise: the type is imported directly from its source file.
         */
        forceUseNamespaceImport?: boolean;
    }
}

export function getNamedTypeReference({
    typeName,
    referencedIn,
    baseDirectory,
    baseDirectoryType,
    forceUseNamespaceImport = false,
}: getNamedTypeReference.Args): ts.TypeNode {
    const moduleSpecifier = getImportPathForNamedType({ from: referencedIn, typeName, baseDirectory });
    const isTypeInCurrentFile = moduleSpecifier === `./${referencedIn.getBaseNameWithoutExtension()}`;
    if (!isTypeInCurrentFile) {
        const shouldUseNamespaceImport = forceUseNamespaceImport || !baseDirectory.isAncestorOf(referencedIn);
        if (shouldUseNamespaceImport) {
            const namespaceImport = getNamespaceImport(baseDirectoryType);
            referencedIn.addImportDeclaration({
                moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, baseDirectory),
                namespaceImport,
            });

            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(namespaceImport),
                    ts.factory.createIdentifier(typeName.name)
                ),
                undefined
            );
        } else {
            referencedIn.addImportDeclaration({
                moduleSpecifier,
                namedImports: [{ name: typeName.name }],
            });
        }
    }

    return ts.factory.createTypeReferenceNode(typeName.name);
}

export function getNamespaceImport(baseDirectoryType: getNamedTypeReference.Args["baseDirectoryType"]): string {
    switch (baseDirectoryType) {
        case "model":
            return "model";
        case "errors":
            return "errors";
    }
}
