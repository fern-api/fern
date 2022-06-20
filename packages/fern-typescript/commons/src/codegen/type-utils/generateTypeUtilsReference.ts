import { TypeDefinition } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { getReferenceToModel } from "../utils/getReferenceToModel";

export function generateTypeUtilsReference({
    typeDefinition,
    referencedIn,
    modelDirectory,
}: {
    typeDefinition: TypeDefinition;
    referencedIn: SourceFile;
    modelDirectory: Directory;
}): ts.Expression {
    return getReferenceToModel({
        typeName: typeDefinition.name,
        typeCategory: "error",
        referencedIn,
        modelDirectory,
        forceUseNamespaceImport: false,
        constructQualifiedReference: ({ namespaceImport, referenceWithoutNamespace }) =>
            namespaceImport != null
                ? ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier(namespaceImport),
                      ts.factory.createIdentifier(typeDefinition.name.name)
                  )
                : referenceWithoutNamespace,
    });
}
