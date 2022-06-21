import { Directory, SourceFile, ts } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";

export const MODEL_NAMESPACE_IMPORT = "model";

export declare namespace getQualifiedReferenceToModel {
    export interface Args<T = unknown> {
        typeName: string;
        filepathOfReference: string;
        referencedIn: SourceFile;
        modelDirectory: Directory;
        /**
         * if true: modelDirectory is added as a namespace import.
         * if false:
         *   if referencedIn falls outside of modelDirectory, then modelDirectory is
         *     added as a namespace import.
         *   otherwise: the type is imported directly from its source file.
         */
        forceUseNamespaceImport?: boolean;
        /**
         * a function to generate the reference.
         *
         * Tip: use createQualifiedTypeReference or createPropertyAccessExpression
         *      defined at the bottom of this file.
         */
        constructQualifiedReference: (args: constructQualifiedReference.Args) => T;
    }

    export namespace constructQualifiedReference {
        export interface Args {
            namespaceImport: string | undefined;
            referenceWithoutNamespace: ts.Identifier;
        }
    }
}

export function getQualifiedReferenceToModel<T>({
    typeName,
    filepathOfReference,
    referencedIn,
    modelDirectory,
    forceUseNamespaceImport = false,
    constructQualifiedReference,
}: getQualifiedReferenceToModel.Args<T>): T {
    const moduleSpecifier = getRelativePathAsModuleSpecifierTo(referencedIn, filepathOfReference);
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
                referenceWithoutNamespace: ts.factory.createIdentifier(typeName),
            });
        } else {
            referencedIn.addImportDeclaration({
                moduleSpecifier,
                namedImports: [{ name: typeName }],
            });
        }
    }

    return constructQualifiedReference({
        namespaceImport: undefined,
        referenceWithoutNamespace: ts.factory.createIdentifier(typeName),
    });
}

export function createQualifiedTypeReference({
    namespaceImport,
    referenceWithoutNamespace,
}: getQualifiedReferenceToModel.constructQualifiedReference.Args): ts.TypeReferenceNode {
    if (namespaceImport != null) {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(ts.factory.createIdentifier(namespaceImport), referenceWithoutNamespace)
        );
    } else {
        return ts.factory.createTypeReferenceNode(referenceWithoutNamespace);
    }
}

export function createPropertyAccessExpression({
    namespaceImport,
    referenceWithoutNamespace,
}: getQualifiedReferenceToModel.constructQualifiedReference.Args): ts.PropertyAccessExpression | ts.Identifier {
    if (namespaceImport != null) {
        return ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(namespaceImport),
            referenceWithoutNamespace
        );
    } else {
        return referenceWithoutNamespace;
    }
}
