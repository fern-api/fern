import { ModelReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { getImportPathForModelReference } from "../references/getImportPathForModelReference";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";

export const MODEL_NAMESPACE_IMPORT = "model";

export declare namespace getQualifiedReferenceToModel {
    export interface Args<T = unknown> {
        reference: ModelReference;
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
    reference,
    referencedIn,
    modelDirectory,
    forceUseNamespaceImport = false,
    constructQualifiedReference,
}: getQualifiedReferenceToModel.Args<T>): T {
    const name = ModelReference._visit(reference, {
        type: ({ name }) => name,
        error: ({ name }) => name,
        _unknown: () => {
            throw new Error("Unknown model reference: " + reference._type);
        },
    });

    const moduleSpecifier = getImportPathForModelReference({ modelDirectory, from: referencedIn, reference });
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
                referenceWithoutNamespace: ts.factory.createIdentifier(name),
            });
        } else {
            referencedIn.addImportDeclaration({
                moduleSpecifier,
                namedImports: [{ name }],
            });
        }
    }

    return constructQualifiedReference({
        namespaceImport: undefined,
        referenceWithoutNamespace: ts.factory.createIdentifier(name),
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
