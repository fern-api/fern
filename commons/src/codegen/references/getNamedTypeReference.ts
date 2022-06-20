import { NamedType } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { getReferenceToModel } from "../utils/getReferenceToModel";
import { TypeCategory } from "./getFilePathForNamedType";

export declare namespace getNamedTypeReference {
    export interface Args {
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
        forceUseNamespaceImport?: boolean;
    }
}

export function getNamedTypeReference({
    typeName,
    typeCategory,
    referencedIn,
    modelDirectory,
    forceUseNamespaceImport = false,
}: getNamedTypeReference.Args): ts.TypeNode {
    return getReferenceToModel({
        typeName,
        typeCategory,
        referencedIn,
        modelDirectory,
        forceUseNamespaceImport,
        constructQualifiedReference: ({ namespaceImport, referenceWithoutNamespace }) =>
            namespaceImport != null
                ? ts.factory.createTypeReferenceNode(
                      ts.factory.createQualifiedName(
                          ts.factory.createIdentifier(namespaceImport),
                          ts.factory.createIdentifier(typeName.name)
                      )
                  )
                : ts.factory.createTypeReferenceNode(referenceWithoutNamespace),
    });
}
