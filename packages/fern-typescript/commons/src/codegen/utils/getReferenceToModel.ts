import { NamedType } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { TypeCategory } from "../references/getFilePathForNamedType";
import { getImportPathForNamedType } from "../references/getImportPathForNamedType";
import { getRelativePathAsModuleSpecifierTo } from "../utils/getRelativePathAsModuleSpecifierTo";

export const MODEL_NAMESPACE_IMPORT = "model";

export declare namespace getReferenceToModel {
    export interface Args<T> {
        typeName: NamedType;
        typeCategory: TypeCategory;
        referencedIn: SourceFile;
        modelDirectory: Directory;
        /**
         * if true: modelDirectory is added as a namespace import.
         * if false:
         *   if referencedIn falls outside of modelDirectory, then modelDirectory is
         *     added as a namespace import.
         *   otherwise: the type is imported directly from its source file.
         */
        forceUseNamespaceImport: boolean;
        constructQualifiedReference: (args: {
            namespaceImport: string | undefined;
            referenceWithoutNamespace: ts.Identifier;
        }) => T;
    }
}

export function getReferenceToModel<T>({
    typeName,
    typeCategory,
    referencedIn,
    modelDirectory,
    forceUseNamespaceImport,
    constructQualifiedReference,
}: getReferenceToModel.Args<T>): T {
    const referenceWithoutNamespace = ts.factory.createIdentifier(typeName.name);

    const moduleSpecifier = getImportPathForNamedType({ from: referencedIn, typeName, typeCategory, modelDirectory });
    const isTypeInCurrentFile = moduleSpecifier === `./${referencedIn.getBaseNameWithoutExtension()}`;
    if (!isTypeInCurrentFile) {
        const shouldUseNamespaceImport = forceUseNamespaceImport || !modelDirectory.isAncestorOf(referencedIn);
        if (shouldUseNamespaceImport) {
            referencedIn.addImportDeclaration({
                moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, modelDirectory),
                namespaceImport: MODEL_NAMESPACE_IMPORT,
            });
            return constructQualifiedReference({
                namespaceImport: MODEL_NAMESPACE_IMPORT,
                referenceWithoutNamespace,
            });
        } else {
            referencedIn.addImportDeclaration({
                moduleSpecifier,
                namedImports: [{ name: typeName.name }],
            });
        }
    }

    return constructQualifiedReference({
        namespaceImport: undefined,
        referenceWithoutNamespace,
    });
}
